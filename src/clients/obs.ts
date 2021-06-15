import * as OBSWebSocket from 'obs-websocket-js';

import { logger } from 'src/config';

export let obsConnected = false;
export const obsClient = new OBSWebSocket();
obsClient.on('ConnectionOpened', () => {
  obsConnected = true;
  logger.info('Connected to OBSWebSocket');
});
obsClient.on('ConnectionClosed', () => {
  obsConnected = false;
  logger.info('Disconnected from OBSWebSocket');
});
