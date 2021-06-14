const discord = require('discord.js');

const discordConfig = require('../config/discord');

const discordClient = new discord.Client();
discordClient.login(discordConfig.token);

discordClient.on('ready', () => {
  logger.info('Connected to Discord');
  logger.info(`Logged in as: ${discordClient.user.tag} - (${discordClient.user.id})`);
});

module.exports = {
  discordClient
};