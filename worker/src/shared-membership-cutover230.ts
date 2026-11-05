/** Build230 fixed shared-role selection. A closure record selects a qualified venue; it never
 * supplies a subject, consumed-code mandate, provider drain proof or legacy grant authority. */
import type {Env} from './env';
import {privacyProviderCustodyDatabase} from './privacy-serving-authority';
import {captureLaunchVerification} from './launch-verification227';
import {isFlagshipGuildName} from './guild-affiliation229';
import {membershipSettlementEnabled} from './membership-role-transition';
import {privacyAdmissionEpochMatches} from './privacy-write-admission';

export const SHARED_MEMBER230_GUILD='236932545793490944';
export const SHARED_MEMBER230_ROLE='1552077551839617104';
export const SHARED_MEMBER230_CONTRACT='olympus-shared-member-230-v1';
export const SHARED_MEMBER230_SEAL_PREFIX='membership230:closure:';
const MODE='SHARED_MEMBERSHIP230_MODE',JSON_KEY='SHARED_MEMBERSHIP230_CLOSURE_JSON',HASH_KEY='SHARED_MEMBERSHIP230_CLOSURE_SHA256';
const KEYS=[MODE,JSON_KEY,HASH_KEY,'PRIVACY_WRITE_ADMISSION_EPOCH','PRIVACY_WRITE_ADMISSION_ENABLED','PRIVACY_WRITE_ADMISSION_LAYOUT',
 'PRIVACY_NATIVE_ERASURE_ENABLED','VERIFY_MEMBERSHIP_ONLY','VERIFY_NATIVE_SCOPE','GUILD_ID','ROLE_GUILD_MEMBER','DB',
 'PRIVACY_ERASURE_ENABLED','MEMBERSHIP_ROLE_SETTLEMENT_ENABLED','QR_PHASE1_ENABLED'] as const;
const HEX32=/^[0-9a-f]{32}$/,HEX40=/^[0-9a-f]{40}$/,HEX64=/^[0-9a-f]{64}$/,UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function fail(reason:string):never{throw Error(reason);}
type Closure230=Readonly<{version:1;contract:typeof SHARED_MEMBER230_CONTRACT;operationId:string;priorEpoch:string;writeEpoch:string;sourceCommit:string;sourceTree:string;bundleSHA256:string;providerA:string;writerCoverageSHA256:string;debtPredicateSHA256:string;createdAt:number;expiresAt:number}>;
export type SharedMemberClosure230=Closure230;
const CLOSURE_KEYS=['version','contract','operationId','priorEpoch','writeEpoch','sourceCommit','sourceTree','bundleSHA256','providerA','writerCoverageSHA256','debtPredicateSHA256','createdAt','expiresAt'] as const;
/** Canonical, closed data shape. This parser grants no cutover or role authority. */
export function parseSharedMemberClosure230(text:unknown):Closure230{
 if(typeof text!=='string'||text.length>4096)fail('shared_member230_closure_shape');
 let raw:unknown;try{raw=JSON.parse(text);}catch{fail('shared_member230_closure_shape');}
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Reflect.ownKeys(raw).length!==CLOSURE_KEYS.length)fail('shared_member230_closure_shape');
 const values=CLOSURE_KEYS.map(k=>{const d=Object.getOwnPropertyDescriptor(raw,k);if(!d||!Object.hasOwn(d,'value'))return fail('shared_member230_closure_shape');return d.value;});
 const c=Object.fromEntries(CLOSURE_KEYS.map((k,i)=>[k,values[i]])) as Closure230;
 if(JSON.stringify(c)!==text||!['operationId','priorEpoch','writeEpoch','sourceCommit','sourceTree','bundleSHA256','providerA','writerCoverageSHA256','debtPredicateSHA256'].every(k=>typeof (c as unknown as Record<string,unknown>)[k]==='string')||c.version!==1||c.contract!==SHARED_MEMBER230_CONTRACT||!HEX32.test(c.operationId)||!HEX32.test(c.priorEpoch)||!HEX32.test(c.writeEpoch)||c.priorEpoch===c.writeEpoch
  ||!HEX40.test(c.sourceCommit)||!HEX40.test(c.sourceTree)||!HEX64.test(c.bundleSHA256)||!UUID.test(c.providerA)||!HEX64.test(c.writerCoverageSHA256)||!HEX64.test(c.debtPredicateSHA256)
  ||!Number.isSafeInteger(c.createdAt)||c.createdAt<1||!Number.isSafeInteger(c.expiresAt)||c.expiresAt!==c.createdAt+300||c.expiresAt>253402300799)fail('shared_member230_closure_shape');
 return Object.freeze(c);
}
export async function sharedMember230SHA256(text:string):Promise<string>{return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');}
type Captured={check:()=>void;values:ReadonlyMap<string,unknown>};
function capture(env:Env):Captured{
 const proto=Object.getPrototypeOf(env),slots=KEYS.map(k=>{const d=Object.getOwnPropertyDescriptor(env,k);if(!d&&k in env||d&&!Object.hasOwn(d,'value'))return fail('shared_member230_configuration');return d;});
 const check=()=>{if(Object.getPrototypeOf(env)!==proto)fail('shared_member230_configuration_changed');for(let i=0;i<KEYS.length;i++){const a=Object.getOwnPropertyDescriptor(env,KEYS[i]!),b=slots[i];if(b?!a||!['value','get','set','writable','enumerable','configurable'].every(k=>Object.is(a[k as keyof PropertyDescriptor],b[k as keyof PropertyDescriptor])):(!!a||KEYS[i]! in env))fail('shared_member230_configuration_changed');}};
 check();return {check,values:new Map(KEYS.map((k,i)=>[k,slots[i]?.value]))};
}
declare const venueBrand:unique symbol;
export type RuntimeVenue230=Readonly<{[venueBrand]:true}>;
export type RuntimeVenue230Facts=Readonly<{guildId:typeof SHARED_MEMBER230_GUILD;roleId:typeof SHARED_MEMBER230_ROLE;epoch:string;sealKey:string;sealJSON:string;sealSHA256:string}>;
type Venue={env:Env;database:D1Database;check:()=>void;values:ReadonlyMap<string,unknown>;facts:RuntimeVenue230Facts};
const venues=new WeakMap<RuntimeVenue230,Venue>();
export type RuntimeVenue230Selection=Readonly<{mode:'off'|'held'|'close-only';reason:string;venue:null}|{mode:'enabled';reason:null;venue:RuntimeVenue230}>;
/** No SQL/effect in OFF/close-only. Hashing snapshots descriptors before its first await. */
export async function captureRuntimeVenue230(env:Env):Promise<RuntimeVenue230Selection>{
 try{
  const c=capture(env),mode=c.values.get(MODE),json=c.values.get(JSON_KEY),digest=c.values.get(HASH_KEY);
  if(mode===undefined||mode==='off'){if(json!==undefined||digest!==undefined)return Object.freeze({mode:'held',reason:'partial_closure_configuration',venue:null});return Object.freeze({mode:'off',reason:'venue_off',venue:null});}
  if(mode==='close-only')return Object.freeze({mode:'close-only',reason:'old_producers_closing',venue:null});
  if(mode!=='enabled'||typeof json!=='string'||typeof digest!=='string'||!HEX64.test(digest))return Object.freeze({mode:'held',reason:'venue_configuration',venue:null});
  const closure=parseSharedMemberClosure230(json),launch=captureLaunchVerification(env);
  if(c.values.get('GUILD_ID')!==SHARED_MEMBER230_GUILD||c.values.get('ROLE_GUILD_MEMBER')!==SHARED_MEMBER230_ROLE||c.values.get('VERIFY_MEMBERSHIP_ONLY')!=='true'
   ||c.values.get('PRIVACY_NATIVE_ERASURE_ENABLED')!=='true'||c.values.get('PRIVACY_WRITE_ADMISSION_ENABLED')!=='true'||c.values.get('PRIVACY_WRITE_ADMISSION_LAYOUT')!=='recorded-live-pre-seal-20261017'
   ||c.values.get('PRIVACY_WRITE_ADMISSION_EPOCH')!==closure.writeEpoch||!membershipSettlementEnabled(env)||launch.mode!=='members-only'||!launch.scope||!isFlagshipGuildName(launch.scope.guild)||!launch.current())return Object.freeze({mode:'held',reason:'venue_native_configuration',venue:null});
  const check=()=>{c.check();if(!launch.current())fail('shared_member230_launch_configuration_changed');};
  const hashed=await sharedMember230SHA256(json);check();if(hashed!==digest)return Object.freeze({mode:'held',reason:'closure_digest_changed',venue:null});
  const database=privacyProviderCustodyDatabase(env);check();if(!privacyAdmissionEpochMatches(database,closure.writeEpoch))return Object.freeze({mode:'held',reason:'venue_database_epoch',venue:null});
  const facts=Object.freeze({guildId:SHARED_MEMBER230_GUILD,roleId:SHARED_MEMBER230_ROLE,epoch:closure.writeEpoch,sealKey:SHARED_MEMBER230_SEAL_PREFIX+closure.operationId,sealJSON:json,sealSHA256:digest});
  const venue=Object.freeze({}) as RuntimeVenue230;venues.set(venue,{env,database,check,values:c.values,facts});return Object.freeze({mode:'enabled',reason:null,venue});
 }catch{return Object.freeze({mode:'held',reason:'venue_configuration_or_custody',venue:null});}
}
export function assertRuntimeVenue230(env:Env,cap:RuntimeVenue230):void{
 const s=venues.get(cap);if(!s)fail('shared_member230_venue_foreign');s.check();
 // Central receives the original cached provider-custody alias. A copied base DB or
 // equal-looking wrapper cannot replace it; the original config witness stays live.
 const database=Object.getOwnPropertyDescriptor(env,'DB');if(!database||!Object.hasOwn(database,'value'))fail('shared_member230_database_changed');
 if(database.value!==s.database&&!(env===s.env&&privacyProviderCustodyDatabase(env)===s.database))fail('shared_member230_database_changed');
 if(!privacyAdmissionEpochMatches(database.value as D1Database,s.facts.epoch))fail('shared_member230_database_epoch_changed');
 for(const k of KEYS){if(k==='DB')continue;const d=Object.getOwnPropertyDescriptor(env,k);if(!d&&k in env||d&&!Object.hasOwn(d,'value')||!Object.is(d?.value,s.values.get(k)))fail('shared_member230_configuration_changed');}
 s.check();
}
export function runtimeVenue230Facts(cap:RuntimeVenue230):RuntimeVenue230Facts{const s=venues.get(cap);if(!s)fail('shared_member230_venue_foreign');s.check();return s.facts;}
/** Consumer repeats exact closure bytes and current Native control; a digest alone is not a DB proof. */
export function runtimeVenue230Predicate(env:Env,cap:RuntimeVenue230,start:number):Readonly<{sql:string;values:readonly string[];next:number}>{
 assertRuntimeVenue230(env,cap);if(!Number.isSafeInteger(start)||start<1||start>96)fail('shared_member230_parameter');const f=runtimeVenue230Facts(cap);
 return Object.freeze({sql:`EXISTS(SELECT 1 FROM site_settings WHERE key=?${start} AND value=?${start+1})`,values:Object.freeze([f.sealKey,f.sealJSON]),next:start+2});
}
/** Restriction only, on NEW old-family producers/effects, never on their own ACK/unknown writes.
 * Owned pre-cutover compensation drain needs its original parent capability at its caller. */
export function oldSharedMemberProducerHeld230(env:Env,guild:unknown,role:unknown):boolean{
 if(guild!==SHARED_MEMBER230_GUILD||role!==SHARED_MEMBER230_ROLE)return false;
 try{for(const key of[MODE,JSON_KEY,HASH_KEY]){const d=Object.getOwnPropertyDescriptor(env,key);if(!d&&key in env||d&&!Object.hasOwn(d,'value'))return true;}
  const mode=Object.getOwnPropertyDescriptor(env,MODE)?.value,partial=Object.getOwnPropertyDescriptor(env,JSON_KEY)||Object.getOwnPropertyDescriptor(env,HASH_KEY);
  return mode===undefined||mode==='off'?!!partial:true;
 }catch{return true;}
}
