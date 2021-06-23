import { AvailableClients } from '../clients';
import { Message } from 'discord.js';
import { PubSubRedemptionMessage } from 'twitch-pubsub-client';

export type PrintFunc = (content: string) => Promise<void | Message>;

export interface CommandData {
  messageParts: string[];
  clients: AvailableClients;
  printFunc: PrintFunc;
}

export interface RedemptionData {
  message: PubSubRedemptionMessage;
  clients: AvailableClients;
}
