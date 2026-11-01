/** Pure plan/receipt helpers. No credentials, file reads, HTTP or mutation.
 * The owner operation supplies the actual existing guild command readback. */
import { createHash } from 'node:crypto';
export const VERIFY_APP219='1550176895671341076';
export const ASMON_GUILD219='236932545793490944';
const CORE219=['1:olympus-admin','1:olympus-intros','1:olympus-lookup','1:verify','1:verify-status','2:Olympus linked characters'];
const NEW219=['1:branches','1:council','1:event','1:guide','1:launch','1:raid','1:stockades','1:treasury','1:workshop'];
const COMMAND_KEYS219=['type','name','name_localizations','description','description_localizations','options','default_member_permissions','default_permission','nsfw'];
const OPTION_KEYS219=['type','name','name_localizations','description','description_localizations','required','choices','options','channel_types','min_value','max_value','min_length','max_length','autocomplete','file_types'];
const key219=row=>`${row.type??1}:${row.name}`;
const canonical219=value=>Array.isArray(value)?value.map(canonical219):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical219(value[key])])):value;
export const digestCommands219=value=>createHash('sha256').update(JSON.stringify(canonical219(value))).digest('hex');
function normalizeOption219(row){
 if(!row||typeof row!=='object'||Array.isArray(row))throw Error('command_option_shape');
 const out=Object.fromEntries(OPTION_KEYS219.filter(key=>Object.hasOwn(row,key)&&row[key]!==null).map(key=>[key,key==='options'?row.options.map(normalizeOption219):key==='choices'?row.choices.map(choice=>Object.fromEntries(['name','value','name_localizations'].filter(k=>Object.hasOwn(choice,k)&&choice[k]!==null).map(k=>[k,structuredClone(choice[k])]))):structuredClone(row[key])]));
 if(out.required===false)delete out.required;
 if(out.autocomplete===false)delete out.autocomplete;
 for(const key of ['options','choices','channel_types'])if(Array.isArray(out[key])&&!out[key].length)delete out[key];
 return out;
}
export function normalizeCommands219(rows){
 if(!Array.isArray(rows)||rows.length>100)throw Error('guild_commands_shape');
 const normalized=rows.map(row=>{
  if(!row||typeof row!=='object'||Array.isArray(row)||typeof row.name!=='string')throw Error('guild_command_shape');
  const out=Object.fromEntries(COMMAND_KEYS219.filter(key=>Object.hasOwn(row,key)&&row[key]!==null).map(key=>[key,key==='options'?row.options.map(normalizeOption219):structuredClone(row[key])]));
  out.type??=1;
  // Discord may expand missing optional defaults in a registration response.
  if(Array.isArray(out.options)&&!out.options.length)delete out.options;
  if(out.default_permission===true)delete out.default_permission;
  if(out.nsfw===false)delete out.nsfw;
  return out;
 }).sort((a,b)=>key219(a)<key219(b)?-1:key219(a)>key219(b)?1:0);
 if(new Set(normalized.map(key219)).size!==normalized.length)throw Error('duplicate_guild_commands');
 return normalized;
}
export function prepareGuildCommandPlan219(existing,additions,{head,tree,definitionSHA256}){
 if(!/^[a-f0-9]{40}$/.test(head)||!/^[a-f0-9]{40}$/.test(tree)||!/^[a-f0-9]{64}$/.test(definitionSHA256))throw Error('command_source_custody');
 if(!Array.isArray(additions)||additions.some(row=>!row||typeof row!=='object'||Object.hasOwn(row,'contexts')||Object.hasOwn(row,'integration_types')||Object.hasOwn(row,'dm_permission')))throw Error('guild_registration_scope');
 if(!Array.isArray(existing)||existing.some(row=>row?.application_id!==VERIFY_APP219||row?.guild_id!==ASMON_GUILD219))throw Error('guild_registration_destination_mismatch');
 const before=normalizeCommands219(existing),extra=normalizeCommands219(additions);
 if(JSON.stringify(before.map(key219))!==JSON.stringify(CORE219))throw Error('existing_verify_command_inventory_changed');
 if(JSON.stringify(extra.map(key219))!==JSON.stringify(NEW219)||extra.some(row=>before.some(old=>key219(old)===key219(row))||row.name==='olympus-qr'))throw Error('new_guild_command_inventory');
 const commands=normalizeCommands219([...before,...extra]);
 return {schema:'olympus-guild-command-plan219/v1',applicationId:VERIFY_APP219,guildId:ASMON_GUILD219,head,tree,definitionSHA256,existingSHA256:digestCommands219(before),payloadSHA256:digestCommands219(commands),existing:before,commands,expectedCount:15,forbiddenNewCommands:['olympus-qr'],publicMessagesCreated:0};
}
export function verifyGuildCommandReadback219(plan,readback){
 if(plan?.schema!=='olympus-guild-command-plan219/v1'||plan.applicationId!==VERIFY_APP219||plan.guildId!==ASMON_GUILD219||plan.expectedCount!==15||digestCommands219(plan.commands)!==plan.payloadSHA256)throw Error('guild_registration_plan_changed');
 const retained=normalizeCommands219(plan.existing);
 if(digestCommands219(retained)!==plan.existingSHA256||JSON.stringify(retained.map(key219))!==JSON.stringify(CORE219))throw Error('guild_registration_plan_changed');
 if(!Array.isArray(readback)||readback.some(row=>row?.application_id!==VERIFY_APP219||row?.guild_id!==ASMON_GUILD219))throw Error('guild_registration_destination_mismatch');
 const rows=normalizeCommands219(readback);
 if(rows.length!==15||digestCommands219(rows)!==plan.payloadSHA256)throw Error('guild_registration_readback_mismatch');
 for(const old of plan.existing){const after=rows.find(row=>key219(row)===key219(old));if(!after||digestCommands219(after)!==digestCommands219(old))throw Error('existing_command_changed');}
 return {count:rows.length,payloadSHA256:plan.payloadSHA256,names:rows.map(key219),existingPreserved:true,publicMessagesCreated:0};
}
