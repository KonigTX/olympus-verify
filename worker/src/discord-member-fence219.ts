// Default member proof remains exactly the legacy button fence.
// The command-only optional arm still pins the exact owner; its caller checks the
// captured owner mode, application, guild and current owner configuration.
// Keep its equivalence assertion until the historical button source may be factored.
import { DISCORD_BOT_OWNER_225 } from './discord-command-owner225';
import { privacyAccountIncarnationLiteralFenceSql, privacyGenerationLiteralFenceSql } from './privacy-serving-authority';

export function discordMemberFenceSql(id: number, generation: string | null, incarnation: string, ownerCommandAccess = false): string {
  const character = `EXISTS(SELECT 1 FROM characters fc WHERE fc.discord_id=?${id} AND fc.status='member')`;
  return `EXISTS(SELECT 1 FROM site_users fu WHERE fu.discord_id=?${id} AND fu.denied=0 AND fu.in_server=1 AND ${privacyAccountIncarnationLiteralFenceSql("fu.account_incarnation", incarnation)} AND ${privacyGenerationLiteralFenceSql("fu.discord_id", generation)})
    AND ${ownerCommandAccess ? `(?${id}='${DISCORD_BOT_OWNER_225}' OR ${character})` : character} AND NOT EXISTS(SELECT 1 FROM members fm WHERE fm.discord_id=?${id} AND fm.banned=1)
    AND NOT EXISTS(SELECT 1 FROM privacy_serving_jobs fj WHERE fj.subject_id=?${id} AND fj.state<>'complete')`;
}
