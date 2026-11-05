/** Adds direct calendar operations beside the existing private raid hub and orders guide class choices by label. */
import { GUILD_COMMANDS_222 } from './guild-command-definitions222';
import { GUILD_COMMANDS_224 } from './guild-command-definitions224';
import { classDisplayChoices } from './site-data';

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
export const GUILD_COMMANDS_228 = Object.freeze(GUILD_COMMANDS_224.map(command => {
  if (command.name === 'raid') return RAID_COMMAND_228;
  const classSubcommand = command.name === 'guide' ? 'class' : command.name === 'forever' ? 'guide' : null;
  if (!classSubcommand || !('options' in command)) return command;
  const subcommands = command.options as Array<{ name: string; options: Array<{ name: string }> }>;
  return {
    ...command,
    options: subcommands.map(subcommand => subcommand.name === classSubcommand ? {
      ...subcommand,
      options: subcommand.options.map(option => option.name === 'class' ? { ...option, choices: classDisplayChoices() } : option),
    } : subcommand),
  };
}));
export const GUILD_COMMAND_NAMES_228 = new Set(GUILD_COMMANDS_228.map(command => command.name));
