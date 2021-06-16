import { getEnvValue } from '../utils';

export default {
  channel: getEnvValue('TWITCH_CHANNEL'),
  clientId: getEnvValue('TWITCH_APPLICATION_CLIENT_ID'),
  clientSecret: getEnvValue('TWITCH_APPLICATION_CLIENT_SECRET'),
  tokensLocation: getEnvValue('TWITCH_BOT_TOKENS_FILE_LOCATION')
};
