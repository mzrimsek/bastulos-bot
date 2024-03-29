import { getEnvValue } from '../../utils';

export default {
  service_account: {
    type: 'service_account',
    project_id: getEnvValue('FIREBASE_PROJECT_ID'),
    private_key_id: getEnvValue('FIREBASE_PRIVATE_KEY_ID'),
    // https://stackoverflow.com/questions/50299329/node-js-firebase-service-account-private-key-wont-parse
    private_key: getEnvValue('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    client_email: getEnvValue('FIREBASE_CLIENT_EMAIL'),
    client_id: getEnvValue('FIREBASE_CLIENT_ID'),
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: getEnvValue('FIREBASE_CLIENT_CERT_URL')
  },
  database_url: getEnvValue('FIREBASE_DATABASE_URL')
};
