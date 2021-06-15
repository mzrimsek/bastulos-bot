import * as mqtt from 'mqtt';

import { logger, mqttConfig } from 'src/config';

export const mqttClient = mqtt.connect(`tcp://${mqttConfig.address}`);
mqttClient.on('connect', () => {
  logger.info('Connected to MQTT Broker');
});
