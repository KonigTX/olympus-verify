/** .224 adds only /olympus to the nineteen established guild commands. */
import {normalizeCommands219 as normalize,digestCommands219 as digest,VERIFY_APP219 as APP,ASMON_GUILD219 as GUILD} from './guild-command-plan219.mjs';

const key=c=>(c.type??1)+':'+c.name;
const expected=['branches','council','event','forever','guide','launch','olympus-admin','olympus-intros','olympus-lookup','olympus-privacy','olympus-status','olympus-unlink','raid','stockades','treasury','verify','verify-status','workshop'].map(x=>'1:'+x).concat('2:Olympus linked characters').sort();
const utility=['branches','council','event','forever','guide','launch','olympus','raid','stockades','treasury','workshop'].sort();
const HUB={type:1,name:'olympus',description:'Open your private Olympus hub: verification, guides, Workshop, branches and guild roles'};
function scope(rows){if(!Array.isArray(rows)||rows.some(r=>r?.application_id!==APP||r?.guild_id!==GUILD))throw Error('guild_registration_destination_mismatch');}
export function prepareGuildCommandPlan224(existing,utilities,{head,tree,definitionSHA256,expectedExistingSHA256}){
 if(!/^[a-f0-9]{40}$/.test(head)||!/^[a-f0-9]{40}$/.test(tree)||![definitionSHA256,expectedExistingSHA256].every(x=>/^[a-f0-9]{64}$/.test(x)))throw Error('command_source_custody');
 scope(existing);
 if(!Array.isArray(utilities)||utilities.length!==11||utilities.some(c=>!c||typeof c!=='object'||['contexts','integration_types','dm_permission'].some(k=>Object.hasOwn(c,k))))throw Error('guild_registration_scope');
 const before=normalize(existing),proposed=normalize(utilities);
 if(JSON.stringify(before.map(key))!==JSON.stringify(expected)||digest(before)!==expectedExistingSHA256)throw Error('existing_verify_command_inventory_changed');
 if(JSON.stringify(proposed.map(c=>c.name).sort())!==JSON.stringify(utility))throw Error('new_guild_command_inventory');
 for(const c of proposed)if(c.name!=='olympus'&&digest(c)!==digest(before.find(old=>key(old)===key(c))))throw Error('established_command_changed');
 const hub=proposed.find(c=>c.name==='olympus');if(digest(hub)!==digest(HUB))throw Error('olympus_hub_definition_changed');
 const commands=normalize([...before,hub]);
 const plan={schema:'olympus-guild-command-plan224/v1',applicationId:APP,guildId:GUILD,head,tree,definitionSHA256,existingSHA256:digest(before),payloadSHA256:digest(commands),existing:before,commands,expectedCount:20,changedCommands:['1:olympus'],publicMessagesCreated:0};
 verifyGuildCommandReadback224(plan,commands.map(c=>({...c,application_id:APP,guild_id:GUILD})));return plan;
}
export function verifyGuildCommandReadback224(plan,readback){
 if(plan?.schema!=='olympus-guild-command-plan224/v1'||plan.applicationId!==APP||plan.guildId!==GUILD||plan.expectedCount!==20||JSON.stringify(plan.changedCommands)!=='["1:olympus"]'||digest(plan.commands)!==plan.payloadSHA256||digest(plan.existing)!==plan.existingSHA256||JSON.stringify(normalize(plan.existing).map(key))!==JSON.stringify(expected)||digest(plan.commands.find(c=>c.name==='olympus'))!==digest(HUB))throw Error('guild_registration_plan_changed');
 scope(readback);const rows=normalize(readback);if(rows.length!==20||digest(rows)!==plan.payloadSHA256)throw Error('guild_registration_readback_mismatch');
 for(const old of plan.existing)if(digest(rows.find(c=>key(c)===key(old)))!==digest(old))throw Error('existing_command_changed');
 return {count:20,payloadSHA256:plan.payloadSHA256,names:rows.map(key),nineteenOtherCommandsPreserved:true,publicMessagesCreated:0,globalCommandsChanged:false};
}
