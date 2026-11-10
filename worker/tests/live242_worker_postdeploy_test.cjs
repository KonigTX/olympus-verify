"use strict";
// POST-DEPLOY ONLY. Authored for .242; do not run as a pre-deployment gate.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),{webcrypto}=require('node:crypto');
const root=path.resolve(__dirname,'../src');
function load(name,imports={},extra={}){
 const file=path.join(root,name+'.ts'),module={exports:{}};
 const body=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext('(function(require,module,exports){'+body+'\n})',{console,Request,Response,TextEncoder,TextDecoder,Uint8Array,Intl,Date,URL,crypto:webcrypto,...extra},{filename:file})(id=>imports[id]??{},module,module.exports);
 return module.exports;
}
(async()=>{
 let checks=0;const check=(name,fn)=>{fn();checks++;console.log('PASS '+name);};
 const launch={'./launch-verification227':{captureLaunchVerification:e=>({mode:e.legacy?'legacy':'members-only',scope:e.legacy?null:{realm:e.realm},current:()=>e.current!==false})}};
 const I=load('interactions',launch);
 check('Forever single name refuses',()=>assert.equal(I.normalizeVerificationName242({realm:'CAMWOW'},'Taylor'),null));
 check('Forever full name accepts',()=>assert.equal(I.normalizeVerificationName242({realm:'Forever Open 2'},'Fern Melder'),'Fern Melder'));
 check('surrounding spaces normalize',()=>assert.equal(I.normalizeVerificationName242({realm:'CAMWOW'},' Fern   Melder '),'Fern Melder'));
 check('real mono-name realm remains supported',()=>assert.equal(I.normalizeVerificationName242({realm:'Moon Guard'},'Taylor'),'Taylor'));
 check('control character refuses',()=>assert.equal(I.normalizeVerificationName242({realm:'CAMWOW'},'Fern\nMelder'),null));
 check('mention or markup refuses',()=>assert.equal(I.normalizeVerificationName242({realm:'CAMWOW'},'<@123> Name'),null));
 check('oversize name refuses',()=>assert.equal(I.normalizeVerificationName242({realm:'CAMWOW'},'A'.repeat(31)+' Last'),null));
 check('legacy normalization preserves internal spaces and trim',()=>assert.equal(I.normalizeVerificationName242({legacy:true},' Fern   Melder '),'Fern   Melder'));
 check('legacy original maximum31 accepts31 and refuses32',()=>{assert.equal(I.normalizeVerificationName242({legacy:true},'A'.repeat(31)),'A'.repeat(31));assert.equal(I.normalizeVerificationName242({legacy:true},'A'.repeat(32)),null);});
 check('current Native maximum32 remains supported',()=>assert.equal(I.normalizeVerificationName242({realm:'CAMWOW'},'A'.repeat(27)+' Last'),'A'.repeat(27)+' Last'));
 check('stale Native capture cannot admit a name',()=>assert.equal(I.normalizeVerificationName242({realm:'CAMWOW',current:false},'Fern Melder'),null));
 const ND=load('member-nickname-data233',{'./community-data-registry':{registerCommunityData:()=>{}}});
 const N=load('member-nickname233',{'./member-nickname-data233':ND});
 check('angle guild suffix',()=>assert.equal(N.formatNickname233('Fern Melder'),'Fern Melder <OLYMPUS PRIME>'));
 check('long nickname remains bounded',()=>assert.ok(N.formatNickname233('A'.repeat(31)).length<=32));
 check('nickname controls refuse',()=>assert.throws(()=>N.formatNickname233('Fern\nMelder')));
 let outbound,claims=0,queued=[],visits=[],counter;
 const env={PUBLIC_BASE_URL:'https://example.test',VERIFY_SECRET:'postdeploy-synthetic-secret',DB:{prepare(sql){return{bind(){return this;},async run(){claims++;return{meta:{changes:claims===1?1:0}};}};}}};
 const R=load('role-reconcile242',{
  './db':{now:()=>Math.floor(Date.now()/1000)},
  './roster-effects':{countStatements:(e,c)=>{counter=c;c.protocol=true;c.factor=1;return e;}},
  './roles':{callBudget:()=>({limit:40,attempts:0})},
  './full-release-pass':{runNativeSubject232:async(e,id,calls)=>{counter.used+=180;calls.attempts+=12;visits.push(id);return{state:id.endsWith('3')?'unknown':'held',reason:'synthetic_original_guard'};}},
  './log':{errorRef:()=> 'synthetic'},
 },{fetch:async(url,init)=>{outbound={url:String(url),...init};return new Response(null,{status:202});}});
 await R.kickRoleWork242(env,'requests');
 check('continuation goes to one fixed origin path',()=>assert.equal(outbound.url,'https://example.test/internal/roles242/continue'));
 const request=()=>new Request(outbound.url,{method:'POST',headers:outbound.headers,body:outbound.body});
 const response=await R.handleRoleContinuation242(request(),env,(label,work)=>queued.push({label,work}));
 check('genuine signed scheduling signal accepted',()=>assert.equal(response.status,202));
 check('scheduling itself does not invoke role writer',()=>assert.equal(visits.length,0));
 check('one deferred work item',()=>assert.equal(queued.length,1));
 check('replay nonce refuses',()=>assert.equal(claims,1));
 assert.equal((await R.handleRoleContinuation242(request(),env,()=>{})).status,409);checks++;
 const bad=new Request(outbound.url,{method:'POST',headers:{...outbound.headers,'X-Olympus-Role-Continuation':'0'.repeat(64)},body:outbound.body});
 assert.equal((await R.handleRoleContinuation242(bad,env,()=>{})).status,401);checks++;
 assert.equal((await R.handleRoleContinuation242(new Request(outbound.url,{method:'POST',body:'x'.repeat(257)}),env,()=>{})).status,413);checks++;
 const subjects=['100000000000000001','100000000000000002','100000000000000003','100000000000000004'];
 const batch=await R.reconcileRoleBatch242(env,subjects);
 check('batch stops at actual HTTP room',()=>assert.equal(batch.results.length,3));
 check('unvisited work is returned',()=>assert.equal(batch.remaining[0],subjects[3]));
 check('unknown retained as unknown',()=>assert.equal(batch.results[2].state,'unknown'));
 check('SQL reservation remains bounded',()=>assert.ok(batch.statements<=850));
 await assert.rejects(()=>R.reconcileRoleBatch242(env,[subjects[0],subjects[0]]));checks++;
 await assert.rejects(()=>R.reconcileRoleBatch242(env,['not-a-discord-id']));checks++;
 console.log(JSON.stringify({scope:'postdeploy-memory-components-only',checks,passed:checks,liveEffects:false,nativeIdentityQualified:false}));
})().catch(e=>{console.error(e);process.exitCode=1;});
