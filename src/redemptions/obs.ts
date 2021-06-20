import * as OBSWebSocket from 'obs-websocket-js';

import { OBS_REDEMPTIONS, SOURCES } from '../constants';

import { RedemptionData } from '../models';
import { isOBSClientConnected } from '../utils';

export async function handleOBSRedemption(
  redemptionData: RedemptionData,
  obsConnected: boolean
): Promise<boolean> {
  const { message, clients } = redemptionData;

  const { obsClient } = clients;

  switch (message.rewardName) {
    case OBS_REDEMPTIONS.TOGGLE_CAM: {
      if (await isOBSClientConnected(obsClient, obsConnected)) {
        await toggleCam(obsClient);
      }
      return true;
    }
    case OBS_REDEMPTIONS.TOGGLE_MUTE_MIC: {
      if (await isOBSClientConnected(obsClient, obsConnected)) {
        await toggleMic(obsClient);
      }
      return true;
    }
    case OBS_REDEMPTIONS.CHANGE_OVERLAY_COLOR: {
      if (await isOBSClientConnected(obsClient, obsConnected)) {
        const redemptionCount = Number.parseInt(message.message, 10);
        let numTimes = Number.isNaN(redemptionCount) ? 1 : redemptionCount;

        if (numTimes < 0) {
          numTimes = Math.abs(numTimes);
        }

        if (numTimes > 1000) {
          numTimes = 1000;
        }

        await changeCamOverlayColor(obsClient, numTimes);
      }
      return true;
    }
    case OBS_REDEMPTIONS.TOGGLE_AQUA: {
      if (await isOBSClientConnected(obsClient, obsConnected)) {
        await toggleAqua(obsClient);
      }
      return true;
    }
    default: {
      return false;
    }
  }
}

async function toggleCam(obsClient: OBSWebSocket): Promise<void> {
  const properties = await obsClient.send('GetSceneItemProperties', {
    item: { name: SOURCES.WEBCAM }
  });
  const { visible } = properties;
  obsClient.send('SetSceneItemRender', {
    source: SOURCES.WEBCAM,
    render: !visible
  });
}

async function toggleMic(obsClient: OBSWebSocket): Promise<void> {
  obsClient.send('ToggleMute', { source: SOURCES.MIC });
}

async function changeCamOverlayColor(obsClient: OBSWebSocket, numTimes = 1): Promise<void> {
  obsClient.send('SetSourceFilterVisibility', {
    sourceName: SOURCES.WEBCAM,
    filterName: 'Color Correction',
    filterEnabled: true
  });

  const rate = 1000 / numTimes;
  for (let i = 0; i < numTimes; i++) {
    setTimeout(() => {
      const randomColor = (Math.random() * 4294967296) >>> 0;
      obsClient.send('SetSourceFilterSettings', {
        sourceName: SOURCES.WEBCAM,
        filterName: 'Color Correction',
        filterSettings: {
          color: randomColor
        }
      });
    }, rate * i);
  }
}

async function toggleAqua(obsClient: OBSWebSocket): Promise<void> {
  const properties = await obsClient.send('GetSceneItemProperties', {
    item: { name: SOURCES.AQUA }
  });
  const { visible } = properties;
  obsClient.send('SetSceneItemRender', {
    source: SOURCES.AQUA,
    render: !visible
  });
}
