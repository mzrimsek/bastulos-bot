require('dotenv').config();

const tmi = require('tmi.js');
const OBSWebSocket = require('obs-websocket-js');

const tmiConfig = require('./config/tmi');
const obsConfig = require('./config/obs');

const client = new tmi.client(tmiConfig);
const obs = new OBSWebSocket();

client.connect();
obs.connect(obsConfig);

const COMMAND_PREFACE = '!';
const ADMIN_USER = 'bastulos';
const ADMIN_COMMANDS = {
  TOGGLE_COMMANDS_ACTIVE: 'active',
  RECONNECT_OBS: 'obs'
};
const COMMANDS = {
  COMMAND_LIST: 'help',
  RESET: 'reset',
  TOGGLE_CAM: 'cam',
  TOGGLE_MUTE_MIC: 'mic',
  CHANGE_OVERLAY_COLOR: 'color',
  TOGGLE_AQUA: 'aqua',
  HELLO: 'hello',
  HEART: 'heart'
};
const SOURCES = {
  WEBCAM: 'Webcam',
  MIC: 'Desktop Mic',
  AQUA: 'Aqua'
};

let active = true;

client.on('chat', async (channel, userInfo, message, self) => {
  if (self) return; // ignore messages from the bot 

  if (message[0] !== COMMAND_PREFACE) return; // ignore non command messages

  const normalizedMessage = message.toLowerCase();
  const messageParts = normalizedMessage.split(' ');
  const command = messageParts[0];

  if (userInfo.username === ADMIN_USER) {
    switch (command) {
      case `${COMMAND_PREFACE}${ADMIN_COMMANDS.TOGGLE_COMMANDS_ACTIVE}`: {
        if (active) {
          client.say(channel, `Bot commands are disabled!`);
          active = false;
        }
        else {
          client.say(channel, `Bot commands are enabled!`);
          active = true;
        }
        break;
      }
      case `${COMMAND_PREFACE}${ADMIN_COMMANDS.RECONNECT_OBS}`: {
        obs.connect(obsConfig);
        break;
      }
      default: {
        break;
      }
    }
  }

  if (!active) return;

  switch (command) {
    case `${COMMAND_PREFACE}${COMMANDS.RESET}`: {
      obs.send('SetSourceFilterVisibility', {
        sourceName: SOURCES.WEBCAM,
        filterName: 'Color Correction',
        filterEnabled: false
      });
      obs.send('SetSceneItemRender', { source: SOURCES.WEBCAM, render: true });
      obs.send('SetMute', { source: SOURCES.MIC, mute: false });
      break;
    }
    case `${COMMAND_PREFACE}${COMMANDS.HEART}`:
    case `${COMMAND_PREFACE}${COMMANDS.HELLO}`: {
      client.say(channel, `@${userInfo.username}, may your heart be your guiding key`);
      break;
    }
    case `${COMMAND_PREFACE}${COMMANDS.COMMAND_LIST}`: {
      const commands = Object.keys(COMMANDS);
      const commandList = commands.map(commandKey => `${COMMAND_PREFACE}${COMMANDS[commandKey]}`).join(', ');
      client.say(channel, `Here are the available commands: \n${commandList}`);
      break;
    }
    case `${COMMAND_PREFACE}${COMMANDS.TOGGLE_CAM}`: {
      const properties = await obs.send('GetSceneItemProperties', { item: { name: SOURCES.WEBCAM } });
      const { visible } = properties;
      obs.send('SetSceneItemRender', { source: SOURCES.WEBCAM, render: !visible });
      break;
    }
    case `${COMMAND_PREFACE}${COMMANDS.TOGGLE_MUTE_MIC}`: {
      obs.send('ToggleMute', { source: SOURCES.MIC });
      break;
    }
    case `${COMMAND_PREFACE}${COMMANDS.CHANGE_OVERLAY_COLOR}`: {
      let numTimes = messageParts[1] ? parseInt(messageParts[1]) : 1;

      if (numTimes < 0) {
        numTimes = Math.abs(numTimes);
      }

      if (numTimes > 1000) {
        numTimes = 1000;
      }

      obs.send('SetSourceFilterVisibility', {
        sourceName: SOURCES.WEBCAM,
        filterName: 'Color Correction',
        filterEnabled: true
      });

      const setColorCorrectionToRandomColor = () => {
        const randomColor = getRandomColor();
        obs.send('SetSourceFilterSettings', {
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
    case `${COMMAND_PREFACE}${COMMANDS.TOGGLE_AQUA}`: {
      const properties = await obs.send('GetSceneItemProperties', { item: { name: SOURCES.AQUA } });
      const { visible } = properties;
      obs.send('SetSceneItemRender', { source: SOURCES.AQUA, render: !visible });
      break;
    }
    default: {
      break;
    }
  }
});

function getRandomColor() {
  return (Math.random() * 4294967296) >>> 0;
}