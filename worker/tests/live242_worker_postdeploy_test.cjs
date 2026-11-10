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
 // .252: real SQLite executes the unchanged bounded queue query and original
 // db.audit privacy fence. Native outcomes are explicit HELD/UNKNOWN doubles;
 // this queue regression supplies no Native identity or grant acceptance.
 const {DatabaseSync}=require('node:sqlite'),queueDb252=new DatabaseSync(':memory:');
 try{
  queueDb252.exec('CREATE TABLE audit(id INTEGER PRIMARY KEY AUTOINCREMENT,ts INTEGER,actor TEXT,action TEXT,subject TEXT,details TEXT);CREATE TABLE privacy_subjects(subject_id TEXT PRIMARY KEY,generation TEXT,state TEXT,revision INTEGER);');
  let onSelected252=null,count252,wall252=Date.now(),slowVisit257=false;const nativeVisits252=[],deferred252=[];
  const Date252=class extends Date{static now(){return wall252;}};
  const queueEnv252={DB:{prepare(sql){let args=[];const statement=queueDb252.prepare(sql);return{bind(...values){args=values;return this;},async all(){if(count252)count252.used++;const results=statement.all(...args);if(sql.includes('SELECT a.id,a.subject FROM audit a')){const hook=onSelected252;onSelected252=null;hook?.();}return{results};},async first(){if(count252)count252.used++;return statement.get(...args)??null;},async run(){if(count252)count252.used++;return{meta:{changes:Number(statement.run(...args).changes)}};}};}}};
  const privacy252={readPrivacySubject:async(e,id)=>e.DB.prepare('SELECT subject_id AS subject,generation AS subjectGeneration,state,revision FROM privacy_subjects WHERE subject_id=?1').bind(id).first()};
  const originalAudit252=load('db'),queue252=load('role-reconcile242',{
   './db':originalAudit252,'./privacy-serving-authority':privacy252,
   './roster-effects':{countStatements:(e,c)=>{count252=c;c.protocol=true;c.factor=1;return e;}},
   './roles':{callBudget:()=>({limit:40,attempts:0})},
   './full-release-pass':{runNativeSubject232:async(_e,id)=>{count252.used+=180;nativeVisits252.push(id);if(slowVisit257)wall252+=12001;return{state:id.endsWith('900')?'unknown':'held',reason:'synthetic_original_privacy_or_unknown_guard'};}},
   './log':{errorRef:()=> 'synthetic'},
  },{Date:Date252});
  const enqueue252=(id,privacy=true)=>{if(privacy)queueDb252.prepare("INSERT INTO privacy_subjects VALUES(?,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','active',0)").run(id);queueDb252.prepare("INSERT INTO audit(ts,actor,action,subject,details)VALUES(1,'system','role.request242',?,'{}')").run(id);};
  const inactive252=Array.from({length:11},(_,n)=>(200000000000000000n+BigInt(n)).toString());
  for(const[id,n]of inactive252.map((id,n)=>[id,n])){enqueue252(id);queueDb252.prepare('UPDATE privacy_subjects SET state=? WHERE subject_id=?').run(n%2?'retired':'retiring',id);}
  const originals252=JSON.stringify(queueDb252.prepare("SELECT * FROM audit WHERE action='role.request242' ORDER BY id").all()),active252='200000000000000900';enqueue252(active252);
  await queue252.runRoleWork242(queueEnv252,'requests',(label,work)=>deferred252.push({label,work}));
  check('252 actual SQL selects active request behind11 oldest retiring originals',()=>assert.deepEqual(nativeVisits252,[active252]));
  check('252 filtered window does not finish or mutate inactive original requests',()=>{assert.equal(queueDb252.prepare("SELECT COUNT(*) n FROM audit WHERE action='role.request242_finished' AND subject<>?").get(active252).n,0);assert.equal(JSON.stringify(queueDb252.prepare("SELECT * FROM audit WHERE action='role.request242' AND subject<>? ORDER BY id").all(active252)),originals252);});
  check('252 original privacy-fenced audit retains unknown outcome without a role ACK',()=>{const row=queueDb252.prepare("SELECT details FROM audit WHERE action='role.request242_finished' AND subject=?").get(active252);assert.equal(JSON.parse(row.details).state,'unknown');assert.equal(deferred252.length,0);});
  await queue252.runRoleWork242(queueEnv252,'requests',(label,work)=>deferred252.push({label,work}));
  check('252 completed unknown request is not automatically revisited',()=>assert.deepEqual(nativeVisits252,[active252]));
  const absent252='200000000000000901';enqueue252(absent252,false);await queue252.runRoleWork242(queueEnv252,'requests',(label,work)=>deferred252.push({label,work}));
  check('252 absent privacy row still reaches the original held issuer boundary',()=>assert.deepEqual(nativeVisits252,[active252,absent252]));
  const raced252='200000000000000902';enqueue252(raced252);onSelected252=()=>queueDb252.prepare("UPDATE privacy_subjects SET state='retiring' WHERE subject_id=?").run(raced252);
  await queue252.runRoleWork242(queueEnv252,'requests',(label,work)=>deferred252.push({label,work}));
  check('252 current privacy recheck blocks a request retired after selection',()=>{assert(!nativeVisits252.includes(raced252));assert.equal(queueDb252.prepare("SELECT COUNT(*) n FROM audit WHERE action='role.request242_finished' AND subject=?").get(raced252).n,0);assert.equal(deferred252.length,0);});
  await queue252.runRoleWork242(queueEnv252,'requests',(label,work)=>deferred252.push({label,work}));
  check('252 inactive-only remainder terminates without self-wake or original mutation',()=>{assert.equal(deferred252.length,0);assert.equal(nativeVisits252.length,2);assert.equal(queueDb252.prepare("SELECT COUNT(*) n FROM audit WHERE action='role.request242' AND subject=?").get(raced252).n,1);});
  const slow257='200000000000000903',waiting257='200000000000000904';enqueue252(slow257);enqueue252(waiting257);slowVisit257=true;
  await queue252.runRoleWork242(queueEnv252,'requests',(label,work)=>deferred252.push({label,work}));
  check('257 elapsed request admission finishes one held visit and leaves the next request untouched',()=>{assert.equal(nativeVisits252.at(-1),slow257);assert(!nativeVisits252.includes(waiting257));assert.equal(queueDb252.prepare("SELECT COUNT(*) n FROM audit WHERE action='role.request242_finished' AND subject=?").get(slow257).n,1);assert.equal(queueDb252.prepare("SELECT COUNT(*) n FROM audit WHERE action='role.request242_finished' AND subject=?").get(waiting257).n,0);assert.equal(deferred252.length,1);assert.equal(deferred252[0].label,'roles242_continue');});
  slowVisit257=false;await queue252.runRoleWork242(queueEnv252,'requests',()=>{});
  check('257 remaining request is still checked on a later invocation without replaying the finished visit',()=>{assert.equal(nativeVisits252.filter(id=>id===slow257).length,1);assert.equal(nativeVisits252.filter(id=>id===waiting257).length,1);assert.equal(queueDb252.prepare("SELECT COUNT(*) n FROM audit WHERE action='role.request242_finished' AND subject=?").get(waiting257).n,1);});
 }finally{queueDb252.close();}
 console.log(JSON.stringify({scope:'postdeploy-memory-components-only',checks,passed:checks,liveEffects:false,nativeIdentityQualified:false}));
})().catch(e=>{console.error(e);process.exitCode=1;});
