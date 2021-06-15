// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { Message } from 'discord.js';
import {
  twitchChatClient,
  twitchPubSubClient,
  obsClient,
  obsConnected,
  firestore,
  collections,
  discordClient,
  mqttClient
} from './clients';
import { discordConfig, logger } from './config';
import { COMMAND_PREFACE, ADMIN_USER, OBS_COMMANDS, LIGHT_COMMANDS, BOT_NAME } from './constants';
import {
  handleAdminCommand,
  handleOBSCommand,
  handleModCommand,
  handleTwitchUserCommand,
  handleUserCommand,
  handleHelpCommand
} from './commands';
import { Clients } from './models';
import { randomlyPadContent } from './utils';

const clients: Clients = {
  twitchChatClient,
  twitchPubSubClient,
  obsClient,
  firebase: {
    firestore,
    collections
  },
  discordClient,
  mqttClient
};

let commandsActive = true;

twitchChatClient.onMessage(async (channel: string, user: string, message: string) => {
  if (user === BOT_NAME) return; // ignore messages from the bot

  if (message[0] !== COMMAND_PREFACE) return; // ignore non command messages

  const mods = await twitchChatClient.getMods(channel);

  const messageParts = message.split(' ');
  const username = `@${user}`;
  const printFunc = (content: string) => twitchChatClient.say(channel, randomlyPadContent(content));
  const commandsActiveUpdateFunc = (newState: boolean) => {
    commandsActive = newState;
  };

  try {
    if (user === ADMIN_USER) {
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

    if (user === ADMIN_USER || mods.includes(user)) {
      if (await handleModCommand(messageParts, clients)) return;
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

discordClient.on('message', async (message: Message) => {
  const member = await message.guild?.members.fetch(message.author);
  const isBastulosBot = member?.id === discordConfig.bot_user_id;
  const { content } = message;

  if (isBastulosBot) return; // ignore messages from the bot

  if (content[0] !== COMMAND_PREFACE) return; // ignore non command messages

  const messageParts = content.split(' ');
  const username = `<@!${member?.user.id}>`;
  const printFunc = (content: string) => message.channel.send(randomlyPadContent(content));

  try {
    if (await handleHelpCommand(messageParts, printFunc, clients)) return;
    if (await handleUserCommand(messageParts, username, printFunc, clients)) return;
  } catch (error) {
    logger.error(error);
  }
});
