import { PubSubClient, PubSubRedemptionMessage } from 'twitch-pubsub-client';

import { ApiClient } from 'twitch';
import { getRefreshableAuthProvider } from './helpers';
import { logger } from '../../config';
import twitchConfig from './config';

export class TwitchChannelPubSubClient {
  private client: PubSubClient | null = null;
  private userId = '';

  private async getClient(): Promise<PubSubClient> {
    if (!this.client) {
      const { channelClientId, channelClientSecret, channelTokensLocation } = twitchConfig;

      const channelAuthProvider = getRefreshableAuthProvider(
        channelClientId,
        channelClientSecret,
        channelTokensLocation
      );
      const apiClient = new ApiClient({ authProvider: channelAuthProvider });

      this.client = new PubSubClient();
      this.userId = await this.client.registerUserListener(apiClient);

      logger.info('Twitch PubSub Client Initialized');
    }
    return this.client;
  }

  async onRedemption(redemptionHandler: (message: PubSubRedemptionMessage) => void): Promise<void> {
    const client = await this.getClient();
    client.onRedemption(this.userId, redemptionHandler);
  }
}
