import { TwitchBotChatClient } from './twitch';

export * from './twitch';
export * from './obs';
export * from './firebase';
export * from './discord';
export * from './mqtt';

export const Clients = {
  TwitchBotChat: new TwitchBotChatClient()
};
