// Real Worker host/auth routing and Native fixture; fake credentials, no network.
const fs227=require('node:fs'),path227=require('node:path'),{Module:Module227}=require('node:module');
const source227=fs227.readFileSync(path227.join(__dirname,'guild_seats_test.cjs'),'utf8'),cuts227=[...source227.matchAll(/^\(async \(\) => \{/gm)];
if(cuts227.length!==1)throw Error('maintained Worker health fixture boundary changed');
const tests227=String.raw`
(async()=>{
  const scope=JSON.stringify({version:1,guild:'Olympus',realm:'Fixture Live Realm'});
  for(const [label,over,wanted]of[
    ['legacy',{}, {mode:'legacy',nativeScopePinned:false,nativeMembershipProofVersion:1}],
    ['selected',{VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:scope},{mode:'members-only',nativeScopePinned:true,nativeMembershipProofVersion:1}],
    ['unconfirmed',{VERIFY_MEMBERSHIP_ONLY:'true'},{mode:'held',nativeScopePinned:false,nativeMembershipProofVersion:1}],
    ['unaffiliated',{VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:JSON.stringify({version:1,guild:'Other Guild',realm:'Fixture Live Realm'})},{mode:'held',nativeScopePinned:false,nativeMembershipProofVersion:1}],
  ]){
    fresh();const response=await indexMod.default.fetch(new Request('https://verify.example/health',{headers:{Authorization:'Bearer watcher-token-for-tests-only-0123456789'}}),env(over),ctx),body=await response.json();
    check(label+' private health carries exact current verification capability',response.status===200&&JSON.stringify(body.verification)===JSON.stringify(wanted));
    check(label+' capability reveals no native guild, realm, key or token',Object.keys(body.verification).sort().join(',')==='mode,nativeMembershipProofVersion,nativeScopePinned');
    const publicResponse=await indexMod.default.fetch(new Request('https://verify.example/health'),env(over),ctx),publicBody=await publicResponse.json();
    check(label+' public health remains only ok/build/d1',publicResponse.status===200&&Object.keys(publicBody).sort().join(',')==='build,d1,ok'&&!Object.hasOwn(publicBody,'verification'));
    const bad=await indexMod.default.fetch(new Request('https://verify.example/health',{headers:{Authorization:'Bearer invalid-fixture-only'}}),env(over),ctx),badBody=await bad.json();
    check(label+' invalid bearer cannot read verification capability',!Object.hasOwn(badBody,'verification'));
  }
  fresh();let databaseTouches=0;
  const configured=env({VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:scope,PRIVACY_RECOVERY_FLOOR:{},PRIVACY_SERVING_GATE_SECRET:'fixture-gate-secret-not-live-0123456789',PRIVACY_CREDENTIAL_EPOCH:'b'.repeat(32),PRIVACY_SERVING_SOURCE_TREE:'c'.repeat(40),PRIVACY_SERVING_DATABASE_ID:'fixture-database-id'});
  configured.DB={prepare(){databaseTouches++;throw Error('health must not touch Native D1');},batch(){databaseTouches++;throw Error('health must not touch Native D1');}};
  check('fixture selects the actual configured-mode early health branch',load('./privacy-global-serving-origin').globalServingMode(configured)==='configured');
  for(const [label,headers,privateRead]of[['private',{Authorization:'Bearer watcher-token-for-tests-only-0123456789'},true],['public',{},false],['invalid bearer',{Authorization:'Bearer invalid-fixture-only'},false]]){
    const response=await indexMod.default.fetch(new Request('https://verify.example/health',{headers}),configured,ctx),body=await response.json();
    check('configured-mode '+label+' health returns without D1',response.status===200&&body.d1==='not_checked'&&databaseTouches===0);
    check('configured-mode '+label+' capability preserves bearer boundary',privateRead?body.verification?.mode==='members-only'&&body.verification.nativeScopePinned===true&&body.verification.nativeMembershipProofVersion===1:Object.keys(body).sort().join(',')==='build,d1,ok');
  }
  for(const[label,over,officer,wantedStatus,presenceOnly]of[
    ['pinned named host',{VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:scope},'Fern Melder',200],
    ['pinned unnamed legacy host',{VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:scope},'',200],
    ['unconfirmed scope',{VERIFY_MEMBERSHIP_ONLY:'true'},'Fern Melder',503],
    ['malformed scope',{VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:'{invalid'},'Fern Melder',503],
    ['foreign guild scope',{VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:JSON.stringify({version:1,guild:'Other Guild',realm:'Fixture Live Realm'})},'Fern Melder',503],
    ['beta realm scope',{VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:JSON.stringify({version:1,guild:'Olympus',realm:'Classic Beta PvP 2'})},'Fern Melder',503],
    ['malformed selected mode',{VERIFY_MEMBERSHIP_ONLY:true,VERIFY_NATIVE_SCOPE:scope},'Fern Melder',503],
    ['explicit read-only legacy host',{VERIFY_MEMBERSHIP_ONLY:'false'},'Fern Melder',200,true],
    ['explicit read-only absent mode',{},'Fern Melder',200,true],
    ['explicit read-only held scope',{VERIFY_MEMBERSHIP_ONLY:'true'},'Fern Melder',503,true],
  ]){
    fresh();await queued(QUINN,'Retained Queue Member');const originalQueue=JSON.stringify(one('SELECT * FROM invite_queue'));
    let queueTouches=0;const queueEnv=env({...over,SET_GUILD_NOTE:'true'});
    queueEnv.DB=new Proxy({},{get(){queueTouches++;throw Error('restricted queue must not read, write or claim D1');}});
    const response=await ingest.getQueue(queueEnv,officer,presenceOnly),body=await response.json();
    check(label+' queue has exact presence-only or held response',response.status===wantedStatus&&(wantedStatus===200?JSON.stringify(body)===JSON.stringify({presenceOnly:true,entries:[],setGuildNote:false}):JSON.stringify(body)===JSON.stringify({error:'verification_configuration_held'})));
    check(label+' queue never touches D1 or changes retained invite bytes',queueTouches===0&&JSON.stringify(one('SELECT * FROM invite_queue'))===originalQueue);db.close();
  }
  for(const[label,over]of[['absent mode',{}],['explicit legacy',{VERIFY_MEMBERSHIP_ONLY:'false',VERIFY_NATIVE_SCOPE:scope}]]){
    fresh();await queued(QUINN,'Retained Queue Member');const response=await ingest.getQueue(env(over),'Officer Olly'),body=await response.json(),retained=one('SELECT * FROM invite_queue');
    check(label+' retains the actual legacy invitation response',response.status===200&&!Object.hasOwn(body,'presenceOnly')&&body.entries.length===1&&body.entries[0].character==='Retained Queue Member'&&body.officer==='Officer Olly');
    check(label+' retains the actual legacy officer claim',retained.claimed_by==='Officer Olly'&&retained.claimed_at===T&&retained.status==='queued');db.close();
  }
  for(const[label,query,readOnly]of[
    ['explicit presence-only','&presenceOnly=1',true],['ambiguous duplicate includes read-only','&presenceOnly=0&presenceOnly=1',true],
    ['rollback-fenced presence-only','&presenceOnly=1&keyVersion=launch-membership-v1',true],
    ['ordinary legacy poll','',false],['explicit zero legacy poll','&presenceOnly=0',false],
  ]){
    fresh();await queued(QUINN,'Retained Queue Member');const originalQueue=JSON.stringify(one('SELECT * FROM invite_queue'));let inviteQueueTouches=0;const deferred=[];
    FAULT=(sql)=>{if(/\binvite_queue\b/i.test(sql)){inviteQueueTouches++;if(readOnly)throw Error('presence-only route touched retained invitation SQL');}return false;};
    const routeContext={waitUntil(promise){deferred.push(promise);}};
    const response=await indexMod.default.fetch(new Request('https://verify.example/queue?officer=Officer%20Olly'+query,{headers:{Authorization:'Bearer watcher-token-for-tests-only-0123456789'}}),env({VERIFY_MEMBERSHIP_ONLY:'false'}),routeContext),body=await response.json();
    await Promise.allSettled(deferred);FAULT=null;const retained=one('SELECT * FROM invite_queue');
    check(label+' survives actual legacy Worker auth/route with correct response',response.status===200&&(readOnly?JSON.stringify(body)===JSON.stringify({presenceOnly:true,entries:[],setGuildNote:false}):!Object.hasOwn(body,'presenceOnly')&&body.entries.length===1&&body.entries[0].character==='Retained Queue Member'));
    check(label+' preserves the requested invitation claim boundary',readOnly?inviteQueueTouches===0&&JSON.stringify(retained)===originalQueue:inviteQueueTouches>0&&retained.claimed_by==='Officer Olly'&&retained.claimed_at===T);
    check(label+' preserves the requested queue-driven deferral boundary',readOnly?deferred.length===0:deferred.length>0);db.close();
  }
  const selected={VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:scope};
  // .248: the outer fetch wrapper must preserve cache-only intent after route() returns.
  fresh();await queued(QUINN,'Cached Verified Member');
  await run("UPDATE characters SET status='member',guid='Player-6931-00732934' WHERE discord_id=?1",QUINN);
  const cacheQueueBefore=JSON.stringify(one('SELECT * FROM invite_queue')),cacheRelaysBefore=JSON.stringify(db.prepare('SELECT * FROM relays ORDER BY officer_id').all()),cacheRolesBefore=JSON.stringify(db.prepare('SELECT * FROM role_settlements ORDER BY id').all());
  let cacheReads=0,cacheInviteOrRelaySql=0;const cacheDeferred=[];REST=[];FETCHES=[];NOTICES=[];STAFF=[];
  FAULT=(sql)=>{if(/FROM characters c WHERE c\.status='member'/.test(sql))cacheReads++;if(/\b(?:invite_queue|relays)\b/i.test(sql)){cacheInviteOrRelaySql++;throw Error('cache-only fetch reached invitation or relay SQL');}return false;};
  const cacheResponse=await indexMod.default.fetch(new Request('https://verify.example/queue?cacheOnly242=1&keyVersion=launch-membership-v1',{headers:{Authorization:'Bearer watcher-token-for-tests-only-0123456789'}}),env(selected),{waitUntil(promise){cacheDeferred.push(promise);}}),cacheBody=await cacheResponse.json();
  await Promise.allSettled(cacheDeferred);FAULT=null;
  check('cache-only actual fetch returns the server-read cache without an invitation response',cacheResponse.status===200&&cacheBody.presenceOnly===true&&cacheBody.setGuildNote===false&&cacheBody.entries.length===0&&!Object.hasOwn(cacheBody,'officer')&&cacheBody.verificationResults.length===1&&cacheBody.verificationResults[0].character==='Cached Verified Member'&&cacheBody.verificationResults[0].status==='pending-role');
  check('cache-only actual fetch allows cache SELECT but never invitation or relay SQL',cacheReads>0&&cacheInviteOrRelaySql===0&&JSON.stringify(one('SELECT * FROM invite_queue'))===cacheQueueBefore&&JSON.stringify(db.prepare('SELECT * FROM relays ORDER BY officer_id').all())===cacheRelaysBefore);
  check('cache-only actual fetch registers zero background role work or Discord effects',cacheDeferred.length===0&&REST.length===0&&FETCHES.length===0&&NOTICES.length===0&&STAFF.length===0);
  check('cache-only actual fetch leaves every existing role settlement unchanged',JSON.stringify(db.prepare('SELECT * FROM role_settlements ORDER BY id').all())===cacheRolesBefore);db.close();
  for(const[label,method,path,body,over]of[
    ['marker without presence intent','GET','/queue?keyVersion=launch-membership-v1',null,{}],
    ['marker with explicit zero presence','GET','/queue?presenceOnly=0&keyVersion=launch-membership-v1',null,{}],
    ['duplicate identical marker','GET','/queue?presenceOnly=1&keyVersion=launch-membership-v1&keyVersion=launch-membership-v1',null,{}],
    ['duplicate conflicting marker','GET','/queue?presenceOnly=1&keyVersion=launch-membership-v1&keyVersion=3',null,selected],
    ['historical unsupported version','GET','/queue?presenceOnly=1&keyVersion=3',null,selected],
    ['malformed marker','GET','/queue?presenceOnly=1&keyVersion=launch-membership-v1%20',null,selected],
    ['other queue route','GET','/queue/unverified?presenceOnly=1&keyVersion=launch-membership-v1',null,selected],
    ['written acknowledgement route','POST','/queue/written?keyVersion=launch-membership-v1',{ids:[]},selected],
    ['legacy verify receiver','POST','/ingest/verify?keyVersion=launch-membership-v1',{},{}],
    ['legacy roster receiver','POST','/ingest/roster?keyVersion=launch-membership-v1',{},{}],
    ['legacy events receiver','POST','/ingest/events?keyVersion=launch-membership-v1',{events:[]},{}],
    ['unconfirmed native receiver','POST','/ingest/events?keyVersion=launch-membership-v1',{events:[]},{VERIFY_MEMBERSHIP_ONLY:'true'}],
    ['unknown ingest route','POST','/ingest/other?keyVersion=launch-membership-v1',{},selected],
    ['body marker with exact query marker','POST','/ingest/events?keyVersion=launch-membership-v1',{events:[],keyVersion:'launch-membership-v1'},selected],
    ['historical body-only key version','POST','/queue/written',{ids:[],keyVersion:3},{}],
  ]){
    fresh();await queued(QUINN,'Retained Queue Member');const before=JSON.stringify(one('SELECT * FROM invite_queue'));let queueSql=0;
    FAULT=(sql)=>{if(/\binvite_queue\b/i.test(sql)){queueSql++;throw Error('unsupported marker reached invitation SQL');}return false;};
    const response=await indexMod.default.fetch(new Request('https://verify.example'+path,{method,headers:{Authorization:'Bearer watcher-token-for-tests-only-0123456789',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})}),env(over),ctx),answer=await response.json();FAULT=null;
    check(label+' remains unsupported before route effects',response.status===400&&answer.error==='unsupported_protocol'&&queueSql===0&&JSON.stringify(one('SELECT * FROM invite_queue'))===before);db.close();
  }
  for(const[path,body,wantedStatus,wantedBody]of[
    ['/ingest/verify',{},400,{error:'character and code required'}],
    ['/ingest/roster',{},409,{error:'native_roster_scope_mismatch'}],
    ['/ingest/events',{events:[]},200,{applied:0}],
  ]){
    fresh();const response=await indexMod.default.fetch(new Request('https://verify.example'+path+'?keyVersion=launch-membership-v1',{method:'POST',headers:{Authorization:'Bearer watcher-token-for-tests-only-0123456789','Content-Type':'application/json'},body:JSON.stringify(body)}),env(selected),ctx),answer=await response.json();
    check('exact marker reaches selected '+path+' and preserves its own validation',response.status===wantedStatus&&JSON.stringify(answer)===JSON.stringify(wantedBody));db.close();
  }
  globalThis.Date=RealDate;console.log(ok+'/'+n+' launch health capability checks passed');process.exitCode=ok===n?0:1;
})().catch(error=>{console.error(error);process.exitCode=1;});`;
const compiled227=new Module227(__filename,module);compiled227.filename=__filename;compiled227.paths=module.paths;compiled227._compile(source227.slice(0,cuts227[0].index)+tests227,__filename);
