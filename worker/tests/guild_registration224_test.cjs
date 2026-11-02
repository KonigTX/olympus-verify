// Pure plan and actual generated preview runtime. Synthetic capability/token;
// Discord is a local stub and every network effect is counted.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const root=path.join(__dirname,'..'),ts=require('typescript');let passed=0,total=0;
function check(name,ok){total++;if(ok){passed++;console.log('PASS '+name);}else console.error('FAIL '+name);}
function load(name){const cache=new Map();function read(file){file=path.resolve(root,'src',file.endsWith('.ts')?file:file+'.ts');if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);new Function('exports','module','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(m.exports,m,p=>p.startsWith('.')?read(path.relative(path.join(root,'src'),path.resolve(path.dirname(file),p))):require(p));return m.exports;}return read(name);}
(async()=>{
 const planner=await import(pathToFileURL(path.join(root,'scripts/guild-command-plan224.mjs'))),normal=await import(pathToFileURL(path.join(root,'scripts/guild-command-plan219.mjs'))),factory=await import(pathToFileURL(path.join(root,'scripts/guild-registration-source224.mjs')));
 const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/guild-commands224-before.json'))),scope=c=>({...c,application_id:fixture.application,guild_id:fixture.guild}),before=fixture.commands.map(scope),defs=load('guild-command-definitions224').GUILD_COMMANDS_224;
 const custody={head:'a'.repeat(40),tree:'b'.repeat(40),definitionSHA256:'c'.repeat(64),expectedExistingSHA256:normal.digestCommands219(normal.normalizeCommands219(before))},plan=planner.prepareGuildCommandPlan224(before,defs,custody);
 check('plan retains twenty command identities and adds only /olympus',plan.expectedCount===20&&plan.commands.length===20&&plan.commands.every(c=>c.name==='olympus'||normal.digestCommands219(c)===normal.digestCommands219(normal.normalizeCommands219(fixture.commands).find(x=>x.name===c.name&&x.type===c.type))));
 check('current raid definition is a bare hub with one optional autocomplete',plan.commands.find(c=>c.name==='raid').options[0].autocomplete===true);
 const refused=fn=>{try{fn();return false;}catch{return true;}};
 check('wrong guild or application cannot become a registration baseline',refused(()=>planner.prepareGuildCommandPlan224(before.map(c=>({...c,guild_id:'300000000000000000'})),defs,custody))&&refused(()=>planner.prepareGuildCommandPlan224(before.map(c=>({...c,application_id:'300000000000000001'})),defs,custody)));
 check('changed baseline digest refuses before any provider effect',refused(()=>planner.prepareGuildCommandPlan224(before,defs,{...custody,expectedExistingSHA256:'d'.repeat(64)})));
 check('an established command cannot piggyback on the hub addition',refused(()=>planner.prepareGuildCommandPlan224(before,defs.map(c=>c.name==='guide'?{...c,description:'Changed unrelated guide'}:c),custody)));
 check('new commands or global install scope cannot piggyback',refused(()=>planner.prepareGuildCommandPlan224(before,[...defs,{type:1,name:'extra',description:'Extra'}],custody))&&refused(()=>planner.prepareGuildCommandPlan224(before,defs.map(c=>({...c,contexts:[0,1]})),custody)));
 const final=plan.commands.map(scope);check('exact acknowledgement verifies all nineteen untouched commands',planner.verifyGuildCommandReadback224(plan,final).nineteenOtherCommandsPreserved);
 check('incomplete or mismatched readbacks never pass',refused(()=>planner.verifyGuildCommandReadback224(plan,final.slice(1)))&&refused(()=>planner.verifyGuildCommandReadback224(plan,final.map(c=>c.name==='olympus'?{...c,description:'Drift'}:c))));
 const cap='e'.repeat(64),host='olympus-verify.synthetic.workers.dev',issuedAt=Date.now(),expiresAt=issuedAt+180000,TOKEN='synthetic-discord-token-not-production';
 function runtime(mode='success'){
  let clock=issuedAt,gets=0,puts=0,commands=before,waiter,release;
  const source=factory.createRegistrationSource224({capability:cap,issuedAt,expiresAt,requestHost:host,plan});
  const context={Request,Response,URL,TextEncoder,TextDecoder,Uint8Array,AbortSignal,crypto:crypto.webcrypto,Date:class extends Date{static now(){return clock;}},fetch:async(url,init)=>{
   if(url!=='https://discord.com/api/v10/applications/'+fixture.application+'/guilds/'+fixture.guild+'/commands'||init.headers.Authorization!=='Bot '+TOKEN||init.redirect!=='manual')throw Error('unapproved destination');
   if(init.method==='GET'){gets++;if(mode==='pending'&&gets===1)await new Promise(r=>{release=r;waiter=true;});if(mode==='drift')return Response.json(commands.map(c=>c.name==='raid'?{...c,description:'Different inventory'}:c));return Response.json(commands);}
   if(init.method==='PUT'){puts++;commands=JSON.parse(init.body).map(scope);if(mode==='unknown')throw Error('synthetic lost acknowledgement');return Response.json(commands);}
   throw Error('unapproved method');
  }};
  vm.createContext(context);new vm.Script(source.replace(/export default globalThis\.__olympusRegistration224;\s*$/,'')).runInContext(context);
  const worker=context.__olympusRegistration224;
  const invoke=(method='GET',payload,other={})=>worker.fetch(new Request('https://'+host+'/commands',{method,headers:{'X-Olympus-Registration-Capability':cap,'Content-Type':'application/json',...other},...(payload?{body:JSON.stringify(payload)}:{})}),{DISCORD_BOT_TOKEN:TOKEN});
  const body=Object.fromEntries(['definitionSHA256','existingSHA256','head','payloadSHA256','tree'].map(k=>[k,plan[k]]));
  return {invoke,body,counts:()=>({gets,puts}),expire:()=>{clock=expiresAt+1;},pending:()=>waiter,release:()=>release?.()};
 }
 let r=runtime(),answer=await r.invoke();
 check('read-only preview inspection reads twenty commands without a PUT',answer.status===200&&r.counts().gets===1&&r.counts().puts===0);
 answer=await r.invoke('POST',r.body);const accepted=await answer.json();
 check('single authorized apply acknowledges the exact guild replacement',answer.status===200&&accepted.outcome==='acknowledged'&&r.counts().puts===1&&planner.verifyGuildCommandReadback224(plan,accepted.putAcknowledgement).count===20);
 answer=await r.invoke('POST',r.body);check('second apply never replays a spent intent',answer.status===409&&r.counts().puts===1);
 r.expire();answer=await r.invoke();check('expired preview returns empty404 before contacting Discord',answer.status===404&&(await answer.text())===''&&r.counts().puts===1);
 r=runtime('unknown');answer=await r.invoke('POST',r.body);const unknownBody=await answer.text();await r.invoke('POST',r.body);
 check('lost provider acknowledgement remains spent with no retry',answer.status===409&&r.counts().puts===1);
 check('provider error response leaks no inherited token or private capability',!unknownBody.includes(TOKEN)&&!unknownBody.includes(cap));
 r=runtime('drift');answer=await r.invoke('POST',r.body);await r.invoke('POST',r.body);
 check('action-time inventory drift refuses and spends the attempt before PUT',answer.status===409&&r.counts().puts===0);
 r=runtime('pending');const first=r.invoke('POST',r.body);for(let n=0;n<30&&!r.pending();n++)await new Promise(resolve=>setImmediate(resolve));const concurrent=await r.invoke('POST',r.body);r.release();const original=await first;
 check('claim is spent before the first provider await, preventing a concurrent PUT',concurrent.status===409&&original.status===200&&r.counts().puts===1);
 console.log('\n'+passed+'/'+total+' registration successor checks passed');process.exitCode=passed===total?0:1;
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
