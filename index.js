require('dotenv').config();

const logger = require('winston');
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { colorize: true });
logger.level = 'debug';
global.logger = logger;

const tmi = require('tmi.js');
const OBSWebSocket = require('obs-websocket-js');
const admin = require('firebase-admin');
const discord = require('discord.js');

const tmiConfig = require('./config/tmi');
const firebaseConfig = require('./config/firebase');
const discordConfig = require('./config/discord');

const { COMMAND_PREFACE, ADMIN_USER, OBS_COMMANDS } = require('./constants/commands');

const { handleAdminCommand, handleOBSCommand } = require('./commands/twitch');
const { handleUserCommand, handleHelpCommand } = require('./commands/shared');
const { loadUserCommands } = require('./utils');

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

const clients = {
  twitchClient,
  obsClient,
  firestore,
  discordClient
};

let commandsActive = true;

twitchClient.on('chat', async (channel, userInfo, message, self) => {
  if (self) return; // ignore messages from the bot 

  if (message[0] !== COMMAND_PREFACE) return; // ignore non command messages

  const messageParts = message.split(' ');
  const username = `@${userInfo.username}`;
  const printFunc = content => twitchClient.say(channel, content);
  const commandsActiveUpdateFunc = newState => commandsActive = newState;

  try {
    if (userInfo.username === ADMIN_USER) {
      handleAdminCommand(messageParts, printFunc, commandsActive, commandsActiveUpdateFunc, clients);
    }

    if (!commandsActive) return;

    const userCommands = await loadUserCommands(firestore);

    handleHelpCommand(messageParts, printFunc, userCommands, OBS_COMMANDS);
    handleUserCommand(messageParts, username, printFunc, userCommands);
    handleOBSCommand(messageParts, clients);
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
    const userCommands = await loadUserCommands(firestore);

    handleHelpCommand(messageParts, printFunc, userCommands);
    handleUserCommand(messageParts, username, printFunc, userCommands);
  } catch (error) {
    logger.error(error);
  }
});