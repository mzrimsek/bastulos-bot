import { getEnvValue } from 'src/utils';

export default {
  address: getEnvValue('OBS_URL'),
  password: getEnvValue('OBS_PASSWORD')
};
