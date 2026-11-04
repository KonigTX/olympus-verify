'use strict';
// Finite .227 static predecessor view. No reconstructed TypeScript is evaluated.
// Runtime loaders, budgets, whole historical pins and differential traces stay current.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const bytes=fs.readFileSync(path.join(__dirname,'fixtures/reviewed227-role-source-contexts.json'));
if(sha(bytes)!=='a15af49b558f8058ec512139e9828af93c6c2ae9aaeab1bb39b03f934845d39c')throw Error('reviewed227 role contexts differ');
const manifest=JSON.parse(bytes.toString('utf8'));
if(manifest.schema!=='lane227-exact-role-inverse-v1'||manifest.baseline!=='4035063a6454a4829b857378450a08ad004c2e50'||Object.keys(manifest.files).sort().join(',')!=='discord,role-settlements,roles,roster')throw Error('reviewed227 role scope differs');
const query=manifest.trace;
if(!query||query.allowedCountPerIngestTrace!==1||query.keys.join(',')!=='k,tag,sql,params'||query.params.length!==0||query.currentQuery.replace('s.id AS id, s.source AS source,','s.id AS id,')!==query.historicalQuery)throw Error('reviewed227 trace scope differs');
function inverse(name,raw){
 const stage=Object.hasOwn(manifest.files,name)?manifest.files[name]:null;
 if(!stage||typeof raw!=='string'||Buffer.byteLength(raw)!==stage.currentBytes||sha(raw)!==stage.currentSHA256)return null;
 let original=raw;
 for(const edit of stage.edits){if(edit.count!==1||typeof edit.from!=='string'||!edit.from||typeof edit.to!=='string'||edit.from===edit.to||original.split(edit.from).length!==2)return null;original=original.replace(edit.from,edit.to);}
 return Buffer.byteLength(original)===stage.historicalBytes&&sha(original)===stage.historicalSHA256?original:null;
}
function originalSource(name,raw){return Object.hasOwn(manifest.files,name)?inverse(name,raw):raw;}
function checks(sourceRoot){
 const results={};
 for(const[name,stage]of Object.entries(manifest.files)){
  const raw=fs.readFileSync(path.join(sourceRoot,name+'.ts'),'utf8'),original=inverse(name,raw);
  results[name+':exact-current-and-predecessor']=original!==null&&sha(original)===stage.historicalSHA256;
  const mutations=[['prefix','// unrelated227\n'+raw],['suffix',raw+'\n// unrelated227\n'],['line endings',raw.replace(/\n/g,'\r\n')],['duplicate context',raw.replace(stage.edits[0].from,stage.edits[0].from+stage.edits[0].from)]];
  stage.edits.forEach((edit,index)=>mutations.push(['altered context '+index,raw.replace(edit.from,edit.from+'// altered227\n')]));
  results[name+':negative-controls']=mutations.every(([,value])=>value!==raw&&inverse(name,value)===null);
  if(name==='roster')results[name+':exact-readonly-query-context']=raw.split('const LATEST_SNAPSHOT_AND_RUN = `'+query.currentQuery+'`;').length===2&&original!==null&&original.split('const LATEST_SNAPSHOT_AND_RUN = `'+query.historicalQuery+'`;').length===2;
 }
 return results;
}
/** Exactly one observed readonly query may lose only its added source projection
 * for the historical digest. No raw tuple, bind, order or response is rewritten. */
function traceInverse(trace,requiredCount=0){
 if(!Array.isArray(trace)||![0,1].includes(requiredCount))throw Error('reviewed227 trace shape');
 const matches=trace.filter(e=>e&&e.sql===query.currentQuery);
 if(matches.length===0){if(requiredCount===1)throw Error('reviewed227 query missing');return trace;}
 if(matches.length!==1)throw Error('reviewed227 query count');
 const tuple=matches[0];
 if(Object.keys(tuple).join(',')!==query.keys.join(',')||tuple.k!=='sql'||tuple.tag!=='legacy'||!Array.isArray(tuple.params)||tuple.params.length!==0)throw Error('reviewed227 query tuple');
 return trace.map(e=>e===tuple?{...e,sql:query.historicalQuery}:e);
}
function traceControls(trace){
 traceInverse(trace,1);const at=trace.findIndex(e=>e.sql===query.currentQuery),tuple=trace[at],replace=value=>trace.map((e,i)=>i===at?value:e);
 const probes=[['missing query',trace.filter((_,i)=>i!==at)],['duplicated query',[...trace.slice(0,at),tuple,...trace.slice(at)]],
  ['changed SQL',replace({...tuple,sql:tuple.sql+' '})],['changed binds',replace({...tuple,params:[1]})],
  ['wrong context',replace({...tuple,tag:'lane'})],['wrong tuple kind',replace({...tuple,k:'http'})],
  ['extra tuple field',replace({...tuple,extra:true})],['changed tuple key order',replace({tag:tuple.tag,k:tuple.k,sql:tuple.sql,params:tuple.params})]];
 return probes.map(([name,value])=>{let refused=false;try{traceInverse(value,1);}catch{refused=true;}return{name,refused};});
}
/** Only unchanged historical static helpers read these owned copies. Never pass this
 * directory to a runtime loader, transpiler, IDENTITY_SRC or execution entry point. */
function withStaticView(sourceRoot,inspect){
 const base=fs.realpathSync(os.tmpdir()),tmp=fs.mkdtempSync(path.join(base,'olympus-static227-'));
 const owned=()=>{const absolute=fs.realpathSync(tmp);return absolute===path.resolve(tmp)&&path.dirname(absolute)===base&&path.basename(absolute).startsWith('olympus-static227-')&&!fs.lstatSync(absolute).isSymbolicLink();};
 if(!owned())throw Error('Owned227 static fixture path');
 try{
  for(const name of ['role-settlements','privacy-global-serving-origin','discord','treasury-cosmetic','treasury-reserved-roles']){
   const raw=originalSource(name,fs.readFileSync(path.join(sourceRoot,name+'.ts'),'utf8'));if(raw===null)throw Error('Current227 source differs: '+name);
   fs.writeFileSync(path.join(tmp,name+'.ts'),raw,{flag:'wx'});
  }
  return inspect(tmp);
 }finally{if(!owned())throw Error('Owned227 cleanup path changed');fs.rmSync(tmp,{recursive:true});}
}
module.exports=Object.freeze({inverse,originalSource,checks,traceInverse,traceControls,withStaticView});
