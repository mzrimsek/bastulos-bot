import * as OBSWebSocket from 'obs-websocket-js';

import { SOURCES } from '../constants';

export async function toggleCam(obsClient: OBSWebSocket): Promise<void> {
  const properties = await obsClient.send('GetSceneItemProperties', {
    item: { name: SOURCES.WEBCAM }
  });
  const { visible } = properties;
  obsClient.send('SetSceneItemRender', {
    source: SOURCES.WEBCAM,
    render: !visible
  });
}

export async function toggleMic(obsClient: OBSWebSocket): Promise<void> {
  obsClient.send('ToggleMute', { source: SOURCES.MIC });
}

export async function changeCamOverlayColor(
  obsClient: OBSWebSocket,
  numTimes = 1
): Promise<void> {
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

export async function toggleAqua(obsClient: OBSWebSocket): Promise<void> {
  const properties = await obsClient.send('GetSceneItemProperties', {
    item: { name: SOURCES.AQUA }
  });
  const { visible } = properties;
  obsClient.send('SetSceneItemRender', {
    source: SOURCES.AQUA,
    render: !visible
  });
}