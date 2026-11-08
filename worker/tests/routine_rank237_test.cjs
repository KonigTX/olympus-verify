'use strict';
// Extend the exact existing Native fixture setup; use the actual issuer and SQL.
const fs=require('node:fs'),path=require('node:path'),{Module}=require('node:module');
const parent=fs.readFileSync(path.join(__dirname,'hardening_test.cjs'),'utf8'),cuts=[...parent.matchAll(/^\(async \(\) => \{/gm)];
if(cuts.length!==1)throw Error('rank237_original_fixture_boundary');
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

 async function unknownRows(full=false){
  await write("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index)VALUES(1,'uncertain one','Uncertain One','Player-4466-1111AAAA','Synthetic Unknown Rank A',1),(1,'uncertain two','Uncertain Two','Player-4466-2222BBBB','Synthetic Unknown Rank B',1)");
  if(full)for(let i=0;i<913;i++)await write("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index)VALUES(1,?1,?2,?3,'Member',8)",'unrelated '+i,'Unrelated '+i,'Player-4466-'+(0x10000000+i).toString(16));
  await write('UPDATE roster_snapshots SET member_count=(SELECT COUNT(*) FROM roster_members WHERE snapshot_id=1)');
 }
 async function alt(status='member',key='uncertain one',guid='Player-4466-1111AAAA'){
  await write("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,source,guid)VALUES(?1,?2,?3,?4,?5,?5,'whisper',?6)",key,'Synthetic Alt',U,status,T-100,guid);
  await write("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,attempts,subject_generation,request_digest,created_at,expires_at,checked_at,roster_id,native_guid,native_profile,native_rank,native_rank_name) SELECT ?1,subject,purpose,guild_id,role_id,desired,state,reason,attempts,subject_generation,?2,created_at,expires_at,checked_at,roster_id,?3,native_profile,1,'Stewart' FROM role_settlements WHERE id=?4",'e'.repeat(32),'f'.repeat(64),guid,ANCHOR);
 }
 let cap;
 await current();await unknownRows(true);await legacy();cap=await capture();
 check('916 complete rows with two unrelated unknown Stewart labels retain only proved main',!!cap&&I.routineMembership232Facts(cap).primary.guid===GUID&&I.routineMembership232Facts(cap).primary.index===3&&await valid(cap));
 check('all916 rank rows remain in original captured and final SQL graph',!!cap&&JSON.parse(originalRow232.rows_json).length===916&&JSON.parse(originalRow232.rows_json).filter(r=>String(r[2]).startsWith('Synthetic Unknown')).length===2);finish(cap);
 await seed();await unknownRows();cap=await capture();check('legacy232 selected policy isolates unrelated unknown ranks identically',!!cap&&I.routineMembership232Facts(cap).primary.guid===GUID&&await valid(cap));finish(cap);
 for(const status of ['member','left_pending','left']){await current();await unknownRows();await alt(status);cap=await capture();check('unknown higher alt '+status+' holds whole account instead of choosing lower valid main',cap===null);finish(cap);}
 await current();await unknownRows();await alt();await write("UPDATE roster_members SET rank_index=9 WHERE name_key='uncertain one'");cap=await capture();check('unknown lower alt also holds whole account',cap===null);finish(cap);
 for(const [label,key,guid]of[['name-only','uncertain one','Player-4466-AAAAFFFF'],['GUID-only','old absent name','Player-4466-1111AAAA']]){
  await current();await unknownRows();await alt('left',key,guid);cap=await capture();check('left '+label+' match to unknown rank cannot mint departure or lower valid alt',cap===null);finish(cap);
 }
 await current();await unknownRows();await alt('left','uncertain one','Player-4466-AAAAFFFF');await write("UPDATE roster_members SET guid=NULL WHERE name_key='uncertain one'");cap=await capture();check('left unknown rank name with missing native GUID cannot mint departure',cap===null);finish(cap);
 await current();await unknownRows();await write("UPDATE roster_members SET rank='Unknown Current' WHERE name_key='one'");cap=await capture();check('current primary unknown rank never grants or supplies nickname authority',cap===null);finish(cap);
 for(const status of ['verified','queued']){await current();await unknownRows();await write("INSERT INTO characters(name_key,name,discord_id,status,bound_at,source,guid)VALUES('unfinished','Unfinished',?1,?2,?3,'note','Player-4466-1111AAAA')",U,status,T-10);cap=await capture();check('unfinished '+status+' retains exact original skip without rank authority',!!cap&&I.routineMembership232Facts(cap).primary.guid===GUID&&await valid(cap));finish(cap);}
 for(const [label,sql]of[
  ['bad row duplicates valid GUID',"UPDATE roster_members SET guid='Player-4466-ABCDEF12' WHERE name_key='uncertain one'"],
  ['two bad rows duplicate GUID',"UPDATE roster_members SET guid='Player-4466-1111AAAA' WHERE name_key='uncertain two'"],
  ['bad row invalid GUID',"UPDATE roster_members SET guid='invalid-guid' WHERE name_key='uncertain one'"],
  ['bad row blank name',"UPDATE roster_members SET name_key='' WHERE name_key='uncertain one'"],
 ]){await current();await unknownRows();await write(sql);cap=await capture();check(label+' remains a GLOBAL identity hold',cap===null);finish(cap);}
 await current();await unknownRows();await write("UPDATE roster_members SET guid=NULL WHERE name_key='uncertain one'");cap=await capture();check('unrelated unknown rank with missing GUID has no authority but does not jam proved main',!!cap&&await valid(cap));finish(cap);
 for(const [label,sql]of[
  ['unknown rank label',"UPDATE roster_members SET rank='Another Synthetic Unknown' WHERE name_key='uncertain one'"],
  ['unknown rank GUID',"UPDATE roster_members SET guid='Player-4466-FFFFFFFF' WHERE name_key='uncertain one'"],
  ['unknown rank name',"UPDATE roster_members SET name_key='another unrelated name' WHERE name_key='uncertain one'"],
 ]){await current();await unknownRows();cap=await capture();await write(sql);check(label+' mutation after capture still fails unchanged full atomic predicate',!!cap&&!(await valid(cap)));finish(cap);}
 globalThis.Date=RealDate;crypto.getRandomValues=realRandom;console.log(ok+'/'+n+' scoped rank237 Native checks passed');process.exitCode=ok===n?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
`;
const m=new Module(__filename,module);m.filename=__filename;m.paths=module.paths;m._compile(parent.slice(0,cuts[0].index)+body,__filename);
