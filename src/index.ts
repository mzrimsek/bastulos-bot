// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { ADMIN_USER, BOT_NAME, COMMAND_PREFACE, LIGHT_COMMANDS, OBS_COMMANDS } from './constants';
import { Clients, CommandData, RedemptionData, TwitchPubSub } from './models';
import {
  apiClient,
  collections,
  discordClient,
  firestore,
  getTwitchPubSubClient,
  mqttClient,
  obsClient,
  obsConnected,
  twitchChatClient
} from './clients';
import { discordConfig, logger } from './config';
import {
  handleAdminCommand,
  handleHelpCommand,
  handleModCommand,
  handleTwitchUserCommand,
  handleUserCommand
} from './commands';
import { isChannelLive, randomlyPadContent } from './utils';

import { Message } from 'discord.js';
import { PubSubRedemptionMessage } from 'twitch-pubsub-client/lib';
import { handleOBSRedemption } from './redemptions';

const clients: Clients = {
  twitchChatClient,
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

  const searchableChannel = channel.replace('#', '');
  const channelIsLive = await isChannelLive(apiClient, searchableChannel);

  if (!channelIsLive) {
    logger.info('Stream offline - command ignored');
    return;
  }

  const mods = await twitchChatClient.getMods(channel);

  const messageParts = message.split(' ');
  const username = `@${user}`;
  const printFunc = (content: string) => twitchChatClient.say(channel, randomlyPadContent(content));
  const commandsActiveUpdateFunc = (newState: boolean) => {
    commandsActive = newState;
  };

  logger.info(`Twitch: ${user} used command: ${message}`);

  const commandData: CommandData = {
    messageParts,
    clients,
    printFunc
  };

  try {
    if (user === ADMIN_USER) {
      if (await handleAdminCommand(commandData, commandsActive, commandsActiveUpdateFunc)) return;
    }

    if (user === ADMIN_USER || mods.includes(user)) {
      if (await handleModCommand(commandData, obsConnected)) return;
    }

    if (!commandsActive) return;

    if (await handleTwitchUserCommand(commandData, username)) return;
    if (await handleHelpCommand(commandData, OBS_COMMANDS, LIGHT_COMMANDS)) return;
    if (await handleUserCommand(commandData, username)) return;
  } catch (error) {
    logger.error(error);
  }
});

getTwitchPubSubClient().then(async (twitchPubSub: TwitchPubSub) => {
  const { twitchPubSubUserId, twitchPubSubClient } = twitchPubSub;

  twitchPubSubClient.onRedemption(twitchPubSubUserId, async (message: PubSubRedemptionMessage) => {
    logger.info(`${message.rewardName} redeemed by ${message.userName}`);

    const redemptionData: RedemptionData = {
      message,
      clients
    };

    try {
      if (await handleOBSRedemption(redemptionData, obsConnected)) return;
    } catch (error) {
      logger.error(error);
    }
  });
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

  logger.info(`Discord: ${member?.displayName} used command: ${message}`);

  const commandData: CommandData = {
    messageParts,
    clients,
    printFunc
  };

  try {
    if (await handleHelpCommand(commandData)) return;
    if (await handleUserCommand(commandData, username)) return;
  } catch (error) {
    logger.error(error);
  }
});
