import { createLogger, format, transports } from 'winston';
const { combine, timestamp, prettyPrint, colorize } = format;

const logger = createLogger({
  level: 'debug',
  format: combine(timestamp(), prettyPrint(), colorize()),
  transports: [new transports.Console()]
});

export default logger;
