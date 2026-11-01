/** Discord command authority, deliberately separate from browser sessions.
 * Only index.ts calls this after signature verification. A request deadline,
 * account birth/version and privacy generation are captured once; no cookie or
 * CommunityContext is minted. Every consuming batch rechecks the same tuple.
 */
import type { Env } from './env';
import { officerRoles } from './env';
import { now } from './db';
import { userOf, type Interaction } from './discord';
import { DB_NOW } from './community-context';
import { discordMemberFenceSql } from './community-event-buttons';
import { destination, discord } from './community-event-delivery';
import { captureLaneConfig } from './full-release-roles';
import { privacyAccountIncarnation, readPrivacySubject } from './privacy-serving-authority';

export interface GuildActor219 { readonly id: string; readonly birth: string; readonly version: number; readonly generation: string|null; readonly deadline: number; readonly guild: string }
const witnesses = new WeakMap<object, Env>();
export async function captureGuildActor219(env: Env, i: Interaction, admittedAt: number, signedAt: number): Promise<GuildActor219> {
  const d=destination(env), user=userOf(i);
  if (!d || i.guild_id!==d.guild || !user || !/^[0-9]{17,20}$/.test(user.id) || ((user as {bot?:unknown}).bot!==undefined&&(user as {bot?:unknown}).bot!==false)
      || !Number.isSafeInteger(admittedAt) || !Number.isSafeInteger(signedAt) || Math.abs(admittedAt-signedAt)>300) throw Error('guild_command_unavailable');
  const deadline=Math.min(admittedAt+180,signedAt+300);
  if (deadline<=now()) throw Error('guild_command_expired');
  const row=await env.DB.prepare('SELECT account_incarnation,session_version FROM site_users WHERE discord_id=?1 AND in_server=1 AND denied=0').bind(user.id).first<{account_incarnation:unknown;session_version:number}>();
  if (!row || !Number.isSafeInteger(row.session_version)) throw Error('guild_command_sign_in');
  const birth=privacyAccountIncarnation(row.account_incarnation), subject=await readPrivacySubject(env,user.id);
  if (subject && subject.state!=='active') throw Error('guild_command_account_held');
  const a=Object.freeze({id:user.id,birth,version:row.session_version,generation:subject?.subjectGeneration??null,deadline,guild:d.guild});
  witnesses.set(a,env);
  if (!await currentGuildActor219(env,a)) throw Error('guild_command_account_held');
  return a;
}
export function guildActorFence219(env:Env,a:GuildActor219,idParameter:number):string {
  if (witnesses.get(a)!==env) throw Error('guild_command_original_actor_held');
  return `(${discordMemberFenceSql(idParameter,a.generation,a.birth)} AND EXISTS(SELECT 1 FROM site_users v219 WHERE v219.discord_id=?${idParameter} AND v219.session_version=${a.version}) AND ${DB_NOW}<${a.deadline})`;
}
export async function currentGuildActor219(env:Env,a:GuildActor219):Promise<boolean> {
  const row=await env.DB.prepare(`SELECT 1 ok WHERE ${guildActorFence219(env,a,1)}`).bind(a.id).first();
  return !!row;
}
export async function guildActorBatch219(env:Env,a:GuildActor219,statements:D1PreparedStatement[]):Promise<D1Result[]> {
  const probe=env.DB.prepare(`SELECT CASE WHEN ${guildActorFence219(env,a,1)} THEN 1 ELSE json_extract('guild_command_actor_held','$') END admitted`).bind(a.id);
  return (await env.DB.batch([probe,...statements])).slice(1);
}
/** Fresh role proof, not the roles snapshot in the original interaction. Role
 * names and hierarchy positions never act as identifiers. No REST retry. */
export async function guildStaffNow219(env:Env,a:GuildActor219):Promise<boolean> {
  if (!await currentGuildActor219(env,a)) return false;
  return await guildOrganizerMemberNow219(env,a.id,a.guild) && await currentGuildActor219(env,a);
}
/** Role transport proof only: callers retain their original account/generation
 * SQL proof on both sides of this await. Does not create account authority. */
export async function guildOrganizerMemberNow219(env:Env,id:string,guild:string):Promise<boolean> {
  if(!/^[0-9]{17,20}$/.test(id)||guild!==destination(env)?.guild)return false;
  const cap=captureLaneConfig(env), roles=new Set([...officerRoles(env),env.ROLE_RAID_LEADER,...cap.staffMap.filter(row=>[0,1,2,4].includes(row.idx)).map(row=>row.role),...[0,1,2,4].map(slot=>cap.cfg?.native[slot])].filter(Boolean));
  const admins=new Set((env.SITE_ADMINS??'').split(',').map(x=>x.trim()));
  const r=await discord(env,'GET',`/guilds/${guild}/members/${id}`);
  const m=r.value as {user?:{id?:unknown;bot?:unknown};pending?:unknown;roles?:unknown}|null;
  if (r.status!==200 || !m || m.user?.id!==id || (m.user.bot!==undefined&&m.user.bot!==false) || (m.pending!==undefined&&m.pending!==false) || !Array.isArray(m.roles) || m.roles.some(x=>typeof x!=='string'||!/^[0-9]{17,20}$/.test(x))) return false;
  return (admins.has(id)||m.roles.some(role=>roles.has(role)));
}
