'use strict';
// Static source qualification only. No reconstructed source is evaluated or passed to a runtime loader.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sha=raw=>crypto.createHash('sha256').update(raw).digest('hex'),TARGET='privacy-global-serving-origin';
const CURRENT={bytes:70133,sha256:'834686e3bca0062af875d9e42ca72d4d9972311415476f3772dda81e7185630d'};
const HISTORICAL={bytes:69807,sha256:'19551311d6e42b0cba58e261e717033c2b73a944136587cd6f0e8853db28559d'};
const oldHelper=fs.readFileSync(path.join(__dirname,'source230-membership-static-projection.cjs'));
if(sha(oldHelper)!=='eb38cbf11209b4ef56f052e5e54b117d6fffdbd40d764faa00aa5708468c5f63')throw Error('reviewed230 helper differs before238 static view');
const previous=require('./source230-membership-static-projection.cjs');
const WINDOWS=[
  {
    "from": "costMode?:'beta_reset'",
    "to": "costMode?:'beta_reset'|'canonical_rank'"
  },
  {
    "from": "const ORIGINAL_BETA_RESET_COST_JOBS=['ensureSchema','runBetaResetSlice'] as const;",
    "to": "const ORIGINAL_BETA_RESET_COST_JOBS=['ensureSchema','runBetaResetSlice'] as const;\n// Separate original callback: no quarter-hour or beta-reset child may borrow this profile.\nconst ORIGINAL_CANONICAL_RANK_COST_JOBS=['ensureSchema','runCanonicalRankPass'] as const;"
  },
  {
    "from": "labels:constraint.costMode==='beta_reset'?ORIGINAL_BETA_RESET_COST_JOBS:ORIGINAL_SCHEDULE_COST_JOBS",
    "to": "labels:constraint.costMode==='canonical_rank'?ORIGINAL_CANONICAL_RANK_COST_JOBS:constraint.costMode==='beta_reset'?ORIGINAL_BETA_RESET_COST_JOBS:ORIGINAL_SCHEDULE_COST_JOBS"
  },
  {
    "from": "mode.value!=='beta_reset'",
    "to": "mode.value!=='beta_reset'&&mode.value!=='canonical_rank'"
  },
  {
    "from": "costMode:'beta_reset' as const}):Object.freeze({binding:binding.value as string,check:retainedCheck})",
    "to": "costMode:mode!.value as 'beta_reset'|'canonical_rank'}):Object.freeze({binding:binding.value as string,check:retainedCheck})"
  }
];
function inverse(raw){
 if(typeof raw!=='string'||Buffer.byteLength(raw)!==CURRENT.bytes||sha(raw)!==CURRENT.sha256)return null;
 let out=raw;for(const w of [...WINDOWS].reverse()){if(!w.to||out.split(w.to).length!==2)return null;out=out.replace(w.to,w.from);}
 return Buffer.byteLength(out)===HISTORICAL.bytes&&sha(out)===HISTORICAL.sha256?out:null;
}
function originalSource(name,raw){return name===TARGET?inverse(raw):raw;}
function checks(sourceRoot){const raw=fs.readFileSync(path.join(sourceRoot,TARGET+'.ts'),'utf8'),old=inverse(raw);return Object.freeze({'exact-current-and-reviewed211':old!==null,'five-closed-contexts':WINDOWS.length===5&&WINDOWS.every(w=>raw.split(w.to).length===2),'unchanged-whole-reviewed211-seal':old!==null&&sha(old)===HISTORICAL.sha256&&Buffer.byteLength(old)===HISTORICAL.bytes});}
function controls(sourceRoot){
 const raw=fs.readFileSync(path.join(sourceRoot,TARGET+'.ts'),'utf8');if(inverse(raw)===null)throw Error('reviewed238 positive static origin differs');
 const replace=(from,to)=>{if(!from||raw.split(from).length!==2||from===to)throw Error('reviewed238 static drift context differs');return raw.replace(from,to);};
 const probes=[['prefix','// unreviewed238\n'+raw],['suffix',raw+'\n// unreviewed238\n'],['line endings',raw.replace(/\n/g,'\r\n')],['unrelated whitespace',replace("import {AsyncLocalStorage} from 'node:async_hooks';","import  {AsyncLocalStorage} from 'node:async_hooks';")]];
 for(const [n,w]of WINDOWS.entries()){probes.push(['missing context '+n,replace(w.to,'')],['duplicated context '+n,replace(w.to,w.to+w.to)]);}
 probes.push(['final owned restriction removed',replace('try{restrict();scope(a.origin);checkMethod(nativeFetch);','try{scope(a.origin);checkMethod(nativeFetch);')],['nonvoid restriction admitted',replace('beforeDispatch()!==undefined','beforeDispatch()===undefined')]);
 return probes.map(([name,candidate])=>Object.freeze({source:TARGET,name,refused:candidate!==raw&&inverse(candidate)===null,scope:'Copy-only238 raw whole-source drift; original211 controls also run after exact inverse'}));
}
function withStaticView(sourceRoot,inspect){
 if(typeof inspect!=='function')throw Error('reviewed238 static inspector required');
 return previous.withStaticView(sourceRoot,view=>{
  // The original230 helper owns/guards this disposable directory and its cleanup.
  const file=path.join(view,TARGET+'.ts');if(path.dirname(file)!==view||fs.lstatSync(file).isSymbolicLink())throw Error('reviewed238 owned static origin path');
  const old=inverse(fs.readFileSync(file,'utf8'));if(old===null)throw Error('reviewed238 current static origin differs');
  fs.writeFileSync(file,old,{encoding:'utf8',flag:'w'});return inspect(view);
 });
}
module.exports=Object.freeze({inverse,originalSource,checks,controls,withStaticView});
