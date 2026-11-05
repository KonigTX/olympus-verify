'use strict';
// Archived bounded selector for the fixed shared-role release. No provider, configuration,
// token or generic variable writer. The pure parser comes from THIS same source archive.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
function need(v,s){if(!v)throw Error(s);}
function parser(exportRoot,callerRoot){
 const sourcePath=path.join(exportRoot,'worker/src/shared-membership-cutover230.ts'),raw=fs.readFileSync(sourcePath,'utf8');
 const ts=require(path.join(callerRoot,'worker/node_modules/typescript'));
 const source=ts.createSourceFile(sourcePath,raw,ts.ScriptTarget.ES2022,true,ts.ScriptKind.TS);
 const names=new Set(['SHARED_MEMBER230_GUILD','SHARED_MEMBER230_ROLE','SHARED_MEMBER230_CONTRACT','HEX32','HEX40','HEX64','UUID','CLOSURE_KEYS','fail','parseSharedMemberClosure230']),found=new Set(),parts=[];
 for(const node of source.statements){
  if(ts.isFunctionDeclaration(node)&&node.name&&names.has(node.name.text)){found.add(node.name.text);parts.push(node.getFullText(source));}
  else if(ts.isVariableStatement(node)){
   const declarations=node.declarationList.declarations,selected=declarations.filter(d=>ts.isIdentifier(d.name)&&names.has(d.name.text));
   if(selected.length){need(selected.length===declarations.length,'PARSER_DEPENDENCIES');for(const d of selected)found.add(d.name.text);parts.push(node.getFullText(source));}
  }
 }
 need(found.size===names.size&&[...names].every(n=>found.has(n)),'PARSER_SOURCE_REQUIRED');
 const js=ts.transpileModule(parts.join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const exports={},context=vm.createContext({exports,module:{exports}});vm.runInContext(js,context,{timeout:2000,filename:'archived-shared-member230-pure-parser'});
 need(exports.SHARED_MEMBER230_GUILD==='236932545793490944'&&exports.SHARED_MEMBER230_ROLE==='1552077551839617104'&&exports.SHARED_MEMBER230_CONTRACT==='olympus-shared-member-230-v1'&&typeof exports.parseSharedMemberClosure230==='function','FIXED_CONTRACT_REQUIRED');
 return exports.parseSharedMemberClosure230;
}
function closureFile(file){
 const resolved=path.resolve(file),before=fs.lstatSync(resolved);need(before.isFile()&&!before.isSymbolicLink()&&before.size>0&&before.size<=4096,'ORDINARY_CLOSURE_FILE_REQUIRED');
 const fd=fs.openSync(resolved,fs.constants.O_RDONLY|(fs.constants.O_NOFOLLOW??0));
 try{const a=fs.fstatSync(fd);need(a.isFile()&&a.dev===before.dev&&a.ino===before.ino&&a.size===before.size,'CLOSURE_FILE_CHANGED');const bytes=fs.readFileSync(fd),b=fs.fstatSync(fd),after=fs.lstatSync(resolved);
  need(after.isFile()&&!after.isSymbolicLink()&&[a,b,after].every(s=>s.dev===a.dev&&s.ino===a.ino&&s.size===a.size&&s.mtimeMs===a.mtimeMs)&&bytes.length===a.size,'CLOSURE_FILE_CHANGED');
  return {json:new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes),sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
 }finally{fs.closeSync(fd);}
}
function recoveryParser(exportRoot,callerRoot){
 const sourcePath=path.join(exportRoot,'worker/src/privacy-shared-member-recovery230.ts'),raw=fs.readFileSync(sourcePath,'utf8'),ts=require(path.join(callerRoot,'worker/node_modules/typescript'));
 const source=ts.createSourceFile(sourcePath,raw,ts.ScriptTarget.ES2022,true,ts.ScriptKind.TS),names=new Set(['SHARED_MEMBER230_RECOVERY_CONTRACT','RECOVERY_KEYS','RECOVERY_HEX32','RECOVERY_HEX40','RECOVERY_HEX64','recoveryHeld','parseSharedMember230RecoveryPlan']),found=new Set(),parts=[];
 for(const node of source.statements){if(ts.isFunctionDeclaration(node)&&node.name&&names.has(node.name.text)){found.add(node.name.text);parts.push(node.getFullText(source));}
  else if(ts.isVariableStatement(node)){const all=node.declarationList.declarations,selected=all.filter(d=>ts.isIdentifier(d.name)&&names.has(d.name.text));if(selected.length){need(selected.length===all.length,'RECOVERY_PARSER_DEPENDENCIES');for(const d of selected)found.add(d.name.text);parts.push(node.getFullText(source));}}}
 need(found.size===names.size&&[...names].every(n=>found.has(n)),'RECOVERY_PARSER_REQUIRED');
 const js=ts.transpileModule(parts.join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,exports={},context=vm.createContext({exports,module:{exports}});vm.runInContext(js,context,{timeout:2000,filename:'archived-shared-member230-recovery-pure-parser'});
 need(exports.SHARED_MEMBER230_RECOVERY_CONTRACT==='olympus-shared-member-230-off-recovery-v1'&&typeof exports.parseSharedMember230RecoveryPlan==='function','RECOVERY_CONTRACT_REQUIRED');return exports.parseSharedMember230RecoveryPlan;
}
function check(exportRoot,callerRoot,commit,tree,mode,bundle,file,recovery='--none'){
 need(/^[0-9a-f]{40}$/.test(commit)&&/^[0-9a-f]{40}$/.test(tree)&&/^[0-9a-f]{64}$/.test(bundle),'EXACT_RELEASE_METADATA_REQUIRED');
 need(mode==='close-only'||mode==='enabled','FIXED_MODE_REQUIRED');
 const parse=parser(exportRoot,callerRoot);
 if(recovery!=='--none'){
  need(mode==='close-only'&&file==='--none','RECOVERY_OFF_ONLY_NO_CLOSURE');const raw=closureFile(recovery),p=recoveryParser(exportRoot,callerRoot)(raw.json),now=Math.floor(Date.now()/1000);
  need(p.sourceCommit===commit&&p.sourceTree===tree&&p.bundleSHA256===bundle&&p.createdAt<=now&&now<p.expiresAt,'RECOVERY_RELEASE_OR_WINDOW_CHANGED');
  return ['SHARED_MEMBERSHIP230_MODE:close-only','PRIVACY_WRITE_ADMISSION_EPOCH:'+p.writeEpoch];
 }
 if(file==='--none'){need(mode==='close-only','ENABLED_REQUIRES_CLOSURE');return ['SHARED_MEMBERSHIP230_MODE:close-only'];}
 need(typeof file==='string'&&file.length>0,'CLOSURE_FILE_REQUIRED');const raw=closureFile(file),c=parse(raw.json),now=Math.floor(Date.now()/1000);
 need(c.sourceCommit===commit&&c.sourceTree===tree&&c.bundleSHA256===bundle,'CLOSURE_RELEASE_CHANGED');
 need(c.createdAt<=now&&now<c.expiresAt,'ORIGINAL_CLOSURE_WINDOW_EXPIRED');
 return ['SHARED_MEMBERSHIP230_MODE:'+mode,'SHARED_MEMBERSHIP230_CLOSURE_JSON:'+raw.json,'SHARED_MEMBERSHIP230_CLOSURE_SHA256:'+raw.sha256,'PRIVACY_WRITE_ADMISSION_EPOCH:'+c.writeEpoch];
}
if(require.main===module){try{need(process.argv.length===9||process.argv.length===10,'ARGUMENT_SHAPE');process.stdout.write(check(path.resolve(process.argv[2]),path.resolve(process.argv[3]),...process.argv.slice(4)).join('\n')+'\n');}catch{console.error('refusing: fixed shared-member230 deployment selection or original closure is unqualified');process.exitCode=1;}}
module.exports={check,parser,recoveryParser,closureFile};
