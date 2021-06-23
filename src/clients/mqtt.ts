import * as mqtt from 'mqtt';

import { logger, mqttConfig } from '../config';

export class MqttClient {
  private client: mqtt.MqttClient | null = null;

  private async getClient(): Promise<mqtt.MqttClient> {
    if (!this.client) {
      this.client = mqtt.connect(`tcp://${mqttConfig.address}`);
      this.client.on('connect', () => {
        logger.info('Connected to MQTT Broker');
      });
    }
    return this.client;
  }

  async publish(topic: string, message: string): Promise<void> {
    const client = await this.getClient();
    client.publish(topic, message);
  }
}
