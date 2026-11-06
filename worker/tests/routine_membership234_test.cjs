'use strict';
// Extend the exact existing Native fixture setup; use the actual issuer and SQL.
const fs=require('node:fs'),path=require('node:path'),{Module}=require('node:module');
const parent=fs.readFileSync(path.join(__dirname,'hardening_test.cjs'),'utf8'),cuts=[...parent.matchAll(/^\(async \(\) => \{/gm)];
if(cuts.length!==1)throw Error('continuity234_original_fixture_boundary');
const body=String.raw`
(async()=>{
 const I=load('./routine-membership-authority232'),P=load('./native-rank-reconciliation232');
 const G=P.NATIVE_GUILD232,R=P.SHARED_MEMBER232,U=A,GUID='Player-4466-ABCDEF12',ANCHOR='b'.repeat(32);
 const policy=JSON.stringify({version:1,enabled:true,profile:P.NATIVE_RANK_PROFILE232,guildId:G,nativeGuild:P.NATIVE_SCOPE232.guild,nativeRealm:P.NATIVE_SCOPE232.realm,membershipRole:R,
 ranks:Array.from(P.NATIVE_RANK_NAMES232,(name,index)=>({index,name,roleId:name==='Stewart'?P.NATIVE_STEWART_ROLE232:P.MIRROR_BY_NAME232[name]})),privileged:true});
 const scope=JSON.stringify({version:1,...P.NATIVE_SCOPE232});
 let db,env,trace232=[],beforeNative232=null,afterNative232=null,originalRow232=null;
 const isSourceRead232=plan=>plan.some(s=>s.statement.includes(' AS rows_json,'));
 const write=async(sql,...values)=>env.DB.prepare(sql).bind(...values).run();
 const changeSQL=async(sql)=>{for(const piece of sql.split(';'))if(piece.trim())await write(piece.trim());};
 async function seed(signed=false){
  db=freshDb();trace232=[];beforeNative232=null;afterNative232=null;originalRow232=null;
  const native=entry.originalNativePort(db,{statement:(sql,params)=>trace232.push({sql,params:params.slice()}),
   beforeBatch:async plan=>{if(beforeNative232&&isSourceRead232(plan)){const hook=beforeNative232;beforeNative232=null;await hook(plan);}},
   afterBatch:async(plan,out)=>{if(isSourceRead232(plan)){originalRow232=out.flatMap(r=>r.results).find(r=>Object.hasOwn(r,'rows_json'))??null;if(afterNative232){const hook=afterNative232;afterNative232=null;await hook(out);}}}});
  env=directEnv({DB:native,NATIVE_RANK_SYNC232:policy,GUILD_ID:G,ROLE_GUILD_MEMBER:R,VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:scope,VERIFY_SECRET:SECRET,
   PUBLIC_BASE_URL:'https://verify.example',SITE_HOST:'guild.example',SITE_GUILD_ID:G,DISCORD_APP_ID:'1550176895671341076',COOKIE_SECRET:'routine232-original-cookie-secret-0123456789',
   SHARED_MEMBERSHIP230_MODE:'enabled',LINKS_NOT_BEFORE:'0',ROSTER_MIN_MEMBERS:'1',ROSTER_MAX_SHRINK_PCT:'10'});
  let originalSession=null;
  if(signed){const at=T;T-=150;try{
   await write('INSERT INTO site_users(discord_id,username,first_login,last_login,session_version) VALUES(?1,?2,?3,?3,7)',U,'Original routine232',T);
   originalSession=(await entry.issueOriginalEntryCookie(name=>load('./'+name),db,{...env,DB:native},U)).session;
  }finally{T=at;}}
  await write('INSERT INTO members(discord_id) VALUES(?1)',U);
  await write("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,source,guid) VALUES('one','One',?1,'member',?2,?3,'whisper',?4)",U,T-100,T-99,GUID);
  await write('INSERT INTO roster_snapshots(id,exported_at,received_at,source,member_count,complete,trusted) VALUES(1,?1,?2,?3,1,1,1)',T-5,T-4,'addon-native-v1:'+scope);
  await write("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index) VALUES(1,'one','One',?1,'Officer',3)",GUID);
  await write("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,claim_nonce,request_digest,roster_id,native_guid,native_profile,attempts,created_at,expires_at,checked_at) VALUES(?1,?2,'launch_membership230',?3,?4,1,'settled','launch230_put_acknowledged_and_confirmed',?5,?6,1,?7,'prime-native-230',1,?8,?9,?10)",ANCHOR,U,G,R,'c'.repeat(32),'d'.repeat(64),GUID,T-90,T-40,T-89);
  if(originalSession)await write('UPDATE role_settlements SET subject_generation=?1 WHERE id=?2',originalSession.g,ANCHOR);
  return originalSession;
 }
 const capture=()=>I.captureRoutineMembership232(env,U);
 async function duplicateGuid232(status){await write('INSERT INTO members(discord_id)VALUES(?1)',B);await write("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,source,guid)VALUES('different','Different',?1,?2,?3,?3,'whisper',?4)",B,status,T-100,GUID);}
 const valid=async(cap,start=1)=>{const p=I.routineMembership232Predicate(env,cap,start);return !!await env.DB.prepare('SELECT 1 WHERE '+p.sql).bind(...(start===1?[]:Array(start-1).fill(null)),...p.values).first();};

 const C=load('./canonical-ranks233'),cutoff=()=>T-1000,OLD_GUID='Player-4466-AABBCCDD';
 async function current(){await seed();env.CANONICAL_RANKS233=JSON.stringify({version:1,enabled:true,profile:C.CANONICAL_PROFILE233,guildId:G,ranks:C.CANONICAL_RANKS233.map(r=>({...r,permissions:'0'}))});env.NATIVE_RANK_SYNC232='off';env.FULL_RELEASE_ROLES='off';env.QR_NATIVE_ROLE_MAP='off';env.QR_RANK_MAPPING_ENABLED='false';env.STAFF_TEN_RANK_ROLES='false';env.ROLE_GUILD_MASTER='1554261979684933742';env.LINKS_NOT_BEFORE=String(cutoff());await write("INSERT INTO privacy_subjects(subject_id,generation,state,revision,created_at,updated_at)VALUES(?1,?2,'active',0,?3,?3)",U,'a'.repeat(32),T-200);await write("UPDATE role_settlements SET subject_generation=?1,purpose='canonical_identity233',native_profile=?2,native_rank=3,native_rank_name='Officer',role_id=?3,attempts=0,claim_nonce=NULL,reason='canonical233_original_control_verified'",'a'.repeat(32),C.CANONICAL_PROFILE233,'1554262223038324840');}
 async function legacy(){await write("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,source,guid)VALUES('legacy absent','Legacy Absent',?1,'member',?2,?2,'whisper',?3)",U,cutoff()-100,OLD_GUID);}
 const oldLink=()=>db.prepare("SELECT * FROM characters WHERE name_key='legacy absent'").get();
 const finish=cap=>{if(cap)I.closeRoutineMembership232(cap);db.close();};
 await current();await legacy();let original=JSON.stringify(oldLink()),receipts=JSON.stringify(db.prepare('SELECT * FROM role_settlements').all()),cap=await capture();check('canonical fresh original primary survives inert pre-cutoff absent member link',!!cap&&I.routineMembership232Facts(cap).primary.guid===GUID&&I.routineMembership232Facts(cap).cause==='eligible'&&await valid(cap));check('capture and final predicate never modify old link or role receipts',JSON.stringify(oldLink())===original&&JSON.stringify(db.prepare('SELECT * FROM role_settlements').all())===receipts);check('all original linked rows remain frozen and cutoff is a fourth READ bind',JSON.parse(originalRow232.links_json).length===2&&trace232.find(r=>r.sql.includes(' AS rows_json,')).params.length===4);finish(cap);
 await current();await write('UPDATE characters SET bound_at=?1,verified_at=?1',cutoff()-100);cap=await capture();check('fresh source-owned post-cutoff anchor admits current character without rewriting old clocks',!!cap&&await valid(cap)&&db.prepare('SELECT verified_at FROM characters').get().verified_at===cutoff()-100);finish(cap);
 for(const offset of[-1,0]){await current();await write('UPDATE characters SET bound_at=?1,verified_at=?1',cutoff()-200);await write('UPDATE role_settlements SET created_at=?1,expires_at=?2,checked_at=?3',cutoff()+offset,cutoff()+offset+300,cutoff()+offset+1);cap=await capture();check('anchor birth cutoff'+offset+' is '+(offset<0?'held':'admitted'),offset<0?cap===null:!!cap&&await valid(cap));finish(cap);}
 await current();await legacy();await write("DELETE FROM characters WHERE name_key='one'");await write('DELETE FROM role_settlements');cap=await capture();check('legacy-only absent links mint no identity or departure/removal mandate',cap===null);finish(cap);
 for(const [label,sql,params]of[
 ['post-cutoff unanchored member','UPDATE characters SET bound_at=?1,verified_at=?1 WHERE name_key=\'legacy absent\'',[T-100]],
 ['unknown GUID','UPDATE characters SET guid=NULL WHERE name_key=\'legacy absent\'',[]],
 ['invalid GUID','UPDATE characters SET guid=\'not-a-guid\' WHERE name_key=\'legacy absent\'',[]],
 ['invalid old clock','UPDATE characters SET bound_at=0 WHERE name_key=\'legacy absent\'',[]],
 ['invalid legacy source','UPDATE characters SET source=\'note\' WHERE name_key=\'legacy absent\'',[]],
 ['unconfirmed left_pending','UPDATE characters SET status=\'left_pending\' WHERE name_key=\'legacy absent\'',[]],
 ['unproved left','UPDATE characters SET status=\'left\' WHERE name_key=\'legacy absent\'',[]],
 ]){await current();await legacy();await write(sql,...params);cap=await capture();check(label+' remains held',cap===null);finish(cap);}
 await current();await legacy();await write("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index)VALUES(1,'legacy absent','Legacy Absent',NULL,'Initiate',9)");await write('UPDATE roster_snapshots SET member_count=2');cap=await capture();check('matching legacy name with unknown native GUID is never treated as absent',cap===null);finish(cap);
 await current();await legacy();await write("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index)VALUES(1,'renamed','Renamed',?1,'Initiate',9)",OLD_GUID);await write('UPDATE roster_snapshots SET member_count=2');cap=await capture();check('legacy GUID present under a different name remains held',cap===null);finish(cap);
 await current();await legacy();await write('INSERT INTO members(discord_id)VALUES(?1)',B);await write("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,source,guid)VALUES('foreign','Foreign',?1,'member',?2,?2,'whisper',?3)",B,T-100,OLD_GUID);cap=await capture();check('global active GUID conflict is not bypassed by legacy exclusion',cap===null);finish(cap);
 await current();await legacy();delete env.CANONICAL_RANKS233;env.NATIVE_RANK_SYNC232=policy;cap=await capture();check('unselected historic232 policy admission is unchanged',cap===null);finish(cap);
 for(const [label,sql,params]of[
 ['old link clocks change','UPDATE characters SET verified_at=?1 WHERE name_key=\'legacy absent\'',[T-50]],
 ['old link GUID changes','UPDATE characters SET guid=\'Player-4466-EEEEFFFF\' WHERE name_key=\'legacy absent\'',[]],
 ['old link disappears','DELETE FROM characters WHERE name_key=\'legacy absent\'',[]],
 ['privacy generation changes',"UPDATE privacy_subjects SET generation='eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'",[]],
 ['standing changes','UPDATE members SET banned=1',[]],
 ['original anchor changes','UPDATE role_settlements SET reason=\'unknown\'',[]],
 ['source expires','UPDATE roster_snapshots SET exported_at=?1',[T-600]],
 ]){await current();await legacy();cap=await capture();await write(sql,...params);check(label+' during await invalidates final admission',!!cap&&!(await valid(cap)));finish(cap);}
 await current();await legacy();cap=await capture();await write("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index)VALUES(1,'legacy absent','Legacy Absent',NULL,'Initiate',9)");await write('UPDATE roster_snapshots SET member_count=2');check('late name-only unknown presence cannot retain ignored-link authority',!!cap&&!(await valid(cap)));finish(cap);
 await current();await legacy();cap=await capture();await write("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,attempts,request_digest,subject_generation,created_at,expires_at,checked_at,native_guid,native_profile,native_rank,native_rank_name)VALUES(?1,?2,'canonical_identity233',?3,?4,1,'settled','canonical233_original_control_verified',0,?5,?6,?7,?8,?9,?10,?11,9,'Initiate')",'f'.repeat(32),U,G,'1561097105974628372','e'.repeat(64),'a'.repeat(32),T-10,T+290,T-9,OLD_GUID,C.CANONICAL_PROFILE233);check('later receipt cannot turn an ignored link into eligibility or renew the deadline',!!cap&&await valid(cap)&&I.routineMembership232Facts(cap).primary.guid===GUID&&I.routineMembership232Facts(cap).deadline===T+300&&JSON.parse(originalRow232.links_json).find(r=>r[0]==='legacy absent')[6]===null);finish(cap);
 await current();await legacy();cap=await capture();env.LINKS_NOT_BEFORE=String(cutoff()+1);let changed=false;try{await valid(cap);}catch{changed=true;}check('cutoff configuration drift cannot renew captured admission',!!cap&&changed);finish(cap);
 globalThis.Date=RealDate;crypto.getRandomValues=realRandom;console.log(ok+'/'+n+' routine continuity234 checks passed');process.exitCode=ok===n?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
`;
const m=new Module(__filename,module);m.filename=__filename;m.paths=module.paths;m._compile(parent.slice(0,cuts[0].index)+body,__filename);
