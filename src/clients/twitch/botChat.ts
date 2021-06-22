import { logger, twitchConfig } from '../../config';

import { ChatClient } from 'twitch-chat-client';
import { Client } from '../../models';
import { getRefreshableAuthProvider } from './helpers';

export class TwitchBotChatClient implements Client<ChatClient> {
  private client: ChatClient | null = null;

  async getClient(): Promise<ChatClient> {
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
}
