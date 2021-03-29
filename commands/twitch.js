const obsConfig = require('../config/obs');

const { COMMAND_PREFACE, ADMIN_COMMANDS, OBS_COMMANDS } = require('../constants/commands');
const { COMMANDS_COLLECTION } = require('../constants/firebase');
const { SOURCES } = require('../constants/obs');

const { getRandomColor } = require('../utils');

async function handleOBSCommand(messageParts, clients) {
  const { obsClient } = clients;
  const command = messageParts[0].toLowerCase();

  switch (command) {
    case `${COMMAND_PREFACE}${OBS_COMMANDS.RESET}`: {
      obsClient.send('SetSourceFilterVisibility', {
        sourceName: SOURCES.WEBCAM,
        filterName: 'Color Correction',
        filterEnabled: false
      });
      obsClient.send('SetSceneItemRender', { source: SOURCES.WEBCAM, render: true });
      obsClient.send('SetMute', { source: SOURCES.MIC, mute: false });
      break;
    }
    case `${COMMAND_PREFACE}${OBS_COMMANDS.TOGGLE_CAM}`: {
      const properties = await obsClient.send('GetSceneItemProperties', { item: { name: SOURCES.WEBCAM } });
      const { visible } = properties;
      obsClient.send('SetSceneItemRender', { source: SOURCES.WEBCAM, render: !visible });
      break;
    }
    case `${COMMAND_PREFACE}${OBS_COMMANDS.TOGGLE_MUTE_MIC}`: {
      obsClient.send('ToggleMute', { source: SOURCES.MIC });
      break;
    }
    case `${COMMAND_PREFACE}${OBS_COMMANDS.CHANGE_OVERLAY_COLOR}`: {
      let numTimes = messageParts[1] ? parseInt(messageParts[1]) : 1;

      if (numTimes < 0) {
        numTimes = Math.abs(numTimes);
      }

      if (numTimes > 1000) {
        numTimes = 1000;
      }

      obsClient.send('SetSourceFilterVisibility', {
        sourceName: SOURCES.WEBCAM,
        filterName: 'Color Correction',
        filterEnabled: true
      });

      function setColorCorrectionToRandomColor() {
        const randomColor = getRandomColor();
        obsClient.send('SetSourceFilterSettings', {
          sourceName: SOURCES.WEBCAM,
          filterName: 'Color Correction',
          filterSettings: {
            color: randomColor
          }
        });
      };

      const rate = 1000 / numTimes;
      for (let i = 0; i < numTimes; i++) {
        setTimeout(setColorCorrectionToRandomColor, rate * i);
      }
      break;
    }
    case `${COMMAND_PREFACE}${OBS_COMMANDS.TOGGLE_AQUA}`: {
      const properties = await obsClient.send('GetSceneItemProperties', { item: { name: SOURCES.AQUA } });
      const { visible } = properties;
      obsClient.send('SetSceneItemRender', { source: SOURCES.AQUA, render: !visible });
      break;
    }
    default: {
      break;
    }
  }
}

function handleAdminCommand(messageParts, printFunc, commandsActive, commandsActiveUpdateFunc, clients) {
  const { obsClient, firestore } = clients;
  const command = messageParts[0].toLowerCase();

  switch (command) {
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.TOGGLE_COMMANDS_ACTIVE}`: {
      if (commandsActive) {
        printFunc('Bot commands are disabled!');
        logger.info('Twitch commands are disabled');
        commandsActiveUpdateFunc(false);
      }
      else {
        printFunc('Bot commands are enabled!');
        logger.info('Twitch commands are enabled');
        commandsActiveUpdateFunc(true);
      }
      break;
    }
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.RECONNECT_OBS}`: {
      obsClient.connect(obsConfig).then(() => logger.info('Connected to OBSWebSocket'));
      break;
    }
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.ADD_COMMAND}`: {
      const newCommand = messageParts[1];
      const newMessage = messageParts.slice(2).join(' ');
      firestore.collection(COMMANDS_COLLECTION).doc(newCommand).set({
        command: newCommand,
        message: newMessage
      }).then(() => logger.info(`Command added: ${newCommand}`));
      break;
    }
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.REMOVE_COMMAND}`: {
      const commandToRemove = messageParts[1];
      firestore.collection(COMMANDS_COLLECTION).doc(commandToRemove).delete().then(() => logger.info(`Command removed: ${commandToRemove}`));
      break;
    }
    default: {
      break;
    }
  }
};

module.exports = {
  handleOBSCommand,
  handleAdminCommand
};