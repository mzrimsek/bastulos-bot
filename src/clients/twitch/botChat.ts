import { logger, twitchConfig } from '../../config';

import { ChatClient } from 'twitch-chat-client';
import { getRefreshableAuthProvider } from './helpers';

export class TwitchBotChatClient {
  private client: ChatClient | null = null;

  private async getClient(): Promise<ChatClient> {
    if (!this.client) {
      const { channel, botClientId, botClientSecret, botTokensLocation } = twitchConfig;

      const botAuthProvider = getRefreshableAuthProvider(
        botClientId,
        botClientSecret,
        botTokensLocation
      );
      this.client = new ChatClient(botAuthProvider, {
        channels: [channel]
      });
      this.client.connect();
      this.client.onConnect(() => logger.info('Connected to Twitch Chat'));
    }
    return this.client;
  }

  async onMessage(
    messageHandler: (channel: string, user: string, message: string) => void
  ): Promise<void> {
    const client = await this.getClient();
    client.onMessage(messageHandler);
  }

  async say(channel: string, message: string): Promise<void> {
    const client = await this.getClient();
    client.say(channel, message);
  }

  async getMods(channel: string): Promise<string[]> {
    const client = await this.getClient();
    return client.getMods(channel);
  }
}
