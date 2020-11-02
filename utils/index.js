function getRandomColor() {
  return (Math.random() * 4294967296) >>> 0;
}

function replaceRequestingUserInMessage(username, command) {
  return command.replace('{user}', '@' + username);
}

module.exports = {
  getRandomColor,
  replaceRequestingUserInMessage
};