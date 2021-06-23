import { OBS_REDEMPTIONS, SOURCES } from '../constants';

import { RedemptionData } from '../models';

export async function handleOBSRedemption(redemptionData: RedemptionData): Promise<boolean> {
  const { message, clients } = redemptionData;

  const { Obs } = clients;

  switch (message.rewardName) {
    case OBS_REDEMPTIONS.TOGGLE_CAM: {
      const properties = await Obs.send('GetSceneItemProperties', {
        item: { name: SOURCES.WEBCAM }
      });
      const { visible } = properties;
      Obs.send('SetSceneItemRender', {
        source: SOURCES.WEBCAM,
        render: !visible
      });
      return true;
    }
    case OBS_REDEMPTIONS.TOGGLE_MUTE_MIC: {
      Obs.send('ToggleMute', { source: SOURCES.MIC });
      return true;
    }
    case OBS_REDEMPTIONS.CHANGE_OVERLAY_COLOR: {
      const redemptionCount = Number.parseInt(message.message, 10);
      let numTimes = Number.isNaN(redemptionCount) ? 1 : redemptionCount;

      if (numTimes < 0) {
        numTimes = Math.abs(numTimes);
      }

      if (numTimes > 1000) {
        numTimes = 1000;
      }

      Obs.send('SetSourceFilterVisibility', {
        sourceName: SOURCES.WEBCAM,
        filterName: 'Color Correction',
        filterEnabled: true
      });

      const rate = 1000 / numTimes;
      for (let i = 0; i < numTimes; i++) {
        setTimeout(() => {
          const randomColor = (Math.random() * 4294967296) >>> 0;
          Obs.send('SetSourceFilterSettings', {
            sourceName: SOURCES.WEBCAM,
            filterName: 'Color Correction',
            filterSettings: {
              color: randomColor
            }
          });
        }, rate * i);
      }
      return true;
    }
    case OBS_REDEMPTIONS.TOGGLE_AQUA: {
      const properties = await Obs.send('GetSceneItemProperties', {
        item: { name: SOURCES.AQUA }
      });
      const { visible } = properties;
      Obs.send('SetSceneItemRender', {
        source: SOURCES.AQUA,
        render: !visible
      });
      return true;
    }
    default: {
      return false;
    }
  }
}
