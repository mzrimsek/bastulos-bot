import { getEnvValue } from '../../utils';

export default {
  channel: getEnvValue('TWITCH_CHANNEL'),
  botClientId: getEnvValue('TWITCH_BOT_CLIENT_ID'),
  botClientSecret: getEnvValue('TWITCH_BOT_CLIENT_SECRET'),
  botTokensLocation: getEnvValue('TWITCH_BOT_TOKENS_FILE_LOCATION'),
  channelClientId: getEnvValue('TWITCH_CHANNEL_CLIENT_ID'),
  channelClientSecret: getEnvValue('TWITCH_CHANNEL_CLIENT_SECRET'),
  channelTokensLocation: getEnvValue('TWITCH_CHANNEL_TOKENS_FILE_LOCATION')
};
