import { ChatClient } from 'twitch-chat-client';
import { PubSubClient } from 'twitch-pubsub-client';
import { firestore } from 'firebase-admin';
import * as OBSWebSocket from 'obs-websocket-js';
import { Client, Message } from 'discord.js';
import { MqttClient } from 'mqtt';

export interface Command {
  command: string;
  message: string;
}

export interface TrackedWord {
  count: number;
}

export type FirestoreCollection<T> = firestore.CollectionReference<T>;

export interface FirebaseClient {
  firestore: firestore.Firestore;
  collections: {
    commandsCollection: FirestoreCollection<Command>;
    trackingWordsCollection: FirestoreCollection<TrackedWord>;
  };
}

export interface Clients {
  twitchChatClient: ChatClient;
  twitchPubSubClient: PubSubClient;
  obsClient: OBSWebSocket;
  firebase: FirebaseClient;
  discordClient: Client;
  mqttClient: MqttClient;
}

export type PrintFunc = (content: string) => Promise<void | Message>;
