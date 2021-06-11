const obsConfig = require('../config/obs');

const { COMMAND_PREFACE, ADMIN_COMMANDS, OBS_COMMANDS, WORD_TRACKING_COMMANDS, LIGHT_COMMANDS } = require('../constants/commands');
const { COMMANDS_COLLECTION, WORD_TRACKING_COLLECTION } = require('../constants/firebase');
const { LIGHT_TOPICS } = require('../constants/mqtt');
const { SOURCES } = require('../constants/obs');

const { getRandomColor, loadTrackingPhrases, getRandomInt } = require('../utils');

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

async function handleTwitchUserCommand(messageParts, username, printFunc, clients) {
  const { firestore, mqttClient } = clients;
  const command = messageParts[0].toLowerCase();

  const trackingPhrases = await loadTrackingPhrases(clients.firestore);

  switch (command) {
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.GET_COUNT}`: {
      const targetPhrase = messageParts.slice(1).join('_');
      if (targetPhrase && trackingPhrases.includes(targetPhrase)) {
        const documentRef = firestore.collection(WORD_TRACKING_COLLECTION).doc(targetPhrase);
        const document = await documentRef.get();
        const currentCount = document.get('count');
        printFunc(`${username}, ${targetPhrase} count is ${currentCount}`);
      }
      break;
    }
    case `${COMMAND_PREFACE}${LIGHT_COMMANDS.TURN_OFF}`: {
      mqttClient.publish(LIGHT_TOPICS.office.on_off, 'off');
      printFunc(`${username} turned off the lights!`);
      break;
    }
    case `${COMMAND_PREFACE}${LIGHT_COMMANDS.TURN_ON}`: {
      mqttClient.publish(LIGHT_TOPICS.office.on_off, 'on');
      printFunc(`${username} turned on the lights!`);
      break;
    }
    case `${COMMAND_PREFACE}${LIGHT_COMMANDS.SET_COLOR}`: {
      if (messageParts.length === 4) {
        const numbers = messageParts.slice(1);
        const cleanedNumbers = numbers.map(number => {
          let numValue = Number.parseInt(number);

          if (Number.isInteger(numValue) && numValue < 0) {
            numValue = 0;
          }

          if (Number.isInteger(numValue) && numValue > 255) {
            numValue = 255;
          }

          return numValue;
        });

        const rgbValue = `[${cleanedNumbers.join(',')}]`;
        mqttClient.publish(LIGHT_TOPICS.office.rgb_color, rgbValue);
        printFunc(`${username} changed the color of the lights!`);
      }

      if (messageParts.length === 2) {
        const color = messageParts[1];
        mqttClient.publish(LIGHT_TOPICS.office.named_color, color);
        printFunc(`${username} changed the color of the lights!`);
      }

      break;
    }
    case `${COMMAND_PREFACE}${LIGHT_COMMANDS.RANDOM_COLOR}`: {
      const r = getRandomInt(255);
      const g = getRandomInt(255);
      const b = getRandomInt(255);
      const color = `[${r},${g},${b}]`;

      mqttClient.publish(LIGHT_TOPICS.office.rgb_color, color);
      printFunc(`${username} did roulette with the color of the lights!`);
      break;
    }
    default: {
      break;
    }
  }
}

async function handleModCommand(messageParts, printFunc, clients) {
  const { firestore } = clients;
  const command = messageParts[0].toLowerCase();

  const trackingPhrases = await loadTrackingPhrases(clients.firestore);

  switch (command) {
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.ADD_WORD}`: {
      const newPhrase = messageParts.slice(1).join('_');
      if (newPhrase && !trackingPhrases.includes(newPhrase)) {
        firestore.collection(WORD_TRACKING_COLLECTION).doc(newPhrase).set({
          count: 0
        }).then(() => logger.info(`Tracking word added: ${newPhrase}`));
      }
      break;
    }
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.REMOVE_WORD}`: {
      const phraseToRemove = messageParts.slice(1).join('_');
      if (phraseToRemove && trackingPhrases.includes(phraseToRemove)) {
        firestore.collection(WORD_TRACKING_COLLECTION).doc(phraseToRemove).delete().then(() => logger.info(`Tracking word removed: ${phraseToRemove}`));
      }
      break;
    }
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.CLEAR_WORD_COUNT}`: {
      const phraseToClear = messageParts.slice(1).join('_');
      if (phraseToClear && trackingPhrases.includes(phraseToClear)) {
        firestore.collection(WORD_TRACKING_COLLECTION).doc(phraseToClear).update('count', 0).then(() => logger.info(`Tracking word cleared: ${phraseToClear}`));
      }
      break;
    }
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.INCREMENT_WORD_COUNT}`: {
      const lastToken = messageParts[messageParts.length - 1];
      const lastTokenAsNum = Number.parseInt(lastToken);

      const hasCount = Number.isInteger(lastTokenAsNum);
      const count = hasCount ? Number.parseInt(lastToken) : 1;

      const phraseParts = hasCount ? messageParts.slice(1, messageParts.length - 1) : messageParts.slice(1);
      const phraseToIncrement = phraseParts.join('_');

      if (phraseToIncrement && trackingPhrases.includes(phraseToIncrement)) {
        const documentRef = firestore.collection(WORD_TRACKING_COLLECTION).doc(phraseToIncrement);
        const document = await documentRef.get();
        const currentCount = document.get('count');
        documentRef.update('count', currentCount + count).then(() => logger.info(`Tracking word incremented: ${phraseToIncrement}`));
      }
    }
    default: {
      break;
    }
  }
}

module.exports = {
  handleOBSCommand,
  handleAdminCommand,
  handleModCommand,
  handleTwitchUserCommand
};