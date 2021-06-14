require('dotenv').config();
import {
  twitchClient,
  obsClient,
  obsConnected,
  firestore,
  collections,
  discordClient,
  mqttClient
} from './clients';
import { discordConfig, logger } from './config';
import { COMMAND_PREFACE, ADMIN_USER, OBS_COMMANDS, LIGHT_COMMANDS } from './constants';

const {
  handleAdminCommand,
  handleOBSCommand,
  handleModCommand,
  handleTwitchUserCommand
} = require('./commands/twitch');
const { handleUserCommand, handleHelpCommand } = require('./commands/shared');
const { randomlyPadContent } = require('./utils');

const clients = {
  twitchClient,
  obsClient,
  firebase: {
    firestore,
    collections
  },
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
  const commandsActiveUpdateFunc = (newState: boolean) => (commandsActive = newState);

  try {
    if (userInfo.username === ADMIN_USER) {
      if (
        handleAdminCommand(
          messageParts,
          printFunc,
          commandsActive,
          commandsActiveUpdateFunc,
          clients
        )
      )
        return;
    }

    if (userInfo.username === ADMIN_USER || userInfo.mod) {
      if (await handleModCommand(messageParts, printFunc, clients)) return;
    }

    if (!commandsActive) return;

    if (await handleTwitchUserCommand(messageParts, username, printFunc, clients)) return;
    if (await handleOBSCommand(messageParts, clients, obsConnected)) return;
    if (await handleHelpCommand(messageParts, printFunc, clients, OBS_COMMANDS, LIGHT_COMMANDS))
      return;
    if (await handleUserCommand(messageParts, username, printFunc, clients)) return;
  } catch (error) {
    logger.error(error);
  }
});

discordClient.on('message', async message => {
  const member = await message.guild.members.fetch(message.author);
  const isBastulosBot = member.id === discordConfig.bot_user_id;
  const { content } = message;

  if (isBastulosBot) return; // ignore messages from the bot

  if (content[0] !== COMMAND_PREFACE) return; // ignore non command messages

  const messageParts = content.split(' ');
  const username = `<@!${member.user.id}>`;
  const printFunc = content => message.channel.send(randomlyPadContent(content));

  try {
    if (await handleHelpCommand(messageParts, printFunc, clients)) return;
    if (await handleUserCommand(messageParts, username, printFunc, clients)) return;
  } catch (error) {
    logger.error(error);
  }
});
