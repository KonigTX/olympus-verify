// Persistence registration is eager; optional intake/site code stays lazy.
import {registerCommunityData} from './community-data-registry';
// Names/GUIDs are removed with the same account while its original characters still identify the records.
const own="action='treasury.receipt242' AND (json_extract(details,'$.guid') IN(SELECT guid FROM characters WHERE discord_id=?1) OR json_extract(details,'$.characterKey') IN(SELECT name_key FROM characters WHERE discord_id=?1))";
// .247 composes this same source-owned predicate into the terminal account audit cleanup.
export {own as TREASURY_RECEIPT_OWN_SQL242};
registerCommunityData('treasury242',
 (env,id)=>[env.DB.prepare('DELETE FROM audit WHERE '+own).bind(id)],
 (env,id)=>({statements:[env.DB.prepare('SELECT ts,details FROM audit WHERE '+own+' ORDER BY id LIMIT 1001').bind(id)],shape:results=>({receipts:results[0]!.results})}));
