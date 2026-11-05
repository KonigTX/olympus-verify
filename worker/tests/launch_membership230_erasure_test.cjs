// The original Native Worker/OAuth/erasure-job fixture, with an actual current-profile S2/S4 venue.
'use strict';
const fs230=require('node:fs'),path230=require('node:path'),{Module:Module230}=require('node:module');
const parent230=fs230.readFileSync(path230.join(__dirname,'privacy_native_erasure_mode_test.cjs'),'utf8'),cuts230=[...parent230.matchAll(/^\(async\(\)=>\{/gm)];
if(cuts230.length!==1||parent230.split("const MEMBER='1551234567890123456'").length!==2)throw Error('launch230_native_erasure_fixture_boundary_changed');
const prefix230=parent230.slice(0,cuts230[0].index).replace("const MEMBER='1551234567890123456'","const MEMBER='1552077551839617104'");
const body230=String.raw`
(async()=>{
 const V=load('shared-membership-cutover230'),N=load('privacy-shared-member-cutover230'),E=load('privacy-native-erasure-roles'),hash=x=>require('node:crypto').createHash('sha256').update(x).digest('hex');
 async function ready(metadata=false){const f=fixture();if(metadata)f.db.exec(load('privacy-provider-metadata').PROVIDER_METADATA_DDL);const closure={version:1,contract:V.SHARED_MEMBER230_CONTRACT,operationId:'c'.repeat(32),priorEpoch:EPOCH,writeEpoch:'b'.repeat(32),sourceCommit:'d'.repeat(40),sourceTree:'e'.repeat(40),bundleSHA256:'f'.repeat(64),providerA:'11111111-2222-4333-8444-555555555555',writerCoverageSHA256:'1'.repeat(64),debtPredicateSHA256:hash(N.SHARED_MEMBER230_OLD_CUSTODY_CLEAR_SQL),createdAt:clock,expiresAt:clock+300},text=JSON.stringify(closure),digest=hash(text);
  await N.executeSharedMember230Open(await N.captureSharedMember230Open(await N.executeSharedMember230Fence(await N.captureSharedMember230Fence(f.env.DB,text,digest)),'enabled'));
  Object.assign(f.env,{PRIVACY_WRITE_ADMISSION_EPOCH:'b'.repeat(32),VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:JSON.stringify({version:1,guild:'OLYMPUS PRIME',realm:'Fixture Live Realm'}),MEMBERSHIP_ROLE_SETTLEMENT_ENABLED:'true',SHARED_MEMBERSHIP230_MODE:'enabled',SHARED_MEMBERSHIP230_CLOSURE_JSON:text,SHARED_MEMBERSHIP230_CLOSURE_SHA256:digest});
  f.writer=A.createPrivacyWriteAdmissionDatabase(f.env.DB,'writer',LAYOUT,'b'.repeat(32));
  const cookie=await f.signIn(ID);await seedPersonal(f,{roles:1});f.inventoryUnavailable=true;const req=await request(f,cookie);assert.equal(req.response.status,202);f.inventoryUnavailable=false;
  const env={...f.env,DB:f.writer},proof=await authority.readErasureProof(env,OP);assert.ok(proof);f.http=[];return {f,env,proof};
 }
 for(const metadata of[false,true]){const {f,env,proof}=await ready(metadata);try{const objects=JSON.stringify(f.rows('SELECT type,name,tbl_name,sql FROM sqlite_master ORDER BY type,name')),out=await E.cleanupNativeErasureRoles(env,proof),row=f.raw("SELECT * FROM role_settlements WHERE purpose='launch_membership_erasure230'");
  check('actual original Native erasure job selects the closed new family and confirms its own DELETE, metadata='+metadata,out.state==='complete'&&out.removed===1&&row?.state==='settled'&&row.reason==='launch230_delete_acknowledged_and_confirmed'&&f.roles.get(ID).length===0);
  check('new erasure keeps existing seven-request/two-delete ceiling without duplicate qualification, metadata='+metadata,f.http.length<=7&&f.http.filter(x=>x.method==='DELETE').length===1&&E.NATIVE_ERASURE_ROLE_HTTP_MAX===7&&E.NATIVE_ERASURE_ROLE_DELETES===2);
  check('new erasure receipt leaves the exact pre-seal physical profile unchanged, metadata='+metadata,await A.admissionCatalogueCurrent(f.writer)&&JSON.stringify(f.rows('SELECT type,name,tbl_name,sql FROM sqlite_master ORDER BY type,name'))===objects);
 }finally{f.close();}}
 {const {f,env,proof}=await ready();try{const original=f.provider;f.provider=async(url,init)=>{if(init.method==='DELETE'){await original(url,init);throw Error('synthetic lost erasure DELETE response');}return original(url,init);};const out=await E.cleanupNativeErasureRoles(env,proof),row=f.raw("SELECT * FROM role_settlements WHERE purpose='launch_membership_erasure230'");
  check('lost new erasure DELETE response stays unknown even when upstream removed the role',out.state==='unknown'&&row?.state==='unknown'&&row.reason==='delete_outcome_unknown'&&f.roles.get(ID).length===0);
  const calls=f.http.length;f.provider=original;clock+=121;const again=await E.cleanupNativeErasureRoles(env,proof),retained=f.raw('SELECT * FROM role_settlements WHERE id=?',row.id);
  check('later absence does not discharge or retry the older unknown new erasure effect',again.state==='complete'&&retained.state==='unknown'&&retained.reason==='delete_outcome_unknown'&&f.http.slice(calls).every(x=>x.method==='GET'));
 }finally{f.close();}}
 {const {f,env,proof}=await ready();try{const out=await E.cleanupNativeErasureRoles(env,{...proof,subjectGeneration:'e'.repeat(32)});check('new erasure rejects stale original subject generation before provider access',out.state==='held'&&f.http.length===0);}finally{f.close();}}
 {const {f,env,proof}=await ready();try{const out=await E.cleanupNativeErasureRoles(env,{...proof,accountIncarnation:'e'.repeat(32)});check('new erasure rejects a substituted original job birth before provider access',out.state==='held'&&f.http.length===0);}finally{f.close();}}
 {const {f,env,proof}=await ready();try{const out=await E.cleanupNativeErasureRoles({...env,SHARED_MEMBERSHIP230_MODE:'close-only'},proof);check('close-only does not route the fixed target through the older erasure writer',out.state==='held'&&f.http.every(x=>x.method==='GET')&&f.rows("SELECT id FROM role_settlements WHERE purpose='launch_membership_erasure230'").length===0);}finally{f.close();}}
 {const {f,env,proof}=await ready();try{await f.write('DELETE FROM site_settings WHERE key LIKE ?',V.SHARED_MEMBER230_SEAL_PREFIX+'%');const out=await E.cleanupNativeErasureRoles(env,proof);check('missing exact venue seal cannot dispatch a new erasure DELETE',out.state!=='complete'&&f.http.every(x=>x.method==='GET'));}finally{f.close();}}
 {const {f,env,proof}=await ready();try{const other=A.createPrivacyWriteAdmissionDatabase(f.env.DB,'writer',LAYOUT,'a'.repeat(32));const out=await E.cleanupNativeErasureRoles({...env,DB:other},proof);check('outside-epoch restored writer cannot dispatch a new erasure DELETE',out.state!=='complete'&&f.http.length===0);}finally{f.close();}}
 console.log(checks+'/'+checks+' launch230 Native erasure checks passed');
})().catch(e=>{console.error(e);process.exitCode=1;});`;
const runner230=new Module230(__filename,module);runner230.filename=__filename;runner230.paths=module.paths;runner230._compile(prefix230+body230,__filename);
