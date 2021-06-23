import * as mqtt from 'mqtt';

import { logger } from '../../config';
import mqttConfig from './config';

export class MqttClient {
  private client: mqtt.MqttClient;

  constructor() {
    this.client = mqtt.connect(`tcp://${mqttConfig.address}`);
    this.client.on('connect', () => {
      logger.info('Connected to MQTT Broker');
    });
  }

  async publish(topic: string, message: string): Promise<void> {
    this.client.publish(topic, message);
  }
}
