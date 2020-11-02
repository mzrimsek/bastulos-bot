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

const HELP_COMMAND = 'help';

module.exports = {
  COMMAND_PREFACE,
  ADMIN_USER,
  ADMIN_COMMANDS,
  OBS_COMMANDS,
  HELP_COMMAND
};