import * as discord from 'discord.js';
import { discordConfig, logger } from '../config';

export const discordClient = new discord.Client();
discordClient.login(discordConfig.token);

discordClient.on('ready', () => {
  logger.info('Connected to Discord');
  logger.info(`Logged in as: ${discordClient.user.tag} - (${discordClient.user.id})`);
});