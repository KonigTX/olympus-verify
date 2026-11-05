// The real pending/native ingest path mints the capability. This component suite
// observes it at the existing role writer; it does not qualify the new runtime
// venue or claim canonical-layout activation of the physical shared role.
'use strict';
const fs230=require('node:fs'),path230=require('node:path'),{Module:Module230}=require('node:module');
const parent230=fs230.readFileSync(path230.join(__dirname,'hardening_test.cjs'),'utf8');
const cuts230=[...parent230.matchAll(/^\(async \(\) => \{/gm)],native230='  return entry.originalNativePort(db);';
if(cuts230.length!==1||parent230.split(native230).length!==2)throw Error('original_consumed230_fixture_boundary_changed');
const body230=String.raw`
(async()=>{
  const assert230=require('node:assert/strict'),crypto230=require('node:crypto');
  const gate230=load('./launch-verification227'),source230=load('./ingest'),roles230=load('./roles');
  const scope230={version:1,guild:'OLYMPUS PRIME',realm:'Fixture Live Realm'};
  let db230,env230,calls230=[],writerHook230=null;
  roles230.grantMemberRole=async(env,id,_reason,_origin,_hints,_budget,selection)=>{
    const cap=selection?.originalConsumed230;calls230.push({env,id,cap});
    if(cap){source230.assertConsumed230Original(env,cap);await writerHook230?.(env,cap);}
    return 'held';
  };
  async function fresh230(mode='enabled',pendingFor=120){
    db230=freshDb();reset();nativeAfter230=null;calls230=[];writerHook230=null;
    env230=directEnv({DB:d1(db230),PUBLIC_BASE_URL:'https://verify.example',VERIFY_SECRET:SECRET,ROLE_GUILD_MEMBER:'1552077551839617104',
      GUILD_ID:'236932545793490944',ADMISSION_MODE:'auto',OFFICER_CHARACTERS:'Fern Melder',ROSTER_MAX_SHRINK_PCT:'10',ROSTER_MIN_MEMBERS:'0',
      REQUEST_CODES:'on',VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:JSON.stringify(scope230),MEMBERSHIP_ROLE_SETTLEMENT_ENABLED:'true',
      ...(mode===undefined?{}:{SHARED_MEMBERSHIP230_MODE:mode})});
    await env230.DB.prepare("INSERT INTO pending(discord_id,name_key,name,created_at,expires_at,nonce) VALUES(?1,'','',?2,?3,'M2X')").bind(A,T,T+pendingFor).run();
    await roster.ingestRoster(env230,T,[{name:'Fern Melder',guid:'Player-4613-12345678',rank:'Member',rankIndex:7}],gate230.captureLaunchVerification(env230).scope.provenance);
    return codes.ticketFor(SECRET,'M2X',day());
  }
  function proof230(code){const scopeHash=crypto230.createHash('sha256').update('native-scope|1|'+scope230.guild+'|'+scope230.realm).digest('hex').slice(0,16);
    return {version:1,member:true,observedAt:T,scopeHash,mac:crypto230.createHmac('sha256',SECRET).update('membership|1|fern melder|Player-4613-12345678|'+code+'|1|'+T+'|'+scopeHash).digest('hex').slice(0,32)};}
  const invoke230=code=>source230.postVerify(env230,{character:'Fern Melder',code,source:'whisper',guid:'Player-4613-12345678',nativeMembership:proof230(code)});
  const pendingPlan230=plan=>plan.some(p=>/^UPDATE pending SET consumed_at =/.test(p.statement));
  let code230=await fresh230(),facts230,p230;
  writerHook230=async(env,cap)=>{
    facts230=source230.consumed230Facts(cap);
    check('capability binds original requester, absent generation, pending and branded native source',facts230.subject===A&&facts230.subjectGeneration===null&&facts230.pendingId===db230.prepare('SELECT id FROM pending').get().id&&facts230.source.guid==='Player-4613-12345678'&&facts230.source.nameKey==='fern melder');
    check('original database acknowledgement supplies consumed time and admission clock',facts230.consumedAt===T&&facts230.admittedAt===T&&db230.prepare('SELECT consumed_at FROM pending').get().consumed_at===T);
    check('deadline keeps the earlier original pending expiry instead of renewing to five minutes',facts230.pendingExpiresAt===T+120&&facts230.deadline===T+120&&/^[0-9a-f]{64}$/.test(facts230.fingerprint));
    p230=source230.consumed230Predicate(env,cap,4);
    const bound=await env.DB.prepare('SELECT ('+p230.sql+') AS matched').bind(null,null,null,...p230.values).first();
    check('offset predicate consumes exact real pending, member link, generation and native snapshot',bound.matched===1&&p230.next===23&&p230.values.length===19);
    assert230.throws(()=>source230.consumed230Facts({...cap}));check('copying an opaque token cannot reconstruct original acknowledgement',true);
    assert230.throws(()=>source230.assertConsumed230Original({...env,DB:env230.DB},cap));check('equal-looking original ordinary DB cannot replace cached custody alias',true);
    assert230.throws(()=>source230.assertConsumed230Original({...env,GUILD_ID:B},cap));check('effect environment cannot replace fixed original guild selection',true);
    for(const key of ['PRIVACY_ERASURE_ENABLED','PRIVACY_NATIVE_ERASURE_ENABLED','MEMBERSHIP_ROLE_SETTLEMENT_ENABLED','QR_PHASE1_ENABLED','DISCORD_APP_ID','DISCORD_BOT_TOKEN','BLOCKING_ROLE_IDS']){
      assert230.throws(()=>source230.assertConsumed230Original({...env,[key]:'synthetic-changed-selection'},cap));
      check('effect environment cannot adopt a replacement '+key,true);
    }
    let getterCalls=0;const accessor={...env};Object.defineProperty(accessor,'DB',{get(){getterCalls++;return env.DB;}});
    assert230.throws(()=>source230.assertConsumed230Original(accessor,cap));check('effect DB accessor is rejected without invoking it',getterCalls===0);
  };
  let reply230=await invoke230(code230);
  check('real consumed pending/native batch reaches one private original capability',reply230.status===200&&reply230.body.result==='member'&&calls230.length===1&&!!calls230[0].cap);
  const first230=calls230[0];if(!first230?.cap)throw Error('original consumed positive path did not mint');
  check('role hold is separate from confirmed membership and never advertised as a grant',reply230.body.roleOutcome==='held'&&reply230.body.roleGranted===false&&reply230.body.pendingConsumed===true&&reply230.body.inviteQueued===false&&ROLE_ADDS.length===0);
  assert230.throws(()=>source230.assertConsumed230Original(first230.env,first230.cap));
  assert230.throws(()=>source230.consumed230Facts(first230.cap));
  assert230.throws(()=>source230.consumed230Predicate(first230.env,first230.cap));
  check('completed invocation revokes the retained actual capability before any later call',true);
  const before230=calls230.length;reply230=await invoke230(code230);check('consumed code cannot mint another capability',reply230.body.result==='no_pending'&&calls230.length===before230);
  await env230.DB.prepare('UPDATE pending SET nonce=?1').bind('P7K').run();
  const changed230=await first230.env.DB.prepare('SELECT ('+p230.sql+') AS matched').bind(null,null,null,...p230.values).first();
  check('changed pending fingerprint fails consuming SQL instead of adopting replacement',changed230.matched===0);db230.close();
  code230=await fresh230('off');reply230=await invoke230(code230);
  check('OFF mode confirms membership without minting new grant authority',reply230.body.result==='member'&&calls230.length===1&&!calls230[0].cap&&ROLE_ADDS.length===0);db230.close();
  code230=await fresh230();let landed230=false;
  nativeAfter230=plan=>{if(pendingPlan230(plan)){nativeAfter230=null;landed230=true;throw Error('synthetic lost original consuming ACK');}};
  reply230=await invoke230(code230);
  check('lost committed pending ACK stays unknown with no reconstructed capability or role call',landed230&&reply230.status===503&&reply230.body.result==='outcome_unknown'&&calls230.length===0&&db230.prepare('SELECT consumed_at FROM pending').get().consumed_at===T);db230.close();
  code230=await fresh230();let modeChanged230=false;
  nativeAfter230=plan=>{if(pendingPlan230(plan)){nativeAfter230=null;modeChanged230=true;env230.SHARED_MEMBERSHIP230_MODE='off';}};
  reply230=await invoke230(code230);
  check('entry mode changing after consumed batch cannot mint against replacement selection',modeChanged230&&reply230.body.result==='member'&&calls230.length===1&&!calls230[0].cap&&reply230.body.roleGranted===false);db230.close();
  code230=await fresh230();let graph230=null;
  nativeAfter230=(plan,out)=>{if(pendingPlan230(plan)){nativeAfter230=null;graph230=out.find(r=>r.results?.some(row=>Object.hasOwn(row,'admitted_at')));}};
  writerHook230=async(env,cap)=>{graph230.meta.changes=2;assert230.throws(()=>source230.assertConsumed230Original(env,cap));};
  reply230=await invoke230(code230);
  check('original native result graph drift is detected after mint across later writer awaits',!!graph230&&reply230.body.roleGranted===false&&ROLE_ADDS.length===0);db230.close();
  console.log(ok+'/'+n+' original consumed230 Native issuer checks passed');process.exitCode=ok===n?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});`;
const fixture230=parent230.slice(0,cuts230[0].index).replace(native230,'  return entry.originalNativePort(db,{afterBatch:(plan,out)=>nativeAfter230?.(plan,out)});');
const runner230=new Module230(__filename,module);runner230.filename=__filename;runner230.paths=module.paths;
runner230._compile('let nativeAfter230=null;\n'+fixture230+body230,__filename);
