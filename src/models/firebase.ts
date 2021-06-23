import { firestore } from 'firebase-admin';

export interface Command {
  command: string;
  message: string;
}

export interface TrackedWord {
  count: number;
}
