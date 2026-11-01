/** Pure, bounded guild registration plan. No credentials, network or writes. */
import { normalizeCommands219 as normalize, digestCommands219 as digest, VERIFY_APP219 as APP, ASMON_GUILD219 as GUILD } from './guild-command-plan219.mjs';
const key=row=>`${row.type??1}:${row.name}`;
const CORE=['1:olympus-admin','1:olympus-intros','1:olympus-lookup','1:verify','1:verify-status','2:Olympus linked characters'];
const OLD=['branches','council','event','guide','launch','raid','stockades','treasury','workshop'].map(x=>'1:'+x);
const UTIL=[...OLD,'1:forever'].sort();
const ACCOUNT=['1:olympus-privacy','1:olympus-status','1:olympus-unlink'];
const ADMIN=['release','role-sync'];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function scope(rows){if(!Array.isArray(rows)||rows.some(r=>r?.application_id!==APP||r?.guild_id!==GUILD))throw Error('guild_registration_destination_mismatch');}
function definitions(rows){
 if(!Array.isArray(rows)||rows.length>25)throw Error('command_definition_bound');
 for(const r of rows){
  if(!r||typeof r!=='object'||['contexts','integration_types','dm_permission'].some(k=>Object.hasOwn(r,k)))throw Error('guild_registration_scope');
  if(typeof r.name!=='string'||!/^[a-z0-9_-]{1,32}$/.test(r.name)||typeof r.description!=='string'||r.description.length<1||r.description.length>100)throw Error('command_definition_text');
  if(r.options!==undefined){if(!Array.isArray(r.options)||r.options.length>25)throw Error('command_option_bound');definitions(r.options);}
 }
}
export function prepareGuildCommandPlan221(existing,utilities,accounts,adminAdditions,{head,tree,definitionSHA256,expectedExistingSHA256}){
 if(!/^[a-f0-9]{40}$/.test(head)||!/^[a-f0-9]{40}$/.test(tree)||!/^[a-f0-9]{64}$/.test(definitionSHA256)||!/^[a-f0-9]{64}$/.test(expectedExistingSHA256))throw Error('command_source_custody');
 scope(existing);definitions(utilities);definitions(accounts);definitions(adminAdditions);
 const before=normalize(existing),u=normalize(utilities),a=normalize(accounts);
 if(!same(before.map(key),[...CORE,...OLD].sort())||digest(before)!==expectedExistingSHA256)throw Error('existing_verify_command_inventory_changed');
 if(!same(u.map(key),UTIL)||!same(a.map(key),ACCOUNT)||!same(adminAdditions.map(r=>r.name).sort(),ADMIN))throw Error('new_guild_command_inventory');
 const admin=structuredClone(before.find(r=>r.name==='olympus-admin'));
 if(!Array.isArray(admin.options)||admin.options.some(r=>ADMIN.includes(r.name)))throw Error('admin_command_inventory_changed');
 admin.options.push(...structuredClone(adminAdditions));
 if(admin.options.length>25)throw Error('admin_command_option_bound');
 const commands=normalize([...before.filter(r=>CORE.includes(key(r))&&r.name!=='olympus-admin'),admin,...u,...a]);
 const plan={schema:'olympus-guild-command-plan221/v1',applicationId:APP,guildId:GUILD,head,tree,definitionSHA256,existingSHA256:digest(before),payloadSHA256:digest(commands),existing:before,commands,expectedCount:19,publicMessagesCreated:0};
 verifyGuildCommandReadback221(plan,commands.map(r=>({...r,application_id:APP,guild_id:GUILD})));
 return plan;
}
export function verifyGuildCommandReadback221(plan,readback){
 if(plan?.schema!=='olympus-guild-command-plan221/v1'||plan.applicationId!==APP||plan.guildId!==GUILD||plan.expectedCount!==19||digest(plan.commands)!==plan.payloadSHA256||digest(normalize(plan.existing))!==plan.existingSHA256)throw Error('guild_registration_plan_changed');
 scope(readback);const rows=normalize(readback);
 if(!same(rows.map(key),[...CORE,...UTIL,...ACCOUNT].sort())||rows.length!==19||digest(rows)!==plan.payloadSHA256)throw Error('guild_registration_readback_mismatch');
 for(const old of plan.existing.filter(r=>CORE.includes(key(r)))){
  const after=structuredClone(rows.find(r=>key(r)===key(old)));
  if(old.name==='olympus-admin'){
   const extra=(after.options??[]).filter(r=>!old.options?.some(x=>x.name===r.name));
   if(!same(extra.map(r=>r.name).sort(),ADMIN))throw Error('existing_admin_changed');
   after.options=after.options.filter(r=>!ADMIN.includes(r.name));
  }
  if(digest(after)!==digest(old))throw Error('existing_core_command_changed');
 }
 return {count:rows.length,payloadSHA256:plan.payloadSHA256,names:rows.map(key),coreCommandsPreserved:true,adminAdditions:ADMIN,publicMessagesCreated:0};
}
