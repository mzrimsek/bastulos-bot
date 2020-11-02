const COMMAND_PREFACE = '!';

const ADMIN_USER = 'bastulos';

const ADMIN_COMMANDS = {
  TOGGLE_COMMANDS_ACTIVE: 'active',
  RECONNECT_OBS: 'obs'
};

const OBS_COMMANDS = {
  RESET: 'reset',
  TOGGLE_CAM: 'cam',
  TOGGLE_MUTE_MIC: 'mic',
  CHANGE_OVERLAY_COLOR: 'color',
  TOGGLE_AQUA: 'aqua'
};

const USER_COMMANDS = {
  COMMAND_LIST: 'help',
  HELLO: 'hello',
  HEART: 'heart'
};

module.exports = {
  COMMAND_PREFACE,
  ADMIN_USER,
  ADMIN_COMMANDS,
  OBS_COMMANDS,
  USER_COMMANDS
};