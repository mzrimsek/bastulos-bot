import * as OBSWebSocket from 'obs-websocket-js';

import { getRandomColor, isOBSClientConnected } from '../utils';

import { SOURCES } from '../constants';

export async function toggleCam(
  obsClient: OBSWebSocket,
  obsConnected: boolean
): Promise<void> {
  if (await isOBSClientConnected(obsClient, obsConnected)) {
    const properties = await obsClient.send('GetSceneItemProperties', {
      item: { name: SOURCES.WEBCAM }
    });
    const { visible } = properties;
    obsClient.send('SetSceneItemRender', {
      source: SOURCES.WEBCAM,
      render: !visible
    });
  }
}

export async function toggleMic(
  obsClient: OBSWebSocket,
  obsConnected: boolean
): Promise<void> {
  if (await isOBSClientConnected(obsClient, obsConnected)) {
    obsClient.send('ToggleMute', { source: SOURCES.MIC });
  }
}

export async function changeCamOverlayColor(
  numTimes: number,
  obsClient: OBSWebSocket,
  obsConnected: boolean
): Promise<void> {
  if (await isOBSClientConnected(obsClient, obsConnected)) {
    obsClient.send('SetSourceFilterVisibility', {
      sourceName: SOURCES.WEBCAM,
      filterName: 'Color Correction',
      filterEnabled: true
    });

    const rate = 1000 / numTimes;
    for (let i = 0; i < numTimes; i++) {
      setTimeout(() => {
        const randomColor = getRandomColor();
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
}

export async function toggleAqua(
  obsClient: OBSWebSocket,
  obsConnected: boolean
): Promise<void> {
  if (await isOBSClientConnected(obsClient, obsConnected)) {
    const properties = await obsClient.send('GetSceneItemProperties', {
      item: { name: SOURCES.AQUA }
    });
    const { visible } = properties;
    obsClient.send('SetSceneItemRender', {
      source: SOURCES.AQUA,
      render: !visible
    });
  }
}
