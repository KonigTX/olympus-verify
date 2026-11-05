/** Finite local history for this closed beta source. Unknown effects are continuing custody, never expiry. */
import type { Env } from './env';
import { BETA_RESET_CUTOFF,BETA_RESET_GUILD_ID,BETA_RESET_ROLE_IDS } from './beta-reset-policy';
const T="CAST(strftime('%s','now') AS INTEGER)";
export const BETA_RESET_RECEIPT_RETENTION_SECONDS=365*86400;
export const BETA_RESET_RECEIPT_RETENTION_ROWS=2000;
const YEAR=BETA_RESET_RECEIPT_RETENTION_SECONDS;
const hex=(v:string,n:number)=>`typeof(${v})='text' AND length(${v})=${n} AND instr(${v},char(0))=0 AND ${v} NOT GLOB '*[^0-9a-f]*'`;
const integer=(v:string)=>`typeof(${v})='integer' AND ${v}>0 AND ${v}<=${T}`;
const scope=(a:string)=>`${a}.guild_id='${BETA_RESET_GUILD_ID}' AND ${a}.role_id IN(${BETA_RESET_ROLE_IDS.map(x=>"'"+x+"'").join(',')})
 AND ${hex(a+'.id',32)} AND typeof(${a}.subject)='text' AND length(${a}.subject) BETWEEN 17 AND 20
 AND instr(${a}.subject,char(0))=0 AND ${a}.subject NOT GLOB '*[^0-9]*'
 AND ${integer(a+'.created_at')} AND typeof(${a}.expires_at)='integer' AND ${a}.expires_at=${a}.created_at+300`;
const noDebt=(a:string)=>`NOT EXISTS(SELECT 1 FROM role_settlements d WHERE d.subject=${a}.subject AND d.guild_id=${a}.guild_id AND d.role_id=${a}.role_id
 AND d.attempts=1 AND d.state IN('dispatching','unknown'))`;
const unspent=`r.purpose='beta_reset' AND r.desired=0 AND r.created_at>=${BETA_RESET_CUTOFF}
 AND ${hex('r.request_digest',64)} AND r.proof_id IS NULL AND r.roster_id IS NULL AND r.subject_generation IS NULL
 AND r.native_guid IS NULL AND r.native_profile IS NULL AND r.native_rank IS NULL AND r.native_rank_name IS NULL
 AND r.attempts=0 AND r.claim_nonce IS NULL AND r.created_at<=${T}-${YEAR}
 AND ((r.state='pending' AND r.reason IN('beta_inventory_observed','beta_reset_fresh_target') AND r.checked_at IS NULL)
 OR (r.state='held' AND r.reason IN('beta_reset_hierarchy_or_read_held','beta_reset_observation_consumed') AND ${integer('r.checked_at')} AND r.checked_at>=r.created_at)
 OR (r.state='settled' AND r.reason='beta_reset_absent' AND ${integer('r.checked_at')} AND r.checked_at>=r.created_at))`;
const removed=`r.purpose='beta_reset' AND r.desired=0 AND r.created_at>=${BETA_RESET_CUTOFF}
 AND ${hex('r.request_digest',64)} AND r.attempts=1 AND ${hex('r.claim_nonce',32)}
 AND r.state='settled' AND r.reason='beta_reset_removed' AND ${integer('r.checked_at')} AND r.checked_at>=r.created_at
 AND max(r.created_at,r.checked_at)<=${T}-${YEAR} AND ${noDebt('r')}`;
const legacy=`r.purpose='beta_guard_grant' AND r.desired=1 AND r.created_at<${BETA_RESET_CUTOFF}
 AND r.attempts=1 AND ${hex('r.claim_nonce',32)} AND r.state='settled' AND r.reason='legacy_put_acknowledged'
 AND ${integer('r.checked_at')} AND r.checked_at>=r.created_at AND max(r.created_at,r.checked_at)<=${T}-${YEAR}
 AND NOT EXISTS(SELECT 1 FROM role_settlements c WHERE c.purpose='grant_compensation' AND c.request_digest=r.id) AND ${noDebt('r')}`;
// The current shared-role family has its own closed receipt shapes. It does not
// borrow the beta source's fixed five-minute expiry or old purpose/reason rules.
const launchToken=(v:string,n:number)=>`${hex(v,n)} AND length(CAST(${v} AS BLOB))=${n}`;
const launchScope=(a:string)=>`${a}.guild_id='${BETA_RESET_GUILD_ID}' AND ${a}.role_id='${BETA_RESET_ROLE_IDS[0]}'
 AND ${launchToken(a+'.id',32)} AND typeof(${a}.subject)='text' AND length(${a}.subject) BETWEEN 17 AND 20
 AND length(CAST(${a}.subject AS BLOB))=length(${a}.subject) AND instr(${a}.subject,char(0))=0 AND ${a}.subject GLOB '[1-9]*' AND ${a}.subject NOT GLOB '*[^0-9]*'
 AND ${integer(a+'.created_at')} AND ${a}.created_at>=${BETA_RESET_CUTOFF} AND typeof(${a}.expires_at)='integer' AND ${a}.expires_at>${a}.created_at AND ${a}.expires_at<=${a}.created_at+300
 AND (${a}.subject_generation IS NULL OR (${launchToken(a+'.subject_generation',32)})) AND ${a}.proof_id IS NULL AND ${a}.native_rank IS NULL AND ${a}.native_rank_name IS NULL`;
const launchChecked=(a:string)=>`${integer(a+'.checked_at')} AND ${a}.checked_at>=${a}.created_at`;
const launchAged=(a:string)=>`max(${a}.created_at,coalesce(${a}.checked_at,${a}.created_at))<=${T}-${YEAR}`;
const launchSource=(a:string)=>`(${a}.purpose='launch_membership230' AND ${a}.desired=1 AND ${a}.native_profile='prime-native-230'
 AND ${launchToken(a+'.request_digest',64)} AND typeof(${a}.roster_id)='integer' AND ${a}.roster_id>0
 AND typeof(${a}.native_guid)='text' AND length(${a}.native_guid) BETWEEN 1 AND 80 AND instr(${a}.native_guid,char(0))=0)
 OR (${a}.purpose='launch_membership_removal230' AND ${a}.desired=0 AND ${a}.native_profile IN('ban','rename_hold','blocking_role','guild_departure')
 AND ${launchToken(a+'.request_digest',64)} AND ${a}.roster_id IS NULL AND ${a}.native_guid IS NULL)`;
// No generation filter: a newer account cannot hide an older unresolved effect.
// Preserve cross-target references too, including malformed/unknown siblings.
const launchPhysicalClear=(a:string)=>`NOT EXISTS(SELECT 1 FROM role_settlements debt WHERE debt.subject=${a}.subject AND debt.guild_id=${a}.guild_id AND debt.role_id=${a}.role_id AND debt.state IN('dispatching','unknown'))`;
const launchNoDebt=(a:string)=>`${launchPhysicalClear(a)} AND NOT EXISTS(SELECT 1 FROM role_settlements reference WHERE reference.request_digest=${a}.id)
 AND NOT EXISTS(SELECT 1 FROM role_settlements reference WHERE reference.id=${a}.request_digest AND reference.state IN('dispatching','unknown'))`;
const launchNoExternalDebt=(a:string)=>`${launchPhysicalClear(a)} AND NOT EXISTS(SELECT 1 FROM role_settlements reference WHERE reference.request_digest=${a}.id AND reference.state IN('dispatching','unknown'))`;
const launchUnspent=`((${launchSource('r')}) AND r.attempts=0 AND r.claim_nonce IS NULL
 AND ((r.state='pending' AND r.reason='launch230_awaiting_dispatch' AND r.checked_at IS NULL)
 OR (r.state='settled' AND ((r.purpose='launch_membership230' AND r.reason='launch230_current_role_observed') OR (r.purpose='launch_membership_removal230' AND r.reason='launch230_current_role_absent')) AND ${launchChecked('r')})))`;
const launchNeverSent=`((${launchSource('r')}) AND r.attempts=1 AND ${launchToken('r.claim_nonce',32)} AND r.state='held' AND r.reason='launch230_never_dispatched' AND ${launchChecked('r')})`;
const launchReturned=`((${launchSource('r')}) AND r.attempts=1 AND ${launchToken('r.claim_nonce',32)} AND r.state='settled' AND ${launchChecked('r')}
 AND ((r.purpose='launch_membership230' AND r.reason='launch230_put_acknowledged_and_confirmed') OR (r.purpose='launch_membership_removal230' AND r.reason='launch230_delete_acknowledged_and_confirmed')))`;
const launchErasure=`(r.purpose='launch_membership_erasure230' AND r.desired=0 AND r.attempts=1 AND ${launchToken('r.claim_nonce',32)} AND ${launchToken('r.request_digest',64)} AND ${launchToken('r.subject_generation',32)}
 AND r.expires_at=r.created_at+120 AND r.roster_id IS NULL AND r.native_guid IS NULL AND typeof(r.native_profile)='text' AND length(r.native_profile) BETWEEN 2 AND 2048
 AND json_valid(r.native_profile) AND json_type(CASE WHEN json_valid(r.native_profile) THEN r.native_profile ELSE 'null' END)='array' AND json_array_length(CASE WHEN json_valid(r.native_profile) THEN r.native_profile ELSE '[]' END) BETWEEN 1 AND 64
 AND NOT EXISTS(SELECT 1 FROM json_each(CASE WHEN json_valid(r.native_profile) THEN r.native_profile ELSE '[]' END) j WHERE j.type<>'text' OR length(j.value) NOT BETWEEN 17 AND 20 OR instr(j.value,char(0))>0 OR length(CAST(j.value AS BLOB))<>length(j.value) OR j.value NOT GLOB '[1-9]*' OR j.value GLOB '*[^0-9]*')
 AND (SELECT COUNT(DISTINCT value) FROM json_each(CASE WHEN json_valid(r.native_profile) THEN r.native_profile ELSE '[]' END))=json_array_length(CASE WHEN json_valid(r.native_profile) THEN r.native_profile ELSE '[]' END)
 AND EXISTS(SELECT 1 FROM json_each(CASE WHEN json_valid(r.native_profile) THEN r.native_profile ELSE '[]' END) j WHERE j.value=r.role_id)
 AND NOT EXISTS(SELECT 1 FROM json_each('${JSON.stringify(BETA_RESET_ROLE_IDS)}') expected WHERE NOT EXISTS(SELECT 1 FROM json_each(CASE WHEN json_valid(r.native_profile) THEN r.native_profile ELSE '[]' END) actual WHERE actual.value=expected.value))
 AND r.native_profile=(SELECT json_group_array(value) FROM (SELECT value FROM json_each(CASE WHEN json_valid(r.native_profile) THEN r.native_profile ELSE '[]' END) ORDER BY value))
 AND r.state='settled' AND r.reason='launch230_delete_acknowledged_and_confirmed' AND ${launchChecked('r')})`;
const launchSingle=`${launchScope('r')} AND ${launchAged('r')} AND ${launchNoDebt('r')} AND ((${launchUnspent}) OR (${launchNeverSent}) OR (${launchReturned}) OR (${launchErasure}))`;
const launchPair=`${launchScope('p')} AND ${launchScope('c')} AND ${launchAged('p')} AND ${launchAged('c')}
 AND p.purpose='launch_membership230' AND p.desired=1 AND p.native_profile='prime-native-230' AND ${launchToken('p.request_digest',64)}
 AND typeof(p.roster_id)='integer' AND p.roster_id>0 AND typeof(p.native_guid)='text' AND length(p.native_guid) BETWEEN 1 AND 80 AND instr(p.native_guid,char(0))=0
 AND p.attempts=1 AND ${launchToken('p.claim_nonce',32)} AND p.state='held' AND p.reason='launch230_compensated' AND ${launchChecked('p')}
 AND c.purpose='launch_membership_compensation230' AND c.subject=p.subject AND c.guild_id=p.guild_id AND c.role_id=p.role_id AND c.subject_generation IS p.subject_generation
 AND c.desired=0 AND c.attempts=1 AND ${launchToken('c.claim_nonce',32)} AND c.state='settled' AND c.reason='launch230_delete_acknowledged_and_confirmed' AND ${launchChecked('c')}
 AND c.native_profile IS NULL AND c.roster_id IS NULL AND c.native_guid IS NULL AND c.expires_at=c.created_at+300 AND c.created_at>=p.created_at
 AND (SELECT COUNT(*) FROM role_settlements siblings WHERE siblings.request_digest=p.id)=1
 AND NOT EXISTS(SELECT 1 FROM role_settlements reference WHERE reference.request_digest=c.id)
 AND ${launchNoExternalDebt('p')} AND ${launchNoExternalDebt('c')}`;
/** Two statements, at most 1,000 independent records plus 500 complete parent/child pairs.
 * The eligibility and deletion consume current rows in the same statement/transaction. No capture is
 * retargeted, no attempts reset and no unknown row is deleted. Pair membership is materialized by the
 * IN selection before deletion, so the first deletion cannot strand its other half.
 */
export function betaResetReceiptRetentionStatements(env:Env):D1PreparedStatement[]{return [
 env.DB.prepare(`DELETE FROM role_settlements WHERE id IN(SELECT r.id FROM role_settlements r
  WHERE (${T}>=${BETA_RESET_CUTOFF}+${YEAR} AND ${scope('r')} AND ((${unspent}) OR (${removed}) OR (${legacy}))) OR (${launchSingle})
  ORDER BY r.created_at,r.id LIMIT 1000)`),
 env.DB.prepare(`WITH candidates AS (
  SELECT p.id AS parent,c.id AS child,c.checked_at AS child_checked FROM role_settlements p JOIN role_settlements c ON c.request_digest=p.id
  WHERE ${T}>=${BETA_RESET_CUTOFF}+${YEAR} AND ${scope('p')} AND ${scope('c')}
   AND p.created_at<${BETA_RESET_CUTOFF} AND p.desired=1 AND p.attempts=1 AND ${hex('p.claim_nonce',32)} AND p.state='held'
   AND ((p.purpose='beta_guard_grant' AND p.reason='removed_after_beta_guard')
    OR (p.purpose IN('roster_membership','verified_membership','verified_native_rank','verified_privileged_rank','roster_native_rank','roster_privileged_rank') AND p.reason='removed_after_admission_changed'))
   AND c.purpose='grant_compensation' AND c.subject=p.subject AND c.guild_id=p.guild_id AND c.role_id=p.role_id
   AND c.subject_generation IS NULL AND c.proof_id IS NULL AND c.roster_id IS NULL AND c.native_guid IS NULL
   AND c.native_profile IS NULL AND c.native_rank IS NULL AND c.native_rank_name IS NULL
   AND c.desired=0 AND c.attempts=1 AND ${hex('c.claim_nonce',32)} AND c.state='settled' AND c.reason='beta_acknowledged_put_cleanup_acknowledged'
   AND ${integer('c.checked_at')} AND c.checked_at>=c.created_at AND c.created_at>=p.created_at
   AND (p.checked_at IS NULL OR (${integer('p.checked_at')} AND p.checked_at>=p.created_at))
   AND max(p.created_at,coalesce(p.checked_at,p.created_at),c.created_at,c.checked_at)<=${T}-${YEAR}
   AND (SELECT COUNT(*) FROM role_settlements siblings WHERE siblings.purpose='grant_compensation' AND siblings.request_digest=p.id)=1
   AND ${noDebt('p')}
  UNION ALL SELECT p.id AS parent,c.id AS child,c.checked_at AS child_checked FROM role_settlements p JOIN role_settlements c ON c.request_digest=p.id WHERE ${launchPair}),
 pairs AS(SELECT parent,child FROM candidates ORDER BY child_checked,parent LIMIT 500)
 DELETE FROM role_settlements WHERE id IN(SELECT parent FROM pairs UNION ALL SELECT child FROM pairs)`),
 ];}
