// Original Native fixture and actual issuer/SQL; no synthetic capability mint.
const fs232=require('node:fs'),path232=require('node:path'),{Module:Module232}=require('node:module');
const parent232=fs232.readFileSync(path232.join(__dirname,'hardening_test.cjs'),'utf8'),cuts232=[...parent232.matchAll(/^\(async \(\) => \{/gm)];
if(cuts232.length!==1)throw Error('maintained hardening fixture entry changed');
const checks232=String.raw`
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
 await seed();let cap=await capture();check('actual Native read issues new routine cap from retained original230 lineage',!!cap&&I.routineMembership232Facts(cap).primary.index===3&&await valid(cap));
 check('historical original pending expiry is not current authority expiry',I.routineMembership232Facts(cap).deadline===T+300&&db.prepare('SELECT expires_at FROM role_settlements').get().expires_at<T);
 check('frozen predicate relocates all fourteen independently frozen bound values',await valid(cap,8));
 let copied=false;try{I.assertRoutineMembership232(env,{...cap});}catch{copied=true;}check('copied capability DTO has no authority',copied);
 I.closeRoutineMembership232(cap);let closed=false;try{I.routineMembership232Facts(cap);}catch{closed=true;}check('closed invocation cannot retain its original capability',closed);db.close();
 for(const status of['member','left_pending']){await seed();await duplicateGuid232(status);check('global '+status+' GUID conflict cannot mint another account rank capability',await capture()===null);db.close();
  await seed();cap=await capture();await duplicateGuid232(status);check('global '+status+' GUID conflict during provider await invalidates final admission',!!cap&&!(await valid(cap)));I.closeRoutineMembership232(cap);db.close();}
 await seed();await duplicateGuid232('left');cap=await capture();check('ended foreign binding supplies no active GUID authority or conflict',!!cap&&await valid(cap));I.closeRoutineMembership232(cap);db.close();
 for(const missing of[null,'']){await seed();await write("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index)VALUES(1,'unrelated','Unrelated',?1,'Initiate',9)",missing);await write('UPDATE roster_snapshots SET member_count=2');cap=await capture();check('unrelated missing native GUID does not block the fully proved Officer '+String(missing),!!cap&&I.routineMembership232Facts(cap).primary.guid===GUID&&await valid(cap));I.closeRoutineMembership232(cap);db.close();}
 for(const status of['member','left']){await seed();await write('UPDATE characters SET status=?1',status);await write('UPDATE roster_members SET guid=NULL');check('same-name unknown native GUID cannot prove rank or departure for '+status,await capture()===null);db.close();}
 for(const status of['verified','queued']){await seed();await write('UPDATE characters SET status=?1,guid=NULL',status);await write('DELETE FROM role_settlements');check('unfinished '+status+' links alone prove neither identity nor departure',await capture()===null);db.close();}
 const initialHolds=[
 ['missing retained original anchor',"DELETE FROM role_settlements"],
 ['unproven generic member row',"UPDATE role_settlements SET purpose='restore_member'"],
 ['unknown original effect',"UPDATE role_settlements SET state='unknown'"],
 ['looked-up provider effect is not own ACK',"UPDATE role_settlements SET reason='observed_provider_presence'"],
 ['old privacy generation',"UPDATE role_settlements SET subject_generation='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'"],
 ['changed bound incarnation',"UPDATE characters SET bound_at="+(T-20)],
 ['changed verification after anchor',"UPDATE characters SET verified_at="+(T-20)],
 ['note-only identity',"UPDATE characters SET source='note'"],
 ['unpinned identity',"UPDATE characters SET guid=NULL"],
 ['unconfirmed absent identity',"DELETE FROM roster_members; UPDATE roster_snapshots SET member_count=0"],
 ['changed name same GUID held',"UPDATE roster_members SET name_key='renamed'"],
 ['stale source',"UPDATE roster_snapshots SET exported_at="+(T-600)],
 ['future source',"UPDATE roster_snapshots SET exported_at="+(T+1)],
 ['partial source',"UPDATE roster_snapshots SET complete=0"],
 ['distrusted source',"UPDATE roster_snapshots SET trusted=0"],
 ['wrong complete count',"UPDATE roster_snapshots SET member_count=2"],
 ['wrong guild provenance',"UPDATE roster_snapshots SET source='addon'"],
 ['old ordinal rank',"UPDATE roster_members SET rank='High Council'"],
 ['NUL receipt ID suffix',"UPDATE role_settlements SET id=id||char(0)||'suffix'"],
 ['NUL digest suffix',"UPDATE role_settlements SET request_digest=request_digest||char(0)||'suffix'"],
 ['NUL nonce suffix',"UPDATE role_settlements SET claim_nonce=claim_nonce||char(0)||'suffix'"],
 ['unbounded historical deadline',"UPDATE role_settlements SET expires_at=created_at+301"],
 ['impossible original rank tuple',"UPDATE role_settlements SET native_rank=3,native_rank_name='Officer'"],
 ['mismatched descendant name',"UPDATE role_settlements SET purpose='launch_routine_membership232',native_profile='olympus-prime-live-20261105-v1',reason='native232_put_acknowledged_and_confirmed',native_rank=3,native_rank_name='Guild Master'"],
 ['mismatched descendant rank role',"UPDATE role_settlements SET purpose='fresh_roster_rank',native_profile='olympus-prime-live-20261105-v1',reason='native232_put_acknowledged_and_confirmed',native_rank=3,native_rank_name='Officer',role_id='1561096679778947113'"],
 ['Council cannot borrow Officer staff lineage',"UPDATE role_settlements SET purpose='staff_roster_rank',native_profile='olympus-prime-live-20261105-v1',reason='native232_put_acknowledged_and_confirmed',native_rank=2,native_rank_name='High Council',role_id='1554262223038324840'"],
 ['nonselected descendant role',"UPDATE role_settlements SET purpose='fresh_roster_rank',native_profile='olympus-prime-live-20261105-v1',reason='native232_put_acknowledged_and_confirmed',role_id='1567917738985398384'"],
 ['foreign descendant purpose',"UPDATE role_settlements SET purpose='restore_member',native_profile='olympus-prime-live-20261105-v1',reason='native232_put_acknowledged_and_confirmed'"],
 ];
 for(const [label,sql]of initialHolds){await seed();await changeSQL(sql);check(label+' cannot issue a new cap',await capture()===null);db.close();}
 for(const [label,change]of[
 ['absent selection',()=>delete env.NATIVE_RANK_SYNC232],['invalid selection',()=>env.NATIVE_RANK_SYNC232='{}'],
 ['disabled mode',()=>env.VERIFY_MEMBERSHIP_ONLY='false'],['wrong selected scope',()=>env.VERIFY_NATIVE_SCOPE=JSON.stringify({version:1,guild:'Olympus',realm:'Fixture Realm'})],
 ['cutoff newer than source',()=>env.LINKS_NOT_BEFORE=String(T)],['floor',()=>env.ROSTER_MIN_MEMBERS='2'],
 ['config getter',()=>Object.defineProperty(env,'NATIVE_RANK_SYNC232',{get(){throw Error('getter executed');}})]
 ]){await seed();change();check(label+' holds',await capture()===null);db.close();}
 await seed();await write("UPDATE role_settlements SET attempts=0,claim_nonce=NULL,reason='launch230_current_role_observed'");cap=await capture();check('old230 observed present proves identity only, not a recreated owned ACK',!!cap&&await valid(cap)&&db.prepare('SELECT attempts FROM role_settlements').get().attempts===0);I.closeRoutineMembership232(cap);db.close();
 for(const observed of[false,true]){await seed();await write("UPDATE role_settlements SET purpose='launch_routine_membership232',native_profile=?1,reason=?2,attempts=?3,claim_nonce=?4,native_rank=3,native_rank_name='Officer'",P.NATIVE_RANK_PROFILE232,observed?'native232_observed_without_dispatch':'native232_put_acknowledged_and_confirmed',observed?0:1,observed?null:'c'.repeat(32));cap=await capture();check('source-owned232 '+(observed?'observed identity':'own ACK')+' retains same-generation lineage',!!cap&&await valid(cap));if(cap)I.closeRoutineMembership232(cap);db.close();}
 for(const [label,sql]of[
 ['fresh snapshot replaces original',"INSERT INTO roster_snapshots(exported_at,received_at,source,member_count,complete,trusted) SELECT exported_at,received_at,source,member_count,complete,trusted FROM roster_snapshots"],
 ['roster partial',"UPDATE roster_snapshots SET complete=0"],['roster GUID changes',"UPDATE roster_members SET guid='Player-4466-1234FFFF'"],
 ['promoted while awaiting provider',"UPDATE roster_members SET rank='Guild Master',rank_index=0"],
 ['new unverified alt',"INSERT INTO characters(name_key,name,discord_id,status,bound_at,guid) SELECT 'two','Two',discord_id,'member',bound_at,'Player-4466-1234FFFF' FROM characters LIMIT 1"],
 ['link removed',"UPDATE characters SET status='unbound'"],['link rebound',"UPDATE characters SET bound_at=bound_at+1"],
 ['standing ban',"UPDATE members SET banned=1"],['original anchor changed',"UPDATE role_settlements SET reason='late_unknown'"],
 ['original anchor removed',"DELETE FROM role_settlements"],['stale clock',null]
 ]){await seed();cap=await capture();if(sql)await changeSQL(sql);else T+=301;check(label+' invalidates final SQL admission',!!cap&&!(await (async()=>{try{return await valid(cap);}catch{return false;}})()));if(!sql)T-=301;I.closeRoutineMembership232(cap);db.close();}
 await seed();cap=await capture();const effect=I.routineMembership232Environment(env,cap);check('effect reuses the original admitted custody alias',effect.DB!==env.DB&&effect===I.routineMembership232Environment(env,cap));env.NATIVE_RANK_SYNC232='off';let changed=false;try{I.assertRoutineMembership232(effect,cap);}catch{changed=true;}check('changed original mode invalidates derived effect environment',changed);I.closeRoutineMembership232(cap);db.close();
 for(const [label,sql,cause]of[
 ['ban',"UPDATE members SET banned=1",'ban'],['rename',"INSERT INTO rename_holds(discord_id,old_name,new_name,char_key,nonce,state,decided_by,decided_at) VALUES('"+U+"','One','Two','one','abc','reapply','"+U+"',"+T+")",'rename_hold']
 ]){await seed();await changeSQL(sql);cap=await capture();check('original current '+label+' creates removal-only mandate',!!cap&&I.routineMembership232Facts(cap).cause===cause&&I.routineMembership232Facts(cap).primary===null&&await valid(cap));if(cap)I.closeRoutineMembership232(cap);db.close();}
 // Current signed account setup uses the maintained original OAuth issuer, not
 // a formatted cookie or a replacement generation asserted by this test.
 const signed232=await seed(true);cap=await capture();
 check('original signed current-generation identity reaches actual Native routine issuer',!!signed232&&!!cap&&signed232.g===I.routineMembership232Facts(cap).subjectGeneration&&await valid(cap));
 await write("UPDATE privacy_subjects SET state='retiring',revision=revision+1,updated_at=?1 WHERE subject_id=?2",T,U);
 check('original signed active cap cannot cross privacy retirement',!!cap&&!(await valid(cap))&&await capture()===null);I.closeRoutineMembership232(cap);db.close();
 await seed(true);cap=await capture();await write('UPDATE privacy_subjects SET generation=?1,revision=revision+1,updated_at=?2 WHERE subject_id=?3','e'.repeat(32),T,U);
 check('current-generation rotation refuses old source cap and old-generation anchor',!!cap&&!(await valid(cap))&&await capture()===null);I.closeRoutineMembership232(cap);db.close();
 // Every setup/mutation still goes through the protected entry database.
 const link232=async(key,guid,index,{status='member',listed=true,anchored=true,subject=U}={})=>{
  await write('INSERT INTO members(discord_id) VALUES(?1) ON CONFLICT DO NOTHING',subject);
  await write("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,source,guid) VALUES(?1,?2,?3,?4,?5,?6,'whisper',?7)",key,key,subject,status,T-100,T-99,guid);
  if(listed){await write('INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index) VALUES(1,?1,?1,?2,?3,?4)',key,guid,P.NATIVE_RANK_NAMES232[index],index);await write('UPDATE roster_snapshots SET member_count=member_count+1 WHERE id=1');}
  if(anchored)await write("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,claim_nonce,request_digest,subject_generation,roster_id,native_guid,native_profile,attempts,created_at,expires_at,checked_at) SELECT ?1,?2,purpose,guild_id,role_id,desired,state,reason,claim_nonce,request_digest,subject_generation,roster_id,?3,native_profile,attempts,created_at,expires_at,checked_at FROM role_settlements WHERE id=?4",'f'.repeat(32),subject,guid,ANCHOR);
 };
 await seed();await link232('two','Player-4466-2222AAAA',1);cap=await capture();check('highest verified linked alt supplies Stewart rather than lower Officer main',!!cap&&I.routineMembership232Facts(cap).primary.guid==='Player-4466-2222AAAA'&&I.routineMembership232Facts(cap).primary.index===1&&await valid(cap));I.closeRoutineMembership232(cap);db.close();
 await seed();await write("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index) VALUES(1,'unlinked','Unlinked','Player-4466-9999FFFF','Guild Master',0)");await write('UPDATE roster_snapshots SET member_count=2');cap=await capture();check('unlinked highest native member cannot outrank this account verified main',!!cap&&I.routineMembership232Facts(cap).primary.guid===GUID&&await valid(cap));I.closeRoutineMembership232(cap);db.close();
 for(const status232 of['verified','queued']){
  await seed();await write("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,source,guid) VALUES('unfinished','Unfinished',?1,?2,?3,NULL,NULL,NULL)",U,status232,T-1);
  cap=await capture();check(status232+' unfinished alt is ignored for eligibility while original main stays admitted',!!cap&&I.routineMembership232Facts(cap).primary.guid===GUID&&await valid(cap));
  await write("UPDATE characters SET status='member' WHERE name_key='unfinished'");check(status232+' unfinished alt promotion changes frozen link state and refuses old cap',!!cap&&!(await valid(cap)));I.closeRoutineMembership232(cap);db.close();
 }
 await seed();await link232('two','Player-4466-2222AAAA',1,{listed:false,status:'left'});cap=await capture();check('one confirmed absent alt preserves the remaining verified main and base eligibility',!!cap&&I.routineMembership232Facts(cap).cause==='eligible'&&I.routineMembership232Facts(cap).primary.guid===GUID&&await valid(cap));I.closeRoutineMembership232(cap);db.close();
 for(const departed232 of['left','left_pending']){
  await seed();await write('UPDATE characters SET status=?1 WHERE name_key=?2',departed232,'one');await write('DELETE FROM roster_members');
  await write("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index) VALUES(1,'other','Other','Player-4466-ABCDFFFF','Initiate',9)");
  cap=await capture();check(departed232==='left'?'all confirmed departures create mandate on nonempty trustworthy other-member roster':'first missing export left_pending is not confirmed last-member departure',departed232==='left'?!!cap&&I.routineMembership232Facts(cap).cause==='departure'&&I.routineMembership232Facts(cap).primary===null&&await valid(cap):cap===null);if(cap)I.closeRoutineMembership232(cap);db.close();
 }
 await seed();await link232('two','Player-4466-2222AAAA',1,{listed:false,status:'left_pending'});check('unconfirmed absent higher alt cannot lower the remaining Officer main rank',await capture()===null);db.close();
 for(const [purpose232,role232]of[['fresh_roster_rank',P.MIRROR_BY_NAME232.Officer],['staff_roster_rank','1554262223038324840']]){
  await seed();await write("UPDATE role_settlements SET purpose=?1,role_id=?2,native_profile=?3,reason='native232_put_acknowledged_and_confirmed',native_rank=3,native_rank_name='Officer'",purpose232,role232,P.NATIVE_RANK_PROFILE232);cap=await capture();check('valid own232 '+purpose232+' descendant is current identity lineage',!!cap&&await valid(cap));I.closeRoutineMembership232(cap);
  await write("UPDATE role_settlements SET attempts=0,claim_nonce=NULL,reason='native232_observed_without_dispatch'");check('observed-only '+purpose232+' is not an owned grant or identity descendant',await capture()===null);db.close();
 }
 await seed();await write("UPDATE role_settlements SET purpose='launch_routine_membership232',native_profile=?1,attempts=0,claim_nonce=NULL,reason='native232_observed_without_dispatch',native_rank=3,native_rank_name='Officer'",P.NATIVE_RANK_PROFILE232);cap=await capture();
 check('zero-attempt232 base observation proves identity without minting PUT ownership',!!cap&&await valid(cap)&&db.prepare("SELECT COUNT(*) n FROM role_settlements WHERE attempts=1 AND claim_nonce IS NOT NULL AND reason='native232_put_acknowledged_and_confirmed'").get().n===0&&ROLE_ADDS.length===0&&ROLE_REMOVES.length===0);I.closeRoutineMembership232(cap);db.close();
 await seed();cap=await capture();await write("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,claim_nonce,request_digest,roster_id,native_guid,native_profile,native_rank,native_rank_name,attempts,created_at,expires_at,checked_at) VALUES(?1,?2,'launch_routine_membership232',?3,?4,1,'settled','native232_put_acknowledged_and_confirmed',?5,?6,1,?7,?8,3,'Officer',1,?9,?10,?11)",'1'.repeat(32),U,G,R,'2'.repeat(32),'3'.repeat(64),GUID,P.NATIVE_RANK_PROFILE232,T-10,T+290,T-9);
 check('new own232 base ACK does not invalidate the already frozen original ancestor',!!cap&&await valid(cap));
 await write("UPDATE role_settlements SET state='unknown' WHERE id=?1",ANCHOR);check('frozen cap never adopts a later replacement anchor after its original changes',!!cap&&!(await valid(cap)));I.closeRoutineMembership232(cap);
 cap=await capture();check('new visit may select the valid retained own232 descendant after original history changes',!!cap&&await valid(cap));I.closeRoutineMembership232(cap);db.close();
 for(const [label232,sql232]of[
  ['anchor GUID',"UPDATE role_settlements SET native_guid='Player-4466-1234FFFF'"],['anchor subject',"UPDATE role_settlements SET subject='222222222222222222'"],
  ['anchor purpose',"UPDATE role_settlements SET purpose='restored_unowned'"],['anchor chronology',"UPDATE role_settlements SET created_at="+(T-110)],['anchor generation',"UPDATE role_settlements SET subject_generation='"+'e'.repeat(32)+"'"]
 ]){await seed();cap=await capture();await changeSQL(sql232);check(label232+' mutation invalidates final Native admission',!!cap&&!(await valid(cap)));I.closeRoutineMembership232(cap);db.close();}
 for(const key232 of['DB','NATIVE_RANK_SYNC232']){
  await seed();let getter232=0;Object.defineProperty(env,key232,{configurable:true,get(){getter232++;throw Error('getter must not execute');}});check(key232+' accessor is refused before executing its getter',await capture()===null&&getter232===0);db.close();
 }
 await seed();cap=await capture();let inheritedGetter232=0;const priorProto232=Object.getPrototypeOf(env);Object.setPrototypeOf(env,Object.create(priorProto232,{LINK_ROLE_ID:{get(){inheritedGetter232++;return R;}}}));
 let protoHeld232=false;try{I.assertRoutineMembership232(env,cap);}catch{protoHeld232=true;}check('original environment prototype drift holds without inherited getter invocation',protoHeld232&&inheritedGetter232===0);I.closeRoutineMembership232(cap);db.close();
 await seed();beforeNative232=()=>{env.NATIVE_RANK_SYNC232='off';};check('selected policy changed across actual Native read cannot issue a cap',await capture()===null);db.close();
 await seed();afterNative232=()=>write('UPDATE characters SET bound_at=bound_at+1');cap=await capture();check('identity changed after original Native read is refused by consuming SQL',!!cap&&!(await valid(cap)));I.closeRoutineMembership232(cap);db.close();
 await seed();cap=await capture();if(!originalRow232)throw Error('original Native result row hook was not reached');originalRow232.rows_json+=' ';let graphHeld232=false;try{I.assertRoutineMembership232(env,cap);}catch{graphHeld232=true;}
 check('changed original Native result graph cannot retain authority',graphHeld232);I.closeRoutineMembership232(cap);db.close();
 // Actual full-size input remains bound JSON, never interpolated roster SQL.
 await seed();const extra232=Array.from({length:999},(_,i)=>['other'+i,'Player-4466-'+(0x10000000+i).toString(16).toUpperCase()]);
 await write("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index) SELECT 1,json_extract(value,'$[0]'),json_extract(value,'$[0]'),json_extract(value,'$[1]'),'Initiate',9 FROM json_each(?1)",JSON.stringify(extra232));await write('UPDATE roster_snapshots SET member_count=1000');trace232=[];cap=await capture();
 check('full1000 native roster issues bounded original cap with one verified main',!!cap&&I.routineMembership232Facts(cap).primary.guid===GUID&&await valid(cap));
 const sourceStatements232=trace232.filter(r=>r.sql.includes(' AS rows_json,')),predicate232=I.routineMembership232Predicate(env,cap),maximum232={physicalStatements:trace232.length,sourceReads:sourceStatements232.length,maxSQLBytes:Math.max(...trace232.map(r=>Buffer.byteLength(r.sql))),maxParameters:Math.max(...trace232.map(r=>r.params.length)),sourceReadParameters:sourceStatements232[0]?.params.length,predicateParameters:predicate232.values.length,maxBoundValueBytes:Math.max(...trace232.flatMap(r=>r.params.map(v=>Buffer.byteLength(typeof v==='string'?v:JSON.stringify(v)))))};
 check('actual captured Native SQL keeps all parameters bounded and fourteen predicate values',maximum232.sourceReads===1&&maximum232.sourceReadParameters===4&&maximum232.predicateParameters===14&&maximum232.maxParameters<100&&trace232.every(r=>Math.max(0,...[...r.sql.matchAll(/\?(\d+)/g)].map(m=>Number(m[1])))===r.params.length));
 console.log('BUDGET routine232 '+JSON.stringify(maximum232));I.closeRoutineMembership232(cap);db.close();
 globalThis.Date=RealDate;crypto.getRandomValues=realRandom;console.log(ok+'/'+n+' routine membership232 checks passed');process.exitCode=ok===n?0:1;
})().catch(error=>{console.error(error);process.exitCode=1;});`;
const mod232=new Module232(__filename,module);mod232.filename=__filename;mod232.paths=module.paths;
mod232._compile(parent232.slice(0,cuts232[0].index)+checks232,__filename);
