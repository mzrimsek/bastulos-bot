import * as fs from 'fs';

import { RefreshableAuthProvider, StaticAuthProvider } from 'twitch-auth';
import { logger, twitchConfig } from 'src/config';

import { ChatClient } from 'twitch-chat-client';
import { PubSubClient } from 'twitch-pubsub-client';

const { channels, clientId, clientSecret, tokensLocation } = twitchConfig;

const tokenData = JSON.parse(fs.readFileSync(tokensLocation, 'utf-8'));
const authProvider = new RefreshableAuthProvider(
  new StaticAuthProvider(clientId, tokenData.accessToken),
  {
    clientSecret,
    refreshToken: tokenData.refreshToken,
    expiry:
      tokenData.expiryTimestamp === null
        ? null
        : new Date(tokenData.expiryTimestamp),
    onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
      const newTokenData = {
        accessToken,
        refreshToken,
        expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
      };
      fs.writeFileSync(
        tokensLocation,
        JSON.stringify(newTokenData, null, 4),
        'utf-8'
      );
    }
  }
);

export const twitchChatClient = new ChatClient(authProvider, { channels });
twitchChatClient.connect();
twitchChatClient.onConnect(() => logger.info('Connected to Twitch Chat'));

export const twitchPubSubClient = new PubSubClient();
