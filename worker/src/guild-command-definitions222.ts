/** Current guild catalogue. Prior release definitions remain immutable history. */
import { GUILD_COMMANDS_221, ACCOUNT_COMMANDS_221, ADMIN_SUBCOMMANDS_221 } from './guild-command-definitions221';
export { ACCOUNT_COMMANDS_221, ADMIN_SUBCOMMANDS_221 };
export const GUILD_COMMANDS_222 = Object.freeze([
 ...GUILD_COMMANDS_221.filter(c=>c.name!=='raid'),
 {type:1,name:'raid',description:'Open your private raid hub: events, signup, rosters and organizer controls',options:[
  {type:3,name:'find',description:'Optional: find an upcoming event, or paste its calendar ID',required:false,autocomplete:true,min_length:1,max_length:80}
 ]}
]);
export const GUILD_COMMAND_NAMES_222 = new Set(GUILD_COMMANDS_222.map(c=>c.name));
