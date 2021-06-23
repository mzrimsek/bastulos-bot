import { TwitchBotChatClient, TwitchChannelPubSubClient } from './twitch';

import { DiscordClient } from './discord';
import { MqttClient } from './mqtt';
import { ObsClient } from './obs';

export * from './firebase';

export const Clients = {
  TwitchChat: new TwitchBotChatClient(),
  TwitchPubSub: new TwitchChannelPubSubClient(),
  Discord: new DiscordClient(),
  Mqtt: new MqttClient(),
  Obs: new ObsClient()
};
