'use strict';
// Exact canonical candidate SELECT, real schema/SQLite, synthetic rows only.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite');
const W=path.join(__dirname,'..'),before='C:/Users/vikto/OneDrive/Apps/Olympus/launch238-2026-11-07/discord-addon/priority-preparation-v1/full-release-roles.before.ts',args=process.argv.slice(2);
assert(args.length===0||args.length===1&&args[0]==='--before','Only the fixed original-source comparison is supported');
const source=fs.readFileSync(args.length?before:path.join(W,'src/full-release-roles.ts'),'utf8');
if(args.length)assert.equal(crypto.createHash('sha256').update(Buffer.from(source)).digest('hex'),'ecd3d5f9a80d9aef9c725486579221b149d2cd23e2cde2e9c0c6ea7b0e0a0f19');
const captures=[...source.matchAll(/export const CANONICAL233_WALK_SELECT=`([^`]+)`;/g)];assert.equal(captures.length,1);
const sql=captures[0][1].replaceAll('${DB_NOW}',"CAST(strftime('%s','now') AS INTEGER)").replaceAll('${FRESH_INTERVAL_SECONDS}','300');assert(!sql.includes('${'));
const ends=[...sql.matchAll(/ SELECT subject,top_rank,urgent FROM (?:work|ranked) ORDER BY /g)];assert.equal(ends.length,1);const prefix=sql.slice(0,ends[0].index);
const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync(path.join(W,'schema.sql'),'utf8'));const now=Number(db.prepare("SELECT CAST(strftime('%s','now') AS INTEGER) n").get().n);let clock=now;db.function('strftime',(f,v)=>{assert.equal(f,'%s');assert.equal(v,'now');return String(clock);});
const G='236932545793490944',PROFILE='olympus-canonical-ranks-20261106-v1',ids=Array.from({length:207},(_,i)=>(900000000000000000n+BigInt(i)).toString()),A=ids[100],generation='a'.repeat(32);
db.prepare('INSERT INTO roster_snapshots(id,exported_at,received_at,first_received_at,source,member_count,complete,trusted)VALUES(260,?,?,?,?,207,1,1)').run(now-10,now-8,now-8,'synthetic-source');
for(let i=0;i<ids.length;i++){
 const s=ids[i],guid='Player-4613-'+i.toString(16).padStart(8,'0'),key='synthetic '+i,isDebt=i<13,rank=s===A?6:8;
 db.prepare('INSERT INTO members(discord_id,username)VALUES(?,?)').run(s,'Synthetic');
 db.prepare("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,source,guid)VALUES(?,?,?,'member',?,?,'whisper',?)").run(key,key,s,now-10000,now-9000,guid);
 db.prepare('INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index)VALUES(260,?,?,?,?,?)').run(key,key,guid,rank===6?'Veteran':'Member',rank);
 db.prepare("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,native_profile,native_rank,attempts,created_at,expires_at)VALUES(?,?,'canonical_routine233',?,'1552077551839617104',1,'settled','canonical233_put_acknowledged_and_confirmed',?,?,1,?,?)").run(i.toString(16).padStart(32,'0'),s,G,isDebt?'olympus-prime-live-20261105-v1':PROFILE,s===A?7:8,now-2000,now-1700);
 const at=s===A?now-500:i<11?now-1000+i:i<13?now-400+i:now-1000;
 db.prepare("INSERT INTO audit(ts,actor,action,subject,details)VALUES(?,'system','role.native232_attempt',?,?)").run(at,s,JSON.stringify({n:259,rank:s===A?7:8,result:'settled'}));
}
const originalIdentity=db.prepare('SELECT guid,bound_at,verified_at FROM characters WHERE discord_id=?').get(A);
let checks=0,passed=0;const check=(name,ok)=>{checks++;if(ok)passed++;console.log((ok?'PASS ':'FAIL ')+name);};
const list=()=>db.prepare(sql).all(G,'',50,0),facts=()=>db.prepare(prefix+' SELECT * FROM work WHERE subject=?5').get(G,'',50,0,A);
const attempt=(rank,age=0,result='held')=>{db.prepare("DELETE FROM audit WHERE subject=? AND action='role.native232_attempt'").run(A);db.prepare("INSERT INTO audit(ts,actor,action,subject,details)VALUES(?,'system','role.native232_attempt',?,?)").run(now-age,A,JSON.stringify({n:260,rank,result}));};
check('synthetic real geometry is207candidates14urgent with eleven older debt attempts',db.prepare('SELECT COUNT(*) n FROM members').get().n===207&&list().filter(r=>r.urgent).length===14&&db.prepare("SELECT COUNT(*) n FROM audit WHERE action='role.native232_attempt' AND ts<? AND subject<>? AND subject IN(SELECT subject FROM role_settlements WHERE native_profile<>?)").get(now-500,A,PROFILE).n===11);
check('known6restore outranks old generic debt instead of old position12',list()[0]?.subject===A&&facts().new_target===1);
attempt(7,30,'settled');check('genuinely different recent target bypasses per-account300cooldown',facts().new_target===1&&facts().urgent===1&&list()[0].subject===A);
attempt(6,30,'held');check('same-target held attempt retains300backoff and doesnot remain newtarget',facts().new_target===0&&facts().urgent===0&&list().slice(0,2).every(r=>r.subject!==A));
attempt(6,301,'held');check('same held target returns only to generic urgent rotation after300',facts().new_target===0&&facts().urgent===1&&list()[0].subject!==A);
db.prepare("DELETE FROM audit WHERE subject=? AND action='role.native232_attempt'").run(A);check('no typed attempt falls back to finite settled rank',facts().new_target===1&&list()[0].subject===A);
attempt(7,40);db.prepare("INSERT INTO audit(ts,actor,action,subject,details)VALUES(?,'system','role.native232_attempt',?,?)").run(now,A,JSON.stringify({rank:'6',result:'held'}));check('newer untyped JSON rank cannot replace latest valid typed attempted target',facts().new_target===1);
db.prepare("INSERT INTO audit(ts,actor,action,subject,details)VALUES(?,'system','role.native232_attempt',?,'not-json')").run(now,A);check('malformed audit JSON doesnot execute JSON extraction or gain authority',facts().new_target===1);
for(const bad of[-1,10,6.5,'6',null]){db.prepare("INSERT INTO audit(ts,actor,action,subject,details)VALUES(?,'system','role.native232_attempt',?,?)").run(now,A,JSON.stringify({rank:bad,result:'held'}));check('invalid attempted rank cannot replace valid typed target: '+String(bad),facts().new_target===1);}
attempt(7,20);db.prepare("UPDATE role_settlements SET native_rank=6 WHERE subject=? AND native_profile=?").run(A,PROFILE);check('current equals settled is never a newtarget even if last attempt differs',facts().new_target===0&&facts().urgent===0);
db.prepare("UPDATE role_settlements SET native_rank=NULL WHERE subject=? AND native_profile=?").run(A,PROFILE);check('unknown settled rank cannot invent a freshretarget',facts().new_target===0);
db.prepare("UPDATE role_settlements SET native_rank=7 WHERE subject=? AND native_profile=?").run(A,PROFILE);
for(const bad of[-1,10,6.5,'6bad']){db.prepare('UPDATE roster_members SET rank_index=? WHERE guid=?').run(bad,originalIdentity.guid);check('nonfinite/out-of-range/untyped current rank stays generic: '+String(bad),facts().new_target===0);}
db.prepare('UPDATE roster_members SET rank_index=6 WHERE guid=?').run(originalIdentity.guid);attempt(7,30);db.prepare('UPDATE members SET banned=1 WHERE discord_id=?').run(A);check('restricted recent attempt preserves its300backoff rather than retarget bypass',facts().new_target===0&&facts().urgent===0);attempt(7,301);check('due restriction remains ahead of a freshretarget',facts().urgent===1&&list()[0].subject===A);db.prepare('UPDATE members SET banned=0 WHERE discord_id=?').run(A);
attempt(7,30);db.prepare('UPDATE members SET banned=1 WHERE discord_id=?').run(ids[0]);check('other due restriction is ahead of changed target',list()[0].subject===ids[0]&&list()[1].subject===A);db.prepare('UPDATE members SET banned=0 WHERE discord_id=?').run(ids[0]);
db.prepare('UPDATE members SET banned=1 WHERE discord_id IN(?,?)').run(ids[0],ids[1]);check('two persistent restrictions reserve second slot for actual changed target',list()[0].subject===ids[0]&&list()[1].subject===A);db.prepare("UPDATE audit SET ts=? WHERE subject=? AND action='role.native232_attempt'").run(now,ids[0]);clock=now+300;check('first restriction rotates next due pass while changed target keeps second slot',list()[0].subject===ids[1]&&list()[1].subject===A);
db.prepare('UPDATE role_settlements SET native_profile=? WHERE native_profile<>?').run(PROFILE,PROFILE);db.prepare('UPDATE role_settlements SET native_rank=6 WHERE subject=? AND native_profile=?').run(A,PROFILE);check('without nonrestricted urgent work both slots may continue due restrictions',list().slice(0,2).every(r=>[ids[0],ids[1]].includes(r.subject)));
check('internal target and restriction ordering fields never expand output columns',JSON.stringify(Object.keys(list()[0]))===JSON.stringify(['subject','top_rank','urgent']));
check('priority doesnot alter GUID/bound/verification timestamps',JSON.stringify(db.prepare('SELECT guid,bound_at,verified_at FROM characters WHERE discord_id=?').get(A))===JSON.stringify(originalIdentity));

if(args.length===0){
// .241: the exact emitted selector, synthetic Native history and genuine-shaped
// receipt/audit data. These remain scheduling hints, never effect authority.
const PROFILE241='olympus-canonical-ranks-20261106-v1',GEN241='a'.repeat(32),SUBJECT241='999999999999999999',old241=Array.from({length:138},(_,i)=>(800000000000000000n+BigInt(i)).toString());
const guid241=i=>'Player-4613-'+(0x20000000+i).toString(16).toUpperCase(),name241=i=>'delta fixture '+i,hex241=(n,size=32)=>BigInt(n).toString(16).padStart(size,'0');
function fixture241(){
 const d=new DatabaseSync(':memory:');d.exec(fs.readFileSync(path.join(W,'schema.sql'),'utf8'));let at=now;
 d.function('strftime',(f,v)=>{assert.equal(f,'%s');assert.equal(v,'now');return String(at);});
 const all=[...old241,SUBJECT241];for(let i=0;i<all.length;i++){const s=all[i];d.prepare('INSERT INTO members(discord_id)VALUES(?)').run(s);d.prepare("INSERT INTO privacy_subjects(subject_id,generation,state,revision,created_at,updated_at)VALUES(?,?,'active',0,?,?)").run(s,GEN241,now-200000,now-200000);d.prepare("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,source,guid)VALUES(?,?,?,'member',?,?,'whisper',?)").run(name241(i),name241(i),s,now-200000,now-200000,guid241(i));}
 const snapshot=(id,target,birth,others=8)=>{d.prepare("INSERT INTO roster_snapshots(id,exported_at,received_at,first_received_at,source,member_count,complete,trusted)VALUES(?,?,?,?,?,139,1,1)").run(id,Math.min(at,birth),Math.min(at,birth),birth,'synthetic-native241');for(let i=0;i<all.length;i++){const rank=all[i]===SUBJECT241?target:others;d.prepare('INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index)VALUES(?,?,?,?,?,?)').run(id,name241(i),name241(i),guid241(i),['Guild Master','Stewart','High Council','Officer','Officer Alt','Raid Leader','Veteran','Raider','Member','Initiate'][rank],rank);}};
 const positive=(id,subject,rank,roster,birth,{g=GEN241,observed=false}={})=>{const role=rank===6?'1561096452057596005':rank===7?'1561096598296076460':rank===8?'1552077551839617104':'1561097105974628372';d.prepare("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,attempts,claim_nonce,request_digest,subject_generation,roster_id,native_guid,native_profile,native_rank,native_rank_name,created_at,expires_at,checked_at)VALUES(?,?,'canonical_routine233',?,?,1,'settled',?,?,?,?,?,?,?,?,?,?,?,?,?)").run(id,subject,G,role,observed?'canonical233_observed_without_dispatch':'canonical233_put_acknowledged_and_confirmed',observed?0:1,observed?null:'c'.repeat(32),'d'.repeat(64),g,roster,guid241(all.indexOf(subject)),PROFILE241,rank,['Guild Master','Stewart','High Council','Officer','Officer Alt','Raid Leader','Veteran','Raider','Member','Initiate'][rank],birth,birth+300,birth+1);};
 const attempt=(rank,n,result='held',age=0)=>d.prepare("INSERT INTO audit(ts,actor,action,subject,details)VALUES(?,'system','role.native232_attempt',?,?)").run(at-age,SUBJECT241,JSON.stringify({n,rank,result}));
 snapshot(1,6,now-100000,9);snapshot(2,6,now-90000,8);snapshot(3,7,now-2,8);
 for(let i=0;i<old241.length;i++)positive(hex241(i+1000),old241[i],9,1,now-99900);d.prepare("UPDATE role_settlements SET purpose='canonical_consumed233' WHERE subject<>?").run(SUBJECT241);
 positive('b'.repeat(32),SUBJECT241,6,2,now-1000);attempt(6,2,'settled',999);
 const query=()=>d.prepare(sql).all(G,'',50,0),work=()=>d.prepare(prefix+' SELECT * FROM ranked WHERE subject=?5').get(G,'',50,0,SUBJECT241);
 return{d,all,snapshot,positive,attempt,list:query,facts:work,get at(){return at;},set at(v){at=v;},close:()=>d.close()};
}
{
 const f=fixture241();check('241 138 genuine initial9to8 catchups no longer bury fresh6to7',f.list()[0]?.subject===SUBJECT241&&f.facts().native_delta_position===1&&f.list()[1]?.subject===old241[0]);
 check('241 special priority retains exact three output keys',JSON.stringify(Object.keys(f.list()[0]))===JSON.stringify(['subject','top_rank','urgent']));
 f.d.prepare("UPDATE members SET banned=1 WHERE discord_id=?").run(old241[0]);check('241 first due restriction stays ahead and delta uses only second slot',f.list()[0]?.subject===old241[0]&&f.list()[1]?.subject===SUBJECT241);f.close();
}
{
 const f=fixture241();f.snapshot(4,7,now-1);check('241 unrelated later snapshot does not erase an unserved transition',f.list()[0]?.subject===SUBJECT241&&f.d.prepare(prefix+' SELECT id FROM native_tokens241 WHERE subject=?5').get(G,'',50,0,SUBJECT241)?.id===3);
 f.d.prepare('UPDATE roster_snapshots SET exported_at=?,received_at=? WHERE id=4').run(now,now);check('241 identical refresh clocks do not replace immutable event birth',f.d.prepare(prefix+' SELECT first_received_at FROM native_tokens241 WHERE subject=?5').get(G,'',50,0,SUBJECT241)?.first_received_at===now-2);f.close();
}
{
 const f=fixture241();f.attempt(7,3,'source_held');check('241 source-held same event retains original300backoff',!f.list().slice(0,2).some(x=>x.subject===SUBJECT241));f.at=now+301;check('241 source-held is not completion and same event becomes due after300',f.list()[0]?.subject===SUBJECT241);f.close();
}
for(const badN of[null,'3',-1,999999]){
 const f=fixture241();f.attempt(7,badN,'held');check('241 malformed latest snapshot cannot repeatedly bypass backoff '+String(badN),!f.list().slice(0,2).some(x=>x.subject===SUBJECT241));f.at=now+301;check('241 malformed latest snapshot retains normal due retry '+String(badN),f.list()[0]?.subject===SUBJECT241);f.close();
}
for(const result of['held','unknown','source_held']){
 const f=fixture241();f.positive('e'.repeat(32),SUBJECT241,7,3,now-1);f.attempt(7,3,result);f.at=now+301;check('241 '+result+' audit never completes token despite positive-shaped row',f.list()[0]?.subject===SUBJECT241);f.close();
}
for(const observed of[false,true]){
 const f=fixture241();f.positive('e'.repeat(32),SUBJECT241,7,3,now-1,{observed});f.attempt(7,3,'settled');check('241 currentG original-shaped '+(observed?'observation':'ACK')+' plus settled audit handles event',f.facts().native_delta_position===null&&!f.list().slice(0,2).some(x=>x.subject===SUBJECT241));f.close();
}
{
 const f=fixture241();f.positive('e'.repeat(32),SUBJECT241,7,3,now-1,{g:'f'.repeat(32)});f.attempt(7,3,'settled');f.at=now+301;check('241 oldG positive cannot corroborate an otherwise matching settled audit',f.list()[0]?.subject===SUBJECT241);f.close();
}
{
 const f=fixture241();f.at=now+1;f.snapshot(4,6,now);f.d.prepare("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,attempts,subject_generation,native_profile,native_rank,created_at,expires_at,checked_at)VALUES(?,?,'canonical_migration233',?,'1561096598296076460',1,'settled','canonical239_target_put_acknowledged_and_confirmed',1,?,'olympus-canonical-migration-20261106-v1',NULL,?,?,?)").run('a'.repeat(32),SUBJECT241,G,GEN241,now-1,now+299,now);
 check('241 Native6to7to6 restores priority after M7 even raw last_rank remains6',f.facts().last_rank===6&&f.facts().new_target===0&&f.list()[0]?.subject===SUBJECT241);f.attempt(6,4,'settled');f.at=now+302;check('241 M target ACK cannot substitute for currentG routine event completion',f.list()[0]?.subject===SUBJECT241);f.close();
}
for(const [label,change]of[
 ['unknown matched rank',d=>d.prepare('UPDATE roster_members SET rank=NULL,rank_index=NULL WHERE snapshot_id=3 AND name_key=?').run(name241(138))],
 ['invalid matched rank',d=>d.prepare("UPDATE roster_members SET rank='Raider',rank_index='7bad' WHERE snapshot_id=3 AND name_key=?").run(name241(138))],
 ['unknown matched GUID',d=>d.prepare('UPDATE roster_members SET guid=NULL WHERE snapshot_id=3 AND name_key=?').run(name241(138))],
 ['name-only identity collision',d=>d.prepare("UPDATE roster_members SET guid='Player-4613-FFFFFFFF' WHERE snapshot_id=3 AND name_key=?").run(name241(138))],
 ['GUID-only identity collision',d=>d.prepare("UPDATE roster_members SET name_key='changed name' WHERE snapshot_id=3 AND guid=?").run(guid241(138))],
 ['duplicate GUID beside valid exact row',d=>{d.prepare("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index)VALUES(3,'duplicate guid','duplicate guid',?,'Officer',3)").run(guid241(138));d.prepare('UPDATE roster_snapshots SET member_count=140 WHERE id=3').run();}],
 ['duplicate GUID with unknown rank beside valid exact row',d=>{d.prepare("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index)VALUES(3,'duplicate unknown guid','duplicate unknown guid',?,NULL,NULL)").run(guid241(138));d.prepare('UPDATE roster_snapshots SET member_count=140 WHERE id=3').run();}],
 ['different physical name and GUID matches',d=>{d.prepare("UPDATE roster_members SET guid='Player-4613-FFFFFFFF' WHERE snapshot_id=3 AND name_key=?").run(name241(138));d.prepare("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index)VALUES(3,'other physical row','other physical row',?,'Raider',7)").run(guid241(138));d.prepare('UPDATE roster_snapshots SET member_count=140 WHERE id=3').run();}],
 ['partial snapshot',d=>d.prepare('UPDATE roster_snapshots SET complete=0 WHERE id=3').run()],
 ['untrusted snapshot',d=>d.prepare('UPDATE roster_snapshots SET trusted=0 WHERE id=3').run()],
 ['different source',d=>d.prepare("UPDATE roster_snapshots SET source='other-source' WHERE id=3").run()],
 ['wrong complete count',d=>d.prepare('UPDATE roster_snapshots SET member_count=1 WHERE id=3').run()]
 ]){const f=fixture241();f.at=now+1;f.snapshot(4,6,now);change(f.d);check('241 '+label+' is an unusable barrier, never inferred through MIN',f.facts().native_delta_position===null);f.close();}
{
 const f=fixture241();f.d.prepare("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,source,guid)VALUES('old absent alt','old absent alt',?,'member',?,?,'whisper',?)").run(SUBJECT241,now-200000,now-200000,guid241(9999));check('241 both equality arms absent for a valid old link add no rank or ambiguity',f.list()[0]?.subject===SUBJECT241&&f.d.prepare(prefix+' SELECT top_rank FROM native_samples241 WHERE subject=?5 AND id=3').get(G,'',50,0,SUBJECT241)?.top_rank===7);f.close();
}
{
 const f=fixture241();f.d.prepare('DELETE FROM characters WHERE discord_id=?').run(SUBJECT241);check('241 retained candidate without current member links has NULL sample and no delta',f.facts().native_delta_position===null&&f.d.prepare(prefix+' SELECT top_rank FROM native_samples241 WHERE subject=?5 AND id=3').get(G,'',50,0,SUBJECT241)?.top_rank===null);f.close();
}
{
 const f=fixture241();f.d.prepare("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,source,guid)VALUES('higher exact alt','higher exact alt',?,'member',?,?,'whisper',?)").run(SUBJECT241,now-200000,now-200000,guid241(9998));for(const id of[1,2,3]){f.d.prepare("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index)VALUES(?,'higher exact alt','higher exact alt',?,'Raid Leader',5)").run(id,guid241(9998));f.d.prepare('UPDATE roster_snapshots SET member_count=140 WHERE id=?').run(id);}check('241 multiple exact linked Native rows preserve account MIN and no false transition',f.facts().top_rank===5&&f.facts().native_delta_position===null&&f.d.prepare(prefix+' SELECT top_rank FROM native_samples241 WHERE subject=?5 AND id=3').get(G,'',50,0,SUBJECT241)?.top_rank===5);f.close();
}
for(const birth of[0,now+1,now-86401]){
 const f=fixture241();f.d.prepare('UPDATE roster_snapshots SET first_received_at=?,exported_at=?,received_at=? WHERE id=3').run(birth,now,now);check('241 immutable missing/future/old event birth falls back '+birth,f.facts().native_delta_position===null);f.close();
}
{
 const f=fixture241();f.at=now+100;for(let i=4;i<=70;i++)f.snapshot(i,7,now+i);check('241 transition outside64samples plus baseline falls back without claiming complete history',f.facts().native_delta_position===null);f.close();
}
{
 const f=fixture241();f.d.prepare("UPDATE roster_members SET rank='Raider',rank_index=7 WHERE snapshot_id=3 AND name_key=?").run(name241(0));f.at=now+1;f.snapshot(4,6,now);check('241 at most one due Native delta is promoted and initial catchup still gets other slot without restriction',f.list()[0]?.subject===old241[0]&&f.list()[1]?.subject===old241[1]&&f.facts().native_delta_position===2);f.close();
}

// .265: execute the actual emitted CTE-free selectors and their exact narrow
// historical inverse over real SQLite. These rows are scheduling debt only;
// HELD/unclaimed hints do not qualify Native identity or an effect.
const emitted265=require('./helpers/pure_source218.cjs').loadPureSource218(W,'full-release-roles');
const newFilter265="AND candidates.subject NOT IN(SELECT checked.subject FROM audit checked WHERE checked.actor='system' AND checked.action='role.native232_attempt' AND checked.subject IS NOT NULL\n AND json_extract(CASE WHEN json_valid(checked.details) THEN checked.details ELSE '{}' END,'$.walk')=?5))";
const oldFilter265="AND NOT EXISTS(SELECT 1 FROM audit checked WHERE checked.actor='system' AND checked.action='role.native232_attempt' AND checked.subject=candidates.subject\n AND json_extract(CASE WHEN json_valid(checked.details) THEN checked.details ELSE '{}' END,'$.walk')=?5))";
const subjects265=['700000000000000001','700000000000000002','700000000000000003','700000000000000004'],walk265='a'.repeat(32),foreignWalk265='b'.repeat(32);
const auditCases265=[
 ['empty',[],subjects265.slice(0,3)],
 ['NULL subject cannot poison membership',[['system','role.native232_attempt',null,JSON.stringify({walk:walk265})]],subjects265.slice(0,3)],
 ['current walk excludes only exact subject',[['system','role.native232_attempt',subjects265[0],JSON.stringify({walk:walk265})]],subjects265.slice(1,3)],
 ['duplicate visits preserve set membership',Array.from({length:2},()=>['system','role.native232_attempt',subjects265[0],JSON.stringify({walk:walk265})]),subjects265.slice(1,3)],
 ['foreign walk',[['system','role.native232_attempt',subjects265[0],JSON.stringify({walk:foreignWalk265})]],subjects265.slice(0,3)],
 ['malformed JSON',[['system','role.native232_attempt',subjects265[0],'not-json']],subjects265.slice(0,3)],
 ['SQL NULL details',[['system','role.native232_attempt',subjects265[0],null]],subjects265.slice(0,3)],
 ['missing walk',[['system','role.native232_attempt',subjects265[0],'{}']],subjects265.slice(0,3)],
 ['JSON NULL walk',[['system','role.native232_attempt',subjects265[0],'{"walk":null}']],subjects265.slice(0,3)],
 ['nontext walk',[['system','role.native232_attempt',subjects265[0],'{"walk":1}']],subjects265.slice(0,3)],
 ['foreign actor',[['watcher','role.native232_attempt',subjects265[0],JSON.stringify({walk:walk265})]],subjects265.slice(0,3)],
 ['foreign action',[['system','role.other',subjects265[0],JSON.stringify({walk:walk265})]],subjects265.slice(0,3)],
 ['BLOB subject is not a text subject',[['system','role.native232_attempt',Buffer.from(subjects265[0]),JSON.stringify({walk:walk265})]],subjects265.slice(0,3)],
 ['inactive privacy remains excluded',[['system','role.native232_attempt',subjects265[3],JSON.stringify({walk:foreignWalk265})]],subjects265.slice(0,3)]
];
for(const[name,profile,oldBytes,newBytes,copies]of[
 ['NATIVE232_SWEEP249_SELECT','olympus-prime-live-20261105-v1',2993,3015,1],
 ['CANONICAL233_SWEEP249_SELECT',PROFILE241,38081,38169,4]
]){
 const current=emitted265[name],historical=current.replaceAll(newFilter265,oldFilter265);
 check('265 '+name+' keeps exact CTE-free shape and five bindings',current.split(newFilter265).length===copies+1&&historical.split(oldFilter265).length===copies+1&&Buffer.byteLength(current)===newBytes&&Buffer.byteLength(historical)===oldBytes&&!/\bWITH\b/i.test(current)&&Math.max(...[...current.matchAll(/\?(\d+)/g)].map(match=>Number(match[1])))===5);
 for(const[label,audits,expected]of auditCases265){
  const d=new DatabaseSync(':memory:');try{
   d.exec(fs.readFileSync(path.join(W,'schema.sql'),'utf8'));d.function('strftime',(format,value)=>{assert.equal(format,'%s');assert.equal(value,'now');return String(now);});
   d.prepare("INSERT INTO roster_snapshots(id,exported_at,received_at,first_received_at,source,member_count,complete,trusted)VALUES(1,?,?,?,'synthetic-no-Native-authority',4,1,1)").run(now,now,now);
   for(let i=0;i<subjects265.length;i++){
    const subject=subjects265[i],key='scan fixture '+i,guid='Player-4613-'+(0x30000000+i).toString(16).toUpperCase();
    d.prepare('INSERT INTO members(discord_id)VALUES(?)').run(subject);
    d.prepare("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,source,guid)VALUES(?,?,?,'member',?,?,'whisper',?)").run(key,key,subject,now-1000,now-1000,guid);
    d.prepare("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index)VALUES(1,?,?,?,'Member',8)").run(key,key,guid);
    d.prepare("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,attempts,native_profile,created_at,expires_at)VALUES(?,?,'canonical_routine233',?,'1552077551839617104',1,'held','synthetic_unproved_scan265',0,?,?,?)").run(i.toString(16).padStart(32,'0'),subject,G,profile,now-400,now-100);
    if(i!==1)d.prepare('INSERT INTO privacy_subjects(subject_id,generation,state,revision,created_at,updated_at)VALUES(?,?,?,0,?,?)').run(subject,'a'.repeat(32),i===3?'retiring':'active',now-1000,now-1000);
   }
   for(const[actor,action,subject,details]of audits)d.prepare('INSERT INTO audit(ts,actor,action,subject,details)VALUES(?,?,?,?,?)').run(now,actor,action,subject,details);
   const before=JSON.stringify({roles:d.prepare('SELECT * FROM role_settlements ORDER BY id').all(),privacy:d.prepare('SELECT * FROM privacy_subjects ORDER BY subject_id').all(),audit:d.prepare('SELECT * FROM audit ORDER BY id').all()});
   const original=d.prepare(historical).all(G,'',50,0,walk265),optimized=d.prepare(current).all(G,'',50,0,walk265);
   check('265 '+name+' '+label+' preserves every selected row and ordering',JSON.stringify(optimized)===JSON.stringify(original)&&JSON.stringify(optimized.map(row=>row.subject).sort())===JSON.stringify([...expected].sort())&&optimized.every(row=>Object.keys(row).join(',')==='subject,top_rank,urgent'));
   check('265 '+name+' '+label+' preserves privacy, unclaimed debt and audit bytes',JSON.stringify({roles:d.prepare('SELECT * FROM role_settlements ORDER BY id').all(),privacy:d.prepare('SELECT * FROM privacy_subjects ORDER BY subject_id').all(),audit:d.prepare('SELECT * FROM audit ORDER BY id').all()})===before);
  }finally{d.close();}
 }
}

}

db.close();console.log(passed+'/'+checks+' canonical238 exact-source priority checks');process.exitCode=passed===checks?0:1;
