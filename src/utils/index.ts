import { ApiClient } from 'twitch';
import { COMMAND_SPACER } from '../constants';

// Deleting this breaks the bot even though it is not used
// Trying to import it in the OBS redemptions file seems to
//  break importing and I have literally no idea why :(
export function getRandomColor(): number {
  return (Math.random() * 4294967296) >>> 0;
}

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

export async function isChannelLive(apiClient: ApiClient, channel: string): Promise<boolean> {
  const stream = await apiClient.helix.streams.getStreamByUserName(channel);
  return stream !== null;
}

export function getEnvValue(key: string): string {
  const value = process.env[key];
  if (value) {
    return value;
  }
  throw new Error(`${key} environment variable missing`);
}
