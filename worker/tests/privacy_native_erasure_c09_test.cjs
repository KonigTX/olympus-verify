// Original Native admission path with the ordinary-decline and permanent-denial regressions.
const { runNativeErasureFixture } = require('./helpers/registered_native_erasure_fixture.cjs');

runNativeErasureFixture(async function review() {
const declineKey=load('application-edit219').ORDINARY_DECLINE_ANSWER_KEY;
const decisionTarget=async(f,cookie,route,policy=false)=>json(await f.call('GET','/api/admin/users/'+ID+'/decision-target?route='+route+'&decisionAction=business_only'+(policy?'&decisionPolicy=permanent_denial':''),{cookie}));
const decisionPost=(f,cookie,route,target,body,action=target.decisionAction??'business_only')=>f.call('POST',
 route==='status'?'/api/admin/applications/'+ID+'/status':'/api/admin/users/'+ID+'/'+route,
 {cookie,headers:{'X-Olympus-Decision-Target':target.targetToken,'X-Olympus-Decision-Action':action},body});
async function ordinaryDeclineAndErasure(){
 const f=fixture();
 try{
  const cookie=await f.signIn(ID),admin=await f.signIn(OTHER);
  const row=()=>f.raw('SELECT * FROM site_applications WHERE discord_id=?',ID);
  const stamp=()=>JSON.parse(row().answers)[declineKey];
  const forged=['0'.repeat(32),clock,clock];
  const application={position:'member',backups:[],class:'warrior',role:'tank',region:'eu',character:'Native Target',fallback:true,ack:true,board:false,avail:'f'.repeat(42),availTz:'Europe/Stockholm',applicationTrack:'member',targetOffice:null,editToken:null,
   answers:{experience:'I have played with groups and will follow the agreed plan.',why:'I want to help the guild and learn with other members.',voice:'yes',extra:'Original private note.',[declineKey]:forged}};
  const own=await f.call('PUT','/api/application',{cookie,body:application});
  check('applicant JSON cannot store an internal decline classification',own.status===200&&stamp()===undefined);
  const stale=await decisionTarget(f,admin,'status');
  const edit=await f.call('PUT','/api/application',{cookie,body:{...application,editToken:(await json(own)).application.editToken,answers:{...application.answers,extra:'Updated after staff prepared'}}});
  const refused=await decisionPost(f,admin,'status',stale,{status:'declined'});
  check('a stale staff decision cannot stamp the edited application',edit.status===200&&refused.status===409&&row().status==='submitted'&&stamp()===undefined);
  const next=await decisionTarget(f,admin,'status');
  const declined=await decisionPost(f,admin,'status',next,{status:'declined'});
  check('ordinary decline uses business_only, stores only its internal proof and omits it from the response',declined.status===200&&Array.isArray(stamp())&&!(declineKey in (await json(declined)).application.answers)&&!f.raw('SELECT 1 FROM privacy_rejection_decisions'));
  const staleEdit=await f.call('PUT','/api/application',{cookie,body:{...application,editToken:(await json(edit)).application.editToken}});
  const forgedConsent=await f.call('PUT','/api/application',{cookie,body:{consentOnly:true,boardPortrait:false,[declineKey]:forged}});
  check('decided and consent-only application writers cannot replace the genuine staff stamp',staleEdit.status===409&&forgedConsent.status===400&&stamp()[0]===f.raw('SELECT account_incarnation FROM site_users WHERE discord_id=?',ID).account_incarnation);
  clock++;
  const note=await decisionPost(f,admin,'status',await decisionTarget(f,admin,'status'),{status:'declined',note:'Updated note'});
  check('an admitted note save keeps only the current decision stamp',note.status===200&&row().admin_note==='Updated note'&&stamp()[2]===row().reviewed_at);
  const erasure=await request(f,cookie),job=await finish(f);
  check('the ordinary pure Member decline completes one-click erasure without a retained denial marker',erasure.response.status===202&&job?.state==='complete'&&!row()&&!f.raw('SELECT 1 FROM site_users WHERE discord_id=?',ID)&&!f.raw('SELECT 1 FROM privacy_denial_markers'));
 }finally{f.close();}
}
async function ambiguousDeclineHolds(){
 for(const old of ['missing','other-birth','other-review']){
  const f=fixture();
  try{
   const cookie=await f.signIn(ID),admin=await f.signIn(OTHER);
   await seedPersonal(f,{roles:0});
   const incarnation=f.raw('SELECT account_incarnation FROM site_users WHERE discord_id=?',ID).account_incarnation;
   const answers=old==='missing'?{}:{[declineKey]:[old==='other-birth'?'0'.repeat(32):incarnation,clock,old==='other-review'?clock-1:clock]};
   await f.write("UPDATE site_applications SET status='declined',reviewed_at=?,reviewed_by=?,answers=? WHERE discord_id=?",clock,OTHER,JSON.stringify(answers),ID);
   clock++;
   const note=await decisionPost(f,admin,'status',await decisionTarget(f,admin,'status'),{status:'declined',note:'No reclassification'});
   check(old+' decline stamp is not upgraded by a same-status note save',note.status===200&&JSON.stringify(JSON.parse(f.raw('SELECT answers FROM site_applications WHERE discord_id=?',ID).answers))===JSON.stringify(answers));
   const erasure=await request(f,cookie);
   check(old+' ambiguous negative remains held with its account and no new denial marker',erasure.response.status===202&&f.raw('SELECT state FROM privacy_serving_jobs WHERE operation_id=?',OP)?.state==='held'&&!!f.raw('SELECT 1 FROM site_users WHERE discord_id=?',ID)&&!f.raw('SELECT 1 FROM privacy_denial_markers'));
  }finally{f.close();}
 }
}
async function legacyDenialWaitsForStaffReview(){
 const f=fixture();
 try{
  const cookie=await f.signIn(ID);
  await seedPersonal(f,{roles:1});
  await f.write("UPDATE site_users SET denied=1,denied_at=?,denied_reason='Older flag' WHERE discord_id=?",clock,ID);
  const appointed=f.raw("SELECT value FROM site_settings WHERE key='appointed'").value;
  const providerCalls=f.http.length;
  const erasure=await request(f,cookie);
  const job=f.raw('SELECT * FROM privacy_serving_jobs WHERE operation_id=?',OP);
  check('older denial without original evidence becomes a known hold before cleanup',erasure.response.status===202&&job?.state==='held'&&job.hold_reason==='staff_review_required'
   &&f.http.length===providerCalls&&f.roles.get(ID).includes(MEMBER)&&f.raw("SELECT value FROM site_settings WHERE key='appointed'").value===appointed
   &&!!f.raw('SELECT 1 FROM characters WHERE discord_id=?',ID)&&!!f.raw('SELECT 1 FROM site_applications WHERE discord_id=?',ID)&&!f.terminalCommitted);
  const status=await f.status(OP,erasure.body.statusToken),readback=await json(status);
  const invalid=await f.status(OP,erasure.body.statusToken.slice(0,-1)+'!');
  check('only the existing private proof reads the held request, with no keyed marker or replay',status.status===200&&readback?.state==='held'
   &&readback.holdReason==='staff_review_required'&&readback.servingAccountErased===false&&invalid.status===404
   &&!f.raw('SELECT 1 FROM privacy_denial_markers')&&!f.raw('SELECT 1 FROM privacy_restore_replay'));
  clock+=121;
  const retry=await f.job('legacy-denial-staff-review');
  check('automatic continuations leave the same held operation for staff review',retry.attempted===0&&f.http.length===providerCalls
   &&f.raw('SELECT last_attempt_at FROM privacy_serving_jobs WHERE operation_id=?',OP).last_attempt_at===job.last_attempt_at);
 }finally{f.close();}
}
async function identifyNativeErasure(f){
 const formCookie=response=>Object.entries(cookies(response)).map(([k,v])=>k+'='+v).join('; ');
 const page=await f.call('GET','/privacy/signin'),csrf=/name="csrf" value="([^"]+)"/.exec(await page.text())[1];
 const start=await f.call('POST','/privacy/signin',{cookie:formCookie(page),form:{csrf}});
 const oauth=new URL(start.headers.get('Location'));
 const callback=await f.call('GET','/privacy/callback?code=code-'+ID+'&state='+encodeURIComponent(oauth.searchParams.get('state'))+'&iss=https%3A%2F%2Fdiscord.com',{cookie:formCookie(start)});
 assert.equal(callback.status,303);
 const accessCookie=formCookie(callback),access=await f.call('GET','/privacy/access',{cookie:accessCookie});
 const section=/<form method="post" action="\/privacy\/access\/erasure">([\s\S]*?)<\/form>/.exec(await access.text())[1];
 const operation=/name="grant" value="([^"]+)"/.exec(section)[1],roleBefore=f.http.length;
 const reply=await f.call('POST','/privacy/access/erasure',{cookie:accessCookie,form:{grant:operation,csrf:/name="csrf" value="([^"]+)"/.exec(section)[1],confirm:'yes'}});
 return {operation,roleBefore,reply};
}
async function broaderLegacyDenialReview(){
 const YEAR=31536000,scope='pure_member_including_fallback0',eventId='e'.repeat(32);
 const outcomes=[];
 for(const [kind,identify] of [['dangling',false],['unmatched',true],['other-generation',false],['wrong-expired-key',true],['prior-marker-only',false],['application-mirror-only',true],['qualified-expired',false],['preflight-read-error',false]]){
  const f=fixture();
  try{
   const cookie=await f.signIn(ID);
   await seedPersonal(f,{roles:1});
   const key=await authority.privacySubjectKey(f.env,ID),birth=f.raw('SELECT account_incarnation FROM site_users WHERE discord_id=?',ID).account_incarnation;
   const wrongKey='A'.repeat(43);
   assert.notEqual(key,wrongKey);
   await f.write("UPDATE site_users SET denied=1,denied_at=?,denied_reason='Older denial for exact fixture' WHERE discord_id=?",clock-60,ID);
   if(kind==='dangling'||kind==='other-generation'){
    await f.write('UPDATE site_users SET rejection_event_id=?,rejection_subject_key=?,rejection_scope=? WHERE discord_id=?',eventId,key,scope,ID);
   }
   if(kind==='unmatched'||kind==='other-generation'){
    await f.write("INSERT INTO privacy_rejection_decisions VALUES(?,?,?,?, 'original-guild-membership-rejection-v1','explicit_membership_deny',?,?,?)",eventId,key,birth,'1'.repeat(32),scope,clock-60,clock-60+YEAR);
   }
   if(kind==='wrong-expired-key'||kind==='qualified-expired'){
    await f.write('UPDATE site_users SET rejection_subject_key=?,rejection_scope=?,rejection_window_expired=1 WHERE discord_id=?',kind==='qualified-expired'?key:wrongKey,scope,ID);
   }
   if(kind==='prior-marker-only'){
    await f.write("INSERT INTO privacy_denial_markers VALUES(?,?,?,'rejected_guild_application_or_membership')",key,clock-3600,clock-3600+YEAR);
   }
   if(kind==='application-mirror-only'){
    await f.write('UPDATE site_applications SET rejection_event_id=?,rejection_subject_key=?,rejection_scope=? WHERE discord_id=?',eventId,key,scope,ID);
   }
   const appointed=()=>f.raw("SELECT value FROM site_settings WHERE key='appointed'").value;
   const original=appointed(),beforeMarkers=JSON.stringify(f.rows('SELECT * FROM privacy_denial_markers'));
   let operation=OP,reply,roleBefore=f.http.length;
   if(identify){
    ({operation,roleBefore,reply}=await identifyNativeErasure(f));
   }else{
    if(kind==='preflight-read-error')f.failSql=sql=>sql.includes('AS disposition');
    reply=(await request(f,cookie)).response;
    f.failSql=null;
   }
   const job=f.raw('SELECT state,hold_reason,last_attempt_at FROM privacy_serving_jobs WHERE operation_id=?',operation);
   assert.equal(reply.status,202);
   assert.ok(job,'genuine job admitted for '+kind);
   const provider=f.http.length-roleBefore,roleDeletes=f.http.slice(roleBefore).filter(call=>call.method==='DELETE').length;
   if(kind==='qualified-expired'){
    const done=await finish(f,operation);
    outcomes.push({kind,done:done.state,markersUnchanged:beforeMarkers===JSON.stringify(f.rows('SELECT * FROM privacy_denial_markers'))});
    continue;
   }
   const sameAppointment=original===appointed(),markersUnchanged=beforeMarkers===JSON.stringify(f.rows('SELECT * FROM privacy_denial_markers'));
   const replay=!!f.raw('SELECT 1 FROM privacy_restore_replay');
   let nextAttempt=null;
   if(job.hold_reason==='staff_review_required'){clock+=121;nextAttempt=(await f.job('same-held-denial')).attempted;}
   outcomes.push({kind,state:job.state,reason:job.hold_reason,provider,roleDeletes,sameAppointment,markersUnchanged,replay,nextAttempt});
  }finally{f.close();}
 }
 console.log('C09_REVIEW_MATRIX '+JSON.stringify(outcomes));
 check('contradictory original denial evidence holds before cleanup, with distinct storage error and qualified expiry',outcomes.every(row=>
  row.kind==='qualified-expired'?row.done==='complete'&&row.markersUnchanged:
  row.state==='held'&&row.reason===(row.kind==='preflight-read-error'?'native_attempt_pending':'staff_review_required')
  &&row.provider===0&&row.roleDeletes===0&&row.sameAppointment&&row.markersUnchanged&&!row.replay
  &&(row.kind==='preflight-read-error'||row.nextAttempt===0)));
}
async function firstGenerationDenialUsesOriginalIdentifyBridge(){
 const f=fixture();
 try{
  await f.signIn(ID);
  const admin=await f.signIn(OTHER);
  await seedPersonal(f,{roles:0});
  await f.write('DELETE FROM privacy_subjects WHERE subject_id=?',ID);
  const denialClock=clock,deny=await decisionTarget(f,admin,'deny');
  const denied=await decisionPost(f,admin,'deny',deny,{reason:'Original first-generation fixture'});
  const event=f.raw('SELECT target_generation,rejected_at FROM privacy_rejection_decisions');
  check('an original denial before the target had a privacy generation remains source-owned',
   denied.status===200&&event?.target_generation===null&&event.rejected_at===denialClock);
  const {operation,reply}=await identifyNativeErasure(f);
  const job=await finish(f,operation),marker=f.raw('SELECT denied_at,retain_until FROM privacy_denial_markers');
  check('the consumed original identify grant bridges a genuine null-generation decision through Native erasure',
   [200,202].includes(reply.status)&&job?.state==='complete'&&marker?.denied_at===denialClock&&marker.retain_until===denialClock+31536000);
 }finally{f.close();}
}
async function currentDenialKeepsOriginalProviderAndMarkerGuards(){
 const f=fixture();
 try{
  const generation='a'.repeat(32);
  await f.write("INSERT INTO privacy_subjects(subject_id,generation,state,revision,created_at,updated_at) VALUES(?,?,'active',0,?,?)",ID,generation,clock,clock);
  await f.signIn(ID);
  const admin=await f.signIn(OTHER);
  await seedPersonal(f,{roles:0});
  const target=await decisionTarget(f,admin,'deny'),decisionClock=clock;
  const denied=await decisionPost(f,admin,'deny',target,{reason:'Current decision fixture'});
  const decision=f.raw('SELECT target_generation,target_account_incarnation,rejected_at FROM privacy_rejection_decisions');
  const birth=f.raw('SELECT account_incarnation FROM site_users WHERE discord_id=?',ID).account_incarnation;
  check('a current same-birth denial carries the exact original generation and clock',denied.status===200&&decision?.target_generation===generation
   &&decision.target_account_incarnation===birth&&decision.rejected_at===decisionClock);
  const cookie=await f.signIn(ID),providerBefore=f.http.length;
  f.inventoryUnavailable=true;
  const erasure=await request(f,cookie),heldJob=f.raw('SELECT state,hold_reason FROM privacy_serving_jobs WHERE operation_id=?',OP);
  f.inventoryUnavailable=false;
  check('a verified denial with synthetic provider failure retains provider handling rather than a staff classification',
   erasure.response.status===202&&heldJob?.state==='held'&&heldJob.hold_reason!=='staff_review_required'
   &&f.http.length>providerBefore&&!f.raw('SELECT 1 FROM privacy_denial_markers')&&!f.terminalCommitted);
  const done=await finish(f),marker=f.raw('SELECT denied_at,retain_until FROM privacy_denial_markers');
  clock+=121;
  await f.job('verified-original-denial-already-complete');
  check('valid repeated continuations retain one original marker and never renew its clock',
   done?.state==='complete'&&marker?.denied_at===decisionClock&&marker.retain_until===decisionClock+31536000
   &&JSON.stringify(f.rows('SELECT denied_at,retain_until FROM privacy_denial_markers'))===JSON.stringify([marker]));
 }finally{f.close();}
}
async function permanentDenialPolicy(){
 const f=fixture();
 try{
  await f.signIn(ID);
  const admin=await f.signIn(OTHER);
  const absent=await decisionTarget(f,admin,'deny',true);
  check('permanent denial preparation provides no token without an application',absent.decisionAvailable===false&&absent.targetToken===null);
  await seedPersonal(f,{roles:0});
  await f.write("UPDATE site_applications SET backup1='raider' WHERE discord_id=?",ID);
  const mixed=await decisionTarget(f,admin,'deny',true);
  check('mixed application cannot prepare a permanent denial',mixed.decisionAvailable===false&&mixed.targetToken===null);
  await f.write("UPDATE site_applications SET backup1=NULL WHERE discord_id=?",ID);
  const deny=await decisionTarget(f,admin,'deny',true);
  const downgrade=await decisionPost(f,admin,'deny',deny,{reason:'Synthetic safety concern'},'business_only');
  const accepted=await decisionPost(f,admin,'deny',deny,{reason:'Synthetic safety concern'});
  check('pure Member permanent denial binds the explicit action and records its original rejection',deny.decisionAction==='membership_rejection_v1'&&downgrade.status===409&&accepted.status===200&&f.raw('SELECT source FROM privacy_rejection_decisions')?.source==='explicit_membership_deny'&&f.raw('SELECT denied FROM site_users WHERE discord_id=?',ID).denied===1);
  const lift=await decisionTarget(f,admin,'undeny',true);
  const lifted=await decisionPost(f,admin,'undeny',lift,{});
  check('lifting an admitted permanent denial explicitly clears its original event and mirrors',lift.decisionAction==='membership_reconsideration_v1'&&lifted.status===200&&!f.raw('SELECT 1 FROM privacy_rejection_decisions')&&f.raw('SELECT denied,rejection_event_id FROM site_users WHERE discord_id=?',ID).denied===0&&f.raw('SELECT rejection_event_id FROM site_applications WHERE discord_id=?',ID).rejection_event_id===null);
 }finally{f.close();}
}
// A genuine old-build MAC over the same current test target, with the old action.
async function oldBusinessTarget(f,target) {
 const claim=JSON.parse(Buffer.from(target.targetToken.split('.')[0],'base64url').toString());
 const raw=Buffer.from(JSON.stringify({...claim,action:'business_only'})).toString('base64url');
 const mac=await load('site-core').sign(f.env.COOKIE_SECRET,'site-membership-decision-target-incarnation-v2',raw);
 return {...target,targetToken:raw+'.'+mac,decisionAction:'business_only'};
}
async function serverAuthorityAndDenialSequence() {
 for(const liftAfterDecline of [false,true]){
  const f=fixture();
  try{
   await f.signIn(ID);const admin=await f.signIn(OTHER);
   const absent=await decisionTarget(f,admin,'deny');
   check('no-policy deny is withheld when the application is absent',absent.targetToken===null&&!absent.decisionAvailable);
   await seedPersonal(f,{roles:0});
   await f.write("UPDATE site_applications SET position='officer' WHERE discord_id=?",ID);
   const officer=await decisionTarget(f,admin,'deny');
   check('no-policy deny cannot authorize an Officer application',officer.targetToken===null&&!officer.decisionAvailable);
   await f.write("UPDATE site_applications SET position='member' WHERE discord_id=?",ID);
   const target=await decisionTarget(f,admin,'deny');
   check('no-policy pure Member deny prepares only the server-selected rejection',target.decisionAction==='membership_rejection_v1'&&target.decisionAvailable&&!!target.targetToken);
   const oldDeny=await decisionPost(f,admin,'deny',await oldBusinessTarget(f,target),{reason:'old tab fixture'});
   check('old correctly signed business-only deny is rejected without a decision effect',oldDeny.status===409&&!f.raw('SELECT 1 FROM privacy_rejection_decisions')&&f.raw('SELECT denied FROM site_users WHERE discord_id=?',ID).denied===0);
   const denyClock=clock;
   const denied=await decisionPost(f,admin,'deny',target,{reason:'current tab fixture'});
   const event=()=>f.raw('SELECT * FROM privacy_rejection_decisions');
   check('server-selected deny records the one original rejection date',denied.status===200&&event()?.source==='explicit_membership_deny'&&event().rejected_at===denyClock);
   clock++;
   const declined=await decisionPost(f,admin,'status',await decisionTarget(f,admin,'status'),{status:'declined'});
   const app=f.raw('SELECT * FROM site_applications WHERE discord_id=?',ID),stamp=JSON.parse(app.answers)[declineKey];
   const incarnation=f.raw('SELECT account_incarnation FROM site_users WHERE discord_id=?',ID).account_incarnation;
   check('ordinary decline under a real denial stamps its own exact current row without lifting or redating the denial',declined.status===200&&JSON.stringify(stamp)===JSON.stringify([incarnation,app.created_at,app.reviewed_at])&&event()?.rejected_at===denyClock);
   if(liftAfterDecline){
    const lift=await decisionTarget(f,admin,'undeny');
    check('no-policy Lift selects reconsideration for the actual rejection event',lift.decisionAction==='membership_reconsideration_v1');
    const eventBefore=JSON.stringify(event()),oldLift=await decisionPost(f,admin,'undeny',await oldBusinessTarget(f,lift),{});
    check('old correctly signed business-only Lift cannot bypass event reconsideration',oldLift.status===409&&JSON.stringify(event())===eventBefore&&f.raw('SELECT denied FROM site_users WHERE discord_id=?',ID).denied===1);
    const applied=await decisionPost(f,admin,'undeny',lift,{});
    check('genuine Lift clears the event and mirrors while preserving the separate current decline stamp',applied.status===200&&!event()&&f.raw('SELECT rejection_event_id FROM site_applications WHERE discord_id=?',ID).rejection_event_id===null&&JSON.stringify(JSON.parse(f.raw('SELECT answers FROM site_applications WHERE discord_id=?',ID).answers)[declineKey])===JSON.stringify(stamp));
   }
   // Deny revoked the original session. A positive OAuth attempt while denied keeps the same
   // account incarnation and can produce a receipt-only session, which still cannot serve member pages.
   const own=await f.signIn(ID);
   check('renewed erasure attempt preserves the original target account incarnation',f.raw('SELECT account_incarnation FROM site_users WHERE discord_id=?',ID).account_incarnation===incarnation);
   const erasure=await request(f,own),job=await finish(f),marker=f.raw('SELECT denied_at,retain_until FROM privacy_denial_markers');
   check(liftAfterDecline?'deny then ordinary decline then Lift erases without a marker':'keeping the denial preserves exactly its original finite marker through erasure',erasure.response.status===202&&job?.state==='complete'&&(liftAfterDecline?!marker:marker?.denied_at===denyClock&&marker.retain_until===denyClock+31536000));
   clock++;
   const login=await f.call('GET','/auth/login'),state=new URL(login.headers.get('Location')).searchParams.get('state');
   const returned=await f.call('GET','/auth/callback?code=code-'+ID+'&state='+encodeURIComponent(state),{cookie:'__Host-olg_state='+cookies(login)['__Host-olg_state']});
   check(liftAfterDecline?'ordinary erasure can return after the explicit Lift':'active original marker refuses a fresh re-sign-in',returned.status===(liftAfterDecline?303:409)&&(liftAfterDecline||!cookies(returned)['__Host-olg']));
  }finally{f.close();}
 }
}
async function legacyLiftRequiresEmptyProof() {
 for(const conflict of ['none','application','orphan']){
  const f=fixture();
  try{
   const member=await f.signIn(ID),admin=await f.signIn(OTHER);
   await seedPersonal(f,{roles:0});
   await f.write("UPDATE site_users SET denied=1,denied_at=?,denied_reason='synthetic legacy' WHERE discord_id=?",clock,ID);
   const originalTarget=await decisionTarget(f,admin,'undeny');
   check('empty source proof keeps legacy business-only Lift available',originalTarget.decisionAvailable&&originalTarget.decisionAction==='business_only'&&!!originalTarget.targetToken);
   const prior=JSON.parse(Buffer.from(originalTarget.targetToken.split('.')[0],'base64url').toString());
   if(conflict==='application')await f.write("UPDATE site_applications SET rejection_subject_key=?,rejection_scope='pure_member_including_fallback1',rejection_window_expired=1 WHERE discord_id=?",prior.subjectKey,ID);
   if(conflict==='orphan')await f.write("INSERT INTO privacy_rejection_decisions(decision_id,subject_key,target_account_incarnation,target_generation,protocol,source,scope,rejected_at,retain_until) VALUES(?,?,?,?,'original-guild-membership-rejection-v1','explicit_membership_deny','pure_member_including_fallback1',?,?)",'4'.repeat(32),prior.subjectKey,prior.targetNonce,prior.g,clock,clock+31536000);
   const latest=await decisionTarget(f,admin,'undeny');
   if(conflict==='none'){
    const reply=await decisionPost(f,admin,'undeny',latest,{});
    const erasure=await request(f,member);
    check('proved legacy Lift remains business-only and permits ordinary erasure without a marker',reply.status===200&&erasure.response.status===202&&(await finish(f))?.state==='complete'&&!f.raw('SELECT 1 FROM privacy_denial_markers'));
   }else{
    const reply=await decisionPost(f,admin,'undeny',originalTarget,{});
    check(conflict+' proof blocks a new legacy Lift target and an otherwise valid stale one',!latest.decisionAvailable&&latest.targetToken===null&&reply.status===409&&f.raw('SELECT denied FROM site_users WHERE discord_id=?',ID).denied===1);
   }
  }finally{f.close();}
 }
}

async function applicationExportOmitsInternalStamp() {
 const f=fixture();
 try{
  const member=await f.signIn(ID),admin=await f.signIn(OTHER);
  await seedPersonal(f,{roles:0});
  const input=f.raw('SELECT answers FROM site_applications WHERE discord_id=?',ID).answers;
  const reply=await decisionPost(f,admin,'status',await decisionTarget(f,admin,'status'),{status:'declined',note:'Authorized staff note'});
  const birth=f.raw('SELECT account_incarnation FROM site_users WHERE discord_id=?',ID).account_incarnation;
  const originalAnswers=()=>f.raw('SELECT answers FROM site_applications WHERE discord_id=?',ID).answers;
  check('actual ordinary decline creates the private stamp needed for the export regression',reply.status===200&&JSON.parse(originalAnswers())[declineKey]?.[0]===birth);
  async function exported(route='/api/admin/export/applications'){
   const result=await f.call('GET',route,{cookie:admin}),body=await result.text(),data=JSON.parse(body);
   assert.equal(result.status,200);
   const row=data.rows.find(value=>value[data.columns.indexOf('discord_id')]===ID);
   assert.ok(row);
   return {body,answers:row[data.columns.indexOf('answers')],note:row[data.columns.indexOf('admin_note')]};
  }
  const before=originalAnswers(),changes=f.raw('SELECT total_changes() AS n').n,report=await exported();
  check('admin application CSV data body excludes the internal key and original incarnation',!report.body.includes(declineKey)&&!report.body.includes(birth)&&report.answers===input&&report.note==='Authorized staff note');
  check('CSV data projection leaves original storage and authorization unchanged',originalAnswers()===before&&f.raw('SELECT total_changes() AS n').n===changes&&(await f.call('GET','/api/admin/export/applications',{cookie:member})).status===403);
  for(const raw of ['corrupt legacy {',' 42.00 ',' ["legacy",null] ', ' { "allowed" : "exact bytes" } ']){
   await f.write('UPDATE site_applications SET answers=? WHERE discord_id=?',raw,ID);
   check('legacy malformed/scalar or stamp-free value retains exact authorized export bytes',(await exported('/api/admin/export/applications.csv')).answers===raw);
  }
  const escapedKey='\\u005f'+declineKey.slice(1);
  const duplicates='{"allowed":{"nested":"keep"},"big":9e400,"'+declineKey+'":null,"'+escapedKey+'":["'+birth+'",1,2]}';
  await f.write('UPDATE site_applications SET answers=? WHERE discord_id=?',duplicates,ID);
  const redacted=await exported();
  check('duplicate and escaped internal keys are all removed without reinterpreting authorized JSON values',!redacted.body.includes(declineKey)&&!redacted.body.includes(birth)&&redacted.answers==='{"allowed":{"nested":"keep"},"big":9e400}'&&originalAnswers()===duplicates);
  const allowed='"allowed" : [{"nested":"comma, brace } and \\"quoted\\""}],"big":9e400';
  const repeated='"'+escapedKey+'":["'+birth+'",1,2]';
  const large='{'+allowed+','+Array(2000).fill(repeated).join(',')+'}';
  await f.write('UPDATE site_applications SET answers=? WHERE discord_id=?',large,ID);
  const stress=await exported();
  check('large duplicate input preserves exact nested fragments in the real export route',stress.answers==='{'+allowed+'}'&&!stress.body.includes(birth)&&originalAnswers()===large);

 }finally{f.close();}
}

async function olderDenialHeldGuidance(){
 const guidance='Keep this request ID and ask an Olympus officer privately for attended review.';
 const privateCode='Keep your status code private and use the same request ID when you check again.';
 const hasGuidance=html=>html.includes(guidance)&&html.includes(privateCode);
 const hasOriginalCode=html=>/<pre class="privacy-status-code">([^<]+)<\/pre>/.exec(html)?.[1];
 const cookieFor=response=>Object.entries(cookies(response)).map(([key,value])=>key+'='+value).join('; ');
 const fields=(html,action)=>{
  const form=[...html.matchAll(/<form method="post" action="([^"]+)">([\s\S]*?)<\/form>/g)].find(match=>match[1]===action);
  assert.ok(form,'expected real '+action+' form');
  return Object.fromEntries([...form[2].matchAll(/<input type="hidden" name="([^"]+)" value="([^"]*)">/g)].map(match=>[match[1],match[2]]));
 };
 const outcomes=[];
 for(const identify of [false,true]){
  const f=fixture(),lane=identify?'identify-only':'site account';
  try{
   const session=await f.signIn(ID);
   await f.write("UPDATE site_users SET denied=1,denied_at=?,denied_reason='older denial fixture' WHERE discord_id=?",clock-60,ID);
   const original=identify?await f.call('GET','/privacy/signin'):await f.call('GET','/privacy/account',{cookie:session});
   const before=await original.text();
   check(lane+' entry offers no request-specific held guidance',!hasGuidance(before));
   let submission,operation;
   if(identify){
    const started=await f.call('POST','/privacy/signin',{cookie:cookieFor(original),form:fields(before,'/privacy/signin')});
    const state=new URL(started.headers.get('Location')).searchParams.get('state');
    const callback=await f.call('GET','/privacy/callback?code=code-'+ID+'&state='+encodeURIComponent(state)+'&iss=https%3A%2F%2Fdiscord.com',{cookie:cookieFor(started)});
    assert.equal(callback.status,303);
    const cookie=cookieFor(callback),page=await f.call('GET','/privacy/access',{cookie}),action='/privacy/access/erasure';
    const form=fields(await page.text(),action);
    operation=form.grant;
    submission=await f.call('POST',action,{cookie,form:{...form,confirm:'yes'}});
   }else{
    const action='/privacy/account/full-erase',form=fields(before,action);
    operation=form.operationId;
    submission=await f.call('POST',action,{cookie:session+'; '+cookieFor(original),form:{...form,confirm:'erase'}});
   }
   const receipt=await submission.text(),token=hasOriginalCode(receipt);
   const job=()=>f.raw('SELECT * FROM privacy_serving_jobs WHERE operation_id=?',operation);
   check(lane+' older denial produces a genuine held job and original private status code',
    submission.status===(identify?202:200)&&!!token&&job()?.state==='held'&&job()?.hold_reason==='staff_review_required'
    &&!!f.raw('SELECT 1 FROM site_users WHERE discord_id=?',ID)&&!f.raw('SELECT 1 FROM privacy_denial_markers')
    &&!f.raw('SELECT 1 FROM privacy_restore_replay')&&!f.terminalCommitted);
   const snapshot=JSON.stringify(job()),transport=f.http.length;
   const statusForm=await f.call('GET','/privacy/account'),statusCookie=cookieFor(statusForm),statusPath='/privacy/account/erasure-status';
   const statusFields=fields(await statusForm.text(),statusPath);
   const status=(id,code)=>f.call('POST',statusPath,{cookie:statusCookie,form:{...statusFields,operationId:id,statusToken:code}});
   const valid=await status(operation,token),validHtml=await valid.text();
   const [payload,mac]=token.split('.'),badCode=payload+'.'+(mac[0]==='A'?'B':'A')+mac.slice(1);
   for(const [id,code] of [[operation,badCode],['e'.repeat(32),token],[operation,'']]){
    const refused=await status(id,code),html=await refused.text();
    check(lane+' invalid or absent saved proof is uniform and discloses no request-specific facts',
     refused.status===404&&html.includes('No erasure request matches this ID and private code.')
     &&![operation,badCode,token,ID,'older denial fixture',guidance].some(value=>html.includes(value)));
   }
   check(lane+' original saved status proof reads without a session, provider call or change to the job',
    valid.status===200&&validHtml.includes('<strong>held</strong>')&&hasOriginalCode(validHtml)===token&&snapshot===JSON.stringify(job())&&transport===f.http.length);
   check(lane+' held presentation contains no raw subject or internal denial reason',
    [receipt,validHtml].every(html=>![ID,'older denial fixture','native_attempt_pending','staff_review_required','Serving account records were erased','Serving account erasure was recorded'].some(value=>html.includes(value))));
   outcomes.push({lane,receipt:hasGuidance(receipt),savedStatus:hasGuidance(validHtml)});
  }finally{f.close();}
 }
 console.log('C09_HELD_GUIDANCE '+JSON.stringify(outcomes));
 check('both genuine held receipt routes and private-code status reads give attended guidance',outcomes.every(result=>result.receipt&&result.savedStatus));
}

 await applicationExportOmitsInternalStamp();
 await serverAuthorityAndDenialSequence();
 await legacyLiftRequiresEmptyProof();
 await ordinaryDeclineAndErasure();
 await ambiguousDeclineHolds();
 await legacyDenialWaitsForStaffReview();
 await permanentDenialPolicy();
 await olderDenialHeldGuidance();
 await currentDenialKeepsOriginalProviderAndMarkerGuards();
 await firstGenerationDenialUsesOriginalIdentifyBridge();
 await broaderLegacyDenialReview();
 console.log(`${checks}/${checks} C09 Native erasure checks passed`);
}).catch(error=>{console.error(error);process.exitCode=1;});
