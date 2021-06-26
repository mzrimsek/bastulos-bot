import { createLogger, format, transports } from 'winston';
const { combine, timestamp, prettyPrint, colorize, printf } = format;

const logger = createLogger({
  level: 'debug',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:MM:SS'
    }),
    prettyPrint(),
    colorize({ level: true }),
    printf(info => {
      const messageNeedsStringified = typeof info.message === 'object';
      const message = messageNeedsStringified ? JSON.stringify(info.message) : info.message;
      return `[${info.level}] ${info.timestamp} - ${message}`;
    })
  ),
  transports: [new transports.Console()]
});

export default logger;
