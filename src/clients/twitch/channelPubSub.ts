import { logger, twitchConfig } from '../../config';

import { ApiClient } from 'twitch';
import { PubSubClient } from 'twitch-pubsub-client';
import { TwitchPubSub } from '../../models';
import { getRefreshableAuthProvider } from './helpers';

export class TwitchChannelPubSubClient {
  private client: TwitchPubSub | null = null;

  async getClient(): Promise<TwitchPubSub> {
    if (!this.client) {
      const { channelClientId, channelClientSecret, channelTokensLocation } = twitchConfig;

      const channelAuthProvider = getRefreshableAuthProvider(
        channelClientId,
        channelClientSecret,
        channelTokensLocation
      );
      const apiClient = new ApiClient({ authProvider: channelAuthProvider });

      const twitchPubSubClient = new PubSubClient();

      try {
        const twitchPubSubUserId = await twitchPubSubClient.registerUserListener(apiClient);

        logger.info('Twitch PubSub Client Initialized');
        this.client = {
          twitchPubSubUserId,
          twitchPubSubClient
        };
      } catch (error) {
        logger.error('Twitch PubSub Client Failed to Initialize:', error);
        throw new Error(error);
      }
    }
    return this.client;
  }
}
