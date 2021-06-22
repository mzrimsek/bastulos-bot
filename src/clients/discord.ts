import * as discord from 'discord.js';

import { discordConfig, logger } from '../config';

export class DiscordClient {
  private client: discord.Client | null = null;

  async getClient(): Promise<discord.Client> {
    if (!this.client) {
      this.client = new discord.Client();
      this.client.login(discordConfig.token);

      this.client.on('ready', () => {
        logger.info('Connected to Discord');
        logger.info(`Logged in as: ${this.client?.user?.tag} - (${this.client?.user?.id})`);
      });
    }
    return this.client;
  }
}
