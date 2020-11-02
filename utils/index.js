const { COMMANDS_COLLECTION } = require('../constants/firebase');

function getRandomColor() {
  return (Math.random() * 4294967296) >>> 0;
}

function replaceRequestingUserInMessage(username, command) {
  return command.replace('{user}', username);
}

async function loadUserCommands(firestore) {
  const commandsSnapshot = await firestore.collection(COMMANDS_COLLECTION).get();
  logger.info('User commands loaded');
  return commandsSnapshot.docs.map(doc => doc.data());
}

module.exports = {
  getRandomColor,
  replaceRequestingUserInMessage,
  loadUserCommands
};