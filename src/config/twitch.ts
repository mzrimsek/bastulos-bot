import { getEnvValue } from '../utils';

const channelKeys = Object.keys(process.env).filter(key => key.match(/TWITCH_CHANNEL_\d/g));
const channels = channelKeys.map(key => getEnvValue(key));

export default {
  channels,
  clientId: getEnvValue('TWITCH_APPLICATION_CLIENT_ID'),
  clientSecret: getEnvValue('TWITCH_APPLICATION_CLIENT_SECRET'),
  botUserName: getEnvValue('TWITCH_BOT_USERNAME'),
  tokensFileLocation: getEnvValue('TWITCH_BOT_TOKENS_FILE_LOCATION')
};
