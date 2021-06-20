import * as OBSWebSocket from 'obs-websocket-js';

import { Client, Message } from 'discord.js';
import { PubSubClient, PubSubRedemptionMessage } from 'twitch-pubsub-client';

import { ChatClient } from 'twitch-chat-client';
import { MqttClient } from 'mqtt';
import { firestore } from 'firebase-admin';

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

export interface TwitchPubSub {
  twitchPubSubUserId: string;
  twitchPubSubClient: PubSubClient;
}

export interface Clients {
  twitchChatClient: ChatClient;
  obsClient: OBSWebSocket;
  firebase: FirebaseClient;
  discordClient: Client;
  mqttClient: MqttClient;
}

export type PrintFunc = (content: string) => Promise<void | Message>;

export interface CommandData {
  messageParts: string[];
  clients: Clients;
  printFunc: PrintFunc;
}

export interface RedemptionData {
  message: PubSubRedemptionMessage;
  clients: Clients;
}
