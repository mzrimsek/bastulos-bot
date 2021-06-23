import { COMMAND_SPACER } from '../constants';

export function getRandomInt(max: number, offset = 0): number {
  return Math.floor(Math.random() * max) + offset;
}

export function replaceRequestingUserInMessage(username: string, command: string): string {
  return command.replace('{user}', username);
}

export function randomlyPadContent(content: string): string {
  const numToPad = getRandomInt(99, 1);
  const padding = COMMAND_SPACER.repeat(numToPad);
  return `${content}${padding}`;
}

export function getEnvValue(key: string): string {
  const value = process.env[key];
  if (value) {
    return value;
  }
  throw new Error(`${key} environment variable missing`);
}
