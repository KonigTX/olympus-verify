/** Adds direct calendar operations beside the existing private raid hub. */
import { GUILD_COMMANDS_222 } from './guild-command-definitions222';
import { GUILD_COMMANDS_224 } from './guild-command-definitions224';

const legacyRaid = GUILD_COMMANDS_222.find(command => command.name === 'raid')!;
const event = GUILD_COMMANDS_222.find(command => command.name === 'event')!;

export const RAID_COMMAND_228 = {
  type: 1,
  name: 'raid',
  description: 'Olympus calendar, signup, rosters and organizer tools',
  options: [
    { type: 1, name: 'hub', description: 'Open your private raid and event hub', options: legacyRaid.options },
    ...event.options,
  ],
};
export const GUILD_COMMANDS_228 = Object.freeze(GUILD_COMMANDS_224.map(command => command.name === 'raid' ? RAID_COMMAND_228 : command));
export const GUILD_COMMAND_NAMES_228 = new Set(GUILD_COMMANDS_228.map(command => command.name));
