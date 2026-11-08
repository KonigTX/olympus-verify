// Synthetic-only actual Workerd/D1. No public production route or provider call.
import app,{originalScheduledCallbackObservation,originalScheduledCallbackPhysicalCostObservation} from '../src/index.ts';
import {postVerify} from '../src/ingest.ts';
import {codeFor,dayBucket} from '../src/codes.ts';
import {createPrivacyWriteAdmissionDatabase} from '../src/privacy-write-admission.ts';
import {runNativeSubject232} from '../src/full-release-pass.ts';
import {callBudget} from '../src/roles.ts';
import {migrateCanonicalRank233} from '../src/role-settlements.ts';
import {captureRuntimeVenue230,runtimeVenue230Facts} from '../src/shared-membership-cutover230.ts';
import {betaResetReceiptRetentionStatements} from '../src/beta-reset-retention.ts';
import {NATIVE_RANK_NAMES232,NATIVE_SCOPE232} from '../src/native-rank-reconciliation232.ts';
import {CANONICAL_RANKS233,CANONICAL_PROFILE233} from '../src/canonical-ranks233.ts';
import {CANONICAL_MIGRATION_PROFILE233} from '../src/canonical-migration233.ts';
const OLD230_DEBT='2bc8a653168cd702a7804fc1631abc6a68ee8200c500fb1345b3087387b89f86',hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join(''),H=async x=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(x)));
const method=(o,k)=>{for(let p=o;p;p=Object.getPrototypeOf(p)){const d=Object.getOwnPropertyDescriptor(p,k);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')throw Error('original_method');return d.value;}}throw Error('original_method');};
export function fixture238(seed){const spent=new Set(),saved=new Map();let callback=null;return {
 async scheduled(event,bindings,ctx){
  const state=saved.get('veteran');if(!state)throw Error('fixture238_original_setup_required');
  callback={event,ctx};await app.scheduled(event,state.env,ctx);
 },
 async fetch(request,bindings){
 const route=new URL(request.url).pathname;
 if(route==='/prepare'){
  const s=saved.get('veteran');if(!s)return new Response(null,{status:409});
  const {env,db}=s;const scenario=bindings.CASE238||'positive';s.scenario=scenario;
  // A second independent pending request is consumed by the original product writer; no ACK is cloned or edited.
  const second='229999999999999999',secondName='Synthetic Second',secondKey='synthetic second',secondGuid='Player-4613-ABCDEF12',at=Math.floor(Date.now()/1000);
  await env.DB.prepare("INSERT INTO privacy_subjects(subject_id,generation,state,revision,created_at,updated_at)VALUES(?1,?2,'active',0,?3,?3)").bind(second,'a'.repeat(32),at-3600).run();
  await env.DB.prepare("INSERT INTO pending(discord_id,name_key,name,created_at,expires_at)VALUES(?1,?2,?3,?4,?5)").bind(second,secondKey,secondName,at,at+300).run();
  await env.DB.batch([env.DB.prepare("INSERT INTO roster_members(snapshot_id,name,name_key,guid,rank,rank_index,level)VALUES(1,?1,?2,?3,'Veteran',6,60)").bind(secondName,secondKey,secondGuid),env.DB.prepare("UPDATE roster_snapshots SET member_count=member_count+1 WHERE id=1")]);
  const secondCode=await codeFor(env.VERIFY_SECRET,secondName,dayBucket(new Date(at*1000))),scope=JSON.parse(env.VERIFY_NATIVE_SCOPE),scopeHash=(await H('native-scope|1|'+scope.guild+'|'+scope.realm)).slice(0,16),macKey=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.VERIFY_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']),mac=hex(await crypto.subtle.sign('HMAC',macKey,new TextEncoder().encode('membership|1|'+secondKey+'|'+secondGuid+'|'+secondCode+'|1|'+at+'|'+scopeHash))).slice(0,32);
  const secondReply=await postVerify(env,{character:secondName,code:secondCode,source:'whisper',guid:secondGuid,nativeMembership:{version:1,member:true,observedAt:at,scopeHash,mac}});
  const secondResult=await secondReply.json();if(secondReply.status!==200||secondResult.roleGranted!==true)throw Error('fixture238_second_original_verification_failed');
  s.second=second;

  if(scenario==='collision')env.BETA_RESET_REMOVALS_ENABLED='true';
  if(scenario==='inactive')env.CANONICAL_RANKS233='off';
  if(scenario==='native-off')env.PRIVACY_NATIVE_ERASURE_ENABLED='false';
  if(scenario==='wrong-layout')env.PRIVACY_WRITE_ADMISSION_LAYOUT='canonical';
  await env.DB.batch([
   env.DB.prepare("INSERT INTO roster_snapshots(id,exported_at,received_at,source,member_count,complete,trusted)SELECT 2,CAST(strftime('%s','now')AS INTEGER),CAST(strftime('%s','now')AS INTEGER),source,member_count,1,1 FROM roster_snapshots WHERE id=1"),
   env.DB.prepare("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index,level)SELECT 2,name_key,name,guid,CASE WHEN guid IN('Player-4613-12345678','Player-4613-ABCDEF12') THEN 'Raider' ELSE rank END,CASE WHEN guid IN('Player-4613-12345678','Player-4613-ABCDEF12') THEN 7 ELSE rank_index END,level FROM roster_members WHERE snapshot_id=1")
  ]);
  if(scenario==='stale')await env.DB.prepare("UPDATE roster_snapshots SET exported_at=CAST(strftime('%s','now')AS INTEGER)-601 WHERE id=2").run();
  if(scenario==='interval')await env.DB.prepare("INSERT INTO audit(ts,actor,action,subject,details)VALUES(CAST(strftime('%s','now')AS INTEGER),'system','role.fresh_state','ingest',?1)").bind(JSON.stringify({n:2,g:''})).run();
  if(scenario==='unknown')await env.DB.prepare("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,attempts,subject_generation,created_at,expires_at,native_profile)VALUES(?1,?2,'canonical_routine233',?3,?4,1,'unknown','synthetic_unresolved',0,?5,1,2,?6)").bind('e'.repeat(32),s.subject,env.GUILD_ID,CANONICAL_RANKS233[8].roleId,'a'.repeat(32),CANONICAL_PROFILE233).run();
  s.originalACKs=(await db.prepare("SELECT * FROM role_settlements WHERE desired=1 AND attempts=1 AND state='settled' ORDER BY id").all()).results;
  s.beforeControl=await db.prepare("SELECT epoch,mode,active,nonce,purpose FROM privacy_write_admission").first();
  s.start=s.wires.length;return Response.json({prepared:true,scenario});
 }
 if(route==='/observe'){
  const s=saved.get('veteran');let observation=null,cost=null,observationError=false;
  try{observation=originalScheduledCallbackObservation(callback.event,callback.ctx);}catch{observationError=true;}
  try{cost=originalScheduledCallbackPhysicalCostObservation(callback.event,callback.ctx);}catch{}
  // Observer polling reads only the original scope record until every deferred scope has returned.
  if(cost&&!cost.allScopesReturned)return Response.json({pending:true,observation,observationError,cost});
  const callbackEnd=s.wires.length;
  const rows=(await s.db.prepare("SELECT id,purpose,role_id,desired,state,reason,attempts FROM role_settlements ORDER BY created_at,id").all()).results;
  const originalAfter=(await s.db.prepare("SELECT * FROM role_settlements WHERE id IN(SELECT value FROM json_each(?1)) ORDER BY id").bind(JSON.stringify(s.originalACKs.map(r=>r.id))).all()).results;
  const control=await s.db.prepare("SELECT epoch,mode,active,nonce,purpose FROM privacy_write_admission").first();
  return Response.json({scenario:s.scenario,observation,observationError,cost,rows,wires:s.wires,start:s.start,end:callbackEnd,originalACKsUnchanged:JSON.stringify(s.originalACKs)===JSON.stringify(originalAfter),controlUnchanged:JSON.stringify(control)===JSON.stringify(s.beforeControl),clockOverride:false,handlerOverride:false,providerCalls:0});
 }

 const kind=new URL(request.url).pathname.slice(1),kinds=['gm','stewart','veteran','member','unknown0','put-unknown','entitlement','migration','empty-from','empty-mismatch','empty-nonmember','empty-unknown'];
 if(request.method!=='POST'||spent.has(kind)||!kinds.includes(kind)&&!['gm-demote','migration-verify'].includes(kind))return new Response(null,{status:404});spent.add(kind);
 if(kind==='migration-verify'){
  const state=saved.get('migration');if(!state)return new Response(null,{status:404});const {db,env,subject,wires}=state,start=wires.length;let result,error=null;
  try{
   await env.DB.batch([env.DB.prepare("INSERT INTO roster_snapshots(id,exported_at,received_at,source,member_count,complete,trusted)SELECT 2,CAST(strftime('%s','now')AS INTEGER),CAST(strftime('%s','now')AS INTEGER),source,member_count,1,1 FROM roster_snapshots WHERE id=1"),env.DB.prepare("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index,level)SELECT 2,name_key,name,guid,CASE WHEN guid='Player-4613-12345678' THEN 'Member' ELSE rank END,CASE WHEN guid='Player-4613-12345678' THEN 8 ELSE rank_index END,level FROM roster_members WHERE snapshot_id=1")]);
   const scope=JSON.parse(env.VERIFY_NATIVE_SCOPE),now=seed.now,guid='Player-4613-12345678',scopeHash=(await H('native-scope|1|'+scope.guild+'|'+scope.realm)).slice(0,16),key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.VERIFY_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']),mac=hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('membership|1|fern melder|'+guid+'|'+seed.code+'|1|'+now+'|'+scopeHash))).slice(0,32);
   const response=await postVerify(env,{character:'Fern Melder',code:seed.code,source:'whisper',guid,nativeMembership:{version:1,member:true,observedAt:now,scopeHash,mac}});result={status:response.status,body:await response.json()};
  }catch(e){error=String(e?.stack||e);}
  const end=wires.length,rows=await db.prepare('SELECT purpose,role_id,desired,state,reason,attempts FROM role_settlements ORDER BY created_at,id').all();return Response.json({kind,result,error,rows:rows.results,wires,start,end,actualLocalWorkerdD1:true,clockOverride:false,providerCalls:0});
 }
 if(kind==='gm-demote'){
  const state=saved.get('gm');if(!state)return new Response(null,{status:404});const {db,env,subject,wires}=state;
  await env.DB.batch([env.DB.prepare("INSERT INTO roster_snapshots(id,exported_at,received_at,source,member_count,complete,trusted)SELECT 2,CAST(strftime('%s','now')AS INTEGER),CAST(strftime('%s','now')AS INTEGER),source,member_count,1,1 FROM roster_snapshots WHERE id=1"),env.DB.prepare("INSERT INTO roster_members(snapshot_id,name_key,name,guid,rank,rank_index,level)SELECT 2,name_key,name,guid,CASE WHEN guid='Player-4613-12345678' THEN 'Veteran' ELSE rank END,CASE WHEN guid='Player-4613-12345678' THEN 6 ELSE rank_index END,level FROM roster_members WHERE snapshot_id=1")]);
  const start=wires.length,result=await runNativeSubject232(env,subject,callBudget(env)),end=wires.length,rows=await db.prepare('SELECT purpose,role_id,desired,state,reason,attempts FROM role_settlements ORDER BY created_at,id').all();return Response.json({kind,actualLocalWorkerdD1:true,clockOverride:false,sourceCallbackOverride:false,result,rows:rows.results,wires,start,end,providerCalls:0});
 }
 const db=bindings['DB_'+kind.replaceAll('-','_')],subject=seed.tables.find(t=>t.name==='pending').rows[0].discord_id;
 const closure={...JSON.parse(seed.config.SHARED_MEMBERSHIP230_CLOSURE_JSON),debtPredicateSHA256:OLD230_DEBT,createdAt:seed.now-3600,expiresAt:seed.now-3300},closureJSON=JSON.stringify(closure),scope={version:1,...NATIVE_SCOPE232};
 const policy=JSON.stringify({version:1,enabled:true,profile:CANONICAL_PROFILE233,guildId:seed.config.GUILD_ID,ranks:CANONICAL_RANKS233.map(r=>({...r,permissions:'0'}))});
 const config={...seed.config,VERIFY_NATIVE_SCOPE:JSON.stringify(scope),NATIVE_RANK_SYNC232:'off',QR_NATIVE_ROLE_MAP:'off',FULL_RELEASE_ROLES:'off',CANONICAL_RANKS233:policy,SHARED_MEMBERSHIP230_CLOSURE_JSON:closureJSON,SHARED_MEMBERSHIP230_CLOSURE_SHA256:await H(closureJSON),DISCORD_BOT_TOKEN:seed.config.DISCORD_BOT_TOKEN+'-'+kind};
 if(kind==='entitlement')config.CANONICAL_ENTITLEMENTS233=JSON.stringify({version:1,profile:CANONICAL_PROFILE233,guildId:config.GUILD_ID,packetSHA256:'4'.repeat(64),entries:[{subject,generation:null,roleKey:'branch-gm'}]});
 const create=seed.objects.filter(x=>x.type!=='trigger'&&!x.name.startsWith('sqlite_')).map(x=>db.prepare(x.sql));while(create.length)await db.batch(create.splice(0,40));
 const order=['privacy_write_admission','privacy_rejection_expiry_control','site_settings','pending','roster_snapshots','roster_members','roster_first_seen','roster_effect_runs','audit'],index=kind==='stewart'?1:kind==='veteran'||kind==='entitlement'?6:kind==='member'?8:0;
 for(const table of [...seed.tables].sort((a,b)=>order.indexOf(a.name)-order.indexOf(b.name)))for(const original of table.rows){const row={...original};if(table.name==='pending'&&Object.hasOwn(row,'subject_generation'))row.subject_generation='a'.repeat(32);if(table.name==='site_settings'&&row.key==='membership230:closure:'+closure.operationId)row.value=closureJSON;if(table.name==='roster_snapshots'){row.source='addon-native-v1:'+JSON.stringify(scope);row.member_count=907;}if(table.name==='roster_members'){row.rank=NATIVE_RANK_NAMES232[index];row.rank_index=index;}const names=Object.keys(row);await db.prepare('INSERT INTO "'+table.name+'"('+names.map(n=>'"'+n+'"').join(',')+')VALUES('+names.map(()=>'?').join(',')+')').bind(...names.map(n=>row[n])).run();}
 const roster=await db.prepare('SELECT snapshot_id FROM roster_members LIMIT 1').first(),fill=[];for(let i=0;i<906;i++){const name='Synthetic '+i;fill.push(db.prepare('INSERT INTO roster_members(snapshot_id,name,name_key,guid,rank,rank_index,level)VALUES(?1,?2,?3,?4,?5,?6,60)').bind(roster.snapshot_id,name,name.toLowerCase(),'Player-4613-'+(0x10000000+i).toString(16).toUpperCase(),NATIVE_RANK_NAMES232[i%10],i%10));}while(fill.length)await db.batch(fill.splice(0,40));
 if(kind==='unknown0'||kind==='empty-unknown')await db.prepare("INSERT INTO role_settlements(id,subject,purpose,guild_id,role_id,desired,state,reason,attempts,subject_generation,created_at,expires_at)VALUES(?1,?2,'fresh_roster_rank',?3,?4,1,'unknown','synthetic_old_unresolved',0,?5,?6,?6)").bind('e'.repeat(32),subject,config.GUILD_ID,'1561095379909353472','f'.repeat(32),seed.now-900).run();
 await db.prepare("INSERT INTO privacy_subjects(subject_id,generation,state,revision,created_at,updated_at)VALUES(?1,?2,'active',0,?3,?3) ON CONFLICT(subject_id)DO NOTHING").bind(subject,'a'.repeat(32),seed.now-3600).run();
 const triggers=seed.objects.filter(x=>x.type==='trigger').map(x=>db.prepare(x.sql));while(triggers.length)await db.batch(triggers.splice(0,40));
 const schema=await db.prepare('SELECT type,name,tbl_name,sql FROM sqlite_master ORDER BY type,name').all(),wires=[],fetcher=Object.getOwnPropertyDescriptor(db,'fetcher').value,send=method(fetcher,'fetch');Object.defineProperty(fetcher,'fetch',{configurable:true,writable:false,value:async function(input,init){const w={requestBody:init?.body,status:null,responseBody:null};wires.push(w);const r=await Reflect.apply(send,fetcher,[input,init]);w.status=r.status;w.responseBody=await r.clone().text();return r;}});
 const env={...config,DB:createPrivacyWriteAdmissionDatabase(db,'writer','recorded-live-pre-seal-20261017',config.PRIVACY_WRITE_ADMISSION_EPOCH)};let result,error=null,repeat=null,retention=null;const start=wires.length;
 try{
  if(kind==='migration'||kind.startsWith('empty-')){
   const selected=await captureRuntimeVenue230(env);if(selected.mode!=='enabled')throw Error('actual_venue_held');const v=runtimeVenue230Facts(selected.venue);
   env.CANONICAL_MIGRATION_SOURCE_TREE233='2'.repeat(40);env.CANONICAL_MIGRATION233=JSON.stringify({version:1,profile:CANONICAL_MIGRATION_PROFILE233,guildId:config.GUILD_ID,operationId:'1'.repeat(32),epoch:v.epoch,seal:await H(v.sealJSON),sourceTree:env.CANONICAL_MIGRATION_SOURCE_TREE233,policySHA256:await H(policy),packetSHA256:'3'.repeat(64),issuedAt:seed.now,expiresAt:seed.now+120,entries:[{subject,generation:null,currentRoles:kind==='migration'?['1552077551839617104','1561095726115725373']:[],targetRole:CANONICAL_RANKS233[0].roleId}]});
   result=await migrateCanonicalRank233(env,subject,callBudget(env));repeat=await migrateCanonicalRank233(env,subject,callBudget(env));
  }else{
   const now=seed.now,guid='Player-4613-12345678',scopeHash=(await H('native-scope|1|'+scope.guild+'|'+scope.realm)).slice(0,16),key=await crypto.subtle.importKey('raw',new TextEncoder().encode(config.VERIFY_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']),mac=hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('membership|1|fern melder|'+guid+'|'+seed.code+'|1|'+now+'|'+scopeHash))).slice(0,32);
   const response=await postVerify(env,{character:'Fern Melder',code:seed.code,source:'whisper',guid,nativeMembership:{version:1,member:true,observedAt:now,scopeHash,mac}});result={status:response.status,body:await response.json()};if(kind==='put-unknown')repeat=await runNativeSubject232(env,subject,callBudget(env));
  }
  const retentionStart=wires.length;const out=await env.DB.batch(betaResetReceiptRetentionStatements(env));retention={start:retentionStart,end:wires.length,success:out.every(r=>r.success===true)};
 }catch(e){error=String(e?.stack||e);}
 const end=wires.length,rows=await db.prepare('SELECT id,purpose,role_id,desired,state,reason,attempts,request_digest,claim_nonce IS NOT NULL AS claimed,native_profile FROM role_settlements ORDER BY created_at,id').all(),control=await db.prepare('SELECT epoch,mode,active,nonce,purpose FROM privacy_write_admission').first(),after=await db.prepare('SELECT type,name,tbl_name,sql FROM sqlite_master ORDER BY type,name').all();saved.set(kind,{env,db,subject,wires});
 return Response.json({kind,actualLocalWorkerdD1:true,clockOverride:false,sourceCallbackOverride:false,result,error,repeat,retention,rows:rows.results,wires,start,end,rosterRows:907,schemaUnchanged:JSON.stringify(schema.results)===JSON.stringify(after.results),control,providerCalls:0});
}};}
