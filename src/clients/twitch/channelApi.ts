import { logger, twitchConfig } from '../../config';

import { ApiClient } from 'twitch';
import { getRefreshableAuthProvider } from './helpers';

export class TwitchChannelApiClient {
  private client: ApiClient;

  constructor() {
    const { channelClientId, channelClientSecret, channelTokensLocation } = twitchConfig;

    const channelAuthProvider = getRefreshableAuthProvider(
      channelClientId,
      channelClientSecret,
      channelTokensLocation
    );
    this.client = new ApiClient({ authProvider: channelAuthProvider });

    logger.info('Twitch API Client Initialized');
  }

  async isChannelLive(channel: string): Promise<boolean> {
    const stream = await this.client.helix.streams.getStreamByUserName(channel);
    return stream !== null;
  }
}
