// Build230 original-source capabilities over exact pre-seal Native SQLite. No provider.
'use strict';
const assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite'),{createHash}=require('node:crypto');
const J=require('./privacy_rejection_decision_test.cjs'),L=J.loader(),V=L('shared-membership-cutover230'),N=L('privacy-shared-member-cutover230'),A=L('privacy-write-admission'),S=L('privacy-serving-authority');
const T=1800000000,OLD='a'.repeat(32),NEXT='b'.repeat(32),OP='c'.repeat(32),G=V.SHARED_MEMBER230_GUILD,R=V.SHARED_MEMBER230_ROLE;
let checks=0;const h=x=>createHash('sha256').update(x).digest('hex');
function eq(label,a,b){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),label);checks++;console.log('PASS '+label);}
async function refusal(label,fn){await assert.rejects(fn,undefined,label);checks++;console.log('PASS '+label);}
function fixture(options={}){
 const db=new DatabaseSync(':memory:',{enableForeignKeyConstraints:true}),cat=L('privacy-write-admission-catalogue'),source=JSON.parse(cat.ADMISSION_COOKIE_PRE_SEAL_SOURCES_JSON).recordedLive,p=source.profile;
 db.function('strftime',(format,input)=>{assert.equal(format,'%s');assert.equal(input,'now');return String(J.fixtureOriginalClock());});for(const t of p.tables)db.exec(t.sql);db.exec(p.slotSQL);for(const i of p.indexes)db.exec(i.sql);
 for(const o of source.objects)if(o[0]==='table'&&o[1]==='_cf_KV')db.exec(o[3]);
 if(options.metadata)db.exec(L('privacy-provider-metadata').PROVIDER_METADATA_DDL);
 db.prepare("INSERT INTO privacy_write_admission(singleton,protocol,epoch,mode,active,nonce,purpose,entry_changes,logical_changes) VALUES(1,'olympus-write-admission-epoch-2',?,'serving',0,'','',7,9)").run(OLD);
 db.prepare("INSERT INTO site_settings(key,value,updated_at)VALUES('auditTypedNames','115',?)").run(T);
 for(const t of p.triggers)db.exec(t.sql);
 let hook=null,calls=0,lose=false;
 const execute=(sql,values)=>{const s=db.prepare(sql),rows=s.columns().length?s.all(...values):(s.run(...values),[]);return {success:true,results:rows,meta:{changes:db.prepare('SELECT changes() n').get().n}};};
 function statement(sql,values=[]){return Object.freeze({sql,values:Object.freeze(values),bind(...v){return statement(sql,v);},async first(){return execute(sql,values).results[0]??null;},async all(){return execute(sql,values);}});}
 const raw=Object.freeze({prepare(sql){return statement(sql);},async batch(statements){calls++;if(hook)hook(statements);db.exec('BEGIN IMMEDIATE');let out;try{out=statements.map(s=>execute(s.sql,s.values));db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}if(lose){lose=false;throw Error('synthetic committed reply lost');}return out;}});
 const c={version:1,contract:V.SHARED_MEMBER230_CONTRACT,operationId:OP,priorEpoch:OLD,writeEpoch:NEXT,sourceCommit:'d'.repeat(40),sourceTree:'e'.repeat(40),bundleSHA256:'f'.repeat(64),providerA:'11111111-2222-4333-8444-555555555555',writerCoverageSHA256:'1'.repeat(64),debtPredicateSHA256:h(N.SHARED_MEMBER230_OLD_CUSTODY_CLEAR_SQL),createdAt:T,expiresAt:T+300};
 const json=JSON.stringify(c),digest=h(json),control=()=>db.prepare('SELECT epoch,mode,active,entry_changes,logical_changes FROM privacy_write_admission').get();
 return {db,raw,c,json,digest,control,hook:x=>hook=x,lose:()=>lose=true,calls:()=>calls};
}
function legacy(f,changes={}){const r={id:'1'.repeat(32),subject:'123456789012345678',purpose:'beta_guard_grant',guild_id:G,role_id:R,desired:1,state:'settled',reason:'legacy_put_acknowledged',claim_nonce:'2'.repeat(32),attempts:1,created_at:1792688300,expires_at:1792688600,checked_at:1792688310,...changes};const keys=Object.keys(r);f.db.prepare("UPDATE privacy_write_admission SET active=1,nonce=?,purpose='writer'").run('e'.repeat(32));try{f.db.prepare(`INSERT INTO role_settlements(${keys.join(',')})VALUES(${keys.map(()=>'?').join(',')})`).run(...keys.map(k=>r[k]));}finally{f.db.prepare("UPDATE privacy_write_admission SET active=0,nonce='',purpose=''").run();}}
async function main(){
 for(const metadata of[false,true]){
  J.fixtureAdvance(T);const f=fixture({metadata});legacy(f);const objects=f.db.prepare('SELECT type,name,tbl_name,sql FROM sqlite_master ORDER BY type,name').all();
  const cap=await N.captureSharedMember230Fence(f.raw,f.json,f.digest);eq('precheck read-only '+metadata,f.control(),{epoch:OLD,mode:'serving',active:0,entry_changes:7,logical_changes:9});
  const ack=await N.executeSharedMember230Fence(cap);eq('S2 same atomic fence retains counters '+metadata,f.control(),{epoch:NEXT,mode:'closed',active:0,entry_changes:7,logical_changes:9});
  eq('seal matches original exact bytes '+metadata,f.db.prepare('SELECT value FROM site_settings WHERE key=?').get(V.SHARED_MEMBER230_SEAL_PREFIX+OP).value,f.json);
  await refusal('serialized/copied FenceAck cannot mint open '+metadata,()=>N.captureSharedMember230Open({...ack},'enabled'));
  const open=await N.captureSharedMember230Open(ack,'enabled'),opened=await N.executeSharedMember230Open(open);eq('same original ACK opens fresh epoch '+metadata,N.sharedMember230OpenFacts(opened).mode,'enabled');
  eq('exact schema unchanged '+metadata,f.db.prepare('SELECT type,name,tbl_name,sql FROM sqlite_master ORDER BY type,name').all(),objects);
  await refusal('one S2 only '+metadata,()=>N.executeSharedMember230Fence(cap));await refusal('one open/abort shared spend '+metadata,()=>N.captureSharedMember230Open(ack,'off'));
 }
 for(const changes of[{state:'unknown'},{state:'held',reason:'past_effect_absent'},{attempts:0,claim_nonce:null},{purpose:'native_account_erasure_role',desired:0},{checked_at:null},{checked_at:1792688400},{created_at:1792688400,expires_at:1792688700},{claim_nonce:'bad'},{subject_generation:'3'.repeat(32)},{reason:'fresh_server_confirmed'},{native_guid:'Player-unknown'},{claim_nonce:'2'.repeat(32)+'\0hidden'},{subject:'123456789012345678\0hidden'}]){
  J.fixtureAdvance(T);const f=fixture();legacy(f,changes);await refusal('old physical custody holds '+JSON.stringify(changes),()=>N.captureSharedMember230Fence(f.raw,f.json,f.digest));eq('held precheck leaves serving',f.control().mode,'serving');
 }
 {const f=fixture();legacy(f);legacy(f,{id:'3'.repeat(32),role_id:'223456789012345678',request_digest:'1'.repeat(32)});await refusal('cross-target child obligation holds parent',()=>N.captureSharedMember230Fence(f.raw,f.json,f.digest));}
 {const f=fixture();const cap=await N.captureSharedMember230Fence(f.raw,f.json,f.digest);let injected=false;f.hook(()=>{if(!injected){injected=true;legacy(f,{state:'dispatching',reason:'dispatching'});}});await refusal('late pre-effect claim aborts SAME S2 batch',()=>N.executeSharedMember230Fence(cap));eq('late claim does not close epoch',f.control().epoch,OLD);eq('failed atomic cut never writes seal',f.db.prepare('SELECT COUNT(*) n FROM site_settings WHERE key LIKE ?').get(V.SHARED_MEMBER230_SEAL_PREFIX+'%').n,0);await refusal('held S2 cannot retry',()=>N.executeSharedMember230Fence(cap));}
 {const f=fixture();const cap=await N.captureSharedMember230Fence(f.raw,f.json,f.digest);f.lose();await refusal('committed S2 reply lost stays unknown',()=>N.executeSharedMember230Fence(cap));eq('lost S2 may have committed',f.control().mode,'closed');await refusal('SELECT/current state does not remint lost ACK',()=>N.captureSharedMember230Open({},'off'));await refusal('lost S2 no resend',()=>N.executeSharedMember230Fence(cap));}
 {const f=fixture();const ack=await N.executeSharedMember230Fence(await N.captureSharedMember230Fence(f.raw,f.json,f.digest));const cap=await N.captureSharedMember230Open(ack,'off');const out=await N.executeSharedMember230Open(cap);eq('bounded OFF abort opens only fresh epoch',[f.control().epoch,N.sharedMember230OpenFacts(out).mode],[NEXT,'off']);}
 {const f=fixture();const ack=await N.executeSharedMember230Fence(await N.captureSharedMember230Fence(f.raw,f.json,f.digest));J.fixtureAdvance(T+300);await refusal('original 300second deadline never renews',()=>N.captureSharedMember230Open(ack,'enabled'));eq('expired remains closed',f.control().mode,'closed');J.fixtureAdvance(T);}
 {const f=fixture();f.db.exec('CREATE TABLE unqualified230(x)');await refusal('exact whole profile rejects added object',()=>N.captureSharedMember230Fence(f.raw,f.json,f.digest));}
 {const f=fixture();f.db.exec('PRAGMA foreign_keys=OFF');await refusal('FK disabled held',()=>N.captureSharedMember230Fence(f.raw,f.json,f.digest));}
 {const f=fixture();f.db.exec('CREATE TEMP TABLE foreign230(x)');await refusal('TEMP schema held',()=>N.captureSharedMember230Fence(f.raw,f.json,f.digest));}
 {const f=fixture();await refusal('wrong closure hash refuses before Native read',()=>N.captureSharedMember230Fence(f.raw,f.json,'0'.repeat(64)));eq('bad hash does not reach Native',f.calls(),0);}
 {const f=fixture(),json=JSON.stringify({...f.c,debtPredicateSHA256:'0'.repeat(64)});await refusal('different custody policy cannot mint fence',()=>N.captureSharedMember230Fence(f.raw,json,h(json)));eq('bad policy has no Native group',f.calls(),0);}
 {const f=fixture();assert.throws(()=>V.parseSharedMemberClosure230(JSON.stringify({...f.c,sourceCommit:['d'.repeat(40)]})) );checks++;console.log('PASS non-string canonical field cannot coerce');}
 for(const mode of[undefined,'off','close-only','bad']){const env=mode===undefined?{}:{SHARED_MEMBERSHIP230_MODE:mode};eq('selection '+mode,(await V.captureRuntimeVenue230(env)).mode,mode===undefined||mode==='off'?'off':mode==='close-only'?'close-only':'held');eq('only fixed target restriction '+mode,V.oldSharedMemberProducerHeld230(env,G,'223456789012345678'),false);}
 {let read=0;const env={};Object.defineProperty(env,'SHARED_MEMBERSHIP230_MODE',{get(){read++;return 'off';}});eq('getter mode holds without invocation',[(await V.captureRuntimeVenue230(env)).mode,V.oldSharedMemberProducerHeld230(env,G,R),read],['held',true,0]);}
 {const env=Object.create({SHARED_MEMBERSHIP230_MODE:'off'});eq('inherited mode held',[(await V.captureRuntimeVenue230(env)).mode,V.oldSharedMemberProducerHeld230(env,G,R)],['held',true]);}
 // Actual registered Native boundary + exact provider alias. No synthetic venue mint.
 {const f=fixture();await N.executeSharedMember230Open(await N.captureSharedMember230Open(await N.executeSharedMember230Fence(await N.captureSharedMember230Fence(f.raw,f.json,f.digest)),'enabled'));
  const db=A.createPrivacyWriteAdmissionDatabase(f.raw,'writer','recorded-live-pre-seal-20261017',NEXT),env={DB:db,GUILD_ID:G,ROLE_GUILD_MEMBER:R,VERIFY_MEMBERSHIP_ONLY:'true',VERIFY_NATIVE_SCOPE:JSON.stringify({version:1,guild:'OLYMPUS PRIME',realm:'CAMWOW US2 Realm 3 PvE'}),VERIFY_SECRET:'synthetic-only',PRIVACY_ERASURE_ENABLED:'true',PRIVACY_NATIVE_ERASURE_ENABLED:'true',PRIVACY_WRITE_ADMISSION_ENABLED:'true',PRIVACY_WRITE_ADMISSION_LAYOUT:'recorded-live-pre-seal-20261017',PRIVACY_WRITE_ADMISSION_EPOCH:NEXT,SHARED_MEMBERSHIP230_MODE:'enabled',SHARED_MEMBERSHIP230_CLOSURE_JSON:f.json,SHARED_MEMBERSHIP230_CLOSURE_SHA256:f.digest};
  const selected=await V.captureRuntimeVenue230(env);eq('actual registered venue admitted',selected.mode,'enabled');const alias=S.privacyProviderCustodyDatabase(env),effect={...env,DB:alias};V.assertRuntimeVenue230(effect,selected.venue);checks++;console.log('PASS original cached provider alias accepted');
  const p=V.runtimeVenue230Predicate(effect,selected.venue,1);eq('runtime exact seal predicate consumes actual admitted Native',await alias.prepare('SELECT CASE WHEN '+p.sql+' THEN 1 ELSE 0 END AS admitted').bind(...p.values).first(),{admitted:1});
  await refusal('copied venue refused',async()=>V.assertRuntimeVenue230(effect,{}));await refusal('equal-looking DB refused',async()=>V.assertRuntimeVenue230({...effect,DB:{...alias}},selected.venue));
  const accessor={...effect};let invoked=0;Object.defineProperty(accessor,'DB',{get(){invoked++;return alias;}});await refusal('actual venue refuses DB accessor without invocation',async()=>V.assertRuntimeVenue230(accessor,selected.venue));eq('DB accessor invocation count stays zero',invoked,0);
  const branch={...env,VERIFY_NATIVE_SCOPE:JSON.stringify({version:1,guild:'Olympus II',realm:'CAMWOW US2 Realm 3 PvE'})};eq('branchII cannot grant flagship role',(await V.captureRuntimeVenue230(branch)).mode,'held');
  const oldDb=A.createPrivacyWriteAdmissionDatabase(f.raw,'writer','recorded-live-pre-seal-20261017',OLD);eq('outside expected epoch cannot adopt wrong registered DB',(await V.captureRuntimeVenue230({...env,DB:oldDb})).mode,'held');
  const proto={},race=Object.assign(Object.create(proto),env),pending=V.captureRuntimeVenue230(race);let inheritedReads=0;Object.defineProperty(proto,'QR_PHASE1_ENABLED',{get(){inheritedReads++;return 'true';}});eq('inherited formerly absent key introduced during hash holds',(await pending).mode,'held');eq('inherited new accessor not invoked',inheritedReads,0);
  await alias.prepare('DELETE FROM site_settings WHERE key=?').bind(V.SHARED_MEMBER230_SEAL_PREFIX+OP).run();eq('missing DB seal refuses runtime predicate',await alias.prepare('SELECT CASE WHEN '+p.sql+' THEN 1 ELSE 0 END AS admitted').bind(...p.values).first(),{admitted:0});
 }
 console.log('shared_membership230_cutover: '+checks+'/'+checks+' PASS');
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={fixture,legacy};
