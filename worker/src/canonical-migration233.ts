/** Root's one-shot owner-inventory migration. This grammar grants no authority
 * by itself and is never a public request payload or routine identity proof. */
import {CANONICAL_GUILD233,CANONICAL_RANKS233,captureCanonicalRankConfig233} from './canonical-ranks233';
export const CANONICAL_MIGRATION_PROFILE233='olympus-canonical-migration-20261106-v1';
/** Fresh reviewed30 inventory minus the separate technical-partner role. */
export const CANONICAL_MIGRATION_ROLE_IDS233=Object.freeze(['1552077551839617104','1554261979684933742','1554262223038324840','1554262510650007602','1555639603619172504','1555640676287385771',
 '1557495772453281853','1557496182966587453','1557496796949909575','1557496812196208640','1557498239656136764','1557498252994285568','1557498673926242385','1557498969310101576','1557499139099590747','1557499286965719050',
 '1561095379909353472','1561095726115725373','1561095748039221339','1561095893007073371','1561096070040125460','1561096328409251880','1561096452057596005','1561096598296076460','1561096679778947113','1561096900378103808','1561097105974628372','1567917738985398384','1568117859970842735']);
/** Restriction only: the retired29 family cannot be revived by a late generic
 * writer. This is never a routine role-ownership or deletion allowlist. */
export function canonicalMigrationProducerHeld233(env:unknown,guild:string,role:string):boolean{
 return captureCanonicalRankConfig233(env).present&&guild===CANONICAL_GUILD233&&CANONICAL_MIGRATION_ROLE_IDS233.includes(role);
}
export type CanonicalMigrationEntry233=Readonly<{subject:string;generation:string|null;currentRoles:readonly string[];targetRole:string}>;
export type CanonicalMigrationManifest233=Readonly<{version:1;profile:typeof CANONICAL_MIGRATION_PROFILE233;guildId:typeof CANONICAL_GUILD233;operationId:string;epoch:string;seal:string;sourceTree:string;policySHA256:string;packetSHA256:string;issuedAt:number;expiresAt:number;entries:readonly CanonicalMigrationEntry233[]}>;
const held=():never=>{throw Error('canonical233_migration_configuration');},hex=(x:unknown,n:number):x is string=>typeof x==='string'&&x.length===n&&/^[0-9a-f]+$/.test(x),integer=(x:unknown):x is number=>typeof x==='number'&&Number.isSafeInteger(x)&&x>0;
export function parseCanonicalMigration233(raw:unknown):CanonicalMigrationManifest233{
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>65536)return held();let x:unknown;try{x=JSON.parse(raw);}catch{return held();}
 if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).join(',')!=='version,profile,guildId,operationId,epoch,seal,sourceTree,policySHA256,packetSHA256,issuedAt,expiresAt,entries')return held();
 const v=x as Record<string,unknown>;
 if(v.version!==1||v.profile!==CANONICAL_MIGRATION_PROFILE233||v.guildId!==CANONICAL_GUILD233||!hex(v.operationId,32)||!hex(v.epoch,32)||!hex(v.seal,64)||!hex(v.sourceTree,40)||!hex(v.policySHA256,64)||!hex(v.packetSHA256,64)||!integer(v.issuedAt)||!integer(v.expiresAt)||v.expiresAt<=v.issuedAt||v.expiresAt>v.issuedAt+300||!Array.isArray(v.entries)||!v.entries.length||v.entries.length>50)return held();
 let prior='';const entries=v.entries.map((entry:unknown)=>{
  if(!entry||typeof entry!=='object'||Array.isArray(entry)||Object.keys(entry).join(',')!=='subject,generation,currentRoles,targetRole')return held();const e=entry as Record<string,unknown>;
  if(typeof e.subject!=='string'||!/^[1-9][0-9]{16,19}$/.test(e.subject)||BigInt(e.subject)>18446744073709551615n||e.subject<=prior||e.generation!==null&&!hex(e.generation,32)||!Array.isArray(e.currentRoles)||e.currentRoles.length>29||typeof e.targetRole!=='string'||!CANONICAL_RANKS233.some(r=>r.roleId===e.targetRole))return held();prior=e.subject;
  let role='';for(const r of e.currentRoles){if(typeof r!=='string'||r<=role||!CANONICAL_MIGRATION_ROLE_IDS233.includes(r))return held();role=r;}
  return Object.freeze({subject:e.subject,generation:e.generation as string|null,currentRoles:Object.freeze(e.currentRoles.slice()) as readonly string[],targetRole:e.targetRole});
 });
 const manifest=Object.freeze({version:1 as const,profile:CANONICAL_MIGRATION_PROFILE233,guildId:CANONICAL_GUILD233,operationId:v.operationId,epoch:v.epoch,seal:v.seal,sourceTree:v.sourceTree,policySHA256:v.policySHA256,packetSHA256:v.packetSHA256,issuedAt:v.issuedAt,expiresAt:v.expiresAt,entries:Object.freeze(entries)});
 if(JSON.stringify(manifest)!==raw)return held();return manifest;
}
/** Capture before the operator entry's first await. Inherited/accessor input is
 * held without executing it; any later value/descriptor/prototype change holds. */
export function captureCanonicalMigration233(env:unknown):Readonly<{manifest:CanonicalMigrationManifest233;raw:string;current:()=>boolean}>|null{
 try{
  if(!env||typeof env!=='object')return null;const proto=Object.getPrototypeOf(env),keys=['CANONICAL_MIGRATION233','CANONICAL_MIGRATION_SOURCE_TREE233'] as const,slots=keys.map(k=>Object.getOwnPropertyDescriptor(env,k));
  if(slots.some((d,i)=>!d||!Object.hasOwn(d,'value')||typeof d.value!=='string'||!d&&keys[i]! in env))return null;
  const raw=slots[0]!.value,manifest=parseCanonicalMigration233(raw);if(slots[1]!.value!==manifest.sourceTree)return null;
  const current=()=>{try{return Object.getPrototypeOf(env)===proto&&keys.every((k,i)=>{const d=Object.getOwnPropertyDescriptor(env,k);return !!d&&['value','get','set','writable','enumerable','configurable'].every(a=>Object.is(d[a as keyof PropertyDescriptor],slots[i]![a as keyof PropertyDescriptor]));});}catch{return false;}};
  return Object.freeze({manifest,raw,current});
 }catch{return null;}
}
