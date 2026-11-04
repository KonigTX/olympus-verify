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
 await serverAuthorityAndDenialSequence();
 await legacyLiftRequiresEmptyProof();
 await ordinaryDeclineAndErasure();
 await ambiguousDeclineHolds();
 await permanentDenialPolicy();
 console.log(`${checks}/${checks} C09 Native erasure checks passed`);
}).catch(error=>{console.error(error);process.exitCode=1;});
