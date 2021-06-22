import * as OBSWebSocket from 'obs-websocket-js';

import { Client } from '../models';
import { logger } from '../config';

export default class ObsClient implements Client<OBSWebSocket> {
  obsConnected = false;
  private client: OBSWebSocket | null = null;

  async getClient(): Promise<OBSWebSocket> {
    if (!this.client) {
      this.client = new OBSWebSocket();

      this.client.on('ConnectionOpened', () => {
        this.obsConnected = true;
        logger.info('Connected to OBSWebSocket');
      });
      this.client.on('ConnectionClosed', () => {
        this.obsConnected = false;
        logger.info('Disconnected from OBSWebSocket');
      });
    }
    return this.client;
  }
}
