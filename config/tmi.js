const config = {
  options: {
    debug: true
  },
  connection: {
    reconnect: true
  },
  identity: {
    username: 'bastulosbot',
    password: `oauth:${process.env.TMI_TOKEN}`
  },
  channels: ['bastulos']
};

module.exports = config;