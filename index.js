require('dotenv').config();

const tmi = require('tmi.js');
const OBSWebSocket = require('obs-websocket-js');
const logger = require('winston');

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { colorize: true });
logger.level = 'debug';

const tmiConfig = require('./config/tmi');
const obsConfig = require('./config/obs');

const { COMMAND_PREFACE, ADMIN_USER, ADMIN_COMMANDS, OBS_COMMANDS, USER_COMMANDS } = require('./constants/commands');
const { SOURCES } = require('./constants/obs');

const { getRandomColor } = require('./utils');

const client = new tmi.client(tmiConfig);
client.connect();

const obs = new OBSWebSocket();

let active = true;

function handleAdminCommand(channel, messageParts) {
  const command = messageParts[0];

  switch (command) {
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.TOGGLE_COMMANDS_ACTIVE}`: {
      if (active) {
        const message = 'Bot commands are disabled!';

        client.say(channel, message);
        logger.info(message);

        active = false;
      }
      else {
        const message = 'Bot commands are enabled!';

        client.say(channel, message);
        logger.info(message);

        active = true;
      }
      break;
    }
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.RECONNECT_OBS}`: {
      obs.connect(obsConfig).then(() => logger.info('Connected to OBSWebSocket'));
      break;
    }
    default: {
      break;
    }
  }
};

function handleUserCommand(channel, userInfo, messageParts) {
  const command = messageParts[0];

  switch (command) {
    case `${COMMAND_PREFACE}${USER_COMMANDS.HEART}`:
    case `${COMMAND_PREFACE}${USER_COMMANDS.HELLO}`: {
      client.say(channel, `@${userInfo.username}, may your heart be your guiding key`);
      break;
    }
    case `${COMMAND_PREFACE}${USER_COMMANDS.COMMAND_LIST}`: {
      const allCommands = {
        ...OBS_COMMANDS,
        ...USER_COMMANDS
      };
      const commands = Object.keys(allCommands);
      const commandList = commands.map(commandKey => `${COMMAND_PREFACE}${allCommands[commandKey]}`).join(', ');
      client.say(channel, `Here are the available commands: \n${commandList}`);
      break;
    }
    default: {
      break;
    }
  }
}

async function handleOBSCommand(messageParts) {
  const command = messageParts[0];

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

  const normalizedMessage = message.toLowerCase();
  const messageParts = normalizedMessage.split(' ');

  try {
    if (userInfo.username === ADMIN_USER) {
      handleAdminCommand(channel, messageParts);
    }

    if (!active) return;

    handleUserCommand(channel, userInfo, messageParts);
    handleOBSCommand(messageParts);
  } catch (error) {
    logger.error(error);
  }
});