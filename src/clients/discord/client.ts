import { Client, Message } from 'discord.js';

import discordConfig from './config';
import { logger } from '../../config';

export class DiscordClient {
  private client: Client;

  constructor() {
    this.client = new Client();
    this.client.login(discordConfig.token);

    this.client.on('ready', () => {
      logger.info('Connected to Discord');
      logger.info(`Logged in as: ${this.client.user?.tag} - (${this.client.user?.id})`);
    });
  }

  async onMessage(messageHandler: (message: Message) => void): Promise<void> {
    this.client.on('message', messageHandler);
  }

  getBotUserId(): string {
    const botUser = this.client.user;

    if (botUser) {
      return botUser.id;
    }

    return '';
  }
}
