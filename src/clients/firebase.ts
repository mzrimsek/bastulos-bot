import * as admin from 'firebase-admin';

import { COMMANDS_COLLECTION, WORD_TRACKING_COLLECTION } from '../constants';
import { Client, Command, FirestoreCollection, FirestoreData, TrackedWord } from '../models';
import { firebaseConfig, logger } from '../config';

export default class FirestoreClient implements Client<FirestoreData> {
  private client: FirestoreData | null = null;

  private getFirestore(): FirebaseFirestore.Firestore {
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

    const firestore: FirebaseFirestore.Firestore = admin.firestore();
    firestore.settings(firestoreSettings);
    return firestore;
  }

  private getCollection<DataType>(
    firestore: FirebaseFirestore.Firestore,
    collection: string
  ): FirestoreCollection<DataType> {
    const converter: FirebaseFirestore.FirestoreDataConverter<DataType> = {
      toFirestore(concreteType: DataType): FirebaseFirestore.DocumentData {
        return concreteType;
      },
      fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): DataType {
        const data = snapshot.data();
        return data as DataType;
      }
    };

    return firestore.collection(collection).withConverter(converter);
  }

  async getClient(): Promise<FirestoreData> {
    if (!this.client) {
      const firestore = this.getFirestore();
      logger.info('Connected to Firestore');

      const commandsCollection = this.getCollection<Command>(firestore, COMMANDS_COLLECTION);
      const trackingWordsCollection = this.getCollection<TrackedWord>(
        firestore,
        WORD_TRACKING_COLLECTION
      );

      const collections = { commandsCollection, trackingWordsCollection };

      this.client = {
        firestore,
        collections
      };
    }
    return this.client;
  }
}
