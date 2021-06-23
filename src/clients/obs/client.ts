import * as OBSWebSocket from 'obs-websocket-js';

import { ObsActionArgs, ObsActionType } from '../../models';

import { logger } from '../../config';
import obsConfig from './config';

export class ObsClient {
  private client: OBSWebSocket;
  private obsConnected = false;

  constructor() {
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

  async send(
    actionType: ObsActionType,
    actionSettings: ObsActionArgs[ObsActionType]
  ): Promise<any> {
    if (!this.obsConnected) {
      await this.client.connect(obsConfig);
    }
    return this.client.send(actionType, actionSettings);
  }
}
