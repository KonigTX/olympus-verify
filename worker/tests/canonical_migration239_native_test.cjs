// Real admitted Native source/schema. Only Discord is synthetic. The inherited
// Node fixture advances business and SQL clocks together; Workerd separately
// qualifies natural DB time, races, physical counts and the full erasure API.
'use strict';
const fs239=require('node:fs'),path239=require('node:path'),{Module:Module239}=require('node:module');
const file239=path239.join(__dirname,'canonical_migration233_native_test.cjs');let source239=fs239.readFileSync(file239,'utf8');
const start239=' await setup233();let r=await run233();',end239=" console.log(ok+'/'+n+' canonical233 migration Native checks passed');process.exitCode=ok===n?0:1;";
if(source239.split(start239).length!==2||source239.split(end239).length!==2)throw Error('migration239_original_fixture_boundary');
const body239=String.raw`
 const N=load('./native-rank-reconciliation232'),Q=load('./qr-phase1-data');
 // Isolated adapter-unit SQLite tables only; no role row, admission trigger or
 // production schema is changed. The source/native cases below remain real.
 {
  const adapterDb239=new DatabaseSync(':memory:');let executed239=0,overwrite239=false,overwritten239=0;const before239=[];
  adapterDb239.exec('CREATE TABLE adapter239(id INTEGER PRIMARY KEY,value INTEGER NOT NULL);CREATE TABLE adapter239_trace(id INTEGER NOT NULL);CREATE TRIGGER adapter239_insert AFTER INSERT ON adapter239 BEGIN INSERT INTO adapter239_trace(id)VALUES(NEW.id);END;');
  const adapter239=entry.originalNativePort(adapterDb239,{beforeRun(sql){before239.push(sql);},readStatement(statement,params){executed239++;return statement.all(...params);},afterRead(){if(overwrite239){overwrite239=false;overwritten239++;adapterDb239.prepare('INSERT INTO adapter239(id,value)VALUES(4,40),(5,50)').run();}}});
  const native239=async sql=>(await adapter239.batch([adapter239.prepare(sql)]))[0];
  try{
   for(const [label,sql,id] of [
    ['plain INSERT','INSERT INTO adapter239(id,value)VALUES(1,10)RETURNING id,value',1],
    ['WITH INSERT','WITH source(id,value)AS(VALUES(2,20))INSERT INTO adapter239 SELECT id,value FROM source RETURNING id,value',2],
    ['plain UPDATE','UPDATE adapter239 SET value=value+1 WHERE id=1 RETURNING id,value',1],
    ['WITH UPDATE','WITH chosen(id)AS(VALUES(2))UPDATE adapter239 SET value=value+1 WHERE id IN(SELECT id FROM chosen)RETURNING id,value',2],
    ['plain DELETE','DELETE FROM adapter239 WHERE id=1 RETURNING id,value',1],
    ['WITH DELETE','WITH chosen(id)AS(VALUES(2))DELETE FROM adapter239 WHERE id IN(SELECT id FROM chosen)RETURNING id,value',2],
   ]){const before=executed239,result=await native239(sql);check('239 adapter '+label+' RETURNING executes once with original logical changes1',result.success&&result.meta.changes===1&&result.results.length===1&&result.results[0].id===id&&executed239===before+1);}
   check('239 adapter trigger writes do not inflate logical metadata or repeat original execution',adapterDb239.prepare('SELECT COUNT(*) n FROM adapter239_trace').get().n===2&&adapterDb239.prepare('SELECT COUNT(*) n FROM adapter239').get().n===0&&before239.length===6);
   const readStart239=before239.length,tick239=String.fromCharCode(96);
   for(const [label,sql] of [
    ['WITH SELECT after prior write','WITH source AS(SELECT 1 AS n)SELECT n FROM source'],
    ['dollar continuation name','WITH recursive$source AS(SELECT 1 AS n)SELECT n FROM recursive$source'],
    ['quoted dollar continuation name','WITH "recursive$source" AS(SELECT 1 AS n)SELECT n FROM "recursive$source"'],
    ['Unicode continuation name','WITH recursiveé AS(SELECT 1 AS n)SELECT n FROM recursiveé'],
    ['nested comments and quoted command words',"/* UPDATE fake */ WITH \"UPDATE\"(\"DELETE\")AS MATERIALIZED(SELECT 'INSERT /* () */ DELETE'),nested AS(WITH \"INSERT\" AS(SELECT 'it''s DELETE )' AS v)SELECT v FROM \"INSERT\")SELECT q.\"DELETE\",nested.v FROM \"UPDATE\" q,nested -- DELETE fake"],
    ['backtick and bracket identifiers','WITH '+tick239+'UPDATE'+tick239+' AS(SELECT 1 AS [DELETE])SELECT [DELETE] FROM '+tick239+'UPDATE'+tick239],
    ['recursive read','WITH RECURSIVE source(n)AS(SELECT 1 UNION ALL SELECT n+1 FROM source WHERE n<2)SELECT SUM(n)AS n FROM source'],
   ]){const before=executed239,result=await native239(sql);check('239 adapter '+label+' stays SELECT changes0 with no write hook',result.success&&result.meta.changes===0&&result.results.length===1&&executed239===before+1&&before239.length===readStart239);}
   overwrite239=true;const overwritten=await native239('INSERT INTO adapter239(id,value)VALUES(3,30)RETURNING id');
   check('239 adapter captures changes before afterRead can replace the SQLite last-change count',overwritten.meta.changes===1&&overwritten.results.length===1&&overwritten.results[0].id===3&&overwritten239===1&&adapterDb239.prepare('SELECT changes() n').get().n===2&&adapterDb239.prepare('SELECT COUNT(*) n FROM adapter239_trace').get().n===5);
   const legacyHook239=before239.length;await native239('PRAGMA user_version');await native239('/* ordinary historical SELECT hook */ SELECT 77 AS n');
   check('239 adapter preserves original non-WITH PRAGMA and commented-SELECT beforeRun behavior',before239.length===legacyHook239+2&&before239[legacyHook239]==='PRAGMA user_version');
   const bounded239=executed239;let refused239=0;for(const sql of ['SELECT '+' '.repeat(1000000),"WITH source AS(SELECT 'unclosed)SELECT 1"]){try{await native239(sql);}catch(e){if(/entry Native SQL command/.test(String(e)))refused239++;}}
   check('239 adapter command scan is bounded and malformed quoted CTEs never execute',refused239===2&&executed239===bounded239);
  }finally{adapterDb239.close();}
 }
 const generation239='6'.repeat(32),legacy239=N.MIRROR_BY_NAME232['Raid Leader'],veteran239=C.CANONICAL_RANKS233[7].roleId;
 let operation239=16;
 const reservations239=()=>rows().filter(r=>r.purpose==='canonical_migration_reservation239');
 const roleDeletes239=()=>rows().filter(r=>r.purpose==='canonical_migration_remove233');
 const originalREST239=stubs['./discord'].rest;
 stubs['./discord'].rest=async(e,method,p,...args)=>{if((method==='PUT'||method==='DELETE')&&options.beforeDispatchClock239!==undefined){T=options.beforeDispatchClock239;delete options.beforeDispatchClock239;}return originalREST239(e,method,p,...args);};
 async function activate239(){await env.DB.prepare("INSERT INTO privacy_subjects(subject_id,generation,state,revision,created_at,updated_at)VALUES(?1,?2,'active',1,?3,?3)").bind(A,generation239,T).run();}
 async function plan239(roles,to=target,generation=generation239){
  env={...env,NATIVE_RANK_SYNC232:'off',QR_NATIVE_ROLE_MAP:'off',FULL_RELEASE_ROLES:'off',CANONICAL_RANKS233:policy233()};
  const v=await venue.captureRuntimeVenue230(env);if(v.mode!=='enabled')throw Error('239_original_venue_held');const f=venue.runtimeVenue230Facts(v.venue);
  const plan={version:1,profile:M.CANONICAL_MIGRATION_PROFILE233,guildId:G,operationId:(++operation239).toString(16).padStart(32,'0'),epoch:f.epoch,seal:h(f.sealJSON),sourceTree:'2'.repeat(40),policySHA256:h(env.CANONICAL_RANKS233),packetSHA256:'3'.repeat(64),issuedAt:T,expiresAt:T+120,entries:[{subject:A,generation,currentRoles:roles.filter(r=>M.CANONICAL_MIGRATION_ROLE_IDS233.includes(r)).sort(),targetRole:to}]};
  env.CANONICAL_MIGRATION233=JSON.stringify(plan);env.CANONICAL_MIGRATION_SOURCE_TREE233=plan.sourceTree;http=[];return plan;
 }
 async function setup239(roles=[R,alias],options239={}){await setup233(roles,{},options239);await activate239();return plan239(roles);}
 async function visit239(){const cap=await I.captureRoutineMembership232(env,A);if(!cap)throw Error('239_actual_routine_issuer_held');try{const effect=I.routineMembership232Environment(env,cap),v=await venue.captureRuntimeVenue230(env);if(v.mode!=='enabled')throw Error('239_actual_routine_venue_held');return await central.reconcileCanonicalRanks233(effect,cap,v.venue,{limit:40,attempts:0,retries:0});}finally{I.closeRoutineMembership232(cap);}}
 async function originalLegacy239(){
  const code=await fresh();await activate239();const verified=await invoke(code);if(!verified.body.roleGranted)throw Error('239_original_verify_failed');
  env={...env,NATIVE_RANK_SYNC232:JSON.stringify({version:1,enabled:true,profile:N.NATIVE_RANK_PROFILE232,guildId:G,nativeGuild:scope.guild,nativeRealm:scope.realm,membershipRole:R,ranks:N.NATIVE_RANK_NAMES232.map((name,index)=>({index,name,roleId:name==='Stewart'?N.NATIVE_STEWART_ROLE232:N.MIRROR_BY_NAME232[name]})),privileged:false})};
  await env.DB.prepare("UPDATE roster_members SET rank='Raid Leader',rank_index=5").run();
  const cap=await I.captureRoutineMembership232(env,A);if(!cap)throw Error('239_legacy_issuer_held');try{const effect=I.routineMembership232Environment(env,cap),v=await venue.captureRuntimeVenue230(env);if(v.mode!=='enabled')throw Error('239_legacy_venue_held');const b={limit:40,attempts:0,retries:0};await central.queueAndSettleRoutineMembership232(effect,cap,v.venue,b);const r=await central.reconcileNativeRanks232(effect,cap,v.venue,b);if(r.state!=='settled'||!present.includes(legacy239))throw Error('239_original_legacy_put_failed');}finally{I.closeRoutineMembership232(cap);}
  const grant=rows().find(r=>r.role_id===legacy239&&r.desired===1&&r.attempts===1&&r.reason==='native232_put_acknowledged_and_confirmed');if(!grant)throw Error('239_original_legacy_receipt_missing');return {code,grant};
 }
 async function twoM239(){await setup239([]);let r=await run233();if(r.state!=='settled')throw Error('239_first_original_m_failed');const original=rows().find(x=>x.purpose==='canonical_migration233'&&x.role_id===target);T++;await plan239([target],veteran239);r=await run233();if(r.state!=='settled')throw Error('239_second_original_m_failed');return {original,negative:roleDeletes239().find(x=>x.role_id===target),target:rows().find(x=>x.purpose==='canonical_migration233'&&x.role_id===veteran239)};}
 async function pendingFrom239(){const original=await originalLegacy239();T++;await plan239(present,C.CANONICAL_RANKS233[4].roleId);let refused=false;batchHook=()=>{if(!refused&&rows().some(x=>x.role_id===legacy239&&x.purpose==='canonical_routine233'&&x.state==='pending'&&x.attempts===0)){refused=true;options.notBot=true;}};try{await visit239();}finally{batchHook=null;options.notBot=false;}const pending=rows().find(x=>x.role_id===legacy239&&x.purpose==='canonical_routine233'&&x.state==='pending'&&x.attempts===0);if(!refused||!pending||pending.request_digest!==original.grant.id)throw Error('239_original_pending_fixture_failed');return {...original,pending};}

 await setup239();let r=await run233(),marker=reservations239()[0];
 if(r.state!=='settled'||r.coordination.originalCreateTuple===null||r.coordination.originalReleaseTuple===null)console.error('SYNTHETIC239_FIRST_M_DIAGNOSTIC '+JSON.stringify({state:String(r.state).slice(0,32),reason:String(r.reason).slice(0,120),create:String(r.coordination.create).slice(0,32),release:String(r.coordination.release).slice(0,32),originalCreateCaptured:r.coordination.originalCreateTuple!==null,originalReleaseCaptured:r.coordination.originalReleaseTuple!==null,rolePUTs:put(),roleDELETEs:del(),ledgerRows:rows().length}));
 check('239 current-G original reservation permits target PUT before exact two DELETE ACKs',r.state==='settled'&&r.targetOwned&&r.coordination.create==='original_native_insert'&&r.coordination.release==='original_native_update'&&put()===1&&del()===2&&roleDeletes239().length===2&&rows().every(x=>x.subject_generation===generation239));
 check('239 released marker is exact bounded NONACK zero-attempt custody, not role ownership',reservations239().length===1&&marker.role_id===R&&marker.desired===0&&marker.state==='held'&&marker.reason==='canonical239_reservation_released'&&marker.attempts===0&&marker.claim_nonce===null&&marker.checked_at>=marker.created_at&&marker.native_profile===M.CANONICAL_MIGRATION_PROFILE233&&marker.proof_id===null&&marker.native_guid===null&&marker.expires_at<=marker.created_at+300);
 check('239 coordination exposes only frozen exact21 original Native create/release NONACK snapshots',r.coordination.originalCreateTuple!==null&&r.coordination.originalReleaseTuple!==null&&typeof r.coordination.originalCreateTuple==='object'&&typeof r.coordination.originalReleaseTuple==='object'&&Object.isFrozen(r.coordination.originalCreateTuple)&&Object.isFrozen(r.coordination.originalReleaseTuple)&&Object.keys(r.coordination.originalCreateTuple).join(',')===central.RETIREMENT_PARENT_FIELDS.join(',')&&Object.keys(r.coordination.originalReleaseTuple).join(',')===central.RETIREMENT_PARENT_FIELDS.join(',')&&r.coordination.originalCreateTuple.state==='pending'&&r.coordination.originalCreateTuple.checked_at===null&&r.coordination.originalReleaseTuple.state==='held'&&r.coordination.originalReleaseTuple.id===r.coordination.reservationId&&JSON.stringify(r.coordination.originalReleaseTuple)===JSON.stringify(Object.fromEntries(central.RETIREMENT_PARENT_FIELDS.map(k=>[k,marker[k]]))));
 http=[];const repeat239=await run233();check('239 deterministic existing reservation cannot be adopted on replay',repeat239.state==='held'&&http.length===0&&reservations239().length===1);db.close();

 await setup239();let lost239=false;batchHook=p=>{if(!lost239&&p.some(x=>x.statement.includes("'canonical_migration_reservation239'"))){lost239=true;throw Error('synthetic original reservation result lost');}};r=await run233();batchHook=null;marker=reservations239()[0];const lostAgain239=await run233();
 check('239 lost original reservation INSERT result is not reconstructed or retried',lost239&&r.state==='held'&&r.coordination.create==='unconfirmed'&&r.coordination.originalCreateTuple===null&&r.coordination.originalReleaseTuple===null&&lostAgain239.state==='held'&&marker.state==='pending'&&marker.attempts===0&&put()===0&&del()===0&&rows().length===1);db.close();

 await setup239();lost239=false;batchHook=p=>{if(!lost239&&p.some(x=>x.statement.includes("SET state='held',reason='canonical239_reservation_released'"))){lost239=true;throw Error('synthetic original release result lost');}};r=await run233();batchHook=null;const lostReleaseEffects239=http.filter(x=>x.method==='PUT'||x.method==='DELETE').length;const lostReleaseAgain239=await run233();
 check('239 lost release result reports unknown without recreating reservation or effect',lost239&&r.state==='unknown'&&r.coordination.release==='unconfirmed'&&r.coordination.originalCreateTuple!==null&&r.coordination.originalReleaseTuple===null&&reservations239()[0].state==='held'&&lostReleaseAgain239.state==='held'&&http.filter(x=>x.method==='PUT'||x.method==='DELETE').length===lostReleaseEffects239);db.close();

 let plan=await setup239();options.onHTTP=async(method,p)=>{if(method==='GET'&&p.endsWith('/roles'))T=plan.expiresAt;};r=await run233();
 check('239 original reservation expiry during preflight refuses all role effects and release',r.state==='held'&&put()===0&&del()===0&&reservations239()[0].state==='pending'&&r.coordination.release==='not_attempted');db.close();
 for(const boundary239 of ['expiry','rollback']){
  plan=await setup239();options.beforeDispatchClock239=boundary239==='expiry'?plan.expiresAt:plan.issuedAt-1;r=await run233();
  check('239 '+boundary239+' between last SQL result and original dispatch callback sends no role HTTP',r.state==='held'&&put()===0&&del()===0&&reservations239()[0].state==='pending'&&rows().some(x=>x.purpose==='canonical_migration233'&&x.attempts===1&&x.reason==='canonical233_migration_never_dispatched'));
  db.close();
 }

 await setup239([target,R]);await env.DB.prepare("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,attempts,created_at,expires_at,native_profile)VALUES(?1,?2,'canonical_routine233',?3,?4,0,'pending','native232_awaiting_dispatch',0,?5,?6,?7)").bind('e'.repeat(32),A,G,target,T,T+100,C.CANONICAL_PROFILE233).run();r=await run233();
 check('239 target-role pending is never included in safe FROM exception',r.state==='held'&&reservations239().length===0&&put()===0&&del()===0);db.close();
 for(const change of [{state:'unknown',attempts:0,g:'9'.repeat(32),desired:0},{state:'pending',attempts:0,g:generation239,desired:1},{state:'dispatching',attempts:1,g:generation239,desired:0}]){
  await setup239();await env.DB.prepare("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,attempts,subject_generation,created_at,expires_at)VALUES(?1,?2,'canonical_routine233',?3,?4,?5,?6,'unsafe_fixture',?7,?8,?9,?10)").bind('e'.repeat(32),A,G,alias,change.desired,change.state,change.attempts,change.g,T,T+100).run();r=await run233();
  check('239 '+change.state+'/'+change.desired+' unsafe family debt refuses reservation before effect',r.state==='held'&&reservations239().length===0&&put()===0&&del()===0);db.close();
 }
 await setup239();await env.DB.prepare("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,attempts,created_at,expires_at)VALUES(NULL,?1,'canonical_routine233',?2,?3,0,'unknown','malformed_null_id',0,?4,?5)").bind(A,G,alias,T,T+100).run();r=await run233();
 check('239 NULL ledger ID cannot escape the new physical unknown fence',r.state==='held'&&reservations239().length===0&&put()===0&&del()===0);db.close();
 for(const malformedPending239 of ['null_profile','null_profile_sibling','null_id_sibling']){
  const f=await pendingFrom239();
  if(malformedPending239==='null_profile')await env.DB.prepare('UPDATE role_settlements SET native_profile=NULL WHERE id=?1').bind(f.pending.id).run();
  else await env.DB.prepare("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,attempts,claim_nonce,subject_generation,request_digest,created_at,expires_at,checked_at,native_profile)VALUES(?1,?2,'fresh_roster_rank',?3,?4,0,'held','native232_never_dispatched',1,?5,?6,?7,?8,?9,?8,?10)").bind(malformedPending239==='null_id_sibling'?null:'d'.repeat(32),A,G,C.ADDON_DEVELOPER233.roleId,'e'.repeat(32),generation239,f.grant.id,T,T+100,malformedPending239==='null_profile_sibling'?null:N.NATIVE_RANK_PROFILE232).run();
  T++;await plan239(present,C.CANONICAL_RANKS233[4].roleId);r=await run233();
  check('239 '+malformedPending239+' is false whitelist classification and blocks reservation',r.state==='held'&&reservations239().length===0&&put()===0&&del()===0);db.close();
 }


 // .239 incoming-reference regression: these deliberately malformed fixture
 // children never supply positive custody. Original Native grant/pending rows
 // come from pendingFrom239; original deadlines are advanced past, not renewed.
 for(const incoming239 of ['foreign_null_unknown','wrong_parent_role_pending','before_parent_pending','foreign_null_grandchild']){
  const f=await pendingFrom239(),parentBytes239=JSON.stringify(rows().find(x=>x.id===f.grant.id));
  if(incoming239==='wrong_parent_role_pending')await env.DB.prepare('UPDATE role_settlements SET role_id=?1 WHERE id=?2').bind(R,f.pending.id).run();
  else if(incoming239==='before_parent_pending')await env.DB.prepare('UPDATE role_settlements SET created_at=?1,expires_at=?2 WHERE id=?3').bind(f.grant.checked_at-1,f.grant.checked_at+1,f.pending.id).run();
  else await env.DB.prepare("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,attempts,subject_generation,request_digest,created_at,expires_at)VALUES(NULL,?1,'canonical_routine233',?2,?3,1,'unknown','synthetic_foreign_incoming_reference',0,?4,?5,?6,?7)").bind('333333333333333333','444444444444444444',C.ADDON_DEVELOPER233.roleId,'9'.repeat(32),incoming239==='foreign_null_grandchild'?f.pending.id:f.grant.id,T,T+100).run();
  const retained239=JSON.stringify(rows());T=Math.max(T,...rows().filter(x=>x.state==='pending').map(x=>x.expires_at))+1;await plan239(present,C.CANONICAL_RANKS233[4].roleId);r=await run233();
  check('239 expired FROM '+incoming239+' globally holds before any reservation or role effect',r.state==='held'&&!r.targetOwned&&reservations239().length===0&&put()===0&&del()===0&&JSON.stringify(rows())===retained239&&JSON.stringify(rows().find(x=>x.id===f.grant.id))===parentBytes239);db.close();
 }
 {
  const f=await pendingFrom239(),retained239=JSON.stringify(rows());T=f.pending.expires_at+1;await plan239(present,C.CANONICAL_RANKS233[4].roleId);r=await run233();
  check('239 expired exact parent-bound pending still coexists without rewriting its Native parent or pending tuple',r.state==='settled'&&r.coordination.release==='original_native_update'&&put()===1&&del()===1&&JSON.parse(retained239).every(x=>JSON.stringify(rows().find(y=>y.id===x.id))===JSON.stringify(x)));db.close();
 }
 {
  const f=await pendingFrom239();await env.DB.prepare("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,attempts,claim_nonce,subject_generation,request_digest,created_at,expires_at,checked_at,native_profile)VALUES(?1,?2,'fresh_roster_rank',?3,?4,0,'held','native232_never_dispatched',1,?5,?6,?7,?8,?9,?8,?10)").bind('d'.repeat(32),A,G,legacy239,'e'.repeat(32),generation239,f.grant.id,T,T+100,N.NATIVE_RANK_PROFILE232).run();
  const retained239=JSON.stringify(rows());T=f.pending.expires_at+1;await plan239(present,C.CANONICAL_RANKS233[4].roleId);r=await run233();
  check('239 original exact never-dispatched exception remains allowed beside parent-bound pending',r.state==='settled'&&r.coordination.release==='original_native_update'&&put()===1&&del()===1&&JSON.parse(retained239).every(x=>JSON.stringify(rows().find(y=>y.id===x.id))===JSON.stringify(x)));db.close();
 }
 {
  await setup239();r=await run233();const retained239=rows().filter(x=>x.purpose==='canonical_migration_remove233'),originalTarget239=rows().find(x=>x.purpose==='canonical_migration233');
  if(r.state!=='settled'||retained239.length!==2)throw Error('239_original_alias_reference_positive_missing');
  T++;await plan239(present,veteran239);r=await run233();
  check('239 strict original different-role M alias children preserve retained target ownership for a later migration',r.state==='settled'&&r.coordination.release==='original_native_update'&&put()===1&&del()===1&&retained239.every(x=>JSON.stringify(rows().find(y=>y.id===x.id))===JSON.stringify(x))&&JSON.stringify(rows().find(x=>x.id===originalTarget239.id))===JSON.stringify(originalTarget239));db.close();
 }

 // Retired live selection is not a deletion allowlist. These parents are
 // genuine original Native grants, not inserted/mutated positive receipts.
 for(const legacyMode239 of ['off','absent']){
  const oldGrant239=await originalLegacy239();T++;await plan239(present,C.CANONICAL_RANKS233[4].roleId);
  if(legacyMode239==='absent')delete env.NATIVE_RANK_SYNC232;
  const grantBytes239=JSON.stringify(rows().find(x=>x.id===oldGrant239.grant.id));http=[];let cleanup239=await visit239();
  const removed239=rows().find(x=>x.purpose==='canonical_routine233'&&x.role_id===legacy239&&x.desired===0&&x.state==='settled'&&x.attempts===1&&x.reason==='canonical233_delete_acknowledged_and_confirmed');
  check('239 '+legacyMode239+' old selector permits only genuine owned legacy removal under canonical source',!!removed239&&removed239.request_digest===oldGrant239.grant.id&&del()===2&&put()===0&&!present.includes(legacy239)&&cleanup239.outcomes.length===2&&cleanup239.outcomes.every(x=>x.state==='settled')&&JSON.stringify(rows().find(x=>x.id===oldGrant239.grant.id))===grantBytes239);
  T++;await roster.ingestRoster(env,T,[{name:'Fern Melder',guid:'Player-4613-12345678',rank:'Veteran',rankIndex:6}],load('./launch-verification227').captureLaunchVerification(env).scope.provenance);http=[];cleanup239=await visit239();
  check('239 '+legacyMode239+' normal fresh promotion after original legacy cleanup never regrants old alias',cleanup239.state==='settled'&&present.includes(veteran239)&&!present.includes(legacy239)&&put()===1&&del()===0&&!http.some(x=>x.method==='PUT'&&x.path.endsWith('/'+legacy239))&&JSON.stringify(rows().find(x=>x.id===oldGrant239.grant.id))===grantBytes239);db.close();
 }
 {
  await originalLegacy239();const unowned239=N.MIRROR_BY_NAME232['Guild Master'],outside239=C.ADDON_DEVELOPER233.roleId;present.push(unowned239,outside239);T++;await plan239(present,C.CANONICAL_RANKS233[4].roleId);delete env.NATIVE_RANK_SYNC232;http=[];await visit239();
  check('239 absent old selector never makes manual historical or outside-family roles owned',present.includes(unowned239)&&present.includes(outside239)&&!http.some(x=>x.method==='DELETE'&&[unowned239,outside239].some(role=>x.path.endsWith('/'+role)))&&!rows().some(x=>x.desired===0&&[unowned239,outside239].includes(x.role_id)));db.close();
 }
 for(const blocker239 of ['unknown','claimed']){
  const original239=await originalLegacy239();T++;await plan239(present,C.CANONICAL_RANKS233[4].roleId);delete env.NATIVE_RANK_SYNC232;
  const blockedId239='d'.repeat(32);await env.DB.prepare("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,attempts,claim_nonce,subject_generation,request_digest,created_at,expires_at,native_profile)VALUES(?1,?2,'canonical_routine233',?3,?4,0,?5,'synthetic_unresolved_negative',?6,?7,?8,?9,?10,?11,?12)").bind(blockedId239,A,G,legacy239,blocker239==='unknown'?'unknown':'pending',blocker239==='unknown'?0:1,blocker239==='unknown'?null:'e'.repeat(32),generation239,original239.grant.id,T,T+120,C.CANONICAL_PROFILE233).run();
  const blockedBytes239=JSON.stringify(rows().find(x=>x.id===blockedId239));http=[];const blocked239=await visit239();
  check('239 absent old selector still holds '+blocker239+' history before any new role effect',blocked239.state==='held'&&put()===0&&del()===0&&present.includes(legacy239)&&JSON.stringify(rows().find(x=>x.id===blockedId239))===blockedBytes239);db.close();
 }

 // No timestamp/ACK row rewriting: this case uses original source-produced
 // Native legacy PUT, original unclaimed removal, then the original M API.
 let legacy=await originalLegacy239();T++;await plan239(present,C.CANONICAL_RANKS233[4].roleId);let refused239=false;
 batchHook=()=>{if(!refused239&&rows().some(x=>x.role_id===legacy239&&x.purpose==='canonical_routine233'&&x.state==='pending'&&x.attempts===0)){refused239=true;options.notBot=true;}};
 const queued239=await visit239();batchHook=null;options.notBot=false;const pending239=rows().find(x=>x.role_id===legacy239&&x.purpose==='canonical_routine233'&&x.state==='pending'&&x.attempts===0),pendingBytes239=JSON.stringify(pending239);
 check('239 fixture genuinely leaves an unclaimed legacy removal from strict original Native parent',refused239&&queued239.state==='held'&&pending239?.request_digest===legacy.grant.id&&pending239.claim_nonce===null&&pending239.checked_at===null&&pending239.subject_generation===generation239);
 T++;await plan239(present,C.CANONICAL_RANKS233[4].roleId);http=[];r=await run233();
 check('239 live exact unclaimed FROM coexists under reservation without old-row rewrite or renewal',r.state==='settled'&&r.coordination.release==='original_native_update'&&put()===1&&del()===1&&JSON.stringify(rows().find(x=>x.id===pending239.id))===pendingBytes239&&roleDeletes239().some(x=>x.role_id===legacy239)&&!present.includes(legacy239));
 const legacyChildren239=rows().filter(x=>x.request_digest===legacy.grant.id).length;T=pending239.expires_at+1;
 await roster.ingestRoster(env,T,[{name:'Fern Melder',guid:'Player-4613-12345678',rank:'Veteran',rankIndex:6}],load('./launch-verification227').captureLaunchVerification(env).scope.provenance);http=[];r=await visit239();
 check('239 fresh normal promotion after old expiry never reclaims consumed legacy grant or churns alias pending',r.state==='settled'&&present.includes(veteran239)&&!present.includes(legacy239)&&!http.some(x=>x.method==='DELETE'&&x.path.endsWith('/'+legacy239))&&rows().filter(x=>x.request_digest===legacy.grant.id).length===legacyChildren239&&JSON.stringify(rows().find(x=>x.id===pending239.id))===pendingBytes239);db.close();

 await setup239([]);r=await run233();const firstAck239=rows().find(x=>x.purpose==='canonical_migration233');await plan239([target],veteran239);r=await run233();
 check('239 same-second original historical FROM ACK refuses before new reservation or role effect',r.state==='held'&&reservations239().length===1&&put()===0&&del()===0&&rows().find(x=>x.id===firstAck239.id).checked_at===T);db.close();

 let history239=await twoM239();
 check('239 original same-role M DELETE has strictly later birth and exact original target-parent expiry',history239.negative.created_at>history239.original.checked_at&&history239.negative.request_digest===history239.target.id&&history239.negative.expires_at===history239.target.expires_at&&history239.target.checked_at<=history239.negative.created_at);
 const historyBytes239=new Map([history239.original,history239.negative,history239.target].map(x=>[x.id,JSON.stringify(x)]));await env.DB.batch(Q.qrErasureStatements(env,A));
 check('239 actual partial QR cleanup retains old positive, M negative and referenced target together',Array.from(historyBytes239).every(([id,value])=>JSON.stringify(rows().find(x=>x.id===id))===value));db.close();

 history239=await twoM239();T++;await plan239([veteran239],target);r=await run233();
 check('239 genuinely newer original grant remains usable after earlier strict M DELETE',r.state==='settled'&&put()===1&&del()===1&&rows().some(x=>x.purpose==='canonical_migration233'&&x.role_id===target&&x.created_at>history239.negative.checked_at)&&present.length===1&&present[0]===target);db.close();

 for(const malformed239 of ['dangling','same_second','null_profile']){
  history239=await twoM239();
  if(malformed239==='dangling')await env.DB.prepare('UPDATE role_settlements SET request_digest=?1 WHERE id=?2').bind('f'.repeat(32),history239.negative.id).run();
  else if(malformed239==='same_second')await env.DB.prepare('UPDATE role_settlements SET created_at=?1 WHERE id=?2').bind(history239.original.checked_at,history239.negative.id).run();
  else await env.DB.prepare('UPDATE role_settlements SET native_profile=NULL WHERE id=?1').bind(history239.negative.id).run();
  T++;await plan239([veteran239],target);r=await run233();
  check('239 '+malformed239+' negative history holds before any new M reservation/effect',r.state==='held'&&put()===0&&del()===0&&reservations239().length===2);
  const before=JSON.stringify(rows().find(x=>x.id===history239.negative.id));await env.DB.batch(Q.qrErasureStatements(env,A));
  check('239 partial cleanup cannot remove '+malformed239+' negative hold and revive old custody',JSON.stringify(rows().find(x=>x.id===history239.negative.id))===before&&rows().some(x=>x.id===history239.original.id));db.close();
 }

 // These are deliberately malformed custody controls, not fabricated positive
 // ACK evidence. The marker itself is always created by original M INSERT.
 for(const condition239 of ['active','missing','retiring','new_generation','claimed','unknown','live','null_profile']){
  plan=await setup239([], {notMember:true});r=await run233();marker=reservations239()[0];if(!marker||marker.state!=='pending'||put()||del())throw Error('239_original_no_effect_marker_missing');
  T=condition239==='live'?plan.expiresAt-1:plan.expiresAt+1;
  if(condition239==='missing')await env.DB.prepare('DELETE FROM privacy_subjects WHERE subject_id=?1').bind(A).run();
  if(condition239==='retiring'||condition239==='null_profile')await env.DB.prepare("UPDATE privacy_subjects SET state='retiring',revision=revision+1,updated_at=?1 WHERE subject_id=?2").bind(T,A).run();
  if(condition239==='new_generation')await env.DB.prepare('UPDATE privacy_subjects SET generation=?1,revision=revision+1,updated_at=?2 WHERE subject_id=?3').bind('7'.repeat(32),T,A).run();
  if(condition239==='claimed')await env.DB.prepare('UPDATE role_settlements SET attempts=1,claim_nonce=?1 WHERE id=?2').bind('8'.repeat(32),marker.id).run();
  if(condition239==='unknown')await env.DB.prepare("UPDATE role_settlements SET state='unknown' WHERE id=?1").bind(marker.id).run();
  if(condition239==='null_profile')await env.DB.prepare('UPDATE role_settlements SET native_profile=NULL WHERE id=?1').bind(marker.id).run();
  const saved=JSON.stringify(rows().find(x=>x.id===marker.id));let cleanup239=null;try{await env.DB.batch(Q.qrErasureStatements(env,A));}catch(e){cleanup239=e;}
  const mayClear239=condition239==='retiring'||condition239==='new_generation',actual=rows().find(x=>x.id===marker.id);
  check('239 '+condition239+' marker privacy '+(mayClear239?'clears exact expired no-network lease':'retains live/unknown/unproved custody'),mayClear239?!cleanup239&&!actual:actual&&JSON.stringify(actual)===saved);
  check('239 '+condition239+' erasure control never sends a role effect',put()===0&&del()===0);db.close();
 }

 // .240 QR coupling unit cases. The first pair is produced by original source.
 // Explicit later row mutations are synthetic predicate/uncertainty controls,
 // never production ACKs, erasure authority, ownership or a live repair recipe.
 async function routinePair240(){
  const old240=await originalLegacy239();T++;await plan239(present,C.CANONICAL_RANKS233[4].roleId);
  await visit239();await visit239();
  const parent240=rows().find(x=>x.id===old240.grant.id),child240=rows().find(x=>x.purpose==='canonical_routine233'&&x.role_id===legacy239&&x.desired===0&&x.state==='settled'&&x.attempts===1&&x.reason==='canonical233_delete_acknowledged_and_confirmed'&&x.request_digest===old240.grant.id);
  if(!parent240||!child240)throw Error('240_original_routine_retention_pair_missing');
  return {parent:parent240,child:child240,rowid:db.prepare('SELECT rowid AS r FROM role_settlements WHERE id=?').get(child240.id).r};
 }
 const row240=id=>db.prepare('SELECT * FROM role_settlements WHERE rowid=?').get(id);
 {const pair240=await routinePair240(),before240=JSON.stringify([pair240.parent,pair240.child]);http=[];
  await env.DB.batch(Q.qrErasureStatements(env,A));await env.DB.batch(Q.qrErasureStatements(env,A));
  check('240 original routine DELETE ACK and original positive remain byte-exact across repeated partial QR',JSON.stringify([rows().find(x=>x.id===pair240.parent.id),row240(pair240.rowid)])===before240&&put()===0&&del()===0);db.close();}
 for(const mutation240 of [
  ['observed0',"attempts=0,claim_nonce=NULL,reason='canonical233_observed_without_dispatch'"],
  ['unrecognized reason',"reason='synthetic_unrecognized_terminal'"],
  ['unrecognized purpose',"purpose='synthetic_unrecognized_terminal'"],
  ['NULL profile','native_profile=NULL'],['NULL id','id=NULL'],['NULL generation','subject_generation=NULL'],
  ['foreign generation',"subject_generation='77777777777777777777777777777777'"],
  ['foreign guild',"guild_id='223456789012345679'"],['foreign role',"role_id='223456789012345680'"],
  ['NULL original checked time','checked_at=NULL'],
  ['malformed M child',"purpose='canonical_migration_remove233',native_profile=NULL,subject_generation='77777777777777777777777777777777',role_id='223456789012345680'"]
 ]){const pair240=await routinePair240();await env.DB.prepare('UPDATE role_settlements SET '+mutation240[1]+' WHERE id=?1').bind(pair240.child.id).run();
  const before240=JSON.stringify([rows().find(x=>x.id===pair240.parent.id),row240(pair240.rowid)]);http=[];
  await env.DB.batch(Q.qrErasureStatements(env,A));await env.DB.batch(Q.qrErasureStatements(env,A));
  check('240 '+mutation240[0]+' settled incoming blocker remains uncertainty with retained parent, not new authority',JSON.stringify([rows().find(x=>x.id===pair240.parent.id),row240(pair240.rowid)])===before240&&put()===0&&del()===0);db.close();}
 {const pair240=await routinePair240(),foreign240='223456789012345678';await env.DB.prepare('UPDATE role_settlements SET subject=?1,subject_generation=NULL,guild_id=?2,role_id=?3 WHERE id=?4').bind(foreign240,'223456789012345679','223456789012345680',pair240.child.id).run();
  const before240=JSON.stringify([rows().find(x=>x.id===pair240.parent.id),row240(pair240.rowid)]);http=[];await env.DB.batch(Q.qrErasureStatements(env,foreign240));
  check('240 foreign erasure root cannot prune global incoming blocker while its original parent survives outside root',JSON.stringify([rows().find(x=>x.id===pair240.parent.id),row240(pair240.rowid)])===before240&&put()===0&&del()===0);db.close();}
 {const pair240=await routinePair240();await env.DB.prepare("UPDATE role_settlements SET state='unknown' WHERE id=?1").bind(pair240.child.id).run();const before240=JSON.stringify(rows());http=[];let held240=false;
  try{await env.DB.batch(Q.qrErasureStatements(env,A));}catch{held240=true;}
  check('240 original unknown-attempt custody still refuses partial QR without any mutation or role effect',held240&&JSON.stringify(rows())===before240&&put()===0&&del()===0);db.close();}
 for(const nonblocking240 of [['NULL digest','request_digest=NULL'],['unclaimed held child',"state='held',attempts=0,claim_nonce=NULL,reason='canonical233_never_dispatched'"]]){
  const pair240=await routinePair240();await env.DB.prepare('UPDATE role_settlements SET '+nonblocking240[1]+' WHERE id=?1').bind(pair240.child.id).run();http=[];await env.DB.batch(Q.qrErasureStatements(env,A));
  check('240 '+nonblocking240[0]+' does not extend unrelated non-blocking child retention',!row240(pair240.rowid)&&JSON.stringify(rows().find(x=>x.id===pair240.parent.id))===JSON.stringify(pair240.parent)&&put()===0&&del()===0);db.close();}
 {const pair240=await routinePair240();await env.DB.prepare('DELETE FROM role_settlements WHERE id=?1').bind(pair240.parent.id).run();http=[];await env.DB.batch(Q.qrErasureStatements(env,A));
  check('240 synthetic missing-parent boundary does not create orphan retention or authority',!rows().some(x=>x.id===pair240.parent.id)&&!row240(pair240.rowid)&&put()===0&&del()===0);db.close();}
 {const pair240=await routinePair240();await env.DB.prepare("UPDATE role_settlements SET attempts=0,claim_nonce=NULL,reason='native232_observed_without_dispatch' WHERE id=?1").bind(pair240.parent.id).run();http=[];await env.DB.batch(Q.qrErasureStatements(env,A));
  check('240 synthetic non-ACK positive observation cannot mint coupled ownership or extend either row lifetime',!rows().some(x=>x.id===pair240.parent.id)&&!row240(pair240.rowid)&&put()===0&&del()===0);db.close();}
 console.log(ok+'/'+n+' canonical239 migration Native checks passed');process.exitCode=ok===n?0:1;
`;
source239=source239.slice(0,source239.indexOf(start239))+body239+source239.slice(source239.indexOf(end239)+end239.length);
const mod239=new Module239(__filename,module);mod239.filename=__filename;mod239.paths=module.paths;mod239._compile(source239,__filename);
