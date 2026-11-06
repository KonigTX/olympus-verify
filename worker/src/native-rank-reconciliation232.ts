/** Owner's 5 Nov 2026 current-Prime policy: shared access plus the highest verified
 * native rank. PURE planning only: neither these DTOs nor a returned plan are an
 * effect capability. A separately qualified original issuer/central writer must
 * revalidate its own current Native, identity, privacy and provider custody. */
export const NATIVE_RANK_PROFILE232='olympus-prime-live-20261105-v1';
export const NATIVE_RANK_NAMES232=Object.freeze(['Guild Master','Stewart','High Council','Officer','Officer Alt','Raid Leader','Veteran','Raider','Member','Initiate'] as const);
export const NATIVE_SCOPE232=Object.freeze({guild:'OLYMPUS PRIME',realm:'CAMWOW US2 Realm 3 PvE'});
export const NATIVE_GUILD232='236932545793490944';
export const SHARED_MEMBER232='1552077551839617104';
export const MANUAL_COUNCIL232='1567917738985398384';
/** Dedicated owner-authorized courtesy role; no caller-selected office ID. The
 * central writer also requires its exact current provider name and zero base permissions. */
export const NATIVE_STEWART_ROLE232='1568117859970842735';
/** IDs retain their historical meanings. The new profile reuses by NAME; the old
 * QR/beta/ten-rank arrays are never relabelled. Stewart needs its new owner role. */
export const MIRROR_BY_NAME232=Object.freeze({
 'Guild Master':'1561095726115725373','High Council':'1561095748039221339',
 'Officer':'1561095893007073371','Officer Alt':'1561096070040125460',
 'Raid Leader':'1561096328409251880','Veteran':'1561096452057596005',
 'Raider':'1561096598296076460','Member':'1561096679778947113','Initiate':'1561097105974628372'
} as const);
export const NATIVE_STAFF232=Object.freeze({'Guild Master':'1554261979684933742','Officer':'1554262223038324840','Raid Leader':'1554262510650007602'} as const);
const ID=/^[1-9][0-9]{16,19}$/,HEX32=/^[0-9a-f]{32}$/,GUID=/^Player-[0-9]{1,6}-[0-9A-Fa-f]{4,16}$/;
const id=(v:unknown):v is string=>typeof v==='string'&&ID.test(v)&&BigInt(v)<=18446744073709551615n;
const held=(why:string):never=>{throw Error(why);};
function data(o:unknown,key:string):unknown{if(!o||typeof o!=='object')return held('native232_data_shape');const d=Object.getOwnPropertyDescriptor(o,key);if(!d||!Object.hasOwn(d,'value'))return held('native232_data_descriptor');return d.value;}
function integer(v:unknown,min=0,max=Number.MAX_SAFE_INTEGER):v is number{return typeof v==='number'&&Number.isSafeInteger(v)&&v>=min&&v<=max;}
export type NativeRankRole232=Readonly<{index:number;name:string;roleId:string}>;
export type NativeRankPolicy232=Readonly<{version:1;enabled:boolean;profile:typeof NATIVE_RANK_PROFILE232;guildId:typeof NATIVE_GUILD232;
 nativeGuild:typeof NATIVE_SCOPE232.guild;nativeRealm:typeof NATIVE_SCOPE232.realm;membershipRole:typeof SHARED_MEMBER232;
 ranks:readonly NativeRankRole232[];privileged:boolean}>;
const originalPolicies232=new WeakSet<object>();
/** No implicit profile/ID fallback, appointment inference, environment read or activation. */
export function parseNativeRankPolicy232(raw:unknown):NativeRankPolicy232{
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>4096)return held('native232_configuration');
 let x:unknown;try{x=JSON.parse(raw);}catch{return held('native232_configuration');}
 if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).join(',')!=='version,enabled,profile,guildId,nativeGuild,nativeRealm,membershipRole,ranks,privileged')return held('native232_configuration_keys');
 const v=x as Record<string,unknown>;
 if(v.version!==1||typeof v.enabled!=='boolean'||typeof v.privileged!=='boolean'||v.profile!==NATIVE_RANK_PROFILE232||v.guildId!==NATIVE_GUILD232||v.nativeGuild!==NATIVE_SCOPE232.guild||v.nativeRealm!==NATIVE_SCOPE232.realm||v.membershipRole!==SHARED_MEMBER232)return held('native232_configuration_scope');
 if(!Array.isArray(v.ranks)||v.ranks.length!==10)return held('native232_configuration_ranks');
 const forbidden=new Set([SHARED_MEMBER232,NATIVE_GUILD232,MANUAL_COUNCIL232,...Object.values(MIRROR_BY_NAME232),...Object.values(NATIVE_STAFF232),
  '1555639603619172504','1555640676287385771','1555944857380458556', // Existing Branch GM/Officer and Addon Developer offices.
  '1550176895671341076','1561095379909353472','1561096900378103808', // bot, other-base and historical Alt
  '1558657538960916490','1557496182966587453','1557495772453281853','1557496796949909575','1557496812196208640','1557498239656136764','1557498252994285568','1557498673926242385','1557498969310101576','1557499139099590747','1557499286965719050']);
 const ranks=v.ranks.map((r:unknown,index:number)=>{
  if(!r||typeof r!=='object'||Array.isArray(r)||Object.keys(r).join(',')!=='index,name,roleId')return held('native232_configuration_rank');
  const a=r as Record<string,unknown>,name=NATIVE_RANK_NAMES232[index]!;
  if(a.index!==index||a.name!==name||!id(a.roleId))return held('native232_configuration_rank');
  if(name==='Stewart'?a.roleId!==NATIVE_STEWART_ROLE232||forbidden.has(a.roleId):a.roleId!==MIRROR_BY_NAME232[name])return held('native232_configuration_role_meaning');
  return Object.freeze({index,name,roleId:a.roleId});
 });
 if(new Set(ranks.map(r=>r.roleId)).size!==10)return held('native232_configuration_duplicate_role');
 const policy=Object.freeze({version:1 as const,enabled:v.enabled,profile:NATIVE_RANK_PROFILE232,guildId:NATIVE_GUILD232,nativeGuild:NATIVE_SCOPE232.guild,nativeRealm:NATIVE_SCOPE232.realm,membershipRole:SHARED_MEMBER232,ranks:Object.freeze(ranks),privileged:v.privileged});
 if(JSON.stringify(policy)!==raw)return held('native232_configuration_canonical');originalPolicies232.add(policy);return policy;
}
export function selectNativeRankPolicy232(raw:unknown):Readonly<{mode:'off'|'held';reason:string;policy:null}|{mode:'enabled';reason:null;policy:NativeRankPolicy232}>{
 if(raw===undefined||raw===''||raw==='off')return Object.freeze({mode:'off',reason:'not_configured',policy:null});
 try{const policy=parseNativeRankPolicy232(raw);return policy.enabled?Object.freeze({mode:'enabled',reason:null,policy}):Object.freeze({mode:'off',reason:'disabled',policy:null});}
 catch{return Object.freeze({mode:'held',reason:'native232_configuration_held',policy:null});}
}
export type NativeRankCapture232=Readonly<{present:boolean;mode:'off'|'held'|'enabled';raw:string|null;policy:NativeRankPolicy232|null;current:()=>boolean}>;
/** Read the new selection independently of historical FULL_RELEASE/QR values.
 * An inherited/accessor selection is configured and held, never absent. */
export function captureNativeRankConfig232(env:unknown):NativeRankCapture232{
 if(!env||typeof env!=='object')return Object.freeze({present:false,mode:'off',raw:null,policy:null,current:()=>true});
 let initial:PropertyDescriptor|undefined,proto:object|null,inherited=false;
 try{proto=Object.getPrototypeOf(env);initial=Object.getOwnPropertyDescriptor(env,'NATIVE_RANK_SYNC232');inherited=!initial&&'NATIVE_RANK_SYNC232' in env;}catch{return Object.freeze({present:true,mode:'held',raw:null,policy:null,current:()=>false});}
 const current=()=>{try{if(Object.getPrototypeOf(env)!==proto)return false;const d=Object.getOwnPropertyDescriptor(env,'NATIVE_RANK_SYNC232');if(!initial)return !d&&!('NATIVE_RANK_SYNC232' in (env as object));return !!d&&['value','get','set','writable','enumerable','configurable'].every(k=>Object.is(d[k as keyof PropertyDescriptor],initial![k as keyof PropertyDescriptor]));}catch{return false;}};
 if(inherited||initial&&!Object.hasOwn(initial,'value'))return Object.freeze({present:true,mode:'held',raw:null,policy:null,current});
 const raw=initial?.value,present=raw!==undefined&&raw!==''&&raw!=='off',selected=selectNativeRankPolicy232(raw);
 return Object.freeze({present,mode:selected.mode,raw:typeof raw==='string'?raw:null,policy:selected.policy,current});
}
/** New producer restriction only: never used to discard/ACK old spent effects. */
export function nativeRankProducerHeld232(env:unknown,guild:string,role:string):boolean{
 const c=captureNativeRankConfig232(env);if(!c.present||guild!==NATIVE_GUILD232)return false;
 return role===SHARED_MEMBER232||Object.values(MIRROR_BY_NAME232).includes(role as never)||Object.values(NATIVE_STAFF232).includes(role as never)||!!c.policy?.ranks.some(r=>r.roleId===role);
}
export type NativeMember232=Readonly<{nameKey:string;guid:string|null;rank:string;index:number}>;
/** Identity facts must come from the future source-owned original issuer, never a
 * name match/note or a caller Boolean. Pure planner types grant no authority. */
export type VerifiedNativeLink232=Readonly<{subject:string;generation:string|null;guid:string;nameKey:string;status:'member';anchorId:string}>;
export type OwnedNativeRole232=Readonly<{subject:string;generation:string|null;roleId:string;family:'membership'|'rank'|'staff';
 state:'settled';desired:1;attempts:1;nonce:string;reason:'native232_put_acknowledged_and_confirmed'}>;
export type NativeRankPlanningInput232=Readonly<{at:number;subject:string;generation:string|null;
 standing:Readonly<{banned:boolean;denied:boolean;renameHeld:boolean;privacy:'active'|'absent'|'retiring'|'retired'}>;
 snapshot:Readonly<{id:number;exportedAt:number;complete:boolean;trusted:boolean;memberCount:number;storedCount:number;source:string;previousTrustedCount:number;rows:readonly NativeMember232[]}>;
 minMembers:number;maxShrinkPercent:number;links:readonly VerifiedNativeLink232[];presentRoles:readonly string[];
 owned:readonly OwnedNativeRole232[];unresolvedRoleIds:readonly string[];manualProtectedRoleIds:readonly string[];
 confirmedAbsentGuids:readonly string[]}>;
export type NativeRankPlan232=Readonly<{state:'ready'|'held';reason:string|null;primary:NativeMember232|null;
 wanted:readonly string[];grant:readonly string[];remove:readonly string[];manualPreserved:readonly string[];
 membershipRetained:boolean;opaqueAuthority:false}>;
const holdPlan=(reason:string):NativeRankPlan232=>Object.freeze({state:'held',reason,primary:null,wanted:Object.freeze([]),grant:Object.freeze([]),remove:Object.freeze([]),manualPreserved:Object.freeze([]),membershipRetained:false,opaqueAuthority:false});
const source232='addon-native-v1:'+JSON.stringify({version:1,...NATIVE_SCOPE232});
const strings=(raw:unknown,max:number):readonly string[]=>{if(!Array.isArray(raw)||raw.length>max||raw.some(v=>!id(v))||new Set(raw).size!==raw.length)return held('native232_role_set');return raw as string[];};
/** All output is a plan, not dispatch admission. Unknown source never means absent.
 * Missing eligible alts need original confirmed-departure evidence before lowering
 * the account's rank. Ties use GUID; every primary choice is from the same subject. */
export function planNativeRankReconciliation232(policy:NativeRankPolicy232,input:NativeRankPlanningInput232):NativeRankPlan232{
 try{
  // A parsed immutable configuration is still not an effect capability. Reject
  // copied/accessor policy objects before consulting any of their properties.
  if(!originalPolicies232.has(policy))return holdPlan('native232_configuration_held');
  const cfg=policy;if(!cfg.enabled)return holdPlan('native232_disabled');
  const at=data(input,'at'),subject=data(input,'subject'),generation=data(input,'generation');
  if(!integer(at,1)||!id(subject)||generation!==null&&(typeof generation!=='string'||!HEX32.test(generation)))return holdPlan('native232_subject');
  const standing=data(input,'standing'),privacy=data(standing,'privacy');if(data(standing,'banned')!==false||data(standing,'denied')!==false||data(standing,'renameHeld')!==false||typeof privacy!=='string'||!['active','absent'].includes(privacy))return holdPlan('native232_standing_held');
  const snap=data(input,'snapshot'),sid=data(snap,'id'),exported=data(snap,'exportedAt'),count=data(snap,'memberCount'),stored=data(snap,'storedCount'),previous=data(snap,'previousTrustedCount'),rows=data(snap,'rows');
  const floor=data(input,'minMembers'),shrink=data(input,'maxShrinkPercent');
  if(!integer(sid,1)||!integer(exported,1)||exported>at||exported<=at-600||data(snap,'complete')!==true||data(snap,'trusted')!==true||data(snap,'source')!==source232)return holdPlan('native232_current_source_held');
  if(!integer(count,0,1000)||!integer(stored,0,1000)||!integer(previous,0,1000)||!integer(floor,0,1000)||!integer(shrink,0,100)||!Array.isArray(rows)||rows.length!==count||stored!==count||count<floor||(previous-count)*100>shrink*previous)return holdPlan('native232_source_size_held');
  type ProvenMember232=NativeMember232&Readonly<{guid:string}>;
  const byGuid=new Map<string,ProvenMember232>(),names=new Set<string>(),unknownGuidKeys=new Set<string>();
  for(const row of rows){const key=data(row,'nameKey'),guid=data(row,'guid'),rank=data(row,'rank'),index=data(row,'index');
   if(typeof key!=='string'||!key||key.length>100||key!==key.trim().replace(/[A-Z]/g,c=>c.toLowerCase())||!integer(index,0,9)||rank!==NATIVE_RANK_NAMES232[index]||names.has(key))return holdPlan('native232_profile_or_guid_held');
   names.add(key);if(guid===null||guid===''){unknownGuidKeys.add(key);continue;}
   if(typeof guid!=='string'||!GUID.test(guid)||byGuid.has(guid))return holdPlan('native232_profile_or_guid_held');
   byGuid.set(guid,Object.freeze({nameKey:key,guid,rank:rank as string,index}));
  }
  const rawLinks=data(input,'links');if(!Array.isArray(rawLinks)||rawLinks.length>100)return holdPlan('native232_link_shape');
  const absentRaw=data(input,'confirmedAbsentGuids');if(!Array.isArray(absentRaw)||absentRaw.length>100||absentRaw.some(g=>typeof g!=='string'||!GUID.test(g))||new Set(absentRaw).size!==absentRaw.length)return holdPlan('native232_departure_shape');
  const confirmedAbsent=new Set<string>(absentRaw),eligible:ProvenMember232[]=[],seenLinks=new Set<string>();let anchors=0;
  for(const link of rawLinks){
   if(data(link,'subject')!==subject||data(link,'generation')!==generation||data(link,'status')!=='member')continue;
   const guid=data(link,'guid'),key=data(link,'nameKey'),anchor=data(link,'anchorId');
   if(typeof guid!=='string'||!GUID.test(guid)||typeof key!=='string'||!key||typeof anchor!=='string'||!HEX32.test(anchor)||seenLinks.has(guid))return holdPlan('native232_verified_link_held');
   if(unknownGuidKeys.has(key))return holdPlan('native232_target_guid_unknown');
   seenLinks.add(guid);anchors++;const member=byGuid.get(guid);
   if(member){if(member.nameKey!==key||confirmedAbsent.has(guid))return holdPlan('native232_identity_changed');eligible.push(member);}
   else if(!confirmedAbsent.has(guid))return holdPlan('native232_departure_unconfirmed');
  }
  if(!anchors)return holdPlan('native232_original_verified_identity_required');
  const present=strings(data(input,'presentRoles'),250),manual=strings(data(input,'manualProtectedRoleIds'),250),unresolved=strings(data(input,'unresolvedRoleIds'),250);
  const rankIds=cfg.ranks.map(r=>r.roleId),staffIds:readonly string[]=Object.values(NATIVE_STAFF232),managed=new Set<string>([SHARED_MEMBER232,...rankIds,...staffIds]);
  if(unresolved.some(r=>managed.has(r)))return holdPlan('native232_provider_custody_held');
  eligible.sort((a,b)=>a.index-b.index||(a.guid<b.guid?-1:a.guid>b.guid?1:0));const primary=eligible[0]??null;
  const wanted:string[]=primary?[SHARED_MEMBER232,cfg.ranks[primary.index]!.roleId]:[];
  // One highest eligible native identity controls this plan. Stewart/HC/OfficerAlt
  // never imply a manual appointment or staff role, even through ordinal ordering.
  if(primary&&cfg.privileged){const staff=NATIVE_STAFF232[primary.rank as keyof typeof NATIVE_STAFF232];if(staff)wanted.push(staff);}
  const ownRaw=data(input,'owned');if(!Array.isArray(ownRaw)||ownRaw.length>250)return holdPlan('native232_ownership_shape');const own=new Set<string>();
  for(const row of ownRaw){if(data(row,'subject')!==subject||data(row,'generation')!==generation)continue;const role=data(row,'roleId'),family=data(row,'family'),nonce=data(row,'nonce');
   const roleFamily=role===SHARED_MEMBER232?'membership':typeof role==='string'&&rankIds.includes(role)?'rank':typeof role==='string'&&staffIds.includes(role)?'staff':null;
   if(roleFamily&&family===roleFamily&&data(row,'state')==='settled'&&data(row,'desired')===1&&data(row,'attempts')===1&&typeof nonce==='string'&&HEX32.test(nonce)&&data(row,'reason')==='native232_put_acknowledged_and_confirmed')own.add(role as string);
  }
  const remove=present.filter(r=>managed.has(r)&&!wanted.includes(r)&&own.has(r)&&!manual.includes(r));
  const manualPreserved=present.filter(r=>managed.has(r)&&!wanted.includes(r)&&(!own.has(r)||manual.includes(r)));
  return Object.freeze({state:'ready',reason:null,primary,wanted:Object.freeze(wanted),grant:Object.freeze(wanted.filter(r=>!present.includes(r))),remove:Object.freeze(remove),manualPreserved:Object.freeze(manualPreserved),membershipRetained:!!primary,opaqueAuthority:false});
 }catch{return holdPlan('native232_input_held');}
}
