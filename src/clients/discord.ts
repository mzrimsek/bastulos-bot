import { Client, Message } from 'discord.js';
import { discordConfig, logger } from '../config';

export class DiscordClient {
  private client: Client | null = null;

  private async getClient(): Promise<Client> {
    if (!this.client) {
      this.client = new Client();
      this.client.login(discordConfig.token);

      this.client.on('ready', () => {
        logger.info('Connected to Discord');
        logger.info(`Logged in as: ${this.client?.user?.tag} - (${this.client?.user?.id})`);
      });
    }
    return this.client;
  }

  async onMessage(messageHandler: (message: Message) => void): Promise<void> {
    const client = await this.getClient();
    client.on('message', messageHandler);
  }
}
