import { RefreshableAuthProvider, StaticAuthProvider } from 'twitch-auth';
import { ChatClient } from 'twitch-chat-client';
import { PubSubClient } from 'twitch-pubsub-client';
import * as fs from 'fs';
import { twitchConfig } from '../config';

const { channels, clientId, clientSecret } = twitchConfig;

const tokenData = JSON.parse(fs.readFileSync('tokens.json', 'utf-8'));
const authProvider = new RefreshableAuthProvider(
  new StaticAuthProvider(clientId, tokenData.accessToken),
  {
    clientSecret,
    refreshToken: tokenData.refreshToken,
    expiry: tokenData.expiryTimestamp === null ? null : new Date(tokenData.expiryTimestamp),
    onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
      const newTokenData = {
        accessToken,
        refreshToken,
        expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
      };
      fs.writeFileSync('tokens.json', JSON.stringify(newTokenData, null, 4), 'utf-8');
    }
  }
);

export const twitchChatClient = new ChatClient(authProvider, { channels });
twitchChatClient.connect();

export const twitchPubSubClient = new PubSubClient();
