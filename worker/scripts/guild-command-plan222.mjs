/** Pure .222 successor: replace only /raid within the existing19 guild commands. */
import {normalizeCommands219 as normalize,digestCommands219 as digest,VERIFY_APP219 as APP,ASMON_GUILD219 as GUILD} from './guild-command-plan219.mjs';
const key=c=>(c.type??1)+':'+c.name;
const expected=['1:branches','1:council','1:event','1:forever','1:guide','1:launch','1:olympus-admin','1:olympus-intros','1:olympus-lookup','1:olympus-privacy','1:olympus-status','1:olympus-unlink','1:raid','1:stockades','1:treasury','1:verify','1:verify-status','1:workshop','2:Olympus linked characters'].sort();
const utility=['branches','council','event','forever','guide','launch','raid','stockades','treasury','workshop'].sort();
function scope(rows){if(!Array.isArray(rows)||rows.some(r=>r?.application_id!==APP||r?.guild_id!==GUILD))throw Error('guild_registration_destination_mismatch');}
function validRaid(raid){return raid?.name==='raid'&&raid.options?.length===1&&raid.options[0].name==='find'&&raid.options[0].type===3&&raid.options[0].autocomplete===true&&!raid.options[0].required&&!raid.options[0].choices&&raid.options[0].min_length===1&&raid.options[0].max_length===80;}
export function prepareGuildCommandPlan222(existing,utilities,{head,tree,definitionSHA256,expectedExistingSHA256}){
 if(!/^[a-f0-9]{40}$/.test(head)||!/^[a-f0-9]{40}$/.test(tree)||![definitionSHA256,expectedExistingSHA256].every(x=>/^[a-f0-9]{64}$/.test(x)))throw Error('command_source_custody');
 scope(existing);
 if(!Array.isArray(utilities)||utilities.length!==10||utilities.some(c=>!c||typeof c!=='object'||['contexts','integration_types','dm_permission'].some(k=>Object.hasOwn(c,k))))throw Error('guild_registration_scope');
 const before=normalize(existing),proposed=normalize(utilities);
 if(JSON.stringify(before.map(key))!==JSON.stringify(expected)||digest(before)!==expectedExistingSHA256)throw Error('existing_verify_command_inventory_changed');
 if(JSON.stringify(proposed.map(c=>c.name).sort())!==JSON.stringify(utility))throw Error('new_guild_command_inventory');
 for(const c of proposed)if(c.name!=='raid'&&digest(c)!==digest(before.find(old=>key(old)===key(c))))throw Error('non_raid_command_changed');
 const raid=proposed.find(c=>c.name==='raid');if(!validRaid(raid))throw Error('raid_hub_definition_changed');
 const commands=normalize(before.map(c=>c.name==='raid'?raid:c));
 const plan={schema:'olympus-guild-command-plan222/v1',applicationId:APP,guildId:GUILD,head,tree,definitionSHA256,existingSHA256:digest(before),payloadSHA256:digest(commands),existing:before,commands,expectedCount:19,changedCommands:['1:raid'],publicMessagesCreated:0};
 verifyGuildCommandReadback222(plan,commands.map(c=>({...c,application_id:APP,guild_id:GUILD})));return plan;
}
export function verifyGuildCommandReadback222(plan,readback){
 if(plan?.schema!=='olympus-guild-command-plan222/v1'||plan.applicationId!==APP||plan.guildId!==GUILD||plan.expectedCount!==19||JSON.stringify(plan.changedCommands)!=='["1:raid"]'||digest(plan.commands)!==plan.payloadSHA256||digest(plan.existing)!==plan.existingSHA256||JSON.stringify(normalize(plan.existing).map(key))!==JSON.stringify(expected)||!validRaid(plan.commands.find(c=>c.name==='raid')))throw Error('guild_registration_plan_changed');
 scope(readback);const rows=normalize(readback);if(rows.length!==19||digest(rows)!==plan.payloadSHA256)throw Error('guild_registration_readback_mismatch');
 for(const old of plan.existing)if(old.name!=='raid'&&digest(rows.find(c=>key(c)===key(old)))!==digest(old))throw Error('existing_command_changed');
 return {count:19,payloadSHA256:plan.payloadSHA256,names:rows.map(key),eighteenOtherCommandsPreserved:true,publicMessagesCreated:0,globalCommandsChanged:false};
}
