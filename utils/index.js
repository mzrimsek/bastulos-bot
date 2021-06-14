const { COMMAND_SPACER } = require('../constants/commands');
const { COMMANDS_COLLECTION, WORD_TRACKING_COLLECTION } = require('../constants/firebase');

function getRandomColor() {
  return (Math.random() * 4294967296) >>> 0;
}

function getRandomInt(max, offset = 0) {
  return Math.floor(Math.random() * max) + offset;
}

function replaceRequestingUserInMessage(username, command) {
  return command.replace('{user}', username);
}

function randomlyPadContent(content) {
  const numToPad = getRandomInt(99, 1);
  const padding = COMMAND_SPACER.repeat(numToPad);
  return `${content}${padding}`;
}

async function loadUserCommands(firebase) {
  const { collections } = firebase;
  const { commandsCollection } = collections;

  const commandsSnapshot = await commandsCollection.get();
  logger.info('User commands loaded');
  return commandsSnapshot.docs.map(doc => doc.data());
}

async function loadTrackingPhrases(firebase) {
  const { collections } = firebase;
  const { trackingWordsCollection } = collections;

  const wordsSnapshot = await trackingWordsCollection.get();
  logger.info('Tracking words loaded');
  return wordsSnapshot.docs.map(doc => doc.id);
}

module.exports = {
  getRandomColor,
  getRandomInt,
  replaceRequestingUserInMessage,
  loadUserCommands,
  loadTrackingPhrases,
  randomlyPadContent
};