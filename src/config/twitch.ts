const channelKeys = Object.keys(process.env).filter(key => key.match(/TWITCH_CHANNEL_\d/g));
const channels = channelKeys
  .map(key => {
    const channel = process.env[key];
    if (channel) {
      return channel;
    }
    return '';
  })
  .filter(channel => channel !== '');

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
