// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { ADMIN_USER, BOT_NAME, COMMAND_PREFACE, LIGHT_COMMANDS, OBS_COMMANDS } from './constants';
import { CommandData, RedemptionData } from './models';
import {
  handleAdminCommand,
  handleHelpCommand,
  handleModCommand,
  handleTwitchUserCommand,
  handleUserCommand
} from './commands';

import { Message } from 'discord.js';
import { PubSubRedemptionMessage } from 'twitch-pubsub-client';
import { clients } from './clients';
import { handleOBSRedemption } from './redemptions';
import { logger } from './config';
import { randomlyPadContent } from './utils';

let commandsActive = true;

clients.TwitchChat.onMessage(async (channel: string, user: string, message: string) => {
  if (user === BOT_NAME) return; // ignore messages from the bot

  if (message[0] !== COMMAND_PREFACE) return; // ignore non command messages

  // const searchableChannel = channel.replace('#', '');
  // const channelIsLive = await clients.TwitchApi.isChannelLive(searchableChannel);

  // if (!channelIsLive) {
  //   logger.info('Stream offline - command ignored');
  //   return;
  // }

  const messageParts = message.split(' ');
  const username = `@${user}`;
  const printFunc = (content: string) =>
    clients.TwitchChat.say(channel, randomlyPadContent(content));
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

    const userIsMod = clients.TwitchChat.isUserChannelMod(channel, user);
    if (user === ADMIN_USER || userIsMod) {
      if (await handleModCommand(commandData)) return;
    }

    if (!commandsActive) return;

    if (await handleTwitchUserCommand(commandData, username)) return;
    if (await handleHelpCommand(commandData, OBS_COMMANDS, LIGHT_COMMANDS)) return;
    if (await handleUserCommand(commandData, username)) return;
  } catch (error) {
    logger.error(error);
  }
});

clients.TwitchPubSub.onRedemption(async (message: PubSubRedemptionMessage) => {
  logger.info(`${message.rewardName} redeemed by ${message.userName}`);

  const redemptionData: RedemptionData = {
    message,
    clients
  };

  try {
    if (await handleOBSRedemption(redemptionData)) return;
  } catch (error) {
    logger.error(error);
  }
});

clients.Discord.onMessage(async (message: Message) => {
  const member = await message.guild?.members.fetch(message.author);
  const isBastulosBot = member?.id === clients.Discord.getBotUserId();
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
