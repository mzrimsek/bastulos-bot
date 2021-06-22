import * as OBSWebSocket from 'obs-websocket-js';

import { Client, Message } from 'discord.js';
import { PubSubClient, PubSubRedemptionMessage } from 'twitch-pubsub-client';

import { ChatClient } from 'twitch-chat-client';
import { FirestoreData } from './firebase';
import { MqttClient } from 'mqtt';

export interface TwitchPubSub {
  twitchPubSubUserId: string;
  twitchPubSubClient: PubSubClient;
}

export interface Clients {
  twitchChatClient: ChatClient;
  obsClient: OBSWebSocket;
  firebase: FirestoreData;
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

export * from './firebase';
export * from './obs';
export * from './client';
