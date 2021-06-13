require('dotenv').config();

const logger = require('winston');
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { colorize: true });
logger.level = 'debug';
global.logger = logger;

const tmi = require('tmi.js');
const OBSWebSocket = require('obs-websocket-js');
const discord = require('discord.js');
const mqtt = require('mqtt');

const { firestore, collections } = require('./clients/firebase');

const tmiConfig = require('./config/tmi');
const obsConfig = require('./config/obs');
const discordConfig = require('./config/discord');
const mqttConfig = require('./config/mqtt');

const { COMMAND_PREFACE, ADMIN_USER, OBS_COMMANDS, LIGHT_COMMANDS } = require('./constants/commands');

const { handleAdminCommand, handleOBSCommand, handleModCommand, handleTwitchUserCommand } = require('./commands/twitch');
const { handleUserCommand, handleHelpCommand } = require('./commands/shared');
const { loadUserCommands, randomlyPadContent } = require('./utils');

// init twitch client
const twitchClient = new tmi.client(tmiConfig);
twitchClient.connect();

// init obs client
let obsConnected = false;
const obsClient = new OBSWebSocket();
obsClient.on('ConnectionOpened', () => {
  obsConnected = true;
  logger.info('Connected to OBSWebSocket');
});
obsClient.on('ConnectionClosed', () => {
  obsConnected = false;
  logger.info('Disconnected from OBSWebSocket');
});

// init discord client
const discordClient = new discord.Client();
discordClient.login(discordConfig.token);

// init connection to discord server
discordClient.on('ready', () => {
  logger.info('Connected to Discord');
  logger.info(`Logged in as: ${discordClient.user.tag} - (${discordClient.user.id})`);
});

// init mqtt client
const mqttClient = mqtt.connect(`tcp://${mqttConfig.address}`);
mqttClient.on('connect', () => {
  logger.info('Connected to MQTT Broker');
});

const clients = {
  twitchClient,
  obsClient,
  firestore,
  discordClient,
  mqttClient
};

let commandsActive = true;

twitchClient.on('chat', async (channel, userInfo, message, self) => {
  if (self) return; // ignore messages from the bot 

  if (message[0] !== COMMAND_PREFACE) return; // ignore non command messages

  const messageParts = message.split(' ');
  const username = `@${userInfo.username}`;
  const printFunc = content => twitchClient.say(channel, randomlyPadContent(content));
  const commandsActiveUpdateFunc = newState => commandsActive = newState;

  try {
    if (userInfo.username === ADMIN_USER) {
      handleAdminCommand(messageParts, printFunc, commandsActive, commandsActiveUpdateFunc, clients);
    }

    if (userInfo.username === ADMIN_USER || userInfo.mod) {
      await handleModCommand(messageParts, printFunc, clients);
    }

    if (!commandsActive) return;

    if (!obsConnected) {
      await obsClient.connect(obsConfig);
    }

    const userCommands = await loadUserCommands(firestore);

    handleHelpCommand(messageParts, printFunc, userCommands, OBS_COMMANDS, LIGHT_COMMANDS);
    handleUserCommand(messageParts, username, printFunc, userCommands);
    handleTwitchUserCommand(messageParts, username, printFunc, clients);
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
  const printFunc = content => message.channel.send(randomlyPadContent(content));

  try {
    const userCommands = await loadUserCommands(firestore);

    handleHelpCommand(messageParts, printFunc, userCommands);
    handleUserCommand(messageParts, username, printFunc, userCommands);
  } catch (error) {
    logger.error(error);
  }
});