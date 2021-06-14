import * as tmi from 'tmi.js';
import { twitchConfig } from '../config';

export const twitchClient = new tmi.client(twitchConfig);
twitchClient.connect();