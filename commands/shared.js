const { COMMAND_PREFACE, HELP_COMMAND } = require('../constants/commands');

const { replaceRequestingUserInMessage } = require('../utils');

async function handleUserCommand(messageParts, username, printFunc, userCommands) {
  const command = messageParts[0].toLowerCase();

  const foundCommand = userCommands.find(x => `${COMMAND_PREFACE}${x.command}` === command);
  if (foundCommand) {
    logger.info(`Found command: ${foundCommand.command}`);
    const replacedCommand = replaceRequestingUserInMessage(username, foundCommand.message);
    printFunc(replacedCommand);
  }
}

function handleHelpCommand(messageParts, printFunc, userCommands, ...extraCommandsDefinitions) {
  const command = messageParts[0].toLowerCase();

  if (command === `${COMMAND_PREFACE}${HELP_COMMAND}`) {
    const extraCommandsLists = extraCommandsDefinitions.map(extraCommandsDefinition => {
      const extraCommandKeys = Object.keys(extraCommandsDefinition);
      return extraCommandKeys.map(commandKey => extraCommandsDefinition[commandKey]);
    });
    const extraCommandsList = [].concat(...extraCommandsLists);

    const userCommandList = userCommands.map(userCommand => userCommand.command);
    const allCommandList = [...userCommandList, ...extraCommandsList, HELP_COMMAND];

    const helpMessageList = allCommandList.map(command => `${COMMAND_PREFACE}${command}`).join(', ');
    printFunc(`Here are the available commands: \n${helpMessageList}`);
  }
}

module.exports = {
  handleUserCommand,
  handleHelpCommand
};