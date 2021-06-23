import * as admin from 'firebase-admin';

import { COMMANDS_COLLECTION, WORD_TRACKING_COLLECTION } from '../constants';
import { Command, TrackedWord } from '../models';
import { firebaseConfig, logger } from '../config';

export class FirestoreClient {
  private client: FirebaseFirestore.Firestore;

  constructor() {
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

    this.client = admin.firestore();
    this.client.settings(firestoreSettings);

    logger.info('Connected to Firestore');
  }

  getCollection<DataType>(collection: string): admin.firestore.CollectionReference<DataType> {
    const converter: FirebaseFirestore.FirestoreDataConverter<DataType> = {
      toFirestore(concreteType: DataType): FirebaseFirestore.DocumentData {
        return concreteType;
      },
      fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): DataType {
        const data = snapshot.data();
        return data as DataType;
      }
    };

    return this.client.collection(collection).withConverter(converter);
  }

  async loadUserCommands(): Promise<Command[]> {
    const commandsSnapshot = await this.getCollection<Command>(COMMANDS_COLLECTION).get();
    logger.info('User commands loaded');
    return commandsSnapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot<Command>) =>
      doc.data()
    );
  }

  async loadTrackingPhrases(): Promise<string[]> {
    const wordsSnapshot = await this.getCollection<TrackedWord>(WORD_TRACKING_COLLECTION).get();
    logger.info('Tracking words loaded');
    return wordsSnapshot.docs.map(
      (doc: admin.firestore.QueryDocumentSnapshot<TrackedWord>) => doc.id
    );
  }
}
