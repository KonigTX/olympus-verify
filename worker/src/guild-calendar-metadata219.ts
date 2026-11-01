/** Small mode discriminators in the existing event-change JSON, never authority
 * by themselves. No IDs or character names are stored inside these fields.
 * Parent retention and existing actor anonymization cover these records.
 */
export const RSVP_CHOICES_219=['tank','healer','melee','ranged','tentative','bench','absent'] as const;
export type RsvpChoice219=typeof RSVP_CHOICES_219[number];
const TOKEN=/^[A-Za-z0-9_-]{22}$/;
export function metadataFields219(raw:unknown):string[]|null {
  if (typeof raw!=='string'||raw.length>256) return null;
  let v:unknown;try{v=JSON.parse(raw);}catch{return null;}
  if (!Array.isArray(v)||v.length!==3||v.some(x=>typeof x!=='string')) return null;
  const [mode,value,anchor]=v as string[];
  if (!TOKEN.test(anchor!)) return null;
  if (mode==='rsvp219' && (RSVP_CHOICES_219 as readonly string[]).includes(value!)) return ['rsvpPreference'];
  if (mode==='organizer219' && value==='reminder') return ['reminderConsent'];
  if (mode==='attendance219' && value==='locked') return ['attendanceLock'];
  return null;
}
export function markerPrefix219(prefix:string,alias=''):string {
  if (!['rsvp219','organizer219','attendance219'].includes(prefix)||!['','m.','c.'].includes(alias)) throw Error('invalid_calendar_marker');
  // CASE avoids interpreting malformed historical JSON. A recognized prefix
  // remains visible to duplicate detection even when its rest is malformed.
  return `(CASE WHEN json_valid(${alias}fields) THEN json_extract(${alias}fields,'$[0]') ELSE NULL END)='${prefix}'`;
}
export const attendanceUnlocked219=(eventExpr:string)=>`NOT EXISTS(SELECT 1 FROM community_event_changes c WHERE c.event_id=${eventExpr} AND ${markerPrefix219('attendance219','c.')})`;
/** A display preference is valid only for this exact signup write. A later site
 * or historical button edit invalidates it automatically, including same-second
 * edits. Duplicate/malformed markers display no inferred preference. */
export function rsvpPreferenceSql219(signupAlias='s'):string {
  if (!['s','community_event_signups'].includes(signupAlias)) throw Error('invalid_signup_alias');
  const select=`SELECT m.fields FROM community_event_changes m WHERE m.event_id=${signupAlias}.event_id AND m.actor=${signupAlias}.discord_id AND ${markerPrefix219('rsvp219','m.')}`;
  return `(CASE WHEN (SELECT COUNT(*) FROM (${select}))=1 THEN (SELECT CASE WHEN json_array_length(m.fields)=3 AND json_extract(m.fields,'$[2]')=${signupAlias}.write_nonce AND json_extract(m.fields,'$[1]') IN('tank','healer','melee','ranged','tentative','bench','absent') THEN json_extract(m.fields,'$[1]') ELSE NULL END FROM community_event_changes m WHERE m.event_id=${signupAlias}.event_id AND m.actor=${signupAlias}.discord_id AND ${markerPrefix219('rsvp219','m.')}) ELSE NULL END)`;
}

export function organizerMarkersSql219(alias='r'):string {
 if(!['r','community_event_reminders'].includes(alias))throw Error('invalid_reminder_alias');
 return `(SELECT json_group_array(json_object('id',m.id,'at',m.at,'fields',m.fields,'actor',m.actor)) FROM (SELECT id,at,fields,actor FROM community_event_changes c WHERE c.event_id=${alias}.event_id AND c.actor=${alias}.actor AND ${markerPrefix219('organizer219','c.')} AND json_extract(c.fields,'$[2]')=${alias}.op_id ORDER BY c.id) m)`;
}
export function organizerMarker219(raw:unknown,actor:string|null,operation:string):boolean|null {
 if(typeof raw!=='string'||raw.length>4096)return null;
 let rows:unknown;try{rows=JSON.parse(raw);}catch{return null;}
 if(!Array.isArray(rows))return null;if(!rows.length)return false;if(rows.length!==1)return null;
 const r=rows[0];if(!r||typeof r!=='object'||Array.isArray(r)||Object.keys(r).sort().join(',')!=='actor,at,fields,id'||!Number.isSafeInteger(r.id)||r.id<1||!Number.isSafeInteger(r.at)||r.at<0||r.actor!==actor||typeof r.fields!=='string')return null;
 let fields:unknown;try{fields=JSON.parse(r.fields);}catch{return null;}
 return Array.isArray(fields)&&fields.length===3&&fields[0]==='organizer219'&&fields[1]==='reminder'&&fields[2]===operation?true:null;
}
