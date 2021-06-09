const { UNICODE_COMMAND_SPACER } = require('../constants/commands');
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
  const padding = UNICODE_COMMAND_SPACER.repeat(numToPad);
  console.log(`${content}${padding}`.length);
  return `${content}${padding}`;
}

async function loadUserCommands(firestore) {
  const commandsSnapshot = await firestore.collection(COMMANDS_COLLECTION).get();
  logger.info('User commands loaded');
  return commandsSnapshot.docs.map(doc => doc.data());
}

async function loadTrackingPhrases(firestore) {
  const wordsSnapshot = await firestore.collection(WORD_TRACKING_COLLECTION).get();
  logger.info('Tracking words loaded');
  return wordsSnapshot.docs.map(doc => doc.id);
}

module.exports = {
  getRandomColor,
  replaceRequestingUserInMessage,
  loadUserCommands,
  loadTrackingPhrases,
  randomlyPadContent
};