import { TwitchBotChatClient, TwitchChannelApiClient, TwitchChannelPubSubClient } from './twitch';

import { DiscordClient } from './discord';
import { FirestoreClient } from './firebase';
import { MqttClient } from './mqtt';
import { ObsClient } from './obs';

export interface AvailableClients {
  TwitchChat: TwitchBotChatClient;
  TwitchPubSub: TwitchChannelPubSubClient;
  TwitchApi: TwitchChannelApiClient;
  Discord: DiscordClient;
  Mqtt: MqttClient;
  Obs: ObsClient;
  Firestore: FirestoreClient;
}

const clients: AvailableClients = {
  TwitchChat: new TwitchBotChatClient(),
  TwitchPubSub: new TwitchChannelPubSubClient(),
  TwitchApi: new TwitchChannelApiClient(),
  Discord: new DiscordClient(),
  Mqtt: new MqttClient(),
  Obs: new ObsClient(),
  Firestore: new FirestoreClient()
};

export default clients;
