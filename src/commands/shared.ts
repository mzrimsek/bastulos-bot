import { COMMAND_PREFACE, HELP_COMMAND } from '../constants';

import { CommandData } from '../models';
import logger from '../logger';
import { replaceRequestingUserInMessage } from '../utils';

export async function handleUserCommand(
  commandData: CommandData,
  username: string
): Promise<boolean> {
  const { messageParts, clients, printFunc } = commandData;

  const command = messageParts[0].toLowerCase();

  const { Firestore } = clients;
  const userCommands = await Firestore.loadUserCommands();

  const foundCommand = userCommands.find(x => `${COMMAND_PREFACE}${x.command}` === command);
  if (foundCommand) {
    logger.info(`Found command: ${foundCommand.command}`);
    const replacedCommand = replaceRequestingUserInMessage(username, foundCommand.message);
    printFunc(replacedCommand);

    return true;
  }

  return false;
}

export async function handleHelpCommand(
  commandData: CommandData,
  ...extraCommandsDefinitions: Record<string, string>[]
): Promise<boolean> {
  const { messageParts, clients, printFunc } = commandData;

  const command = messageParts[0].toLowerCase();

  if (command === `${COMMAND_PREFACE}${HELP_COMMAND}`) {
    const { Firestore } = clients;
    const userCommands = await Firestore.loadUserCommands();

    const extraCommandsLists = extraCommandsDefinitions.map(extraCommandsDefinition => {
      const extraCommandKeys = Object.keys(extraCommandsDefinition);
      return extraCommandKeys.map(commandKey => extraCommandsDefinition[commandKey]);
    });
    const extraCommandsList: string[] = extraCommandsLists.flat();

    const userCommandList = userCommands.map(userCommand => userCommand.command);
    const allCommandList = [...userCommandList, ...extraCommandsList, HELP_COMMAND];

    const helpMessageList = allCommandList
      .map(command => `${COMMAND_PREFACE}${command}`)
      .join(', ');
    printFunc(`Here are the available commands: \n${helpMessageList}`);

    return true;
  }

  return false;
}
