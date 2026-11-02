'use strict';
// Finite type-only .222 successor. Original211 helper, source seals and failures stay unchanged.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),ts=require('typescript');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),addition="    values?: string[];\n";
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function qualifies(raw){if(typeof raw!=='string'||sha(raw)!=='2ed91b2fd780228d8ffe9ba488442e2d48c31eb65959d7babdc9a46281f6b0c8'||raw.split(addition).length!==2)return false;const old=raw.replace(addition,'');return Buffer.byteLength(old)===17513&&sha(old)==='363bde727368332075468f6c4c39331b773f153be78f4c372b78b961059a68f3'&&compile(raw)===compile(old);}
function checks(sourceRoot){const raw=fs.readFileSync(path.join(sourceRoot,'discord.ts'),'utf8');return {qualified:qualifies(raw),negativeControls:[raw+'\n// extra', '// extra\n'+raw,raw.replace(addition,addition+addition),raw.replace('values?: string[];','values: number[];')].every(s=>!qualifies(s)),scope:'Exact current type-only declaration and identical emitted runtime; not raw211 source equality'};}
// Re-run the original static drift oracles on exact source copies. Only the
// erased declaration is inverted; reconstructed text is never executed.
function driftControls222(sourceRoot){
 const os=require('node:os'),root=path.resolve(os.tmpdir()),tmp=fs.mkdtempSync(path.join(root,'olympus-static222-'));
 if(path.dirname(path.resolve(tmp))!==root||!path.basename(tmp).startsWith('olympus-static222-'))throw Error('Owned static fixture path');
 try{for(const name of ['role-settlements','privacy-global-serving-origin','discord','treasury-cosmetic','treasury-reserved-roles']){
  let raw=fs.readFileSync(path.join(sourceRoot,name+'.ts'),'utf8');if(name==='discord'){if(!qualifies(raw))throw Error('Current222 Discord support differs');raw=raw.replace(addition,'');}fs.writeFileSync(path.join(tmp,name+'.ts'),raw,{flag:'wx'});
 }return require('./source211-historical-projection.cjs').driftControls(tmp).map(row=>({...row,scope:row.source==='discord'?'Original211 static restriction control after exact erased-type inverse':'Exact current source copied for original211 static restriction control'}));}
 finally{fs.rmSync(tmp,{recursive:true});}
}
module.exports={qualifies,checks,driftControls222};
