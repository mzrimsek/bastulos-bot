require('dotenv').config();

const logger = require('winston');
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { colorize: true });
logger.level = 'debug';

const tmi = require('tmi.js');
const OBSWebSocket = require('obs-websocket-js');
const admin = require('firebase-admin');
const discord = require('discord.js');

const tmiConfig = require('./config/tmi');
const obsConfig = require('./config/obs');
const firebaseConfig = require('./config/firebase');
const discordConfig = require('./config/discord');

const { COMMAND_PREFACE, ADMIN_USER, ADMIN_COMMANDS, OBS_COMMANDS, HELP_COMMAND } = require('./constants/commands');
const { COMMANDS_COLLECTION } = require('./constants/firebase');

const { replaceRequestingUserInMessage } = require('./utils');
const { handleOBSCommand } = require('./commands/twitch');

// init twitch client
const twitchClient = new tmi.client(tmiConfig);
twitchClient.connect();

// init obs client
const obsClient = new OBSWebSocket();

// init firebase client
admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig.service_account),
  databaseURL: firebaseConfig.database_url
});
const firestoreSettings = {
  timestampsInSnapshots: true
};

// init connection to firestore
let firestore = null;
try {
  firestore = admin.firestore();
  firestore.settings(firestoreSettings);
  logger.info('Connection to Firebase established');
} catch {
  logger.info('Failed to connect to Firebase');
}

// init discord client
const discordClient = new discord.Client();
discordClient.login(discordConfig.token);

// init connection to discord server
discordClient.on('ready', () => {
  logger.info('Connected to Discord');
  logger.info(`Logged in as: ${discordClient.user.tag} - (${discordClient.user.id})`);
});

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
        twitchClient.say(channel, 'Bot commands are disabled!');
        commandsActive = false;
      }
      else {
        twitchClient.say(channel, 'Bot commands are enabled!');
        commandsActive = true;
      }
      break;
    }
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.RECONNECT_OBS}`: {
      obsClient.connect(obsConfig).then(() => logger.info('Connected to OBSWebSocket'));
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

async function handleUserCommand(messageParts, username, printFunc) {
  const userCommands = await loadUserCommands();

  const command = messageParts[0].toLowerCase();

  if (command === `${COMMAND_PREFACE}${HELP_COMMAND}`) {
    const obsCommandKeys = Object.keys(OBS_COMMANDS);
    const obsCommandList = obsCommandKeys.map(commandKey => OBS_COMMANDS[commandKey]);
    const userCommandList = userCommands.map(userCommand => userCommand.command);
    const allCommandList = [...userCommandList, ...obsCommandList, HELP_COMMAND];

    const helpMessageList = allCommandList.map(command => `${COMMAND_PREFACE}${command}`).join(', ');
    printFunc(`Here are the available commands: \n${helpMessageList}`);
  } else {
    const foundCommand = userCommands.find(x => `${COMMAND_PREFACE}${x.command}` === command);

    if (foundCommand) {
      logger.info(`Found command: ${foundCommand.command}`);
      const replacedCommand = replaceRequestingUserInMessage(username, foundCommand.message);
      printFunc(replacedCommand);
    }
  }
}

twitchClient.on('chat', async (channel, userInfo, message, self) => {
  if (self) return; // ignore messages from the bot 

  if (message[0] !== COMMAND_PREFACE) return; // ignore non command messages

  const messageParts = message.split(' ');
  const username = `@${userInfo.username}`;
  const printFunc = content => twitchClient.say(channel, content);

  try {
    if (userInfo.username === ADMIN_USER) {
      handleAdminCommand(channel, messageParts);
    }

    if (!commandsActive) return;

    handleUserCommand(messageParts, username, printFunc);
    handleOBSCommand(messageParts, obsClient);
  } catch (error) {
    logger.error(error);
  }
});

discordClient.on('message', async message => {
  const member = await message.guild.fetchMember(message.author);
  const isBastulosBot = member.id === discordConfig.bot_user_id;
  const { content } = message;

  if (isBastulosBot) return; // ignore messages from the bot

  if (content[0] !== COMMAND_PREFACE) return; // ignore non command messages

  const messageParts = content.split(' ');
  const username = `<@!${member.user.id}>`;
  const printFunc = content => message.channel.send(content);

  try {
    handleUserCommand(messageParts, username, printFunc);
  } catch (error) {
    logger.error(error);
  }
});