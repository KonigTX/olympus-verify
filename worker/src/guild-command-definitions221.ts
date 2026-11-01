/** Current utility catalogue. The .219 catalogue remains the historical source
 * for its retained commands; no private companion command is registered here. */
import { GUILD_COMMANDS_219 } from './guild-command-definitions219';

const text=(name:string,description:string,required=false,max_length=60)=>({type:3,name,description,required,max_length});
const integer=(name:string,description:string,required=false,min_value=1,max_value=100)=>({type:4,name,description,required,min_value,max_value});
const sub=(name:string,description:string,options:unknown[]=[])=>({type:1,name,description,options});
const command=(name:string,description:string,options:unknown[]=[])=>({type:1,name,description,options});
const guide=GUILD_COMMANDS_219.find(row=>row.name==='guide')!;
const guideNames:Readonly<Record<string,string>>={class:'guide',talent:'talents',consumes:'consumables',buffs:'buffs',attunement:'attunement'};
const guideOptions=guide.options as ReadonlyArray<{type:number;name:string;description:string;options:unknown[]}>;

export const ACCOUNT_COMMANDS_221=Object.freeze([
 command('olympus-status','Show your verified characters and Olympus access'),
 command('olympus-unlink','Open account-removal and character-unlink instructions; nothing is removed immediately'),
 command('olympus-privacy','Open your account export, erasure and privacy controls')
]);
export const ADMIN_SUBCOMMANDS_221=Object.freeze([
 sub('release','Release an open request only; an existing character binding is never unlinked',[text('character','Character with an open verification request',true,32)]),
 sub('role-sync','Re-apply the latest admitted roster (same guarded workflow as sync)')
]);
export const GUILD_COMMANDS_221=Object.freeze([
 ...GUILD_COMMANDS_219.filter(row=>row.name!=='workshop'),
 command('forever','Forever class guides, talent links, raid preparation and consumables',
  guideOptions.map(row=>({...row,name:guideNames[row.name]??row.name}))),
 command('workshop','Find opted-in crafters or prepare a private commission request',[
  sub('search','Find self-reported recipes and professions from current opted-in guild members',[
   text('query','Recipe, profession or crafter name'),integer('page','Result page')
  ]),
  sub('order','Prepare a private draft to review and send to a crafter yourself',[
   text('recipe','Item or recipe requested; no personal information',true),
   integer('quantity','Number requested',true,1,1000),
   text('when','Proposed timing; the crafter must agree',false,80),
   text('materials','Materials you can supply; agree any remainder with the crafter',false,160)
  ])
 ])
]);
export const GUILD_COMMAND_NAMES_221=new Set(GUILD_COMMANDS_221.map(row=>row.name));
