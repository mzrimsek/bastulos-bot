import { firestore } from 'firebase-admin';

export interface Command {
  command: string;
  message: string;
}

export interface TrackedWord {
  count: number;
}

export type FirestoreCollection<T> = firestore.CollectionReference<T>;

export interface FirestoreData {
  firestore: firestore.Firestore;
  collections: {
    commandsCollection: FirestoreCollection<Command>;
    trackingWordsCollection: FirestoreCollection<TrackedWord>;
  };
}
