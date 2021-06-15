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
    printf(info => `[${info.level}] ${info.timestamp} - ${info.message}`)
  ),
  transports: [new transports.Console()]
});

export default logger;
