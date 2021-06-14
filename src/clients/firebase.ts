import * as admin from 'firebase-admin';
import { firebaseConfig, logger } from '../config';
import { COMMANDS_COLLECTION, WORD_TRACKING_COLLECTION } from '../constants';

const firestoreSettings = {
  timestampsInSnapshots: true
};

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig.service_account),
  databaseURL: firebaseConfig.database_url
});

export let firestore = null;
try {
  firestore = admin.firestore();
  firestore.settings(firestoreSettings);
  logger.info('Connection to Firebase established');
} catch {
  logger.info('Failed to connect to Firebase');
}

const commandsCollection = firestore.collection(COMMANDS_COLLECTION);
const trackingWordsCollection = firestore.collection(WORD_TRACKING_COLLECTION);

export const collections = [commandsCollection, trackingWordsCollection];
