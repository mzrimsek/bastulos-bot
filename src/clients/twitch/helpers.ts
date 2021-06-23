import * as fs from 'fs';

import { RefreshableAuthProvider, StaticAuthProvider } from 'twitch-auth';

export function getRefreshableAuthProvider(
  clientId: string,
  clientSecret: string,
  tokensLocation: string
): RefreshableAuthProvider {
  const tokenData = JSON.parse(fs.readFileSync(tokensLocation, 'utf-8'));
  return new RefreshableAuthProvider(new StaticAuthProvider(clientId, tokenData.accessToken), {
    clientSecret,
    refreshToken: tokenData.refreshToken,
    expiry: tokenData.expiryTimestamp === null ? null : new Date(tokenData.expiryTimestamp),
    onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
      const newTokenData = {
        accessToken,
        refreshToken,
        expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
      };
      fs.writeFileSync(tokensLocation, JSON.stringify(newTokenData, null, 4), 'utf-8');
    }
  });
}
