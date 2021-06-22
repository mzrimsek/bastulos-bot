import * as OBSWebSocket from 'obs-websocket-js';

import { logger, obsConfig } from '../config';

import { ObsActionType } from '../models';

export class ObsClient {
  private client: OBSWebSocket | null = null;
  private obsConnected = false;

  private async getClient(): Promise<OBSWebSocket> {
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
