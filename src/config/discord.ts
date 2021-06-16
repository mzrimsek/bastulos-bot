import { getEnvValue } from '../utils';

export default {
  token: getEnvValue('DISCORD_TOKEN'),
  bot_user_id: getEnvValue('DISCORD_BOT_USER_ID')
};
