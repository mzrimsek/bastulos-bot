export const COMMAND_PREFACE = '!';

export const COMMAND_SPACER = '\u200c';

export const ADMIN_USER = 'bastulos';

export const ADMIN_COMMANDS = {
  TOGGLE_COMMANDS_ACTIVE: 'active',
  ADD_COMMAND: 'add',
  REMOVE_COMMAND: 'rm',
};

export const OBS_COMMANDS = {
  RESET: 'reset',
  TOGGLE_CAM: 'cam',
  TOGGLE_MUTE_MIC: 'mic',
  CHANGE_OVERLAY_COLOR: 'color',
  TOGGLE_AQUA: 'aqua'
};

const WORD_TRACKING_COMMANDS = {
  ADD_WORD: 'addw',
  REMOVE_WORD: 'rmw',
  CLEAR_WORD_COUNT: 'clrw',
  INCREMENT_WORD_COUNT: 'incw',
  GET_COUNT: 'wordcount'
};

const LIGHT_COMMANDS = {
  TURN_OFF: 'lightsoff',
  TURN_ON: 'lightson',
  SET_COLOR: 'lightscol',
  RANDOM_COLOR: 'lightsrand'
};

const HELP_COMMAND = 'help';

module.exports = {
  OBS_COMMANDS,
  HELP_COMMAND,
  WORD_TRACKING_COMMANDS,
  LIGHT_COMMANDS
};