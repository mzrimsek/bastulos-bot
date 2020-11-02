require('dotenv').config();

const tmi = require('tmi.js');
const OBSWebSocket = require('obs-websocket-js');
const admin = require('firebase-admin');
const logger = require('winston');

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { colorize: true });
logger.level = 'debug';

const tmiConfig = require('./config/tmi');
const obsConfig = require('./config/obs');
const firebaseConfig = require('./config/firebase');

const { COMMAND_PREFACE, ADMIN_USER, ADMIN_COMMANDS, OBS_COMMANDS, HELP_COMMAND } = require('./constants/commands');
const { SOURCES } = require('./constants/obs');
const { COMMANDS_COLLECTION } = require('./constants/firebase');

const { getRandomColor, replaceRequestingUserInMessage } = require('./utils');

// init twitch client
const client = new tmi.client(tmiConfig);
client.connect();

// init obs client
const obs = new OBSWebSocket();

// init firebase client
admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig.service_account),
  databaseURL: firebaseConfig.database_url
});
const firestoreSettings = {
  timestampsInSnapshots: true
};

let firestore = null;
try {
  firestore = admin.firestore();
  firestore.settings(firestoreSettings);
  logger.info('Connection to Firebase established');
} catch {
  logger.info('Failed to connect to Firebase');
}

async function loadUserCommands() {
  const commandsSnapshot = await firestore.collection(COMMANDS_COLLECTION).get();
  logger.info('User commands loaded');
  return commandsSnapshot.docs.map(doc => doc.data());
}

let commandsActive = true;

function handleAdminCommand(channel, messageParts) {
  const command = messageParts[0].toLowerCase();

  switch (command) {
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.TOGGLE_COMMANDS_ACTIVE}`: {
      if (commandsActive) {
        client.say(channel, 'Bot commands are disabled!');
        commandsActive = false;
      }
      else {
        client.say(channel, 'Bot commands are enabled!');
        commandsActive = true;
      }
      break;
    }
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.RECONNECT_OBS}`: {
      obs.connect(obsConfig).then(() => logger.info('Connected to OBSWebSocket'));
      break;
    }
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.ADD_COMMAND}`: {
      const newCommand = messageParts[1];
      const newMessage = messageParts.slice(2).join(' ');
      firestore.collection(COMMANDS_COLLECTION).doc(newCommand).set({
        command: newCommand,
        message: newMessage
      }).then(() => logger.info(`Command added: ${newCommand}`));
      break;
    }
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.REMOVE_COMMAND}`: {
      const commandToRemove = messageParts[1];
      firestore.collection(COMMANDS_COLLECTION).doc(commandToRemove).delete().then(() => logger.info(`Command removed: ${commandToRemove}`));
      break;
    }
    default: {
      break;
    }
  }
};

async function handleUserCommand(channel, userInfo, messageParts) {
  const userCommands = await loadUserCommands();

  const command = messageParts[0].toLowerCase();

  if (command === `${COMMAND_PREFACE}${HELP_COMMAND}`) {
    const obsCommandKeys = Object.keys(OBS_COMMANDS);
    const obsCommandList = obsCommandKeys.map(commandKey => OBS_COMMANDS[commandKey]);
    const userCommandList = userCommands.map(userCommand => userCommand.command);
    const allCommandList = [...userCommandList, ...obsCommandList, HELP_COMMAND];

    const helpMessageList = allCommandList.map(command => `${COMMAND_PREFACE}${command}`).join(', ');
    client.say(channel, `Here are the available commands: \n${helpMessageList}`);
  } else {
    const foundCommand = userCommands.find(x => `${COMMAND_PREFACE}${x.command}` === command);

    if (foundCommand) {
      logger.info(`Found command: ${foundCommand.command}`);
      const replacedCommand = replaceRequestingUserInMessage(userInfo.username, foundCommand.message);
      client.say(channel, replacedCommand);
    }
  }
}

async function handleOBSCommand(messageParts) {
  const command = messageParts[0].toLowerCase();

  switch (command) {
    case `${COMMAND_PREFACE}${OBS_COMMANDS.RESET}`: {
      obs.send('SetSourceFilterVisibility', {
        sourceName: SOURCES.WEBCAM,
        filterName: 'Color Correction',
        filterEnabled: false
      });
      obs.send('SetSceneItemRender', { source: SOURCES.WEBCAM, render: true });
      obs.send('SetMute', { source: SOURCES.MIC, mute: false });
      break;
    }
    case `${COMMAND_PREFACE}${OBS_COMMANDS.TOGGLE_CAM}`: {
      const properties = await obs.send('GetSceneItemProperties', { item: { name: SOURCES.WEBCAM } });
      const { visible } = properties;
      obs.send('SetSceneItemRender', { source: SOURCES.WEBCAM, render: !visible });
      break;
    }
    case `${COMMAND_PREFACE}${OBS_COMMANDS.TOGGLE_MUTE_MIC}`: {
      obs.send('ToggleMute', { source: SOURCES.MIC });
      break;
    }
    case `${COMMAND_PREFACE}${OBS_COMMANDS.CHANGE_OVERLAY_COLOR}`: {
      let numTimes = messageParts[1] ? parseInt(messageParts[1]) : 1;

      if (numTimes < 0) {
        numTimes = Math.abs(numTimes);
      }

      if (numTimes > 1000) {
        numTimes = 1000;
      }

      obs.send('SetSourceFilterVisibility', {
        sourceName: SOURCES.WEBCAM,
        filterName: 'Color Correction',
        filterEnabled: true
      });

      function setColorCorrectionToRandomColor() {
        const randomColor = getRandomColor();
        obs.send('SetSourceFilterSettings', {
          sourceName: SOURCES.WEBCAM,
          filterName: 'Color Correction',
          filterSettings: {
            color: randomColor
          }
        });
      };

      const rate = 1000 / numTimes;
      for (let i = 0; i < numTimes; i++) {
        setTimeout(setColorCorrectionToRandomColor, rate * i);
      }
      break;
    }
    case `${COMMAND_PREFACE}${OBS_COMMANDS.TOGGLE_AQUA}`: {
      const properties = await obs.send('GetSceneItemProperties', { item: { name: SOURCES.AQUA } });
      const { visible } = properties;
      obs.send('SetSceneItemRender', { source: SOURCES.AQUA, render: !visible });
      break;
    }
    default: {
      break;
    }
  }
}

client.on('chat', async (channel, userInfo, message, self) => {
  if (self) return; // ignore messages from the bot 

  if (message[0] !== COMMAND_PREFACE) return; // ignore non command messages

  const messageParts = message.split(' ');

  try {
    if (userInfo.username === ADMIN_USER) {
      handleAdminCommand(channel, messageParts);
    }

    if (!commandsActive) return;

    handleUserCommand(channel, userInfo, messageParts);
    handleOBSCommand(messageParts);
  } catch (error) {
    logger.error(error);
  }
});