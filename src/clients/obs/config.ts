import { getEnvValue } from '../../utils';

export default {
  client: {
    address: getEnvValue('OBS_URL'),
    password: getEnvValue('OBS_PASSWORD'),
  },
  enabled: getEnvValue('OBS_ENABLED') === 'true'
};
