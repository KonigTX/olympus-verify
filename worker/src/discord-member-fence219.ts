// Shared command proof copied exactly from the legacy button fence.
// Keep its equivalence assertion until the historical button source may be factored.
import { privacyAccountIncarnationLiteralFenceSql, privacyGenerationLiteralFenceSql } from './privacy-serving-authority';

export function discordMemberFenceSql(id: number, generation: string | null, incarnation: string): string {
  return `EXISTS(SELECT 1 FROM site_users fu WHERE fu.discord_id=?${id} AND fu.denied=0 AND fu.in_server=1 AND ${privacyAccountIncarnationLiteralFenceSql("fu.account_incarnation", incarnation)} AND ${privacyGenerationLiteralFenceSql("fu.discord_id", generation)})
    AND EXISTS(SELECT 1 FROM characters fc WHERE fc.discord_id=?${id} AND fc.status='member') AND NOT EXISTS(SELECT 1 FROM members fm WHERE fm.discord_id=?${id} AND fm.banned=1)
    AND NOT EXISTS(SELECT 1 FROM privacy_serving_jobs fj WHERE fj.subject_id=?${id} AND fj.state<>'complete')`;
}
