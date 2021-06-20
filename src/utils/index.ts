import * as OBSWebSocket from 'obs-websocket-js';

import { Command, FirebaseClient, TrackedWord } from '../models';
import { logger, obsConfig } from '../config';

import { COMMAND_SPACER } from '../constants';
import { firestore } from 'firebase-admin';

// Deleting this breaks the bot even though it is not used
// Trying to import it in the OBS redemptions file seems to
//  break importing and I have literally no idea why :(
export function getRandomColor(): number {
  return (Math.random() * 4294967296) >>> 0;
}

export function getRandomInt(max: number, offset = 0): number {
  return Math.floor(Math.random() * max) + offset;
}

export function replaceRequestingUserInMessage(
  username: string,
  command: string
): string {
  return command.replace('{user}', username);
}

export function randomlyPadContent(content: string): string {
  const numToPad = getRandomInt(99, 1);
  const padding = COMMAND_SPACER.repeat(numToPad);
  return `${content}${padding}`;
}

export async function loadUserCommands(
  firebase: FirebaseClient
): Promise<Command[]> {
  const { collections } = firebase;
  const { commandsCollection } = collections;

  const commandsSnapshot = await commandsCollection.get();
  logger.info('User commands loaded');
  return commandsSnapshot.docs.map(
    (doc: firestore.QueryDocumentSnapshot<Command>) => doc.data()
  );
}

export async function loadTrackingPhrases(
  firebase: FirebaseClient
): Promise<string[]> {
  const { collections } = firebase;
  const { trackingWordsCollection } = collections;

  const wordsSnapshot = await trackingWordsCollection.get();
  logger.info('Tracking words loaded');
  return wordsSnapshot.docs.map(
    (doc: firestore.QueryDocumentSnapshot<TrackedWord>) => doc.id
  );
}

export async function isOBSClientConnected(
  obsClient: OBSWebSocket,
  obsConnected: boolean
): Promise<boolean> {
  if (!obsConnected) {
    try {
      await obsClient.connect(obsConfig);
      return true;
    } catch {
      logger.info('Unable to connect to OBSWebsocket');
      return false;
    }
  }
  return true;
}

export function getEnvValue(key: string): string {
  const value = process.env[key];
  if (value) {
    return value;
  }
  throw new Error(`${key} environment variable missing`);
}
