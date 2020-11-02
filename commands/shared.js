const { COMMAND_PREFACE, OBS_COMMANDS, HELP_COMMAND } = require('../constants/commands');
const { COMMANDS_COLLECTION } = require('../constants/firebase');

const { replaceRequestingUserInMessage } = require('../utils');

async function loadUserCommands(firestore) {
  const commandsSnapshot = await firestore.collection(COMMANDS_COLLECTION).get();
  logger.info('User commands loaded');
  return commandsSnapshot.docs.map(doc => doc.data());
}

async function handleUserCommand(messageParts, username, printFunc, clients) {
  const { firestore } = clients;
  const userCommands = await loadUserCommands(firestore);

  const command = messageParts[0].toLowerCase();

  if (command === `${COMMAND_PREFACE}${HELP_COMMAND}`) {
    const obsCommandKeys = Object.keys(OBS_COMMANDS);
    const obsCommandList = obsCommandKeys.map(commandKey => OBS_COMMANDS[commandKey]);
    const userCommandList = userCommands.map(userCommand => userCommand.command);
    const allCommandList = [...userCommandList, ...obsCommandList, HELP_COMMAND];

    const helpMessageList = allCommandList.map(command => `${COMMAND_PREFACE}${command}`).join(', ');
    printFunc(`Here are the available commands: \n${helpMessageList}`);
  } else {
    const foundCommand = userCommands.find(x => `${COMMAND_PREFACE}${x.command}` === command);

    if (foundCommand) {
      logger.info(`Found command: ${foundCommand.command}`);
      const replacedCommand = replaceRequestingUserInMessage(username, foundCommand.message);
      printFunc(replacedCommand);
    }
  }
}

module.exports = {
  handleUserCommand
};