import * as OBSWebSocket from 'obs-websocket-js';

import { ObsActionArgs, ObsActionType } from '../models';
import { logger, obsConfig } from '../config';

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

  async send(
    actionType: ObsActionType,
    actionSettings: ObsActionArgs[ObsActionType]
  ): Promise<void> {
    const client = await this.getClient();

    if (!this.obsConnected) {
      await client.connect(obsConfig);
    }

    client.send(actionType, actionSettings);
  }
}
