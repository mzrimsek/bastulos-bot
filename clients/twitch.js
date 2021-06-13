const tmi = require('tmi.js');

const tmiConfig = require('../config/twitch');

const twitchClient = new tmi.client(tmiConfig);
twitchClient.connect();

module.exports = {
  twitchClient
};