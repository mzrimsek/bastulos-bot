import * as OBSWebSocket from 'obs-websocket-js';

import { Client, ObsActionType } from '../models';
import { logger, obsConfig } from '../config';

export class ObsClient implements Client<OBSWebSocket> {
  private client: OBSWebSocket | null = null;
  private obsConnected = false;

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

  async send(actionType: ObsActionType, actionSettings: Record<string, any>) {
    const client = await this.getClient();

    if (!this.obsConnected) {
      await client.connect(obsConfig);
    }

    client.send(actionType, actionSettings);
  }
}
