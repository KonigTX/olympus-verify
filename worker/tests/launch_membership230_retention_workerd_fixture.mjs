// Real local Workerd/D1 compatibility, independent of the alternating cron phase.
// Adapted from the independently attributed provider diagnostic. No clock override,
// scheduled-controller substitution, provider call, or claim of future365-day expiry.
import {betaResetReceiptRetentionStatements} from '../src/beta-reset-retention.ts';
import {createPrivacyWriteAdmissionDatabase} from '../src/privacy-write-admission.ts';
import {qrErasureStatements} from '../src/qr-phase1-data.ts';
import * as catalogue from '../src/privacy-write-admission-catalogue.ts';
import {NATIVE_RANK_PROFILE232,NATIVE_RANK_NAMES232,NATIVE_SCOPE232,MIRROR_BY_NAME232,NATIVE_STEWART_ROLE232} from '../src/native-rank-reconciliation232.ts';
const EPOCH='a'.repeat(32),GUILD='236932545793490944',ROLE='1552077551839617104',SUBJECT='123456789012345678';
const STEWART232=NATIVE_STEWART_ROLE232,policy232=JSON.stringify({version:1,enabled:true,profile:NATIVE_RANK_PROFILE232,guildId:GUILD,nativeGuild:NATIVE_SCOPE232.guild,nativeRealm:NATIVE_SCOPE232.realm,membershipRole:ROLE,ranks:NATIVE_RANK_NAMES232.map((name,index)=>({index,name,roleId:name==='Stewart'?STEWART232:MIRROR_BY_NAME232[name]})),privileged:true});
const selected232={GUILD_ID:GUILD,ROLE_GUILD_MEMBER:ROLE,NATIVE_RANK_SYNC232:policy232};
let spent=false;
function originalMethod(o,k){for(let p=o;p;p=Object.getPrototypeOf(p)){const d=Object.getOwnPropertyDescriptor(p,k);if(d){if(!Object.hasOwn(d,'value')||typeof d.value!=='function')throw Error('fixture_original_method');return d.value;}}throw Error('fixture_missing_method');}
export default {async fetch(request,env){
 if(new URL(request.url).pathname!=='/run'||request.method!=='POST'||spent)return new Response(null,{status:404});spent=true;
 const db=env.DB,wires=[];let recording=false,activeWires=wires;
 const fetcher=Object.getOwnPropertyDescriptor(db,'fetcher')?.value,fetchMethod=originalMethod(fetcher,'fetch');
 Object.defineProperty(fetcher,'fetch',{configurable:true,writable:false,value:async function(input,init){
  if(this!==fetcher)throw Error('fixture_fetcher_changed');const row=recording?{requestBody:init?.body,responseBody:null,status:null}:null;if(row)activeWires.push(row);
  const response=await Reflect.apply(fetchMethod,fetcher,[input,init]);if(row){row.status=response.status;row.responseBody=await response.clone().text();}return response;
 }});
 const cat=JSON.parse(catalogue.ADMISSION_EXPECTED_JSON),seed=[];
 const flush=async()=>{while(seed.length)await db.batch(seed.splice(0,50));};
 for(const r of [...cat.tables,...cat.indexes])seed.push(db.prepare(r.sql));seed.push(db.prepare(catalogue.ADMISSION_CONTROL_DDL));await flush();
 const T=(await db.prepare("SELECT CAST(strftime('%s','now') AS INTEGER) AS t").first()).t;
 seed.push(db.prepare("INSERT INTO privacy_write_admission VALUES(1,?,0,'','',0,0,?,'serving')").bind(catalogue.ADMISSION_PROTOCOL,EPOCH));
 const row=(id,changes={})=>({id:id.repeat(32),subject:SUBJECT,purpose:'launch_membership230',guild_id:GUILD,role_id:ROLE,desired:1,state:'settled',reason:'launch230_put_acknowledged_and_confirmed',attempts:1,claim_nonce:(Number(id)+1).toString(16).repeat(32),subject_generation:null,request_digest:'f'.repeat(64),roster_id:1,native_guid:'Player-fixture-only',native_profile:'prime-native-230',created_at:T-10,expires_at:T+80,checked_at:T-9,...changes});
 const parent=row('5',{state:'held',reason:'launch230_compensated'}),records=[row('1'),row('3',{state:'unknown',reason:'launch230_provider_outcome_unknown'}),parent,row('7',{purpose:'launch_membership_compensation230',desired:0,request_digest:parent.id,native_profile:null,roster_id:null,native_guid:null,reason:'launch230_delete_acknowledged_and_confirmed',created_at:T-8,expires_at:T+292,checked_at:T-7})];
 const current=(id,change={})=>row(id,{claim_nonce:'b'.repeat(32),purpose:'launch_routine_membership232',native_profile:NATIVE_RANK_PROFILE232,native_guid:'Player-4466-12345678',native_rank:3,native_rank_name:'Officer',reason:'native232_put_acknowledged_and_confirmed',...change}),parent232=current('e',{state:'held',reason:'native232_compensated'});
 records.push(current('a'),current('c',{purpose:'fresh_roster_rank',role_id:MIRROR_BY_NAME232.Officer,state:'unknown',reason:'native232_provider_outcome_unknown'}),parent232,current('f',{purpose:'native_rank_compensation232',desired:0,request_digest:parent232.id,native_guid:null,native_rank:null,native_rank_name:null,roster_id:null,reason:'native232_delete_acknowledged_and_confirmed',created_at:T-8,expires_at:T+292,checked_at:T-7}));
 for(const r of records){const keys=Object.keys(r);seed.push(db.prepare(`INSERT INTO role_settlements(${keys.join(',')})VALUES(${keys.map(()=>'?').join(',')})`).bind(...keys.map(k=>r[k])));}await flush();
 for(const r of cat.triggers)seed.push(db.prepare(r.sql));await flush();
 const rows=async()=>(await db.prepare('SELECT * FROM role_settlements ORDER BY id').all()).results;
 const schema=async()=>(await db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all()).results;
 const before=await rows(),schemaBefore=await schema(),captured=[];
 betaResetReceiptRetentionStatements({...selected232,DB:{prepare(sql){captured.push(sql);return {sql};}}});
 const cases=[];recording=true;
 for(let i=0;i<captured.length;i++){const start=wires.length;try{const r=await db.prepare(captured[i]).run();cases.push({name:'raw-'+i,success:true,changes:r.meta?.changes,wireStart:start,wireEnd:wires.length});}catch(error){cases.push({name:'raw-'+i,success:false,error:String(error?.message||error),wireStart:start,wireEnd:wires.length});}}
 const admitted=createPrivacyWriteAdmissionDatabase(db,'writer','canonical',EPOCH);
 {const start=wires.length;try{const out=await admitted.batch(betaResetReceiptRetentionStatements({...selected232,DB:admitted}));cases.push({name:'admitted-pair',success:true,changes:out.map(x=>x.meta?.changes),wireStart:start,wireEnd:wires.length});}catch(error){cases.push({name:'admitted-pair',success:false,error:String(error?.message||error),wireStart:start,wireEnd:wires.length});}}
 recording=false;
 const after=await rows(),schemaAfter=await schema(),control=await db.prepare('SELECT epoch,mode,active,nonce,purpose FROM privacy_write_admission WHERE singleton=1').first();
 // D1 parser/execution qualification only. No erasure job, absence observation,
 // effect capability or provider authority is manufactured for this branch.
 const TARGET='123456789012345679',parentID='04'.repeat(16),terminalRecords=[];
 const terminalRow=(token,change={})=>current('0',{id:token.repeat(16),subject:TARGET,purpose:'fresh_roster_rank',role_id:STEWART232,attempts:0,claim_nonce:null,state:'unknown',reason:'fixture_unresolved232',...change});
 terminalRecords.push(terminalRow('01'),terminalRow('02',{state:'dispatching'}),terminalRow('03',{purpose:'native_rank_compensation232',guild_id:'236932545793490945',subject_generation:'c'.repeat(32),native_profile:'malformed-cross-guild'}),
  terminalRow('04',{state:'settled',attempts:1,claim_nonce:'b'.repeat(32),reason:'native232_put_acknowledged_and_confirmed'}),terminalRow('05',{state:'pending',desired:0,request_digest:parentID}),
  terminalRow('06',{state:'settled',attempts:1,claim_nonce:'b'.repeat(32),reason:'native232_put_acknowledged_and_confirmed'}),terminalRow('07',{state:'settled',reason:'native232_observed_without_dispatch'}),
  terminalRow('08',{purpose:'verified_member',native_profile:null}),terminalRow('09',{purpose:'native_rank_compensation232x',native_profile:'olympus-prime-live-20261105-v1x'}));
 await admitted.batch(terminalRecords.map(r=>{const keys=Object.keys(r);return admitted.prepare(`INSERT INTO role_settlements(${keys.join(',')})VALUES(${keys.map(()=>'?').join(',')})`).bind(...keys.map(k=>r[k]));}));
 const terminalRows=async()=>(await db.prepare('SELECT * FROM role_settlements WHERE subject=? ORDER BY id').bind(TARGET).all()).results;
 const capturedFamily=qrErasureStatements({PRIVACY_NATIVE_ERASURE_ENABLED:'true',DB:{prepare(sql){return{bind(...params){return{sql,params};}}}}},TARGET),terminalPlan=capturedFamily[1],terminalBefore=await terminalRows(),terminalWires=[],terminalCases=[];
 activeWires=terminalWires;recording=true;
 for(let i=0;i<2;i++){const start=terminalWires.length;try{const r=await admitted.prepare(terminalPlan.sql).bind(...terminalPlan.params).run();terminalCases.push({success:true,changes:r.meta?.changes,wireStart:start,wireEnd:terminalWires.length});}catch(error){terminalCases.push({success:false,error:String(error?.message||error),wireStart:start,wireEnd:terminalWires.length});}}
 recording=false;
 const terminalAfter=await terminalRows(),finalSchema=await schema(),finalControl=await db.prepare('SELECT epoch,mode,active,nonce,purpose FROM privacy_write_admission WHERE singleton=1').first();
 const authorityRows=(await db.prepare("SELECT (SELECT count(*) FROM privacy_serving_jobs) AS jobs,(SELECT count(*) FROM role_settlements WHERE purpose='native_account_erasure_inventory') AS inventories").first());
 const terminal={scope:'Exact source-generated terminal DELETE SQL compatibility/execution only; not erasure admission, whole-job approval, provider or live erasure.',subject:TARGET,sourceStatementCount:capturedFamily.length,sourceSQL:terminalPlan.sql,params:terminalPlan.params,cases:terminalCases,wires:terminalWires,before:terminalBefore,after:terminalAfter,retentionRowsUnchanged:JSON.stringify(after)===JSON.stringify((await db.prepare('SELECT * FROM role_settlements WHERE subject=? ORDER BY id').bind(SUBJECT).all()).results),authorityRows,newErasureAuthorityMinted:false,schemaUnchanged:JSON.stringify(schemaBefore)===JSON.stringify(finalSchema),control:finalControl};
 return Response.json({schema:'launch230-retention-local-workerd-v1',at:new Date().toISOString(),nativeNow:T,actualLocalWorkerdD1:true,native232ActivePolicy:true,scheduledCallback:false,clockOverride:false,sourceHandlerOverride:false,providerCalls:0,sourceSQL:captured,cases,wires,before,after,schemaUnchanged:JSON.stringify(schemaBefore)===JSON.stringify(schemaAfter),control,terminal});
}};
