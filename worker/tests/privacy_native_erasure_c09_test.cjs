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
 await ordinaryDeclineAndErasure();
 await ambiguousDeclineHolds();
 await permanentDenialPolicy();
 console.log(`${checks}/${checks} C09 Native erasure checks passed`);
}).catch(error=>{console.error(error);process.exitCode=1;});
