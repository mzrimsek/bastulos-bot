import * as admin from 'firebase-admin';
import { firebaseConfig, logger } from '../config';
import { COMMANDS_COLLECTION, WORD_TRACKING_COLLECTION } from '../constants';
import { Command, FirestoreCollection, TrackedWord } from '../models';

const firestoreSettings = {
  timestampsInSnapshots: true
};

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: firebaseConfig.service_account.project_id,
    clientEmail: firebaseConfig.service_account.client_email,
    privateKey: firebaseConfig.service_account.private_key
  }),
  databaseURL: firebaseConfig.database_url
});

export const firestore: FirebaseFirestore.Firestore = admin.firestore();
firestore.settings(firestoreSettings);
logger.info('Connection to Firebase established');

const commandConverter: FirebaseFirestore.FirestoreDataConverter<Command> = {
  toFirestore(command: Command): FirebaseFirestore.DocumentData {
    return { command: command.command, message: command.message };
  },
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): Command {
    const data = snapshot.data();
    return { command: data.command, message: data.message };
  }
};

const trackingWordConverter: FirebaseFirestore.FirestoreDataConverter<TrackedWord> = {
  toFirestore(trackedWord: TrackedWord): FirebaseFirestore.DocumentData {
    return { count: trackedWord.count };
  },
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): TrackedWord {
    const data = snapshot.data();
    return { count: data.count };
  }
};

const commandsCollection: FirestoreCollection<Command> = firestore
  .collection(COMMANDS_COLLECTION)
  .withConverter(commandConverter);

const trackingWordsCollection: FirestoreCollection<TrackedWord> = firestore
  .collection(WORD_TRACKING_COLLECTION)
  .withConverter(trackingWordConverter);

export const collections = { commandsCollection, trackingWordsCollection };
