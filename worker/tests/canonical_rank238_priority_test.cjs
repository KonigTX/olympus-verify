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
db.close();console.log(passed+'/'+checks+' canonical238 exact-source priority checks');process.exitCode=passed===checks?0:1;
