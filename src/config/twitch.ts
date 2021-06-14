const channelKeys = Object.keys(process.env).filter(key => key.match(/TWITCH_CHANNEL_\d/g));
const channels = channelKeys.map(key => process.env[key]);

export default {
  connection: {
    reconnect: true
  },
  identity: {
    username: 'bastulosbot',
    password: `oauth:${process.env.TMI_TOKEN}`
  },
  channels
};