import { TwitchBotChatClient, TwitchChannelPubSubClient } from './twitch';

import { DiscordClient } from './discord';

export * from './obs';
export * from './firebase';
export * from './mqtt';

export const Clients = {
  TwitchChat: new TwitchBotChatClient(),
  TwitchPubSub: new TwitchChannelPubSubClient(),
  Discord: new DiscordClient()
};
