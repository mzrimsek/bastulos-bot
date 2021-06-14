import { obsConfig, logger } from '../config';
import { COMMAND_PREFACE, ADMIN_COMMANDS, OBS_COMMANDS, WORD_TRACKING_COMMANDS, LIGHT_COMMANDS, LIGHT_TOPICS, SOURCES } from '../constants';
const { getRandomColor, loadTrackingPhrases, getRandomInt } = require('../utils');

async function handleOBSCommand(messageParts, clients, obsConnected) {
  const { obsClient } = clients;

  const isOBSClientConnected = async () => {
    if (!obsConnected) {
      try {
        await obsClient.connect(obsConfig);
        return true;
      } catch {
        logger.info('Unable to connect to OBSWebsocket')
        return false;
      }
    }
    return true;
  };

  const command = messageParts[0].toLowerCase();

  switch (command) {
    case `${COMMAND_PREFACE}${OBS_COMMANDS.RESET}`: {
      if (await isOBSClientConnected()) {
        obsClient.send('SetSourceFilterVisibility', {
          sourceName: SOURCES.WEBCAM,
          filterName: 'Color Correction',
          filterEnabled: false
        });
        obsClient.send('SetSceneItemRender', { source: SOURCES.WEBCAM, render: true });
        obsClient.send('SetMute', { source: SOURCES.MIC, mute: false });
      }
      return true;
    }
    case `${COMMAND_PREFACE}${OBS_COMMANDS.TOGGLE_CAM}`: {
      if (await isOBSClientConnected()) {
        const properties = await obsClient.send('GetSceneItemProperties', { item: { name: SOURCES.WEBCAM } });
        const { visible } = properties;
        obsClient.send('SetSceneItemRender', { source: SOURCES.WEBCAM, render: !visible });
      }
      return true;
    }
    case `${COMMAND_PREFACE}${OBS_COMMANDS.TOGGLE_MUTE_MIC}`: {
      if (await isOBSClientConnected()) {
        obsClient.send('ToggleMute', { source: SOURCES.MIC });
      }
      return true;
    }
    case `${COMMAND_PREFACE}${OBS_COMMANDS.CHANGE_OVERLAY_COLOR}`: {
      if (await isOBSClientConnected()) {
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
      }
      return true;
    }
    case `${COMMAND_PREFACE}${OBS_COMMANDS.TOGGLE_AQUA}`: {
      if (await isOBSClientConnected()) {
        const properties = await obsClient.send('GetSceneItemProperties', { item: { name: SOURCES.AQUA } });
        const { visible } = properties;
        obsClient.send('SetSceneItemRender', { source: SOURCES.AQUA, render: !visible });
      }
      return true;
    }
    default: {
      return false;
    }
  }
}

function handleAdminCommand(messageParts, printFunc, commandsActive, commandsActiveUpdateFunc, clients) {
  const { firebase } = clients;
  const { collections } = firebase;
  const { commandsCollection } = collections;

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
      return true;
    }
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.ADD_COMMAND}`: {
      const newCommand = messageParts[1];
      const newMessage = messageParts.slice(2).join(' ');
      commandsCollection.doc(newCommand).set({
        command: newCommand,
        message: newMessage
      }).then(() => logger.info(`Command added: ${newCommand}`));
      return true;
    }
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.REMOVE_COMMAND}`: {
      const commandToRemove = messageParts[1];
      commandsCollection.doc(commandToRemove).delete().then(() => logger.info(`Command removed: ${commandToRemove}`));
      return true;
    }
    default: {
      return false;
    }
  }
};

async function handleTwitchUserCommand(messageParts, username, printFunc, clients) {
  const { firebase, mqttClient } = clients;
  const { collections } = firebase;
  const { trackingWordsCollection } = collections;

  const command = messageParts[0].toLowerCase();

  switch (command) {
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.GET_COUNT}`: {
      const trackingPhrases = await loadTrackingPhrases(firebase);

      const targetPhrase = messageParts.slice(1).join('_');
      if (targetPhrase && trackingPhrases.includes(targetPhrase)) {
        const documentRef = trackingWordsCollection.doc(targetPhrase);
        const document = await documentRef.get();
        const currentCount = document.get('count');
        printFunc(`${username}, ${targetPhrase} count is ${currentCount}`);
      }
      return true;
    }
    case `${COMMAND_PREFACE}${LIGHT_COMMANDS.TURN_OFF}`: {
      mqttClient.publish(LIGHT_TOPICS.office.on_off, 'off');
      printFunc(`${username} turned off the lights!`);
      return true;
    }
    case `${COMMAND_PREFACE}${LIGHT_COMMANDS.TURN_ON}`: {
      mqttClient.publish(LIGHT_TOPICS.office.on_off, 'on');
      printFunc(`${username} turned on the lights!`);
      return true;
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

      return true;
    }
    case `${COMMAND_PREFACE}${LIGHT_COMMANDS.RANDOM_COLOR}`: {
      const r = getRandomInt(255);
      const g = getRandomInt(255);
      const b = getRandomInt(255);
      const color = `[${r},${g},${b}]`;

      mqttClient.publish(LIGHT_TOPICS.office.rgb_color, color);
      printFunc(`${username} did roulette with the color of the lights!`);
      return true;
    }
    default: {
      return false;
    }
  }
}

async function handleModCommand(messageParts, printFunc, clients) {
  const { firebase } = clients;
  const { collections } = firebase;
  const { trackingWordsCollection } = collections;

  const command = messageParts[0].toLowerCase();

  switch (command) {
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.ADD_WORD}`: {
      const trackingPhrases = await loadTrackingPhrases(firebase);

      const newPhrase = messageParts.slice(1).join('_');
      if (newPhrase && !trackingPhrases.includes(newPhrase)) {
        trackingWordsCollection.doc(newPhrase).set({
          count: 0
        }).then(() => logger.info(`Tracking word added: ${newPhrase}`));
      }
      return true;
    }
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.REMOVE_WORD}`: {
      const trackingPhrases = await loadTrackingPhrases(firebase);

      const phraseToRemove = messageParts.slice(1).join('_');
      if (phraseToRemove && trackingPhrases.includes(phraseToRemove)) {
        trackingWordsCollection.doc(phraseToRemove).delete().then(() => logger.info(`Tracking word removed: ${phraseToRemove}`));
      }
      return true;
    }
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.CLEAR_WORD_COUNT}`: {
      const trackingPhrases = await loadTrackingPhrases(firebase);

      const phraseToClear = messageParts.slice(1).join('_');
      if (phraseToClear && trackingPhrases.includes(phraseToClear)) {
        trackingWordsCollection.doc(phraseToClear).update('count', 0).then(() => logger.info(`Tracking word cleared: ${phraseToClear}`));
      }
      return true;
    }
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.INCREMENT_WORD_COUNT}`: {
      const trackingPhrases = await loadTrackingPhrases(firebase);

      const lastToken = messageParts[messageParts.length - 1];
      const lastTokenAsNum = Number.parseInt(lastToken);

      const hasCount = Number.isInteger(lastTokenAsNum);
      const count = hasCount ? Number.parseInt(lastToken) : 1;

      const phraseParts = hasCount ? messageParts.slice(1, messageParts.length - 1) : messageParts.slice(1);
      const phraseToIncrement = phraseParts.join('_');

      if (phraseToIncrement && trackingPhrases.includes(phraseToIncrement)) {
        const documentRef = trackingWordsCollection.doc(phraseToIncrement);
        const document = await documentRef.get();
        const currentCount = document.get('count');
        documentRef.update('count', currentCount + count).then(() => logger.info(`Tracking word incremented: ${phraseToIncrement}`));
      }
      return true;
    }
    default: {
      return false;
    }
  }
}

module.exports = {
  handleOBSCommand,
  handleAdminCommand,
  handleModCommand,
  handleTwitchUserCommand
};