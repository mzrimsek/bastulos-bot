import {
  ADMIN_COMMANDS,
  COMMAND_PREFACE,
  LIGHT_COMMANDS,
  LIGHT_TOPICS,
  OBS_COMMANDS,
  SOURCES,
  WORD_TRACKING_COMMANDS
} from '../constants';

import { CommandData } from '../models';
import { getRandomInt } from '../utils';
import logger from '../logger';

export async function handleAdminCommand(
  commandData: CommandData,
  commandsActive: boolean,
  commandsActiveUpdateFunc: (newState: boolean) => void
): Promise<boolean> {
  const { messageParts, clients, printFunc } = commandData;

  const { Firestore } = clients;

  const command = messageParts[0].toLowerCase();

  switch (command) {
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.TOGGLE_COMMANDS_ACTIVE}`: {
      if (commandsActive) {
        printFunc('Bot commands are disabled!');
        logger.info('Twitch commands are disabled');
        commandsActiveUpdateFunc(false);
      } else {
        printFunc('Bot commands are enabled!');
        logger.info('Twitch commands are enabled');
        commandsActiveUpdateFunc(true);
      }
      return true;
    }
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.ADD_COMMAND}`: {
      const newCommand = messageParts[1];
      const newMessage = messageParts.slice(2).join(' ');
      Firestore.getCommandsCollection()
        .doc(newCommand)
        .set({
          command: newCommand,
          message: newMessage
        })
        .then(() => logger.info(`Command added: ${newCommand}`));
      return true;
    }
    case `${COMMAND_PREFACE}${ADMIN_COMMANDS.REMOVE_COMMAND}`: {
      const commandToRemove = messageParts[1];
      Firestore.getCommandsCollection()
        .doc(commandToRemove)
        .delete()
        .then(() => logger.info(`Command removed: ${commandToRemove}`));
      return true;
    }

    default: {
      return false;
    }
  }
}

export async function handleTwitchUserCommand(
  commandData: CommandData,
  username: string
): Promise<boolean> {
  const { messageParts, clients, printFunc } = commandData;

  const { Firestore, Mqtt } = clients;

  const command = messageParts[0].toLowerCase();

  switch (command) {
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.GET_COUNT}`: {
      const trackingPhrases = await Firestore.loadTrackingPhrases();

      const targetPhrase = messageParts.slice(1).join('_');
      if (targetPhrase && trackingPhrases.includes(targetPhrase)) {
        const documentRef = Firestore.getTrackedWordsCollection().doc(targetPhrase);
        const document = await documentRef.get();
        const currentCount = document.get('count');
        printFunc(`${username}, ${targetPhrase} count is ${currentCount}`);
      }
      return true;
    }
    case `${COMMAND_PREFACE}${LIGHT_COMMANDS.TURN_OFF}`: {
      Mqtt.publish(LIGHT_TOPICS.office.on_off, 'off');
      printFunc(`${username} turned off the lights!`);
      return true;
    }
    case `${COMMAND_PREFACE}${LIGHT_COMMANDS.TURN_ON}`: {
      Mqtt.publish(LIGHT_TOPICS.office.on_off, 'on');
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
        Mqtt.publish(LIGHT_TOPICS.office.rgb_color, rgbValue);
        printFunc(`${username} changed the color of the lights!`);
      }

      if (messageParts.length === 2) {
        const color = messageParts[1];
        Mqtt.publish(LIGHT_TOPICS.office.named_color, color);
        printFunc(`${username} changed the color of the lights!`);
      }

      return true;
    }
    case `${COMMAND_PREFACE}${LIGHT_COMMANDS.RANDOM_COLOR}`: {
      const r = getRandomInt(255);
      const g = getRandomInt(255);
      const b = getRandomInt(255);
      const color = `[${r},${g},${b}]`;

      Mqtt.publish(LIGHT_TOPICS.office.rgb_color, color);
      printFunc(`${username} did roulette with the color of the lights!`);
      return true;
    }
    default: {
      return false;
    }
  }
}

export async function handleModCommand(commandData: CommandData): Promise<boolean> {
  const { messageParts, clients } = commandData;

  const { Firestore, Obs } = clients;

  const command = messageParts[0].toLowerCase();

  switch (command) {
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.ADD_WORD}`: {
      const trackingPhrases = await Firestore.loadTrackingPhrases();

      const newPhrase = messageParts.slice(1).join('_');
      if (newPhrase && !trackingPhrases.includes(newPhrase)) {
        Firestore.getTrackedWordsCollection()
          .doc(newPhrase)
          .set({
            count: 0
          })
          .then(() => logger.info(`Tracking word added: ${newPhrase}`));
      }
      return true;
    }
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.REMOVE_WORD}`: {
      const trackingPhrases = await Firestore.loadTrackingPhrases();

      const phraseToRemove = messageParts.slice(1).join('_');
      if (phraseToRemove && trackingPhrases.includes(phraseToRemove)) {
        Firestore.getTrackedWordsCollection()
          .doc(phraseToRemove)
          .delete()
          .then(() => logger.info(`Tracking word removed: ${phraseToRemove}`));
      }
      return true;
    }
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.CLEAR_WORD_COUNT}`: {
      const trackingPhrases = await Firestore.loadTrackingPhrases();

      const phraseToClear = messageParts.slice(1).join('_');
      if (phraseToClear && trackingPhrases.includes(phraseToClear)) {
        Firestore.getTrackedWordsCollection()
          .doc(phraseToClear)
          .update('count', 0)
          .then(() => logger.info(`Tracking word cleared: ${phraseToClear}`));
      }
      return true;
    }
    case `${COMMAND_PREFACE}${WORD_TRACKING_COMMANDS.INCREMENT_WORD_COUNT}`: {
      const trackingPhrases = await Firestore.loadTrackingPhrases();

      const lastToken = messageParts[messageParts.length - 1];
      const lastTokenAsNum = Number.parseInt(lastToken);

      const hasCount = Number.isInteger(lastTokenAsNum);
      const count = hasCount ? Number.parseInt(lastToken) : 1;

      const phraseParts = hasCount
        ? messageParts.slice(1, messageParts.length - 1)
        : messageParts.slice(1);
      const phraseToIncrement = phraseParts.join('_');

      if (phraseToIncrement && trackingPhrases.includes(phraseToIncrement)) {
        const documentRef = Firestore.getTrackedWordsCollection().doc(phraseToIncrement);
        const document = await documentRef.get();
        const currentCount: number = document.get('count');
        documentRef
          .update('count', currentCount + count)
          .then(() => logger.info(`Tracking word incremented: ${phraseToIncrement}`));
      }
      return true;
    }
    case `${COMMAND_PREFACE}${OBS_COMMANDS.RESET}`: {
      await Obs.send('SetSourceFilterVisibility', {
        sourceName: SOURCES.WEBCAM,
        filterName: 'Color Correction',
        filterEnabled: false
      });
      await Obs.send('SetSceneItemRender', {
        source: SOURCES.WEBCAM,
        render: true
      });
      await Obs.send('SetMute', { source: SOURCES.MIC, mute: false });
      return true;
    }
    default: {
      return false;
    }
  }
}
