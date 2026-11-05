'use strict';
// Always executes both actual source queries on real local Workerd/D1. No phase
// selection, clock or handler override; future365-day eligibility stays in Native68.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),cp=require('node:child_process'),assert=require('node:assert/strict');
const ROOT=path.join(__dirname,'..'),requested=process.env.LAUNCH230_RETENTION_WORKERD_RESULT_DIR;
if(requested&&(!path.isAbsolute(requested)||fs.existsSync(requested)))throw Error('fresh_absolute_result_dir_required');
const OUT=requested||fs.mkdtempSync(path.join(os.tmpdir(),'olv-launch230-retention-'));if(requested)fs.mkdirSync(OUT,{recursive:true});
const H=b=>crypto.createHash('sha256').update(b).digest('hex'),write=(n,v)=>fs.writeFileSync(path.join(OUT,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
const {buildSync}=require('esbuild'),built=buildSync({entryPoints:[path.join(__dirname,'launch_membership230_retention_workerd_fixture.mjs')],absWorkingDir:ROOT,bundle:true,write:false,format:'esm',platform:'browser',target:'es2022',external:['node:async_hooks'],tsconfig:path.join(ROOT,'tsconfig.json'),metafile:true,logLevel:'silent'}),source=Buffer.from(built.outputFiles[0].contents);
const inputs=Object.keys(built.metafile.inputs).map(p=>{const file=path.resolve(ROOT,p),bytes=fs.readFileSync(file);return{path:file,bytes:bytes.length,sha256:H(bytes)};});write('source-inputs.json',inputs);write('bundle-metafile.json',built.metafile);fs.writeFileSync(path.join(OUT,'fixture.mjs'),source,{flag:'wx'});
const children=[],spawn=cp.spawn;cp.spawn=function(bin,args,options){if(!/workerd(?:\.exe)?$/i.test(bin))throw Error('unexpected_child');const child=Reflect.apply(spawn,this,[bin,args,options]),r={pid:child.pid,closed:false,code:null,signal:null};r.done=new Promise(resolve=>child.once('close',(code,signal)=>{Object.assign(r,{closed:true,code,signal});resolve();}));children.push(r);return child;};
const {Miniflare,Log,LogLevel,convertV4MiniflareOptions}=require('miniflare');let mf,outbound=0,checks=0,complete=false;
const pass=(name,value)=>{assert.equal(value,true,name);checks++;console.log('PASS '+name);};
const bounded=(promise,label,ms=30000)=>{let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label+'_timeout')),ms);})]).finally(()=>clearTimeout(timer));};
const items=body=>{const p=JSON.parse(body);return Array.isArray(p)?p:[p];};
(async()=>{try{
 mf=new Miniflare(convertV4MiniflareOptions({rootPath:OUT,script:source.toString(),modules:true,name:'launch230-retention',compatibilityDate:'2026-09-01',compatibilityFlags:['nodejs_compat'],host:'127.0.0.1',port:0,cf:false,log:new Log(LogLevel.NONE),logRequests:false,telemetry:{enabled:false},unsafeRegisterWorker:false,unsafeLocalExplorer:false,unsafeObservability:false,resourceTmpPath:path.join(OUT,'tmp'),resourcePersistencePath:path.join(OUT,'persist'),isolatedResourcePersistencePath:path.join(OUT,'isolated'),d1Databases:{DB:'launch230-retention'},outboundService:()=>{outbound++;throw Error('no_outbound');}}));
 await bounded(mf.ready,'workerd_start');const response=await bounded(mf.dispatchFetch('http://fixture.invalid/run',{method:'POST'}),'fixture_request'),body=await response.text();fs.writeFileSync(path.join(OUT,'response.json'),body,{flag:'wx'});assert.equal(response.status,200);const r=JSON.parse(body);
 pass('actual local Workerd Native D1 uses original clock and source',r.actualLocalWorkerdD1===true&&r.clockOverride===false&&r.sourceHandlerOverride===false&&r.scheduledCallback===false);
 pass('both exact source retention queries always constructed',r.sourceSQL.length===2&&r.sourceSQL.every(s=>typeof s==='string'&&!s.includes('?')));
 pass('raw single and pair SQL compile and execute on actual D1',r.cases.length===3&&r.cases[0].success===true&&r.cases[1].success===true&&r.cases[0].changes===0&&r.cases[1].changes===0);
 pass('both queries succeed through actual Native admission',r.cases[2].name==='admitted-pair'&&r.cases[2].success===true&&r.cases[2].changes.length===2&&r.cases[2].changes.every(x=>x===0));
 pass('fresh known unknown and compensated pair remain byte-exact',r.before.length===4&&JSON.stringify(r.before)===JSON.stringify(r.after)&&r.after.some(x=>x.state==='unknown')&&r.after.some(x=>x.reason==='launch230_compensated'));
 pass('complete original canonical schema remains unchanged',r.schemaUnchanged===true);
 pass('Native original admission closes neutral in same epoch',r.control.epoch==='a'.repeat(32)&&r.control.mode==='serving'&&r.control.active===0&&r.control.nonce===''&&r.control.purpose==='');
 const raw0=r.wires[r.cases[0].wireStart],raw1=r.wires[r.cases[1].wireStart],admitted=r.wires.slice(r.cases[2].wireStart,r.cases[2].wireEnd),q=admitted.flatMap(w=>items(w.requestBody));
 pass('actual SDK request bytes carry each unchanged zero-bind source query',items(raw0.requestBody)[0].sql===r.sourceSQL[0]&&items(raw1.requestBody)[0].sql===r.sourceSQL[1]&&r.sourceSQL.every(sql=>q.filter(p=>p.sql===sql&&p.params.length===0).length===1));
 pass('every actual Native wire returned success',r.wires.every(w=>w.status===200&&items(w.responseBody).every(p=>p.success===true)));
 for(const p of inputs){const b=fs.readFileSync(p.path);assert.equal(b.length,p.bytes);assert.equal(H(b),p.sha256);}pass('all compiled source input bytes remain unchanged',true);
 pass('zero outbound provider requests',outbound===0&&r.providerCalls===0);complete=true;
 }finally{
  if(mf)await bounded(mf.dispose(),'workerd_dispose',10000);for(const c of children)await bounded(c.done,'workerd_close',10000);cp.spawn=spawn;
  complete=complete&&children.length===1&&children.every(c=>c.closed);write('result.json',{schema:'launch230-retention-local-workerd-result-v1',at:new Date().toISOString(),complete,checks,bundleSHA256:H(source),sourceInputCount:inputs.length,clockOverride:false,handlerOverride:false,providerCalls:0,outbound,children:children.map(({done,...r})=>r),scope:'Actual local D1 compile/execution and fresh-row preservation only. Not future365-day expiry, actual scheduled callback, provider acceptance or complete live retention proof.'});
 }
 assert.equal(complete,true);console.log(checks+'/'+checks+' launch230 retention Workerd checks passed; '+OUT);
})().catch(e=>{console.error(e);process.exitCode=1;});
