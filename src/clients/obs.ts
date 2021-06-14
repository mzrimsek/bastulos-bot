const OBSWebSocket = require('obs-websocket-js');

let obsConnected = false;
const obsClient = new OBSWebSocket();
obsClient.on('ConnectionOpened', () => {
  obsConnected = true;
  logger.info('Connected to OBSWebSocket');
});
obsClient.on('ConnectionClosed', () => {
  obsConnected = false;
  logger.info('Disconnected from OBSWebSocket');
});

module.exports = {
  obsClient,
  obsConnected
};