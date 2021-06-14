import { logger } from '../config';
import { COMMAND_SPACER } from '../constants';

export function getRandomColor() {
  return (Math.random() * 4294967296) >>> 0;
}

export function getRandomInt(max: number, offset = 0) {
  return Math.floor(Math.random() * max) + offset;
}

export function replaceRequestingUserInMessage(username: string, command: string) {
  return command.replace('{user}', username);
}

export function randomlyPadContent(content: string) {
  const numToPad = getRandomInt(99, 1);
  const padding = COMMAND_SPACER.repeat(numToPad);
  return `${content}${padding}`;
}

export async function loadUserCommands(firebase: any) {
  const { collections } = firebase;
  const { commandsCollection } = collections;

  const commandsSnapshot = await commandsCollection.get();
  logger.info('User commands loaded');
  return commandsSnapshot.docs.map(doc => doc.data());
}

export async function loadTrackingPhrases(firebase: any) {
  const { collections } = firebase;
  const { trackingWordsCollection } = collections;

  const wordsSnapshot = await trackingWordsCollection.get();
  logger.info('Tracking words loaded');
  return wordsSnapshot.docs.map(doc => doc.id);
}
