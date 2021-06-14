import * as tmi from 'tmi.js';
import * as OBSWebSocket from 'obs-websocket-js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as admin from 'firebase-admin';
import * as discord from 'discord.js';
import * as mqtt from 'mqtt';

export interface Command {
  command: string;
  message: string;
}

export interface TrackedWord {
  count: number;
}

export type FirestoreCollection<T> = FirebaseFirestore.CollectionReference<T>;

export interface FirebaseClient {
  firestore: FirebaseFirestore.Firestore;
  collections: {
    commandsCollection: FirestoreCollection<Command>;
    trackingWordsCollection: FirestoreCollection<TrackedWord>;
  };
}

export interface Clients {
  twitchClient: tmi.Client;
  obsClient: OBSWebSocket;
  firebase: FirebaseClient;
  discordClient: discord.Client;
  mqttClient: mqtt.MqttClient;
}

export type PrintFunc = (content: string) => Promise<[string] | discord.Message>;
