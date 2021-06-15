import { getEnvValue } from '../utils';

export default {
  address: getEnvValue('MQTT_BROKER_ADDRESS')
};
