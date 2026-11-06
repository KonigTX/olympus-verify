'use strict';
// Always-run genuine local Workerd/D1, including original ACK1 and private publication.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'olv-officer233-')),seedPath=path.join(out,'seed.json'),H=b=>crypto.createHash('sha256').update(b).digest('hex');
const seedRun=cp.spawnSync(process.execPath,[path.join(__dirname,'launch_membership231_seed.cjs'),seedPath],{cwd:root,encoding:'utf8',windowsHide:true,timeout:60000,maxBuffer:4e6});fs.writeFileSync(path.join(out,'seed.log'),(seedRun.stdout||'')+(seedRun.stderr||''));assert.equal(seedRun.status,0,'actual_source_seed');
const seed=JSON.parse(fs.readFileSync(seedPath)),{buildSync}=require('esbuild'),entry='import {fixture233} from '+JSON.stringify(path.join(__dirname,'officer_invites233_workerd_fixture.mjs'))+';import seed from '+JSON.stringify(seedPath)+';export default fixture233(seed);';
const built=buildSync({stdin:{contents:entry,resolveDir:root,sourcefile:'officer233-entry.mjs'},absWorkingDir:root,bundle:true,write:false,format:'esm',platform:'browser',target:'es2022',external:['node:async_hooks'],tsconfig:path.join(root,'tsconfig.json'),metafile:true,logLevel:'silent'}),source=Buffer.from(built.outputFiles[0].contents),pins=Object.keys(built.metafile.inputs).filter(p=>p!=='officer233-entry.mjs').map(p=>({path:path.resolve(root,p),sha256:H(fs.readFileSync(path.resolve(root,p)))}));
fs.writeFileSync(path.join(out,'fixture.mjs'),source);fs.writeFileSync(path.join(out,'source-pins.json'),JSON.stringify(pins,null,2));
const kinds=['positive','lost-first','lost-publication'],subject=seed.tables.find(t=>t.name==='pending').rows[0].discord_id,http=[],{Miniflare,Log,LogLevel,convertV4MiniflareOptions}=require('miniflare');let mf,n=0,complete=false;
const check=(name,v)=>{assert.equal(v,true,name);n++;console.log('PASS '+name);},packets=s=>{const v=JSON.parse(s);return Array.isArray(v)?v:[v];};
(async()=>{try{
 mf=new Miniflare(convertV4MiniflareOptions({rootPath:out,script:source.toString(),modules:true,name:'officer233',compatibilityDate:'2026-09-01',compatibilityFlags:['nodejs_compat'],host:'127.0.0.1',port:0,cf:false,log:new Log(LogLevel.NONE),logRequests:false,telemetry:{enabled:false},unsafeRegisterWorker:false,unsafeLocalExplorer:false,unsafeObservability:false,resourceTmpPath:path.join(out,'tmp'),resourcePersistencePath:path.join(out,'persist'),isolatedResourcePersistencePath:path.join(out,'isolated'),d1Databases:Object.fromEntries(kinds.map(k=>['DB_'+k.replaceAll('-','_'),'officer233-'+k])),outboundService:async req=>{
  const k=kinds.find(k=>req.headers.get('authorization')==='Bot '+seed.config.DISCORD_BOT_TOKEN+'-'+k),u=new URL(req.url);assert(k&&u.origin==='https://discord.com'&&req.method==='GET'&&u.pathname==='/api/v10/guilds/'+seed.config.GUILD_ID+'/members/'+subject,'only_fixed_mock_discord_GET');http.push({kind:k,method:req.method});
  // The exact current source Knight list is separately returned and checked by the fixture.
  return Response.json({user:{id:subject},roles:['1299841745550311535']});
 }}));await mf.ready;
 const costs={};for(const kind of kinds){const r0=await mf.dispatchFetch('http://fixture.invalid/'+kind,{method:'POST'}),text=await r0.text();fs.writeFileSync(path.join(out,kind+'.json'),text);assert.equal(r0.status,200,kind);const r=JSON.parse(text);
  check(kind+' genuine D1 with real clock and original source callback',r.actualLocalWorkerdD1&&r.clockOverride===false&&r.sourceCallbackOverride===false);
  const failures=r.wires.flatMap(w=>packets(w.responseBody)).filter(x=>x.success===false);check(kind+' every admitted/raw D1 query compiles and executes',failures.length===0&&!r.wires.some(w=>/Expression tree is too large/.test(w.responseBody)));
  check(kind+' only invite custody changes, pending/schema/control/roles unchanged',r.rows.length===1&&r.pendingUnchanged&&r.controlUnchanged&&r.schemaUnchanged&&r.roleRows===0);
  check(kind+' expired/malformed other-subject rows neither starve the fresh read nor lose custody',r.oldRows===6&&r.oldRowsUnchanged);
  if(kind==='positive')check('original ACK1 then private publication produces approved bounded queue',r.result.status===200&&r.result.body.result==='queued'&&r.rows[0].approved_by==='officer233'&&r.projection.invites.length===1&&!r.faultSpent);
  if(kind==='lost-first')check('committed INSERT with lost ACK1 remains pending and unprojectable',r.result.status===503&&r.result.body.result==='unknown'&&r.rows[0].approved_by==='officer233-pending'&&r.projection.invites.length===0&&r.faultSpent);
  if(kind==='lost-publication')check('lost ACK2 stays unknown; published attestation rests on original ACK1',r.result.status===503&&r.result.body.result==='unknown'&&r.rows[0].approved_by==='officer233'&&r.projection.invites.length===1&&r.faultSpent);
  check(kind+' serialized caller stage cannot publish or replace original custody',r.callerStageHeld);
  const note=JSON.parse(r.rows[0].note);check(kind+' original 60-second proof expiry is unchanged by projection',note.expiresAt===note.observedAt+60&&r.projection.invites.every(x=>x.expiresAt===note.expiresAt));
  const wires=r.wires.slice(r.start,r.end);costs[kind]={trips:wires.length,physicalSQL:wires.flatMap(w=>packets(w.requestBody)).length,http:http.filter(x=>x.kind===kind).length,providerWrites:0};check(kind+' bounded D1 transport and GET-only entitlement lookup',costs[kind].trips<50&&costs[kind].http<=2&&http.every(x=>x.method==='GET'));
 }
 for(const p of pins)assert.equal(H(fs.readFileSync(p.path)),p.sha256,'source_custody');check('compiled source custody unchanged',true);fs.writeFileSync(path.join(out,'costs.json'),JSON.stringify(costs,null,2));complete=true;
 }finally{if(mf)await mf.dispose();fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({schema:'officer233-local-workerd-result-v1',complete,checks:n,out,providerCalls:0,clockOverride:false,bundleSHA256:H(source)},null,2));}
 console.log(n+'/'+n+' officer233 Workerd checks; '+out);
})().catch(e=>{console.error(e);process.exitCode=1;});
