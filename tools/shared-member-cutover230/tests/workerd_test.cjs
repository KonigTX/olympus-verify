'use strict';
// Real local workerd/D1 only. No remote bindings, auth or provider requests.
const path=require('node:path'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'../../..'),{Miniflare,convertV4MiniflareOptions}=require(root+'/worker/node_modules/miniflare'),esbuild=require(root+'/worker/node_modules/esbuild'),J=require(root+'/worker/tests/privacy_rejection_decision_test.cjs'),{createNativeCutover230Adapter}=require('../native-rpc-adapter.cjs');
const L=J.loader(),N=L('privacy-shared-member-cutover230'),V=L('shared-membership-cutover230'),hash=x=>createHash('sha256').update(x).digest('hex');
let checks=0;function eq(s,a,b){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),s);checks++;console.log('PASS '+s);}
async function main(){
 const createdAt=Math.floor(Date.now()/1000)-1,c={version:1,contract:V.SHARED_MEMBER230_CONTRACT,operationId:'c'.repeat(32),priorEpoch:'a'.repeat(32),writeEpoch:'b'.repeat(32),sourceCommit:'d'.repeat(40),sourceTree:'e'.repeat(40),bundleSHA256:'f'.repeat(64),providerA:'11111111-2222-4333-8444-555555555555',writerCoverageSHA256:'1'.repeat(64),debtPredicateSHA256:hash(N.SHARED_MEMBER230_OLD_CUSTODY_CLEAR_SQL),createdAt,expiresAt:createdAt+300},closureJSON=JSON.stringify(c),closureSHA256=hash(closureJSON),capability='9'.repeat(64),requestHost='olympus-verify.synthetic.workers.dev';
 const entry=`import {createSharedMember230RPC} from './tools/shared-member-cutover230/preview-rpc.ts';export default createSharedMember230RPC(${JSON.stringify({closureJSON,closureSHA256,capability,requestHost})});`;
 const script=esbuild.buildSync({stdin:{contents:entry,resolveDir:root,sourcefile:'shared-member230-local-entry.ts'},bundle:true,write:false,format:'esm',platform:'neutral',target:'es2022',external:['node:async_hooks']}).outputFiles[0].text;
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script,compatibilityDate:'2026-10-17',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'00000000-0000-4000-8000-000000000230'}}));
 try{
  const db=await mf.getD1Database('DB'),source=JSON.parse(L('privacy-write-admission-catalogue').ADMISSION_COOKIE_PRE_SEAL_SOURCES_JSON).recordedLive,p=source.profile;
  const setup=[...p.tables.map(t=>t.sql),p.slotSQL,...p.indexes.map(t=>t.sql),...source.objects.filter(o=>o[0]==='table'&&o[1]==='_cf_KV').map(o=>o[3])];
  await db.batch(setup.map(sql=>db.prepare(sql)));await db.prepare("INSERT INTO privacy_write_admission(singleton,protocol,epoch,mode,active,nonce,purpose,entry_changes,logical_changes)VALUES(1,'olympus-write-admission-epoch-2',?,'serving',0,'','',7,9)").bind(c.priorEpoch).run();
  await db.prepare("INSERT INTO site_settings(key,value,updated_at)VALUES('auditTypedNames','115',?)").bind(createdAt).run();await db.batch(p.triggers.map(t=>db.prepare(t.sql)));
  const before=await db.prepare("SELECT COUNT(*) n FROM main.sqlite_master WHERE name COLLATE BINARY<>'_cf_METADATA'").first();eq('genuine workerd exact portable application objects',before.n,442);
  const wire=[],send=async body=>{wire.push(body.planId);const response=await mf.dispatchFetch('https://'+requestHost+'/_membership230/native',{method:'POST',headers:{'content-type':'application/json','X-Olympus-Cutover230':capability},body:JSON.stringify(body)});return new Response(await response.arrayBuffer(),{status:response.status,headers:response.headers});};
  const adapter=createNativeCutover230Adapter(N,{closureJSON,closureSHA256},send),fence=await N.captureSharedMember230Fence(adapter.database,closureJSON,closureSHA256),ack=await N.executeSharedMember230Fence(fence);
  eq('actual workerd batch closes fresh epoch',await db.prepare('SELECT epoch,mode,active,entry_changes,logical_changes FROM privacy_write_admission').first(),{epoch:c.writeEpoch,mode:'closed',active:0,entry_changes:7,logical_changes:9});
  eq('actual workerd trigger-admitted seal exact',(await db.prepare('SELECT value FROM site_settings WHERE key=?').bind(V.SHARED_MEMBER230_SEAL_PREFIX+c.operationId).first()).value,closureJSON);
  const open=await N.executeSharedMember230Open(await N.captureSharedMember230Open(ack,'enabled'));eq('original local ACK consumes genuine workerd open',N.sharedMember230OpenFacts(open).mode,'enabled');eq('only four allowed plan calls',wire,['precheck','fence-and-seal','closed-read','open-enabled']);
  const refused=await mf.dispatchFetch('https://'+requestHost+'/_membership230/native',{method:'POST',headers:{'content-type':'application/json','X-Olympus-Cutover230':capability},body:JSON.stringify({planId:'precheck',sql:'DELETE FROM members'})});eq('workerd refuses arbitrary SQL request',refused.status,503);
  eq('workerd schema preserved',(await db.prepare("SELECT COUNT(*) n FROM main.sqlite_master WHERE name COLLATE BINARY<>'_cf_METADATA'").first()).n,442);
  console.log('shared_member230_workerd: '+checks+'/'+checks+' PASS');
 }finally{await mf.dispose();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
