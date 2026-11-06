'use strict';
// Closed .233 -> .232 -> .231 -> .230 -> a984 static predecessor only. Never evaluate reconstructed source.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const bytes=fs.readFileSync(path.join(__dirname,'fixtures/reviewed230-membership-source-contexts.json'));
if(sha(bytes)!=='6c321621d7105b340895875c27024ae7f54aa4e54d8ff7b758c5e0ef5c80e7b2')throw Error('reviewed230 membership static contexts differ');
const manifest=JSON.parse(bytes.toString('utf8'));
const counts={'discord':1,'role-settlements':21,'roles':8,'roster':5,'interactions':3};
if(manifest.schema!=='source230-exact-membership-static-inverse-v1'||manifest.currentSource!=='9f19969b2467da1878516ee686cd7efbbe4cd773'||manifest.predecessorSource!=='a984092fe2151cd00900cc3e51bdeac9d295fba1'||Object.keys(manifest.files).sort().join(',')!==Object.keys(counts).sort().join(','))throw Error('reviewed230 membership static scope differs');
for(const[name,count]of Object.entries(counts)){const s=manifest.files[name];if(!s||s.edits.length!==count||![s.currentSHA256,s.predecessorSHA256].every(v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v))||![s.currentBytes,s.predecessorBytes].every(v=>Number.isSafeInteger(v)&&v>0))throw Error('reviewed230 membership hunk bounds differ');}
const bytes232=fs.readFileSync(path.join(__dirname,'fixtures/reviewed232-native-rank-source-contexts.json'));
if(sha(bytes232)!=='6f61431f7d91774de1c64e341e334c7c688cd44f022e3758e7c860726ece0af2')throw Error('reviewed232 native rank static contexts differ');
const stage232=JSON.parse(bytes232.toString('utf8')),counts232={'role-settlements':11,'roster':1};
if(stage232.schema!=='source232-exact-native-rank-static-inverse-v1'||stage232.currentSource!=='95e8f65d64390bc6cdbfea8d4a880bd31fa38c9d'||stage232.predecessorSource!=='44c2dedcd9ab8ac9eab73849645c4ecba0e62282'||Object.keys(stage232.files).sort().join(',')!==Object.keys(counts232).sort().join(','))throw Error('reviewed232 static scope differs');
for(const[name,count]of Object.entries(counts232)){const s=stage232.files[name],prior=manifest.files[name];if(!s||s.edits.length!==count||s.predecessorSHA256!==prior.currentSHA256||s.predecessorBytes!==prior.currentBytes||![s.currentSHA256,s.predecessorSHA256].every(v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v))||![s.currentBytes,s.predecessorBytes].every(v=>Number.isSafeInteger(v)&&v>0))throw Error('reviewed232 static hunk or predecessor bounds differ');}
const bytes233=fs.readFileSync(path.join(__dirname,'fixtures/reviewed233-canonical-source-contexts.json'));
if(sha(bytes233)!=='fa186b69c01c3973107e6503f9460762fd5a98fe248f6266a6b3a9b41a78b7e8')throw Error('reviewed233 canonical static contexts differ');
const stage233=JSON.parse(bytes233.toString('utf8')),counts233={discord:3,'role-settlements':18,roster:2,interactions:2,guide:3,'treasury-cosmetic':2,'treasury-reserved-roles':2,'privacy-serving-erase':9};
const support233={'treasury-cosmetic':{currentBytes:35574,currentSHA256:'a7ff7f6351229447fe872b7c869b87ef57a5a47f9e288900fd31417bfc8217b8'},'treasury-reserved-roles':{currentBytes:3118,currentSHA256:'4142acde3271e6a38d1c113515274872c74684127baf46d79f414a20bddc8aaa'},'privacy-serving-erase':{currentBytes:39564,currentSHA256:'4879ac191a77e6e9c9d3c274b883058a6f3008d712b54b53c31f4b1a15f4b205'}};
if(stage233.schema!=='source233-exact-canonical-static-inverse-v1'||stage233.currentSource!=='build233-reviewed-source-v1'||stage233.preparationCommit!=='4123e967c35dad4546fc6ae86fdb4a846ca41e5f'||stage233.predecessorSource!=='e8fe400e13bb0607b6a4eade4ab0668835e15eea'||Object.keys(stage233.files).sort().join(',')!==Object.keys(counts233).sort().join(','))throw Error('reviewed233 static scope differs');
for(const[name,count]of Object.entries(counts233)){const s=stage233.files[name],prior=stage232.files[name]??manifest.files[name]??support233[name]??(name==='guide'?{currentSHA256:manifest.copyProjection.guideSource.sha256,currentBytes:manifest.copyProjection.guideSource.bytes}:null);if(!s||!prior||s.edits.length!==count||s.predecessorSHA256!==prior.currentSHA256||s.predecessorBytes!==prior.currentBytes||![s.currentSHA256,s.predecessorSHA256].every(v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v))||![s.currentBytes,s.predecessorBytes].every(v=>Number.isSafeInteger(v)&&v>0))throw Error('reviewed233 static hunk or predecessor bounds differ');}
function before233(name,raw){
 const s=Object.hasOwn(stage233.files,name)?stage233.files[name]:null;
 if(!s)return raw;
 if(typeof raw!=='string'||Buffer.byteLength(raw)!==s.currentBytes||sha(raw)!==s.currentSHA256)return null;
 let original=raw;
 for(const e of s.edits){if(e.count!==1||typeof e.from!=='string'||!e.from||typeof e.to!=='string'||e.from===e.to||original.split(e.from).length!==2)return null;original=original.replace(e.from,e.to);}
 return Buffer.byteLength(original)===s.predecessorBytes&&sha(original)===s.predecessorSHA256?original:null;
}
function before232(name,raw){
 const s=Object.hasOwn(stage232.files,name)?stage232.files[name]:null;
 if(!s)return raw;
 if(typeof raw!=='string'||Buffer.byteLength(raw)!==s.currentBytes||sha(raw)!==s.currentSHA256)return null;
 let original=raw;
 for(const e of s.edits){if(e.count!==1||typeof e.from!=='string'||!e.from||typeof e.to!=='string'||e.from===e.to||original.split(e.from).length!==2)return null;original=original.replace(e.from,e.to);}
 return Buffer.byteLength(original)===s.predecessorBytes&&sha(original)===s.predecessorSHA256?original:null;
}
const copy=manifest.copyProjection,need=(v,s)=>{if(!v)throw Error('reviewed230 copy '+s);};
need(copy?.schema==='source230-paired-copy-only-v1'&&copy.guidePath==='/channels/810000000000000009/messages'&&copy.logPath==='/channels/810000000000000007/messages'&&copy.cacheSQL==='UPDATE seen_interactions SET response = ?2 WHERE id = ?1'&&copy.interactionId==='810000000000000905'&&copy.guides.length===2&&copy.buttons.length===3,'scope');
for(const row of [...copy.guides,...copy.buttons,copy.held])need(row.count===1&&typeof row.current==='string'&&typeof row.predecessor==='string'&&sha(row.current)===row.currentSHA256&&sha(row.predecessor)===row.predecessorSHA256&&row.current!==row.predecessor,'whole payload seals');
need(stage233.guideCopies.length===2,'233 guide pair count');
for(const[row,i]of stage233.guideCopies.map((r,i)=>[r,i]))need(row.count===1&&typeof row.current==='string'&&row.predecessor===copy.guides[i].current&&sha(row.current)===row.currentSHA256&&sha(row.predecessor)===row.predecessorSHA256&&row.current!==row.predecessor,'233 whole guide payload seals');
function inverse230(name,raw){
 const s=Object.hasOwn(manifest.files,name)?manifest.files[name]:null;
 if(!s||typeof raw!=='string'||Buffer.byteLength(raw)!==s.currentBytes||sha(raw)!==s.currentSHA256)return null;
 let original=raw;
 for(const e of s.edits){if(e.count!==1||typeof e.from!=='string'||!e.from||typeof e.to!=='string'||e.from===e.to||original.split(e.from).length!==2)return null;original=original.replace(e.from,e.to);}
 return Buffer.byteLength(original)===s.predecessorBytes&&sha(original)===s.predecessorSHA256?original:null;
}
function inverse(name,raw){return inverse230(name,before232(name,before233(name,raw)));}
function checks(sourceRoot){
 const out={};
 for(const[name,s]of Object.entries(stage233.files)){
  const raw=fs.readFileSync(path.join(sourceRoot,name+'.ts'),'utf8'),old=before233(name,raw);
  out['233:'+name+':whole-current-and-e8fe']=old!==null&&Buffer.byteLength(old)===s.predecessorBytes&&sha(old)===s.predecessorSHA256;
  const probes=[['prefix','// unrelated233\n'+raw],['suffix',raw+'\n// unrelated233\n'],['CRLF',raw.replace(/\n/g,'\r\n')],['source whitespace',raw.replace('const ','const  ')]];
  for(const[e,i]of s.edits.map((e,i)=>[e,i]))probes.push(['duplicated context '+i,raw.replace(e.from,e.from+e.from)],['changed context '+i,raw.replace(e.from,e.from+'// unreviewed233\n')]);
  for(const[label,mutated]of probes)out['233:'+name+':refuses-'+label]=mutated!==raw&&before233(name,mutated)===null;
 }
 const guide=before233('guide',fs.readFileSync(path.join(sourceRoot,'guide.ts'),'utf8'));
 out['guide:whole-current-copy-source']=guide!==null&&Buffer.byteLength(guide)===copy.guideSource.bytes&&sha(guide)===copy.guideSource.sha256;
 for(const[name,s]of Object.entries(stage232.files)){
  const raw=before233(name,fs.readFileSync(path.join(sourceRoot,name+'.ts'),'utf8'));if(raw===null){out['232:'+name+':whole-current-and-44c']=false;continue;}const old=before232(name,raw);
  out['232:'+name+':whole-current-and-44c']=old!==null&&sha(old)===s.predecessorSHA256;
  const probes=[['prefix','// unrelated232\n'+raw],['suffix',raw+'\n// unrelated232\n'],['CRLF',raw.replace(/\n/g,'\r\n')],['source whitespace',raw.replace('const ','const  ')]];
  for(const[e,i]of s.edits.map((e,i)=>[e,i]))probes.push(['duplicated context '+i,raw.replace(e.from,e.from+e.from)],['changed context '+i,raw.replace(e.from,e.from+'// unreviewed232\n')]);
  for(const[label,mutated]of probes)out['232:'+name+':refuses-'+label]=mutated!==raw&&inverse230(name,before232(name,mutated))===null;
 }
 for(const[name,s]of Object.entries(manifest.files)){
  const raw=before233(name,fs.readFileSync(path.join(sourceRoot,name+'.ts'),'utf8')),old=inverse230(name,before232(name,raw));
  out[name+':whole-current-and-a984']=old!==null&&sha(old)===s.predecessorSHA256;
  const current230=before232(name,raw),probes=typeof current230==='string'?[['prefix','// unrelated230\n'+current230],['suffix',current230+'\n// unrelated230\n'],['CRLF',current230.replace(/\n/g,'\r\n')],['source whitespace',current230.replace('const ','const  ')]]:[];
  for(const[e,i]of s.edits.map((e,i)=>[e,i]))if(typeof current230==='string')probes.push(['duplicated context '+i,current230.replace(e.from,e.from+e.from)],['changed context '+i,current230.replace(e.from,e.from+'// unreviewed230\n')]);
  for(const[label,mutated]of probes)out[name+':refuses-'+label]=mutated!==current230&&inverse230(name,mutated)===null;
 }
 return out;
}
// Comparison copies only: raw trace/response, SQL, non-text binds and runtime sources stay untouched.
function copyTrace(trace,fresh,required={}){
 need(Array.isArray(trace)&&typeof fresh==='boolean'&&Object.keys(required).every(k=>['guide','cache','held'].includes(k))&&Object.values(required).every(n=>n===0||n===1),'trace shape');
 const seen={guide:0,cache:0,held:0},one=k=>{seen[k]++;need(seen[k]<=1,'duplicate '+k);};
 const result=trace.map(e=>{
  if(e?.tag!=='legacy')return e;
  if(e.k==='http'&&e.method==='POST'&&e.path===copy.guidePath){
   need(Object.keys(e).join(',')==='k,tag,method,path,body,reason'&&e.reason===null,'guide context');
   const paired=stage233.guideCopies.filter(r=>e.body===r.current),body=paired.length===1?paired[0].predecessor:e.body;
   const rows=copy.guides.filter(r=>body===r.current);need(rows.length===1,'guide payload');one('guide');return{...e,body:rows[0].predecessor};
  }
  if(e.k==='http'&&e.method==='POST'&&e.path===copy.logPath&&e.body===copy.held.current){
   need(Object.keys(e).join(',')==='k,tag,method,path,body,reason'&&e.reason===null,'held context');one('held');return{...e,body:copy.held.predecessor};
  }
  if(e.k==='sql'&&e.sql===copy.cacheSQL&&Array.isArray(e.params)&&e.params[0]===copy.interactionId){
   need(Object.keys(e).join(',')==='k,tag,sql,params'&&e.params.length===2,'cache context');
   const rows=copy.buttons.filter(r=>r.fresh===fresh&&r.current===e.params[1]);need(rows.length===1,'cache payload');one('cache');return{...e,params:[e.params[0],rows[0].predecessor]};
  }
  return e;
 });
 for(const[k,n]of Object.entries(required))need(seen[k]===n,'required '+k);
 return result;
}
function copyResponse(response,fresh,button){
 if(!button)return response;
 const raw=JSON.stringify(response),rows=copy.buttons.filter(r=>r.fresh===fresh&&r.current===raw);need(rows.length===1,'response payload');return JSON.parse(rows[0].predecessor);
}
function copyControls(){
 const out={},refused=f=>{try{f();return false;}catch{return true;}},http=(p,body)=>({k:'http',tag:'legacy',method:'POST',path:p,body,reason:null});
 for(const[row,i]of stage233.guideCopies.map((r,i)=>[r,i])){
  const e=http(copy.guidePath,row.current),raw=JSON.stringify([e]);out['233 guide '+i+' exact pair preserves original trace']=copyTrace([e],false,{guide:1})[0].body===copy.guides[i].predecessor&&JSON.stringify([e])===raw;
  for(const[name,value]of [['duplicate',[e,e]],['changed payload',[{...e,body:e.body+' '}]],['changed endpoint',[{...e,path:e.path+'?x'}]],['changed method',[{...e,method:'PATCH'}]],['changed reason',[{...e,reason:'changed'}]],['extra metadata',[{...e,extra:true}]]])out['233 guide '+i+' refuses '+name]=refused(()=>copyTrace(value,false,{guide:1}));
 }
 for(const[row,i]of copy.guides.map((r,i)=>[r,i])){
  const e=http(copy.guidePath,row.current),raw=JSON.stringify([e]);out['guide '+i+' exact paired output']=copyTrace([e],false,{guide:1})[0].body===row.predecessor&&JSON.stringify([e])===raw;
  for(const[name,value]of [['duplicate',[e,e]],['changed payload',[{...e,body:e.body+' '}]],['changed endpoint',[{...e,path:e.path+'?x'}]],['changed method',[{...e,method:'PATCH'}]],['changed reason',[{...e,reason:'changed'}]],['extra metadata',[{...e,extra:true}]]])out['guide '+i+' refuses '+name]=refused(()=>copyTrace(value,false,{guide:1}));
 }
 for(const[row,i]of copy.buttons.map((r,i)=>[r,i])){
  const e={k:'sql',tag:'legacy',sql:copy.cacheSQL,params:[copy.interactionId,row.current]},raw=JSON.stringify([e]);out['button '+i+' exact response and correlated cache']=copyTrace([e],row.fresh,{cache:1})[0].params[1]===row.predecessor&&JSON.stringify(copyResponse(JSON.parse(row.current),row.fresh,true))===row.predecessor&&JSON.stringify([e])===raw;
  for(const[name,value]of [['duplicate',[e,e]],['changed SQL',[{...e,sql:e.sql+' '}]],['changed ID',[{...e,params:['810000000000000999',row.current]}]],['changed response',[{...e,params:[copy.interactionId,row.current+' ']}]],['extra bind',[{...e,params:[...e.params,0]}]],['extra metadata',[{...e,extra:true}]]])out['button '+i+' refuses '+name]=refused(()=>copyTrace(value,row.fresh,{cache:1}));
  out['button '+i+' response mutant refused']=refused(()=>copyResponse({...JSON.parse(row.current),extra:true},row.fresh,true));
 }
 const held=http(copy.logPath,copy.held.current);out['held exact paired output']=copyTrace([held],false,{held:1})[0].body===copy.held.predecessor;
 for(const[name,value]of [['duplicate',[held,held]],['changed payload',[{...held,body:held.body+' '}]],['changed endpoint',[{...held,path:held.path+'?x'}]],['changed reason',[{...held,reason:'changed'}]]])out['held refuses '+name]=refused(()=>copyTrace(value,false,{held:1}));
 const untouched={k:'sql',tag:'legacy',sql:'SELECT 1',params:[1]};out['unrelated authority tuple retained by identity']=copyTrace([untouched],false)[0]===untouched;
 return out;
}
/** Disposable static fixture input only; current runtime loaders never see this directory. */
function withStaticView(sourceRoot,inspect){
 const base=fs.realpathSync(os.tmpdir()),tmp=fs.mkdtempSync(path.join(base,'olympus-static230-'));
 const owned=()=>{const p=fs.realpathSync(tmp);return p===path.resolve(tmp)&&path.dirname(p)===base&&path.basename(p).startsWith('olympus-static230-')&&!fs.lstatSync(p).isSymbolicLink();};
 if(!owned())throw Error('Owned230 static fixture path');
 try{
  for(const name of [...Object.keys(counts),'privacy-global-serving-origin','treasury-cosmetic','treasury-reserved-roles']){
   const raw=fs.readFileSync(path.join(sourceRoot,name+'.ts'),'utf8'),view=Object.hasOwn(counts,name)?inverse(name,raw):before233(name,raw);
   if(view===null)throw Error('Current230 static source differs: '+name);fs.writeFileSync(path.join(tmp,name+'.ts'),view,{flag:'wx'});
  }
  return inspect(tmp);
 }finally{if(!owned())throw Error('Owned230 static cleanup path changed');fs.rmSync(tmp,{recursive:true});}
}
module.exports=Object.freeze({inverse,before233,checks,withStaticView,copyTrace,copyResponse,copyControls});
