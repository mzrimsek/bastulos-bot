import * as mqtt from 'mqtt';

import { logger, mqttConfig } from '../config';

export class MqttClient {
  private client: mqtt.MqttClient | null = null;

  async getClient(): Promise<mqtt.MqttClient> {
    if (!this.client) {
      this.client = mqtt.connect(`tcp://${mqttConfig.address}`);
      this.client.on('connect', () => {
        logger.info('Connected to MQTT Broker');
      });
    }
    return this.client;
  }
}
