// Reuse the maintained genuine ingest/Native fixture, not a new verification model.
const fs227 = require('node:fs'), path227 = require('node:path'), { Module: Module227 } = require('node:module');
const parent227 = fs227.readFileSync(path227.join(__dirname, 'hardening_test.cjs'), 'utf8');
const cuts227 = [...parent227.matchAll(/^\(async \(\) => \{/gm)];
if (cuts227.length !== 1) throw Error('maintained hardening fixture entry changed');
const native227='  return entry.originalNativePort(db);';
if(parent227.split(native227).length!==2)throw Error('maintained Native fixture boundary changed');
const checks227 = String.raw`
(async () => {
  const gate = load('./launch-verification227');
  const SCOPE227=JSON.stringify({version:1,guild:'Olympus',realm:'Fixture Live Realm'}),SELECTED227={VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:SCOPE227};
  let getterCalls = 0;
  for (const [label, value, wanted] of [['true','true','members-only'],['false','false','legacy'],['undefined',undefined,'legacy'],['boolean',true,'held'],['whitespace',' true','held'],['empty','','held']]) {
    check('mode '+label+' is exact', gate.captureLaunchVerification({VERIFY_MEMBERSHIP_ONLY:value,VERIFY_NATIVE_SCOPE:SCOPE227}).mode === wanted);
  }
  const accessor = {}; Object.defineProperty(accessor,'VERIFY_MEMBERSHIP_ONLY',{get(){getterCalls++;return 'true';}});
  check('configuration getter is refused without invocation',gate.captureLaunchVerification(accessor).mode==='held'&&getterCalls===0);
  check('inherited mode cannot grant historical admission',gate.captureLaunchVerification(Object.create({VERIFY_MEMBERSHIP_ONLY:'true'})).mode==='held');
  const mutable={VERIFY_MEMBERSHIP_ONLY:'false'}, before=gate.captureLaunchVerification(mutable);mutable.VERIFY_MEMBERSHIP_ONLY='true';
  check('captured configuration change is held',!before.current());
  const launchClock={...SELECTED227,LINKS_NOT_BEFORE:'0'},clockCapture=gate.captureLaunchVerification(launchClock);launchClock.LINKS_NOT_BEFORE='1';
  check('original launch-cutoff binding cannot change while verification awaits',!clockCapture.current());
  const selected=gate.captureLaunchVerification(SELECTED227), native={current:true,exportedAt:T,rosterGuid:'Player-4613-12345678',whisperGuid:'Player-4613-12345678',source:selected.scope.provenance,nativeMembership:true};
  check('membership-only mode cannot run with an unconfirmed native scope',gate.captureLaunchVerification({VERIFY_MEMBERSHIP_ONLY:'true'}).mode==='held');
  for(const [label,raw]of[['unaffiliated',JSON.stringify({version:1,guild:'Other Guild',realm:'Fixture Live Realm'})],['beta',JSON.stringify({version:1,guild:'Olympus',realm:'Classic Beta PvP 2'})],['unknown',JSON.stringify({version:1,guild:'Olympus',realm:'unknown'})],['duplicate keys','{"version":1,"guild":"Other Guild","guild":"Olympus","realm":"Fixture Live Realm"}']])check(label+' scope cannot become approved native source',gate.parseLaunchNativeScope(raw)===null);
  check('native GUID and current roster match qualifies admission',gate.launchVerificationRefusal(selected,native,T)===null);
  for(const [label,delta] of [['missing whisper GUID',{whisperGuid:null}],['missing roster GUID',{rosterGuid:null}],['different native character',{whisperGuid:'Player-4613-87654321'}],['stale roster',{exportedAt:T-600}],['future roster',{exportedAt:T+1}],['unknown roster',{current:false}],['unscoped roster',{source:'addon'}]]) {
    const refused=gate.launchVerificationRefusal(selected,{...native,...delta},T);
    check(label+' refuses native membership admission before request closure',refused?.result==='membership_not_confirmed'&&refused.pendingConsumed===false&&refused.roleGranted===false&&refused.inviteQueued===false);
  }
  let db, env;
  const BOT227='444444444444444444',BOTROLE227='555555555555555555';
  let memberHook227=null,putHook227=null,putAfter227=null;
  stubs['./discord'].rest=async(_env,method,p,_body,_attempt,_reason,_budget,_mandatory,beforeDispatch)=>{
    if(method==='GET'&&p==='/users/@me')return{id:BOT227};
    if(method==='GET'&&p.endsWith('/roles'))return[{id:_env.GUILD_ID,position:0,permissions:'0',managed:false},{id:ROLE,position:1,permissions:'0',managed:false},{id:BOTROLE227,position:10,permissions:'268435456',managed:false}];
    if(method==='GET'&&p.endsWith('/members/'+BOT227))return{roles:[BOTROLE227],user:{id:BOT227}};
    if(method==='GET'&&p.endsWith('/members/'+A)){await memberHook227?.();return{roles:ROLE_ADDS.some(r=>r.id===A)?[ROLE]:[],user:{id:A}};}
    if(method==='PUT'&&p.endsWith('/members/'+A+'/roles/'+ROLE)){await putHook227?.();beforeDispatch?.();ROLE_ADDS.push({id:A,role:ROLE});await putAfter227?.();return{};}
    throw Error('unexpected scoped verification fixture provider '+method+' '+p);
  };
  const fresh = async () => {
    db=freshDb();reset();nativeBefore227=null;nativeAfter227=null;memberHook227=null;putHook227=null;putAfter227=null;
    env=directEnv({DB:d1(db),PUBLIC_BASE_URL:'https://verify.example',VERIFY_SECRET:SECRET,ROLE_GUILD_MEMBER:ROLE,ADMISSION_MODE:'auto',OFFICER_CHARACTERS:'Fern Melder',ROSTER_MAX_SHRINK_PCT:'10',ROSTER_MIN_MEMBERS:'0',GUILD_ID:'1549537348516188200',REQUEST_CODES:'on',...SELECTED227,MEMBERSHIP_ROLE_SETTLEMENT_ENABLED:'true',DISCORD_APP_ID:BOT227,DISCORD_BOT_TOKEN:'fixture-only'});
    await env.DB.prepare('INSERT INTO pending(discord_id,name_key,name,created_at,expires_at,nonce) VALUES(?1,\'\',\'\',?2,?3,\'M2X\')').bind(A,T,T+86400).run();
    return codes.ticketFor(SECRET,'M2X',day());
  };
  const snapshot = async (guid='Player-4613-12345678',exportedAt=T) => roster.ingestRoster(env,exportedAt,[{name:'Fern Melder',guid,rank:'Member',rankIndex:7},{name:'Other Member',guid:'Player-4613-87654321',rank:'Initiate',rankIndex:9}],gate.captureLaunchVerification(env).scope.provenance);
  const nativeMembers227=[{name:'Fern Melder',guid:'Player-4613-12345678',rank:'Member',rankIndex:7},{name:'Other Member',guid:'Player-4613-87654321',rank:'Initiate',rankIndex:9}];
  const nativeProof227=(code,guid='Player-4613-12345678',member=true,observedAt=T,scope=JSON.parse(SCOPE227))=>{
    const crypto227=require('node:crypto'),scopeHash=crypto227.createHash('sha256').update('native-scope|1|'+scope.guild+'|'+scope.realm,'utf8').digest('hex').slice(0,16);
    const mac=crypto227.createHmac('sha256',SECRET).update('membership|1|fern melder|'+guid+'|'+String(code).toUpperCase()+'|'+(member?'1':'0')+'|'+observedAt+'|'+scopeHash,'utf8').digest('hex').slice(0,32);
    return{version:1,member,observedAt,scopeHash,mac};
  };
  const invoke = (code,guid='Player-4613-12345678',nativeMembership=nativeProof227(code,guid)) => ingest.postVerify(env,{character:'Fern Melder',code,source:'whisper',guid,nativeMembership});
  const noAdmission = () => db.prepare('SELECT COUNT(*) n FROM characters').get().n===0&&db.prepare('SELECT COUNT(*) n FROM invite_queue').get().n===0&&ROLE_ADDS.length===0&&VERIFIED.length===0;
  const unchanged = () => db.prepare('SELECT consumed_at FROM pending').get().consumed_at===null&&noAdmission();
  const closedRefusal = reply => reply.status===409&&reply.body.result==='membership_not_confirmed'&&reply.body.pendingConsumed===true&&reply.body.requestRefused===true&&reply.body.roleGranted===false&&reply.body.inviteQueued===false&&db.prepare('SELECT consumed_at,consumed_source FROM pending').get().consumed_at!==null&&db.prepare('SELECT consumed_source FROM pending').get().consumed_source==='membership_refused'&&noAdmission();
  const displayPath227 = '/queue/unverified?keyVersion=launch-roster-display-v1';
  const watcherKey227 = 'synthetic-watcher-display-only-fixture-token';
  const displayFetch227 = (path=displayPath227, auth=true, runtime=env) => load('./index').default.fetch(
    new Request('https://verify.example' + path, { headers: auth ? {Authorization:'Bearer '+watcherKey227} : {} }),
    {...runtime,WATCHER_TOKEN:watcherKey227}, {waitUntil(){throw Error('strict display started background work');}}
  );
  const displayWrite227 = (statement, ...params) => env.DB.prepare(statement).bind(...params).run();
  await fresh();
  let display227 = await displayFetch227();
  check('strict display stays unavailable without an admitted native snapshot',display227.status===409);
  check('strict display needs Watcher bearer before returning any lists',(await displayFetch227(displayPath227,false)).status===401);
  for(const path of ['/queue?keyVersion=launch-roster-display-v1',displayPath227+'&officer=other',displayPath227+'&keyVersion=launch-roster-display-v1','/queue/unverified?keyVersion=launch-membership-v1']){
    check('strict display protocol rejects the other route or query '+path,(await displayFetch227(path)).status===400);
  }
  await snapshot();
  const beforeRead227=db.prepare('SELECT total_changes() AS n').get().n;
  display227=await displayFetch227();
  let lists227=await display227.json();
  check('exact scoped snapshot lists only display fields and no queue or removal authority',display227.status===200&&JSON.stringify(lists227)===JSON.stringify({
    protocol:'launch-roster-display-v1',fetchedAt:T,snapshotAt:T,guild:'Olympus',realm:'Fixture Live Realm',verified:[],
    unverified:nativeMembers227.map(({name,guid})=>({name,guid,pending:false}))
  }));
  check('strict display names cannot be stored in a shared HTTP cache',display227.headers.get('Cache-Control')==='private, no-store, no-transform');
  check('strict display read never changes a row or settles role, pending or invite custody',db.prepare('SELECT total_changes() AS n').get().n===beforeRead227&&unchanged());
  check('legacy mode cannot obtain strict reports',(await displayFetch227(displayPath227,true,{...env,VERIFY_MEMBERSHIP_ONLY:'false'})).status===409);
  check('held scope cannot obtain strict reports',(await displayFetch227(displayPath227,true,{...env,VERIFY_NATIVE_SCOPE:undefined})).status===409);
  check('strict display refuses an underlying snapshot from before the admission cutoff',(await displayFetch227(displayPath227,true,{...env,LINKS_NOT_BEFORE:String(T+1)})).status===409);
  for(const [label,change]of[
    ['unversioned provenance',"source='addon'"],['unfinished','complete=0'],['distrusted','trusted=0'],['wrong count','member_count=3'],
    ['stale','exported_at='+(T-3601)],['future','exported_at='+(T+1)]
  ]){
    await displayWrite227('UPDATE roster_snapshots SET '+change);
    check(label+' latest snapshot is withheld on the real read path',(await displayFetch227()).status===409);
    await displayWrite227('UPDATE roster_snapshots SET source=?1,complete=1,trusted=1,member_count=2,exported_at=?2',selected.scope.provenance,T);
  }
  await roster.ingestRoster(env,T+1,nativeMembers227,'addon');
  check('new unscoped snapshot cannot fall back to the earlier valid scoped roster',(await displayFetch227()).status===409);
  db.close();

  const withDisplayLink227 = async () => {
    await fresh();await snapshot();
    await displayWrite227("INSERT INTO members(discord_id,username,global_name) VALUES(?1,'example-member','Example Member')",A);
    await displayWrite227("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,guid) VALUES('fern melder','Fern Melder',?1,'member',?2,?2,?3)",A,T,nativeMembers227[0].guid);
    await displayWrite227("UPDATE pending SET name_key='other member',name='Other Member'");
  };
  await withDisplayLink227();
  lists227=await (await displayFetch227()).json();
  check('current exact GUID returns display names only and named pending prevents a reminder',JSON.stringify(lists227.verified)===JSON.stringify([
    {name:'Fern Melder',guid:nativeMembers227[0].guid,status:'member',username:'example-member',displayName:'Example Member'}
  ])&&lists227.unverified[0]?.pending===true&&!JSON.stringify(lists227).includes(A));
  db.close();
  for(const [label,statement]of[
    ['same name with the wrong current GUID',"UPDATE characters SET guid='Player-4613-00000000'"],
    ['rename still settling under a prior name',"UPDATE characters SET name_key='old name',name='Old Name'"],
    ['prior non-member state',"UPDATE characters SET status='left_pending'"],
    ['banned link','UPDATE members SET banned=1'],
    ['prior permanent denial',"UPDATE characters SET status='denied'"],
    ['retiring privacy subject',"INSERT INTO privacy_subjects(subject_id,generation,state,revision,created_at,updated_at) VALUES('"+A+"','"+'a'.repeat(32)+"','retiring',0,"+T+","+T+")"]
  ]){
    await withDisplayLink227();
    await displayWrite227(statement);
    lists227=await (await displayFetch227()).json();
    check(label+' gives neither a displayed Discord name nor a reminder target',lists227.verified?.length===0&&!lists227.unverified?.some(row=>row.name==='Fern Melder'));
    if(label==='retiring privacy subject')check('retiring subject does not expose a named pending request or reminder',lists227.unverified?.length===0);
    db.close();
  }

  const savedVectorTime=T;T=1793720000;
  const vectorEnv={VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:JSON.stringify({version:1,guild:'Olympus',realm:'Native Live Realm'}),VERIFY_SECRET:'synthetic-per-whisper-only'};
  const vectorProof=gate.captureNativeMembershipProof({version:1,member:true,observedAt:T,scopeHash:'a32080270acf8d2f',mac:'a386604f5049ee4c67b2518c302c1b48'});
  check('real WebCrypto accepts the frozen independent Lua/Watcher protocol vector',!!await gate.verifyNativeMembershipProof(vectorEnv,gate.captureLaunchVerification(vectorEnv),vectorProof,'Fresh Member-Realm','Player-1-ABCDEF12','8ALCWJ'));T=savedVectorTime;
  let proofCode=await fresh(),proofMode=gate.captureLaunchVerification(env),rawProof=nativeProof227(proofCode),proofCopy=gate.captureNativeMembershipProof(rawProof);rawProof.member=false;rawProof.mac='0'.repeat(32);
  check('native proof is copied before asynchronous signature verification',!!await gate.verifyNativeMembershipProof(env,proofMode,proofCopy,'Fern Melder','Player-4613-12345678',proofCode));db.close();
  proofCode=await fresh();let proofGetter=0;rawProof=nativeProof227(proofCode);Object.defineProperty(rawProof,'member',{get(){proofGetter++;return true;}});
  check('native proof getter is refused without execution',gate.captureNativeMembershipProof(rawProof)===null&&proofGetter===0);db.close();
  proofCode=await fresh();proofMode=gate.captureLaunchVerification(env);proofCopy=gate.captureNativeMembershipProof(nativeProof227(proofCode));const rotating=gate.verifyNativeMembershipProof(env,proofMode,proofCopy,'Fern Melder','Player-4613-12345678',proofCode);env.VERIFY_SECRET='synthetic changed key';let rotationHeld=false;try{await rotating;}catch(error){rotationHeld=error instanceof gate.LaunchVerificationHeld;}
  check('secret rotation during real crypto is held without adopting the replacement key',rotationHeld&&unchanged());db.close();
  for(const [label,wire]of[['missing native scope',{}],['unaffiliated collector guild',{nativeGuild:'Other Guild',nativeRealm:'Fixture Live Realm'}],['wrong native realm',{nativeGuild:'Olympus',nativeRealm:'Another Live Realm'}],['different native case',{nativeGuild:'OLYMPUS',nativeRealm:'Fixture Live Realm'}]]){
    await fresh();const result=await ingest.postRoster(env,{exportedAt:T,members:nativeMembers227,...wire});
    check(label+' is refused before a global roster or role effect',result.status===409&&result.body.error==='native_roster_scope_mismatch'&&db.prepare('SELECT COUNT(*) n FROM roster_snapshots').get().n===0&&noAdmission());db.close();
  }
  await fresh();delete env.VERIFY_NATIVE_SCOPE;let invalidScope=await ingest.postRoster(env,{exportedAt:T,members:nativeMembers227,nativeGuild:'Olympus',nativeRealm:'Fixture Live Realm'});
  check('unconfirmed operator scope holds native ingest before effects',invalidScope.status===503&&db.prepare('SELECT COUNT(*) n FROM roster_snapshots').get().n===0&&noAdmission());db.close();
  await fresh();await roster.ingestRoster(env,T,nativeMembers227,'addon');
  let nativePost=await ingest.postRoster(env,{exportedAt:T,members:nativeMembers227,nativeGuild:'Olympus',nativeRealm:'Fixture Live Realm'});
  check('new native provenance cannot be borrowed by refreshing legacy snapshot',nativePost.status===200&&db.prepare('SELECT COUNT(*) n FROM roster_snapshots').get().n===2&&db.prepare('SELECT source FROM roster_snapshots ORDER BY id DESC LIMIT 1').get().source===selected.scope.provenance&&db.prepare('SELECT source FROM roster_snapshots ORDER BY id LIMIT 1').get().source==='addon');
  nativePost=await ingest.postRoster(env,{exportedAt:T,members:nativeMembers227,nativeGuild:'Olympus',nativeRealm:'Fixture Live Realm'});
  check('same already scoped native export keeps original snapshot identity',nativePost.status===200&&db.prepare('SELECT COUNT(*) n FROM roster_snapshots').get().n===2);db.close();
  let code=await fresh(), reply=await invoke(code);
  check('no roster: closes only original request without a character, review, invite or role',closedRefusal(reply));
  const again=await load('./interactions').handleInteraction(env,{type:3,guild_id:env.GUILD_ID,data:{custom_id:'guide:verify'},member:{user:{id:A},roles:[]}});
  const nextCode=(again.body?.data?.content||'').match(/Your code: \x60([A-Z2-9]{7})\x60/)?.[1];
  check('Get my code after definitive refusal really issues a fresh nonce',!!nextCode&&nextCode!==code&&db.prepare('SELECT COUNT(*) n FROM pending WHERE consumed_at IS NULL').get().n===1&&db.prepare("SELECT COUNT(*) n FROM pending WHERE consumed_source='membership_refused'").get().n===1);db.close();
  for(const [label,change] of [['unfinished','UPDATE roster_snapshots SET complete=0'],['distrusted','UPDATE roster_snapshots SET trusted=0'],['truncated','UPDATE roster_snapshots SET member_count=3']]){
    code=await fresh();await snapshot();await env.DB.prepare(change).run();reply=await invoke(code);
    check(label+': real ingest closes only refused request and creates no admission',closedRefusal(reply));db.close();
  }
  code=await fresh();await snapshot();reply=await invoke(code,'Player-4613-00000000');
  check('another character GUID cannot borrow this native roster name',closedRefusal(reply));db.close();
  code=await fresh();await snapshot();reply=await ingest.postVerify(env,{character:'Fern Melder',code,source:'whisper'});
  check('unsigned/name-only relay lacks native whisper identity and grants nothing',closedRefusal(reply));db.close();
  for(const [label,make]of[
    ['native own-membership false',c=>nativeProof227(c,undefined,false)],['missing native assertion',()=>null],
    ['stale native assertion',c=>nativeProof227(c,undefined,true,T-601)],['future native assertion',c=>nativeProof227(c,undefined,true,T+6)],
    ['wrong scope assertion',c=>nativeProof227(c,undefined,true,T,{guild:'Olympus II',realm:'Fixture Live Realm'})],
    ['wrong code assertion',()=>nativeProof227('K7QM2XD')],['tampered MAC',c=>({...nativeProof227(c),mac:'0'.repeat(32)})],
    ['unknown proof field',c=>({...nativeProof227(c),guild:'Olympus'})],
  ]){code=await fresh();await snapshot();reply=await invoke(code,undefined,make(code));check(label+' cannot borrow even a fresh positive roster',closedRefusal(reply));db.close();}
  for(const[label,guid,make]of[
    ['missing proof',undefined,()=>null],['invalid false MAC',undefined,c=>({...nativeProof227(c,undefined,false),mac:'0'.repeat(32)})],
    ['stale false proof',undefined,c=>nativeProof227(c,undefined,false,T-601)],
    ['foreign GUID false proof','Player-4613-00000000',c=>nativeProof227(c,'Player-4613-00000000',false)],
    ['foreign scope false proof',undefined,c=>nativeProof227(c,undefined,false,T,{guild:'Olympus II',realm:'Fixture Live Realm'})],
  ]){code=await fresh();await snapshot();reply=await invoke(code,guid,make(code));check(label+' cannot poison the trusted roster',closedRefusal(reply)&&db.prepare('SELECT trusted FROM roster_snapshots').get().trusted===1);db.close();}
  code=await fresh();await snapshot();reply=await invoke(code,undefined,nativeProof227(code,undefined,false,T-1));
  check('valid negative observed before a newer export cannot quarantine that export',closedRefusal(reply)&&db.prepare('SELECT trusted FROM roster_snapshots').get().trusted===1);db.close();
  for(const replacement of ['refreshed timestamp','new snapshot']){
    code=await fresh();await snapshot();const originalId=db.prepare('SELECT MAX(id) id FROM roster_snapshots').get().id;const signedAbsence=nativeProof227(code,undefined,false);let advanced=false;
    nativeBefore227=async plan=>{if(plan.some(p=>p.statement.includes("consumed_source='membership_refused'"))){nativeBefore227=null;advanced=true;T+=1;
      await roster.ingestRoster(env,T,replacement==='new snapshot'?[nativeMembers227[0],{...nativeMembers227[1],rank:'Member',rankIndex:7}]:nativeMembers227,selected.scope.provenance);
    }};
    reply=await invoke(code,undefined,signedAbsence);
    check('negative proof racing admitted '+replacement+' preserves newer evidence without a stale quarantine',advanced&&(closedRefusal(reply)||reply.status===503&&reply.body.result==='outcome_unknown'&&unchanged())&&db.prepare('SELECT exported_at FROM roster_snapshots ORDER BY id DESC LIMIT 1').get().exported_at===T&&db.prepare('SELECT COUNT(*) n FROM roster_snapshots WHERE trusted=0').get().n===0&&(replacement!=='new snapshot'||db.prepare('SELECT MAX(id) id FROM roster_snapshots').get().id>originalId));db.close();
  }
  code=await fresh();await snapshot();await env.DB.prepare('INSERT INTO members(discord_id) VALUES(?1) ON CONFLICT DO NOTHING').bind(A).run();
  await env.DB.prepare("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,member_since,guid)VALUES('fern melder','Fern Melder',?1,'member',?2,?2,?2,'Player-4613-12345678')").bind(A,T).run();
  reply=await invoke(code,undefined,nativeProof227(code,undefined,false));
  check('authenticated current negative atomically restricts only its contradicted positive snapshot',reply.status===409&&reply.body.pendingConsumed===true&&reply.body.requestRefused===true&&db.prepare('SELECT trusted FROM roster_snapshots').get().trusted===0&&db.prepare('SELECT consumed_source FROM pending').get().consumed_source==='membership_refused'&&db.prepare('SELECT status FROM characters').get().status==='member'&&ROLE_ADDS.length===0&&ROLE_REMOVES.length===0);
  const negativeRestore=await load('./roles').grantMemberRole(env,A,'synthetic restore after native absence','status',undefined,undefined,{subjectGeneration:null});
  check('restore cannot regrant from quarantined cached membership',negativeRestore==='held'&&ROLE_ADDS.length===0);
  const negativeSweep=await load('./restore').sweepMemberRoles(env,'cron');
  check('ordinary sweep cannot grant from quarantined cache or invent a role removal',negativeSweep!==null&&ROLE_ADDS.length===0&&ROLE_REMOVES.length===0);db.close();
  for(const [label,change]of[['replaced request',()=>db.prepare("UPDATE pending SET nonce='K7Q',created_at=created_at+1").run()],['already closed request',()=>db.prepare("UPDATE pending SET consumed_at=?,consumed_source='banned'").run(T)]]){
    code=await fresh();let reached=false;
    nativeBefore227=plan=>{if(plan.some(p=>p.statement.includes("consumed_source='membership_refused'"))){nativeBefore227=null;reached=true;change();}};
    reply=await invoke(code);const row=db.prepare('SELECT nonce,consumed_at,consumed_source FROM pending').get();
    check(label+' cannot be clobbered by a delayed definitive refusal',reached&&reply.status===503&&reply.body.result==='outcome_unknown'&&row.consumed_source!=='membership_refused'&&noAdmission());db.close();
  }
  code=await fresh();let closeLanded=false;
  nativeAfter227=plan=>{if(plan.some(p=>p.statement.includes("consumed_source='membership_refused'"))){nativeAfter227=null;closeLanded=true;throw Error('synthetic lost committed refusal close ACK');}};
  reply=await invoke(code);
  check('lost committed refusal ACK stays unknown and cannot acknowledge definitive no-role refusal',closeLanded&&reply.status===503&&reply.body.result==='outcome_unknown'&&reply.body.requestRefused!==true&&db.prepare('SELECT consumed_source FROM pending').get().consumed_source==='membership_refused'&&noAdmission());db.close();
  code=await fresh();await snapshot();reply=await invoke(code);
  check('matching native whisper on complete trusted main roster links the requested account',reply.body.result==='member'&&db.prepare('SELECT discord_id,status,guid FROM characters').get().discord_id===A&&db.prepare('SELECT status FROM characters').get().status==='member');
  check('native member path never creates an applicant invite or review',db.prepare('SELECT COUNT(*) n FROM invite_queue').get().n===0&&VERIFIED.length===0);
  check('native member reaches existing single member-role writer',ROLE_ADDS.some(row=>row.id===A&&row.role===ROLE));db.close();
  // Actual original Native boundaries: a concurrent roster write completes BEFORE
  // the atomic consume/promotion group, never between its statements.
  for(const [label,mutate]of[
    ['newer snapshot',()=>{const id=Number(db.prepare("INSERT INTO roster_snapshots(exported_at,received_at,source,member_count,complete,trusted)VALUES(?,?,'addon',0,1,1)").run(T,T).lastInsertRowid);return id;}],
    ['partial snapshot',()=>db.prepare('UPDATE roster_snapshots SET complete=0').run()],
    ['provenance changed',()=>db.prepare("UPDATE roster_snapshots SET source='addon'").run()],
    ['roster aged past source deadline',()=>{T+=600;}],
  ]){
    code=await fresh();await snapshot();let reached=false;
    nativeBefore227=plan=>{if(plan.some(p=>/^UPDATE pending SET consumed_at =/.test(p.statement))){nativeBefore227=null;reached=true;mutate();}};
    reply=await invoke(code);
    check(label+' at Native consume boundary cannot consume, link or grant',reached&&unchanged()&&reply.status>=400);db.close();
  }
  code=await fresh();await snapshot();const agingNative=nativeProof227(code,undefined,true,T-599);let nativeTimeRace=false;
  nativeBefore227=plan=>{if(plan.some(p=>/^UPDATE pending SET consumed_at =/.test(p.statement))){nativeBefore227=null;nativeTimeRace=true;T+=2;}};
  reply=await invoke(code,undefined,agingNative);
  check('native assertion expiry is fenced inside consume even when roster stays fresh',nativeTimeRace&&unchanged()&&reply.status>=400);db.close();
  code=await fresh();await snapshot();let promotionRace=false;
  nativeAfter227=plan=>{if(plan.some(p=>/^UPDATE pending SET consumed_at =/.test(p.statement))){nativeAfter227=null;promotionRace=true;db.prepare('UPDATE roster_snapshots SET complete=0').run();}};
  reply=await invoke(code);
  check('proof changing after consume cannot promote or dispatch a role',promotionRace&&db.prepare('SELECT consumed_at FROM pending').get().consumed_at!==null&&db.prepare('SELECT status FROM characters').get().status==='verified'&&ROLE_ADDS.length===0&&reply.status>=400);db.close();
  code=await fresh();await snapshot();let modeRace=false;
  nativeBefore227=plan=>{if(plan.some(p=>/^UPDATE pending SET consumed_at =/.test(p.statement))){nativeBefore227=null;modeRace=true;env.VERIFY_MEMBERSHIP_ONLY='false';}};
  reply=await invoke(code);
  check('mode changing at a dispatched Native boundary grants no role and keeps outcome unknown',modeRace&&ROLE_ADDS.length===0&&VERIFIED.length===0&&reply.status===503&&reply.body.result==='outcome_unknown');db.close();
  // Use the CURRENT central membership intent writer with real Native custody,
  // inventory/hierarchy checks and the original snapshot selected by the whisper.
  code=await fresh();Object.assign(env,{MEMBERSHIP_ROLE_SETTLEMENT_ENABLED:'true',DISCORD_APP_ID:BOT227,DISCORD_BOT_TOKEN:'fixture-only'});await snapshot();reply=await invoke(code);
  check('source-bound launch verification dispatches one central membership intent',ROLE_ADDS.length===1&&db.prepare("SELECT COUNT(*) n FROM role_settlements WHERE purpose='roster_membership' AND state='settled' AND attempts=1").get().n===1);db.close();
  code=await fresh();Object.assign(env,{MEMBERSHIP_ROLE_SETTLEMENT_ENABLED:'true',DISCORD_APP_ID:BOT227,DISCORD_BOT_TOKEN:'fixture-only'});await snapshot();
  await env.DB.prepare('INSERT INTO members(discord_id) VALUES(?1) ON CONFLICT DO NOTHING').bind(A).run();
  await env.DB.prepare("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,member_since,guid)VALUES('fern melder','Fern Melder',?1,'member',?2,?2,?2,'Player-4613-12345678')").bind(A,T).run();
  reply=await invoke(code);
  check('already linked member with fresh native proof reaches immediate central missing-role repair',reply.body.result==='member'&&ROLE_ADDS.length===1&&db.prepare("SELECT COUNT(*) n FROM role_settlements WHERE purpose='roster_membership' AND state='settled' AND attempts=1").get().n===1);
  check('existing member repair creates no applicant invite or review',VERIFIED.length===0&&db.prepare('SELECT COUNT(*) n FROM invite_queue').get().n===0);db.close();
  for(const [label,mutate]of[['roster replaced',()=>db.prepare('UPDATE roster_snapshots SET complete=0').run()],['native provenance changed',()=>db.prepare("UPDATE roster_snapshots SET source='addon'").run()],['mode changed',()=>{env.VERIFY_MEMBERSHIP_ONLY='false';}],['scope pin changed',()=>{env.VERIFY_NATIVE_SCOPE=JSON.stringify({version:1,guild:'Olympus',realm:'Another Live Realm'});}]]){
    code=await fresh();Object.assign(env,{MEMBERSHIP_ROLE_SETTLEMENT_ENABLED:'true',DISCORD_APP_ID:BOT227,DISCORD_BOT_TOKEN:'fixture-only'});await snapshot();let reached=false;
    memberHook227=()=>{memberHook227=null;reached=true;mutate();};reply=await invoke(code);
    check(label+' during central member lookup dispatches no role',reached&&ROLE_ADDS.length===0);db.close();
  }
  code=await fresh();await snapshot();let afterAdmit=false;
  nativeAfter227=plan=>{if(plan.some(p=>p.statement.includes("reason='admitted_before_effect'"))){nativeAfter227=null;afterAdmit=true;db.prepare('UPDATE roster_snapshots SET complete=0').run();}};
  reply=await invoke(code);
  check('source changed after final Native admission cannot dispatch stale central PUT',afterAdmit&&ROLE_ADDS.length===0&&db.prepare("SELECT COUNT(*) n FROM role_settlements WHERE attempts=1 AND state IN('dispatching','unknown')").get().n===1);db.close();
  code=await fresh();Object.assign(env,{MEMBERSHIP_ROLE_SETTLEMENT_ENABLED:'true',DISCORD_APP_ID:BOT227,DISCORD_BOT_TOKEN:'fixture-only'});await snapshot();let putBoundary=false;
  putHook227=()=>{putHook227=null;putBoundary=true;env.VERIFY_MEMBERSHIP_ONLY='false';};reply=await invoke(code);
  check('final central PUT boundary rechecks original mode before provider dispatch',putBoundary&&ROLE_ADDS.length===0&&db.prepare("SELECT COUNT(*) n FROM role_settlements WHERE attempts=1 AND state IN('dispatching','unknown')").get().n===1);db.close();
  code=await fresh();Object.assign(env,{MEMBERSHIP_ROLE_SETTLEMENT_ENABLED:'true',DISCORD_APP_ID:BOT227,DISCORD_BOT_TOKEN:'fixture-only'});await snapshot();let landed=false;
  putAfter227=()=>{putAfter227=null;landed=true;env.VERIFY_MEMBERSHIP_ONLY='false';};reply=await invoke(code);
  check('mode changing after landed PUT remains unknown rather than claiming rollback',landed&&ROLE_ADDS.length===1&&reply.status===503&&reply.body.result==='outcome_unknown'&&db.prepare("SELECT COUNT(*) n FROM role_settlements WHERE attempts=1 AND state IN('dispatching','unknown')").get().n===1);
  env.VERIFY_MEMBERSHIP_ONLY='true';reply=await invoke(code);
  check('consumed code cannot re-dispatch a spent or unknown membership PUT',ROLE_ADDS.length===1&&reply.body.result==='no_pending');db.close();
  code=await fresh();await snapshot();await env.DB.prepare("UPDATE roster_snapshots SET source='addon'").run();
  await env.DB.prepare('INSERT INTO members(discord_id) VALUES(?1) ON CONFLICT DO NOTHING').bind(A).run();
  await env.DB.prepare("INSERT INTO characters(name_key,name,discord_id,status,bound_at,guid)VALUES('fern melder','Fern Melder',?1,'member',?2,'Player-4613-12345678')").bind(A,T).run();
  const unscopedRestore=await load('./roles').grantMemberRole(env,A,'synthetic restore','status',undefined,undefined,{subjectGeneration:null});
  check('ordinary central restore cannot bypass configured native provenance',unscopedRestore==='held'&&ROLE_ADDS.length===0);db.close();
  code=await fresh();env.VERIFY_MEMBERSHIP_ONLY='false';reply=await invoke(code);
  check('explicit legacy admission retains its separately authorized workflow',reply.body.result==='verified'&&VERIFIED.length===1);db.close();
  globalThis.Date=RealDate;crypto.getRandomValues=realRandom;
  console.log(ok+'/'+n+' launch membership mode checks passed');process.exitCode=ok===n?0:1;
})().catch(error=>{console.error(error);process.exitCode=1;});`;
const module227 = new Module227(__filename, module);
module227.filename = __filename;
module227.paths = module.paths;
const fixture227=parent227.slice(0,cuts227[0].index).replace(native227,"  return entry.originalNativePort(db,{beforeBatch:plan=>nativeBefore227?.(plan),afterBatch:plan=>nativeAfter227?.(plan)});");
module227._compile('let nativeBefore227=null,nativeAfter227=null;\n'+fixture227 + checks227, __filename);
