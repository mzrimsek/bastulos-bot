import { ObsActionArgs, ObsActionType } from '../../models';

import OBSWebSocket from 'obs-websocket-js';
import logger from '../../logger';
import obsConfig from './config';

export class ObsClient {
  private client?: OBSWebSocket;
  private obsConnected = false;

  private getClient(): OBSWebSocket {
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
  ): Promise<any> {
    if (!obsConfig.enabled) {
      logger.info('OBS is disabled');
      return;
    }

    if (!this.obsConnected) {
      await this.getClient().connect(obsConfig.client);
    }
    return this.getClient().send(actionType, actionSettings);
  }
}
