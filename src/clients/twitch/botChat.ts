import { logger, twitchConfig } from '../../config';

import { ChatClient } from 'twitch-chat-client';
import { getRefreshableAuthProvider } from './helpers';

export class TwitchBotChatClient {
  private client: ChatClient;

  constructor() {
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

  async onMessage(
    messageHandler: (channel: string, user: string, message: string) => void
  ): Promise<void> {
    this.client.onMessage(messageHandler);
  }

  async say(channel: string, message: string): Promise<void> {
    this.client.say(channel, message);
  }

  async getMods(channel: string): Promise<string[]> {
    return this.client.getMods(channel);
  }
}
