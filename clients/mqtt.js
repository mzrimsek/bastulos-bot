const mqtt = require('mqtt');

const mqttConfig = require('../config/mqtt');

const mqttClient = mqtt.connect(`tcp://${mqttConfig.address}`);
mqttClient.on('connect', () => {
  logger.info('Connected to MQTT Broker');
});

module.exports = {
  mqttClient
};