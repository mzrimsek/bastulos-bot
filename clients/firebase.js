const admin = require('firebase-admin');

const firebaseConfig = require('../config/firebase');
const { COMMANDS_COLLECTION, WORD_TRACKING_COLLECTION } = require('../constants/firebase');

const firestoreSettings = {
  timestampsInSnapshots: true
};

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig.service_account),
  databaseURL: firebaseConfig.database_url
});

let firestore = null;
try {
  firestore = admin.firestore();
  firestore.settings(firestoreSettings);
  logger.info('Connection to Firebase established');
} catch {
  logger.info('Failed to connect to Firebase');
}

const commandsCollection = firestore.collection(COMMANDS_COLLECTION).get().then(() => {
  logger.info('Commands collection loaded');
});

const trackingWordsCollection = firestore.collection(WORD_TRACKING_COLLECTION).get().then(() => {
  logger.info('Tracking words collection loaded');
});

module.exports = {
  firestore,
  collections: {
    commandsCollection,
    trackingWordsCollection
  }
};