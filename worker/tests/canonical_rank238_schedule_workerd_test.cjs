'use strict';
// Genuine Workerd ScheduledController + original public entry + real local D1.
// Only Discord is mocked. No handler, clock, opaque issuer or Native admission replacement.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'olv-canonical238-')),reportPath=process.argv[2];
if(reportPath)assert(path.isAbsolute(reportPath)&&!fs.existsSync(reportPath),'new_absolute_report');
const H=b=>crypto.createHash('sha256').update(b).digest('hex'),seedPath=path.join(out,'seed.json');
const results=[],compiled=[],allPins=new Map();let checks=0,complete=false;
function check(name,yes){assert.equal(yes,true,name);checks++;console.log('PASS '+name);}
function wx(name,value){fs.writeFileSync(path.join(out,name),typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value,null,2)+'\n',{flag:'wx'});}
function capture(file){const b=fs.readFileSync(file);if(allPins.has(file))assert.equal(H(b),allPins.get(file).sha256,'source_stable');else allPins.set(file,{path:file,sha256:H(b),bytes:b.length});return b;}
const budgetFile=path.join(root,'src/scheduled-budget.ts'),budgetRaw=capture(budgetFile),FALSE='export const CANONICAL_RANK_SCHEDULE_QUALIFIED=false as const;',TRUE='export const CANONICAL_RANK_SCHEDULE_QUALIFIED=true as const;';
const falseCount=budgetRaw.toString().split(FALSE).length-1,trueCount=budgetRaw.toString().split(TRUE).length-1;
assert(falseCount+trueCount===1,'one_explicit_source_qualification_literal');
const shippingQualified=trueCount===1,sourceLiteral=shippingQualified?TRUE:FALSE;
const setup=cp.spawnSync(process.execPath,[path.join(__dirname,'launch_membership231_seed.cjs'),seedPath],{cwd:root,encoding:'utf8',windowsHide:true,timeout:60000,maxBuffer:4e6});
wx('seed.stdout.log',setup.stdout||'');wx('seed.stderr.log',setup.stderr||'');wx('seed-exit.json',{status:setup.status,signal:setup.signal,error:setup.error?.code??null});
assert.equal(setup.status,0,'original_seed_exit');
const seed=JSON.parse(fs.readFileSync(seedPath)),A=seed.tables.find(t=>t.name==='pending').rows[0].discord_id,B='229999999999999999',G=seed.config.GUILD_ID,BOT=seed.config.DISCORD_APP_ID,BOTROLE='888888888888888888',HIGH='777777777777777777',BLOCK='666666666666666666';
const ranks=[['Olympus Guild Master','1554261979684933742'],['Olympus High Council','1567917738985398384'],['Olympus Officer','1554262223038324840'],['Olympus Officer Alt','1561096070040125460'],['Olympus Raid Leader','1554262510650007602'],['Olympus Branch GM','1555639603619172504'],['Olympus Branch Officer','1555640676287385771'],['Olympus Veteran','1561096452057596005'],['Olympus Raider','1561096598296076460'],['Olympus Member','1552077551839617104'],['Olympus Alt','1561096900378103808'],['Olympus Initiate','1561097105974628372']];
const {build:esbuild}=require('esbuild'),{Miniflare,Log,LogLevel,convertV4MiniflareOptions}=require('miniflare');
function sourceRows(variant){const rows=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.isFile()){const b=capture(p),v=p===budgetFile?variant:b;rows.push({path:path.relative(root,p).replaceAll('\\','/'),bytes:v.length,sha256:H(v),gitBlob:crypto.createHash('sha1').update(Buffer.from('blob '+v.length+'\0')).update(v).digest('hex')});}else throw Error('source_nonordinary');}}walk(path.join(root,'src'));return rows.sort((a,b)=>a.path.localeCompare(b.path));}
async function build(qualified,label){
 const requested=qualified?TRUE:FALSE,variant=Buffer.from(budgetRaw.toString().replace(sourceLiteral,requested)),changed=requested!==sourceLiteral;
 assert.equal(variant.toString().replace(requested,sourceLiteral),budgetRaw.toString(),'whole_literal_inverse');
 const entry="import {fixture238} from "+JSON.stringify(path.join(__dirname,'canonical_rank238_schedule_fixture.mjs'))+";import seed from "+JSON.stringify(seedPath)+";export default fixture238(seed);",virtual=path.resolve(root,'canonical238-entry.mjs');
 const built=await esbuild({stdin:{contents:entry,resolveDir:root,sourcefile:'canonical238-entry.mjs'},absWorkingDir:root,bundle:true,write:false,format:'esm',platform:'browser',target:'es2022',external:['node:async_hooks'],tsconfig:path.join(root,'tsconfig.json'),metafile:true,logLevel:'silent',plugins:[{name:'exact-one-literal-qualification-variant',setup(api){api.onLoad({filter:/scheduled-budget\.ts$/},args=>{assert.equal(path.resolve(args.path),budgetFile,'exact_variant_path');capture(args.path);return {contents:variant.toString(),loader:'ts'};});}}]});
 const pins=[];let virtualSeen=false;for(const p of Object.keys(built.metafile.inputs)){const absolute=path.resolve(root,p);if(absolute===virtual){assert(!virtualSeen,'one_virtual_entry');virtualSeen=true;pins.push({path:p,virtual:true,sha256:H(Buffer.from(entry)),bytes:Buffer.byteLength(entry)});continue;}const b=capture(absolute);pins.push({path:absolute,sha256:H(b),bytes:b.length,variantSHA256:absolute===budgetFile?H(variant):undefined});}
 assert(virtualSeen,'declared_virtual_entry_present');
 const source=Buffer.from(built.outputFiles[0].contents),rows=sourceRows(variant),receipt={label,qualified,actualShippingBytes:!changed,unpublishedOneLiteralVariant:changed,sourceLiteral,requestedLiteral:requested,originalBudgetSHA256:H(budgetRaw),variantBudgetSHA256:H(variant),wholeSourceRows:rows,wholeSourceRowsSHA256:H(Buffer.from(JSON.stringify(rows))),bundleSHA256:H(source),bundleBytes:source.length,compiledInputs:pins,virtualEntry:{source:entry,sha256:H(Buffer.from(entry))},noOtherSourceSubstitution:true};
 wx(label+'.bundle.mjs',source);wx(label+'.metafile.json',built.metafile);wx(label+'.source.json',receipt);compiled.push(receipt);return source.toString();
}
function packets(text){const x=JSON.parse(text);return Array.isArray(x)?x:[x];}
async function run(qualified,label,scenario,source){
 const present=new Map([[A,[HIGH]],[B,[HIGH]]]),http=[],selfWakes=[],selfNonces=new Set(),outboundRefusals=[];let mf,callbackPhase=false;
 try{
  mf=new Miniflare(convertV4MiniflareOptions({rootPath:path.join(out,label+'-'+scenario),script:source,modules:true,name:'canonical238',compatibilityDate:'2026-09-01',compatibilityFlags:['nodejs_compat'],host:'127.0.0.1',port:0,cf:false,log:new Log(LogLevel.ERROR),logRequests:false,telemetry:{enabled:false},unsafeRegisterWorker:false,unsafeLocalExplorer:false,unsafeObservability:false,resourceTmpPath:path.join(out,label+'-'+scenario,'tmp'),resourcePersistencePath:path.join(out,label+'-'+scenario,'persist'),isolatedResourcePersistencePath:path.join(out,label+'-'+scenario,'isolated'),bindings:{CASE238:scenario},d1Databases:{DB_veteran:'canonical238-'+label+'-'+scenario},outboundService:async req=>{
   try{
   const u=new URL(req.url),p=u.pathname.replace(/^\/api\/v10/,'');
   if(u.origin==='https://verify.example'&&u.pathname==='/internal/roles242/continue'){
    assert.equal(new URL(seed.config.PUBLIC_BASE_URL).origin,'https://verify.example','fixed_source_self_origin');
    assert.equal(u.href,'https://verify.example/internal/roles242/continue','exact_self_wake_URL');assert.equal(req.method,'POST','only_signed_self_POST');
    assert.equal(req.headers.get('content-type'),'application/json','typed_self_wake');assert.equal(req.headers.get('authorization'),null,'no_Discord_credential_at_self_boundary');
    const text=await req.text();assert(Buffer.byteLength(text)<=256,'bounded_self_wake');const wake=JSON.parse(text);
    assert(wake&&typeof wake==='object'&&!Array.isArray(wake),'self_wake_object');assert.equal(Object.keys(wake).sort().join(','),'at,kind,nonce','exact_self_wake_keys');
    assert(['requests','sweep'].includes(wake.kind),'fixed_self_work_kind');assert(Number.isSafeInteger(wake.at)&&Math.abs(Math.floor(Date.now()/1000)-wake.at)<=60,'fresh_self_wake_TTL');
    assert(typeof wake.nonce==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(wake.nonce),'canonical_self_nonce');assert(!selfNonces.has(wake.nonce),'no_self_nonce_replay');
    const supplied=req.headers.get('X-Olympus-Role-Continuation')||'',expected=crypto.createHmac('sha256',seed.config.VERIFY_SECRET).update('role-continuation242\n'+text).digest('hex');
    assert(/^[0-9a-f]{64}$/.test(supplied)&&crypto.timingSafeEqual(Buffer.from(supplied,'hex'),Buffer.from(expected,'hex')),'original_self_body_HMAC');selfNonces.add(wake.nonce);
    const observation={origin:u.origin,path:u.pathname,method:req.method,body:wake,bodySHA256:H(Buffer.from(text)),HMACValidated:true,TTLValidated:true,nonceReplayChecked:true,schedulingOnly:true,childExecuted:false,roleACK:false};
    selfWakes.push(observation);wx(label+'-'+scenario+'-self-wake-'+String(selfWakes.length).padStart(3,'0')+'.json',observation);
    // This double acknowledges only the scheduling boundary; it does not run or qualify a child invocation.
    return new Response(null,{status:202});
   }
   assert.equal(u.origin,'https://discord.com','only_mock_discord');assert.equal(req.headers.get('authorization'),'Bot '+seed.config.DISCORD_BOT_TOKEN+'-veteran','fixed_mock_token');
   http.push({method:req.method,path:p,callback:callbackPhase});
   if(req.method==='GET'&&p==='/users/@me')return Response.json({id:BOT,bot:true});
   if(req.method==='GET'&&p==='/guilds/'+G+'/roles')return Response.json([{id:G,name:'@everyone',position:0,permissions:'0',managed:false},{id:BOTROLE,name:'Synthetic Bot',position:40,permissions:'268435456',managed:false},{id:HIGH,name:'Synthetic Unowned',position:50,permissions:'0',managed:false},{id:BLOCK,name:'Synthetic Blocker',position:1,permissions:'0',managed:false},...ranks.map(([name,id],i)=>({id,name,position:30-i,permissions:'0',managed:false}))]);
   if(req.method==='GET'&&p==='/guilds/'+G+'/members/'+BOT)return Response.json({user:{id:BOT,bot:true},roles:[BOTROLE]});
   for(const id of [A,B]){if(req.method==='GET'&&p==='/guilds/'+G+'/members/'+id)return Response.json({user:{id},roles:present.get(id)});
    const pre='/guilds/'+G+'/members/'+id+'/roles/';if((req.method==='PUT'||req.method==='DELETE')&&p.startsWith(pre)){const role=p.slice(pre.length);assert(ranks.some(r=>r[1]===role),'only_canonical_target');present.set(id,req.method==='PUT'?[...new Set([...present.get(id),role])]:present.get(id).filter(r=>r!==role));if(scenario==='lost-put'&&callbackPhase&&id===A&&req.method==='PUT')throw Error('synthetic_original_reply_lost_after_remote_apply');return new Response(null,{status:204});}}
   throw Error('unplanned_mock_HTTP');
   }catch(error){
    const refusal={syntheticFixtureOnly:true,url:req.url,method:req.method,contentType:req.headers.get('content-type'),hasAuthorization:req.headers.has('authorization'),signatureHeaderLength:(req.headers.get('X-Olympus-Role-Continuation')||'').length,errorName:error?.name||null,errorMessage:String(error?.message||error),errorStack:String(error?.stack||error)};
    outboundRefusals.push(refusal);wx(label+'-'+scenario+'-outbound-refusal-'+String(outboundRefusals.length).padStart(3,'0')+'.json',refusal);throw error;
   }
  }}));await mf.ready;
  const first=await mf.dispatchFetch('http://fixture.invalid/veteran',{method:'POST'}),firstBody=await first.json();check(label+'/'+scenario+' original first account obtains real own grant ACK',first.status===200&&firstBody.error===null&&firstBody.result.body.roleGranted===true);
  const prep=await mf.dispatchFetch('http://fixture.invalid/prepare',{method:'POST'});wx(label+'-'+scenario+'-prepare.json',await prep.text());assert.equal(prep.status,200,'second_original_setup');
  const before=http.length;callbackPhase=true;const worker=await mf.getWorker();assert.equal(typeof worker.scheduled,'function','genuine_runtime_scheduled_service');const original=await worker.scheduled({cron:'* * * * *'});wx(label+'-'+scenario+'-scheduled.json',original);
  if(original.outcome!=='ok'||original.noRetry!==true){
   wx(label+'-'+scenario+'-callback-refusal-boundary.json',{syntheticFixtureOnly:true,original,selfWakes,outboundRefusals});
   try{const diagnostic=await mf.dispatchFetch('http://fixture.invalid/observe');wx(label+'-'+scenario+'-callback-refusal-observation.json',await diagnostic.text());}catch(error){wx(label+'-'+scenario+'-callback-observation-error.json',{name:error?.name,message:String(error?.message||error),stack:String(error?.stack||error)});}
  }
  check(label+'/'+scenario+' original runtime callback closes without automatic retry',original.outcome==='ok'&&original.noRetry===true);
  let r;const observeDeadline=Date.now()+20000;for(let poll=0;;poll++){const observation=await mf.dispatchFetch('http://fixture.invalid/observe');r=await observation.json();wx(label+'-'+scenario+'-observation-'+String(poll).padStart(3,'0')+'.json',r);if(!r.pending)break;assert(Date.now()<observeDeadline,'all_original_deferred_scopes_closed_before_cost_acceptance');await new Promise(resolve=>setTimeout(resolve,50));}const calls=http.slice(before),effects=calls.filter(x=>x.method==='PUT'||x.method==='DELETE');
  check(label+'/'+scenario+' original genuine controller captured and no clock/handler substitution',!r.observationError&&r.observation?.scope==='original_scheduled_callback'&&r.clockOverride===false&&r.handlerOverride===false);
  check(label+'/'+scenario+' original two grant ACKs and Native control unchanged',r.originalACKsUnchanged===true&&r.controlUnchanged===true);
  if(!qualified||['collision','inactive','native-off','wrong-layout'].includes(scenario)){check(label+'/'+scenario+' source guard holds before Native/profile work',effects.length===0&&r.cost===null&&r.wires.slice(r.start,r.end).length===0);}
  else {
   check(label+'/'+scenario+' exact two-label callback profile stays within391/40',r.cost?.allScopesReturned===true&&r.cost.jobs?.length===2&&r.cost.jobs.every(j=>['ensureSchema','runCanonicalRankPass'].includes(j.job)&&j.state==='returned'&&j.pendingGroups===0&&j.failedGroups===0)&&r.cost.jobs.reduce((s,j)=>s+j.statements,0)<=391&&calls.length<=40);
   const raw=r.wires.slice(r.start,r.end);check(label+'/'+scenario+' real Native D1 responses contain no compiler/admission failure',raw.flatMap(w=>packets(w.responseBody)).every(p=>p.success!==false));
   const physicalStatements=raw.reduce((sum,w)=>{assert.equal(typeof w.requestBody,'string','original_D1_request_body_string');const statements=packets(w.requestBody);assert(statements.length>0,'nonempty_original_D1_statement_packet');for(const statement of statements){assert(statement&&typeof statement==='object'&&!Array.isArray(statement)&&typeof statement.sql==='string'&&statement.sql.length>0,'original_D1_statement_shape');}return sum+statements.length;},0),observedStatements=r.cost.jobs.reduce((sum,j)=>sum+j.statements,0);
   check(label+'/'+scenario+' original Native wire statement count equals complete source observer count',physicalStatements>0&&physicalStatements===observedStatements);
   r.independentPhysicalStatementCount=physicalStatements;wx(label+'-'+scenario+'-physical-cost.json',{physicalStatements,observedStatements,equal:physicalStatements===observedStatements,originalRawRequestBodiesCounted:true});
   if(scenario==='positive'){check(label+' two independent accounts replaced by one current Raider each',effects.length===4&&[A,B].every(id=>present.get(id).includes(ranks[8][1])&&!present.get(id).includes(ranks[7][1])&&present.get(id).includes(HIGH)));check(label+' actual pass visits at most2 with two owned new canonical ACKs',r.rows.filter(x=>x.purpose==='canonical_routine233'&&x.desired===1&&x.state==='settled'&&x.reason==='canonical233_put_acknowledged_and_confirmed').length===2);}
   if(scenario==='stale')check(label+' stale preflight produces no pass/attempt or effect',effects.length===0&&!r.rows.some(x=>x.purpose==='canonical_routine233')&&r.cost.jobs.find(x=>x.job==='runCanonicalRankPass').statements===2);
   if(scenario==='interval')check(label+' old global300s stamp does not suppress owed Native Raider delta',effects.length===4&&[A,B].every(id=>present.get(id).includes(ranks[8][1])&&ranks.filter(([,role])=>present.get(id).includes(role)).length===1&&present.get(id).includes(HIGH)&&effects.filter(x=>x.path.includes('/members/'+id+'/')).length===2&&effects.some(x=>x.method==='PUT'&&x.path==='/guilds/'+G+'/members/'+id+'/roles/'+ranks[8][1])&&effects.some(x=>x.method==='DELETE'&&x.path==='/guilds/'+G+'/members/'+id+'/roles/'+ranks[7][1]))&&r.rows.filter(x=>x.purpose==='canonical_routine233'&&x.desired===1&&x.state==='settled'&&x.attempts===1&&x.reason==='canonical233_put_acknowledged_and_confirmed'&&x.role_id===ranks[8][1]).length===2);
   if(scenario==='unknown')check(label+' all-generation unknown prevents selected account replacement',r.rows.some(x=>x.state==='unknown'&&x.attempts===0)&&!effects.some(x=>x.path.includes('/members/'+A+'/')));
   if(scenario==='lost-put')check(label+' lost PUT remains unknown without replay or deletion of its new target',r.rows.some(x=>x.state==='unknown'&&x.attempts===1)&&effects.filter(x=>x.method==='PUT'&&x.path.includes('/members/'+A+'/')).length===1&&!effects.some(x=>x.method==='DELETE'&&x.path.endsWith('/'+ranks[8][1])));
   const previous=http.length,repeat=await worker.scheduled({cron:'* * * * *'});check(label+'/'+scenario+' immediate second callback retains30s/no replay',repeat.outcome==='ok'&&repeat.noRetry===true&&http.length===previous);
  }
  check(label+'/'+scenario+' signed wake boundary claims no child or role ACK',selfWakes.every(w=>w.schedulingOnly===true&&w.childExecuted===false&&w.roleACK===false)&&calls.length+selfWakes.length<=50);
  results.push({label,scenario,qualified,original,cost:r.cost,HTTP:calls.length+selfWakes.length,roleHTTP:calls.length,selfWakeHTTP:selfWakes.length,selfWakes,continuationChildExecuted:false,continuationRoleACK:false,effects:effects.length,layout:scenario==='wrong-layout'?'canonical':'recorded-live-pre-seal-20261017',actualGenuineScheduledController:true,providerCalls:0});
 }finally{if(mf)await mf.dispose();}
}
(async()=>{try{
 const actual=await build(shippingQualified,'actual-source'),opposite=await build(!shippingQualified,'one-literal-variant');
 await run(shippingQualified,'actual-source','positive',actual);
 await run(!shippingQualified,'one-literal-variant','positive',opposite);
 const qualifiedSource=shippingQualified?actual:opposite,label=shippingQualified?'actual-source':'one-literal-variant';
 for(const scenario of ['collision','inactive','native-off','wrong-layout','interval','stale','unknown','lost-put'])await run(true,label,scenario,qualifiedSource);
 for(const p of allPins.values())assert.equal(H(fs.readFileSync(p.path)),p.sha256,'all_source_inputs_preserved');check('all original source and fixture bytes remain exact',true);complete=true;
 }finally{
 const report={schema:'canonical-rank238-genuine-scheduled-local-v1',complete,checks,shippingQualified,operationalSourceQualification:false,actualShippingLiteralGenuineScheduledComponentQualified:complete&&shippingQualified,unpublishedVariantDoesNotQualifyShippingFalse:!shippingQualified,layoutScope:['recorded-live-pre-seal-20261017'],otherLayoutsQualified:false,results,compiled,sourcePins:[...allPins.values()],providerCalls:0,clockOverride:false,handlerOverride:false,continuationBoundary:{schedulingOnly:true,childExecuted:false,roleACK:false,exactSignedSelfPOSTValidated:true},out};
 wx('result.json',report);if(reportPath)fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 }
 console.log(checks+'/'+checks+' canonical238 genuine scheduled checks; '+out);
})().catch(e=>{console.error(e);process.exitCode=1;});
