import { firestore } from 'firebase-admin';
import { logger } from '../config';
import { COMMAND_SPACER } from '../constants';
import { Command, TrackedWord, FirebaseClient } from '../models';

export function getRandomColor(): number {
  return (Math.random() * 4294967296) >>> 0;
}

export function getRandomInt(max: number, offset = 0): number {
  return Math.floor(Math.random() * max) + offset;
}

export function replaceRequestingUserInMessage(username: string, command: string): string {
  return command.replace('{user}', username);
}

export function randomlyPadContent(content: string): string {
  const numToPad = getRandomInt(99, 1);
  const padding = COMMAND_SPACER.repeat(numToPad);
  return `${content}${padding}`;
}

export async function loadUserCommands(firebase: FirebaseClient): Promise<Command[]> {
  const { collections } = firebase;
  const { commandsCollection } = collections;

  const commandsSnapshot = await commandsCollection.get();
  logger.info('User commands loaded');
  return commandsSnapshot.docs.map((doc: firestore.QueryDocumentSnapshot<Command>) => doc.data());
}

export async function loadTrackingPhrases(firebase: FirebaseClient): Promise<string[]> {
  const { collections } = firebase;
  const { trackingWordsCollection } = collections;

  const wordsSnapshot = await trackingWordsCollection.get();
  logger.info('Tracking words loaded');
  return wordsSnapshot.docs.map((doc: firestore.QueryDocumentSnapshot<TrackedWord>) => doc.id);
}

export function getEnvValue(key: string): string {
  const value = process.env[key];
  if (value) {
    return value;
  }
  throw new Error(`${key} environment variable missing`);
}
