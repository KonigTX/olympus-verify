'use strict';
// Historical static adapter, NOT a current-runtime identity proof or a copy-only inverse.
// Finite guarded Native242 feature + privacy247 edits are reversed only in an owned
// disposable static directory. Runtime source loaders and raw traces stay current.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const sha=v=>crypto.createHash('sha256').update(v).digest('hex'),need=(v,s)=>{if(!v)throw Error('reviewed247 '+s);};
const manifestBytes=fs.readFileSync(path.join(__dirname,'fixtures/reviewed247-native-historical-static-contexts.json'));
need(sha(manifestBytes)==='ea0b9b0bf7198c2251e75a6d7e9f53e0fd106d36bee781bf4705ce8a7a706491','historical manifest changed');
const manifest=JSON.parse(manifestBytes.toString('utf8'));
const COUNTS=Object.freeze({interactions:16,guide:7,'privacy-serving-erase':5});
need(manifest.schema==='source247-exact-historical-static-adapter-v1'&&manifest.currentSourceQualification===false&&manifest.sourceEvaluationAuthorized===false&&Object.keys(manifest.files).sort().join(',')===Object.keys(COUNTS).sort().join(','),'scope');
const predecessorBytes=fs.readFileSync(path.join(__dirname,'fixtures/reviewed233-canonical-source-contexts.json'));
need(sha(predecessorBytes)==='fa186b69c01c3973107e6503f9460762fd5a98fe248f6266a6b3a9b41a78b7e8'&&manifest.predecessorFixtureSHA256===sha(predecessorBytes),'original233 fixture');
const predecessor=JSON.parse(predecessorBytes.toString('utf8'));
for(const[name,count]of Object.entries(COUNTS)){
 const row=manifest.files[name],old=predecessor.files[name];
 need(row.edits.length===count&&row.predecessorSHA256===old.currentSHA256&&row.predecessorBytes===old.currentBytes&&/^[a-f0-9]{64}$/.test(row.currentSHA256)&&Number.isSafeInteger(row.currentBytes)&&row.currentBytes>0,'whole source bounds '+name);
 for(const e of row.edits)need(e.count===1&&typeof e.from==='string'&&e.from&&typeof e.to==='string'&&e.to&&e.from!==e.to&&sha(e.from)===e.fromSHA256&&sha(e.to)===e.toSHA256&&Number.isSafeInteger(e.currentOffset)&&Number.isSafeInteger(e.predecessorOffset)&&e.currentOffset>=0&&e.predecessorOffset>=0,'finite window '+name);
}
function inverse(name,raw){
 const row=Object.hasOwn(manifest.files,name)?manifest.files[name]:null;
 if(!row||typeof raw!=='string'||Buffer.byteLength(raw)!==row.currentBytes||sha(raw)!==row.currentSHA256)return null;
 let old=raw;
 for(const e of row.edits){if(old.split(e.from).length!==2)return null;old=old.replace(e.from,()=>e.to);}
 return Buffer.byteLength(old)===row.predecessorBytes&&sha(old)===row.predecessorSHA256?old:null;
}
function originalSource(name,raw){return Object.hasOwn(manifest.files,name)?inverse(name,raw):raw;}
function checks(sourceRoot){
 const out={};
 for(const[name,row]of Object.entries(manifest.files)){
  const raw=fs.readFileSync(path.join(sourceRoot,name+'.ts'),'utf8'),old=inverse(name,raw);
  out[name+':current-whole-source']=Buffer.byteLength(raw)===row.currentBytes&&sha(raw)===row.currentSHA256;
  out[name+':finite-counted-historical-inverse']=old!==null&&row.edits.every(e=>raw.split(e.from).length===2);
  out[name+':entire-original233-input']=old!==null&&Buffer.byteLength(old)===row.predecessorBytes&&sha(old)===row.predecessorSHA256;
 }
 return out;
}
function controls(sourceRoot){
 const out=[];
 for(const[name,row]of Object.entries(manifest.files)){
  const raw=fs.readFileSync(path.join(sourceRoot,name+'.ts'),'utf8'),old=inverse(name,raw);need(old!==null,'positive static source '+name);
  const probes=[['unrelated prefix','// unreviewed247\n'+raw],['unrelated suffix',raw+'\n// unreviewed247\n'],['raw CRLF drift',raw.replace(/\n/g,'\r\n')],['historical source cannot masquerade as current',old]];
  // The introductory comment is outside every changed hunk for all three files.
  const first=raw.indexOf('\n');probes.push(['outside-window comment byte',raw.slice(0,first)+' '+raw.slice(first)]);
  for(const[i,e]of row.edits.entries())probes.push(['missing window '+i,raw.replace(e.from,'')],['duplicate window '+i,raw.replace(e.from,e.from+e.from)],['changed window '+i,raw.replace(e.from,e.from+'/* unrelated247 */')]);
  for(const[label,candidate]of probes)out.push({source:name,name:label,refused:candidate!==raw&&inverse(name,candidate)===null,scope:'Static-only source inverse; no runtime qualification'});
  for(const other of [...Object.keys(COUNTS).filter(x=>x!==name),'roles','../'+name])out.push({source:name,name:'wrong file '+other,refused:inverse(other,raw)===null,scope:'Exact fixed three-file scope'});
 }
 return out;
}
const OLD239_SHA='39f12bb39335e0234d7e43daa6ae2bc4c8e1aaf58b9dc65507012aac069594eb';
need(sha(fs.readFileSync(path.join(__dirname,'source239-migration-static-projection.cjs')))===OLD239_SHA,'original239 helper changed');
const source239=require('./source239-migration-static-projection.cjs');
const STATIC_NAMES=Object.freeze(['discord','role-settlements','roles','roster','interactions','guide','treasury-cosmetic','treasury-reserved-roles','privacy-serving-erase','privacy-global-serving-origin']);
function withStaticView(sourceRoot,inspect){
 need(typeof inspect==='function','static inspector required');
 const base=fs.realpathSync(os.tmpdir()),tmp=fs.mkdtempSync(path.join(base,'olympus-static247-'));
 const owned=()=>{const p=fs.realpathSync(tmp),s=fs.lstatSync(p);return p===path.resolve(tmp)&&path.dirname(p)===base&&path.basename(p).startsWith('olympus-static247-')&&s.isDirectory()&&!s.isSymbolicLink();};
 need(owned(),'owned static directory');
 try{
  for(const name of STATIC_NAMES){
   const file=path.join(sourceRoot,name+'.ts'),s=fs.lstatSync(file);need(s.isFile()&&!s.isSymbolicLink(),'ordinary static source '+name);
   const raw=fs.readFileSync(file,'utf8'),old=originalSource(name,raw);need(old!==null,'current static source changed '+name);
   fs.writeFileSync(path.join(tmp,name+'.ts'),old,{flag:'wx'});
  }
  // The unchanged239 helper owns its own next disposable directory. Nothing
  // here is ever supplied to a TypeScript loader or exported runtime factory.
  return source239.withStaticView(tmp,inspect);
 }finally{need(owned(),'owned static cleanup path');fs.rmSync(tmp,{recursive:true});}
}
// Whole comparison payload pairs are derived from the frozen Source literals,
// not recorded output. The current suite must still prove all raw SQL, binds,
// event counts/order, auth, responses and HTTP outside these exact text pairs.
const copy=manifest.comparisonCopies;
need(manifest.membershipFixtureSHA256==='6c321621d7105b340895875c27024ae7f54aa4e54d8ff7b758c5e0ef5c80e7b2'&&copy.guidePath==='/channels/810000000000000009/messages'&&copy.cacheSQL==='UPDATE seen_interactions SET response = ?2 WHERE id = ?1'&&copy.interactionId==='810000000000000905'&&copy.guides.length===2&&copy.buttons.length===3,'comparison scope');
for(const row of [...copy.guides,...copy.buttons])need(typeof row.fresh==='boolean'&&row.count===1&&typeof row.current==='string'&&typeof row.predecessor==='string'&&row.current!==row.predecessor&&sha(row.current)===row.currentSHA256&&sha(row.predecessor)===row.predecessorSHA256,'whole comparison pair');
const membershipBytes=fs.readFileSync(path.join(__dirname,'fixtures/reviewed230-membership-source-contexts.json'));
need(sha(membershipBytes)===manifest.membershipFixtureSHA256,'original230 comparison fixture');
const membership=JSON.parse(membershipBytes.toString('utf8'));
for(const[i,row]of copy.guides.entries())need(row.fresh===(i===1)&&row.predecessor===predecessor.guideCopies[i].current,'original233 whole guide pair');
for(const[i,row]of copy.buttons.entries())need(row.fresh===membership.copyProjection.buttons[i].fresh&&row.predecessor===membership.copyProjection.buttons[i].current,'original230 whole button pair');
function comparisonTrace(trace,fresh,required={}){
 need(Array.isArray(trace)&&typeof fresh==='boolean'&&Object.keys(required).every(k=>['guide','cache'].includes(k))&&Object.values(required).every(n=>n===0||n===1),'trace arguments');
 const seen={guide:0,cache:0},one=k=>{seen[k]++;need(seen[k]<=1,'duplicate '+k);};
 const result=trace.map(e=>{
  if(e?.tag!=='legacy')return e;
  if(e.k==='http'&&e.method==='POST'&&e.path===copy.guidePath){
   need(Object.keys(e).join(',')==='k,tag,method,path,body,reason'&&e.reason===null,'guide tuple');
   const rows=copy.guides.filter(r=>r.fresh===fresh&&r.current===e.body);need(rows.length===1,'guide whole payload and fresh mode');one('guide');return {...e,body:rows[0].predecessor};
  }
  if(e.k==='sql'&&e.sql===copy.cacheSQL&&Array.isArray(e.params)&&e.params[0]===copy.interactionId){
   need(Object.keys(e).join(',')==='k,tag,sql,params'&&e.params.length===2,'cache tuple');
   const rows=copy.buttons.filter(r=>r.fresh===fresh&&r.current===e.params[1]);need(rows.length===1,'cache whole response and fresh mode');one('cache');return {...e,params:[e.params[0],rows[0].predecessor]};
  }
  return e;
 });
 for(const[k,n]of Object.entries(required))need(seen[k]===n,'required '+k);
 return result;
}
function comparisonResponse(response,fresh,button){
 if(!button)return response;
 need(typeof fresh==='boolean','response fresh mode');
 const raw=JSON.stringify(response),rows=copy.buttons.filter(r=>r.fresh===fresh&&r.current===raw);need(rows.length===1,'response whole payload');return JSON.parse(rows[0].predecessor);
}
function comparisonControls(){
 const out={},refused=f=>{try{f();return false;}catch{return true;}};
 for(const[i,row]of copy.guides.entries()){
  const e={k:'http',tag:'legacy',method:'POST',path:copy.guidePath,body:row.current,reason:null},raw=JSON.stringify([e]);
  out['guide '+i+' exact whole pair preserves raw trace']=comparisonTrace([e],row.fresh,{guide:1})[0].body===row.predecessor&&JSON.stringify([e])===raw;
  const probes=[['duplicate',[e,e]],['missing',[]],['changed payload',[{...e,body:e.body+' '}]],['wrong path',[{...e,path:e.path+'?x'}]],['wrong method',[{...e,method:'PATCH'}]],['changed reason',[{...e,reason:'unreviewed'}]],['extra metadata',[{...e,extra:true}]]];
  for(const[name,value]of probes)out['guide '+i+' refuses '+name]=refused(()=>comparisonTrace(value,row.fresh,{guide:1}));
  out['guide '+i+' refuses other fresh payload']=refused(()=>comparisonTrace([e],!row.fresh,{guide:1}));
 }
 for(const[i,row]of copy.buttons.entries()){
  const e={k:'sql',tag:'legacy',sql:copy.cacheSQL,params:[copy.interactionId,row.current]},raw=JSON.stringify([e]);
  out['button '+i+' exact response and cache preserve raw inputs']=comparisonTrace([e],row.fresh,{cache:1})[0].params[1]===row.predecessor&&JSON.stringify(comparisonResponse(JSON.parse(row.current),row.fresh,true))===row.predecessor&&JSON.stringify([e])===raw;
  const probes=[['duplicate',[e,e]],['missing',[]],['SQL drift',[{...e,sql:e.sql+' '}]],['ID drift',[{...e,params:['810000000000000999',row.current]}]],['payload drift',[{...e,params:[copy.interactionId,row.current+' ']}]],['extra bind',[{...e,params:[...e.params,0]}]],['extra metadata',[{...e,extra:true}]]];
  for(const[name,value]of probes)out['button '+i+' refuses '+name]=refused(()=>comparisonTrace(value,row.fresh,{cache:1}));
  out['button '+i+' refuses response metadata']=refused(()=>comparisonResponse({...JSON.parse(row.current),extra:true},row.fresh,true));
  out['button '+i+' refuses nonboolean fresh']=refused(()=>comparisonResponse(JSON.parse(row.current),'false',true));
 }
 const sql={k:'sql',tag:'legacy',sql:'SELECT 1',params:[1]},http={k:'http',tag:'legacy',method:'GET',path:'/users/@me',body:null,reason:null};
 const result=comparisonTrace([sql,http],false,{guide:0,cache:0});out['unrelated SQL and HTTP retained by identity']=result.length===2&&result[0]===sql&&result[1]===http;
 out['non-button response retained by identity']=comparisonResponse(sql,false,false)===sql;
 return out;
}
module.exports=Object.freeze({inverse,originalSource,checks,controls,withStaticView,comparisonTrace,comparisonResponse,comparisonControls,metadata:Object.freeze({staticOnly:true,currentRuntimeQualified:false,manifestSHA256:sha(manifestBytes)})});
