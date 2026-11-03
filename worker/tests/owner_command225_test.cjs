// Real signed Worker routing and Native SQLite; all accounts and Discord HTTP are local fixtures.
const fs225=require('node:fs'),path225=require('node:path'),{Module}=require('node:module');
const parent225=fs225.readFileSync(path225.join(__dirname,'guild_commands219_test.cjs'),'utf8');
const start225=parent225.indexOf('async function guildCommands219(){'),end225=parent225.indexOf(' await fresh219();',start225);
let fixture225=fs225.readFileSync(path225.join(__dirname,'community_event_buttons_test.cjs'),'utf8');
const originalIds225='const GUILD = "300000000000000006", CHANNEL = "300000000000000007", BOT = "300000000000000008", WRONG = "300000000000000009";';
if(fixture225.split(originalIds225).length!==2||start225<0||end225<start225)throw Error('Original signed fixture boundary');
// Exact production identity constants, but synthetic signed requests, credentials, database and transport only.
fixture225=fixture225.replace(originalIds225,'const GUILD = "236932545793490944", CHANNEL = "300000000000000007", BOT = "1550176895671341076", WRONG = "300000000000000009";');
const cuts225=[...fixture225.matchAll(/^\(async \(\) => \{/gm)];if(cuts225.length!==1)throw Error('Original fixture entry');
async function checks225(){
 const OWNER='472099715253796864',auth=load('./guild-command-authority219');
 const controls=a=>(a?.components??[]).flatMap(r=>r.components);
 const send=async({name='olympus',who=OWNER,type=2,custom,values,guild=GUILD,application=BOT,tamper=false}={})=>{
  const data=type===2?{name,options:[]}:{custom_id:custom,component_type:values?3:2,...(values?{values}:{})};
  const i={type,id:nextId(),application_id:application,token:TOKEN219,guild_id:guild,channel_id:CHANNEL,member:{user:{id:who,username:'Fernmelder'},roles:[]},data};
  const body=JSON.stringify(i),stamp=String(at()),sig=Buffer.from(await crypto.subtle.sign('Ed25519',keys.privateKey,new TextEncoder().encode(stamp+body))).toString('hex'),pending=[];
  answers219=[];
  const response=await worker.fetch(new Request('https://verify.example/interactions',{method:'POST',headers:{'Content-Type':'application/json','X-Signature-Timestamp':stamp,'X-Signature-Ed25519':sig},body:tamper?body.replace('Fernmelder','Impersonator'):body}),env(over219),{waitUntil:p=>pending.push(p)});
  const text=await response.text();let initial=null;try{initial=text?JSON.parse(text):null;}catch{}await Promise.all(pending);return {status:response.status,initial,answer:answers219.at(-1)};
 };
 const answer=r=>r.initial?.type===4?r.initial.data:r.answer;
 const refused=r=>!answer(r)?.embeds?.length&&r.initial?.type!==9;
 const freshOwner=async()=>{
  await fresh219();over219.SITE_ADMINS=OWNER;
  await fixtureRun('INSERT INTO site_users(discord_id,username,global_name,in_server,denied,session_version,first_login,last_login,checked_at) VALUES(?,?,?,1,0,1,?,?,?)',OWNER,'Synthetic owner','Synthetic owner',at(),at(),at());
  await fixtureRun('INSERT INTO members(discord_id,banned) VALUES(?,0)',OWNER);
 };
 await freshOwner();
 const schemaBefore=JSON.stringify(db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all());
 let r=await send();check('owner without any character opens the private guild hub',r.initial?.type===5&&r.initial.data.flags===64&&r.answer?.embeds?.[0]?.title==='Olympus · your guild hub');
 check('owner access explicitly does not claim verification or grant roles',r.answer.embeds[0].footer.text.includes('Owner access does not verify a character or grant any role.')&&one('SELECT COUNT(*) n FROM characters WHERE discord_id=?',OWNER).n===0);
 const menu=controls(r.answer).find(c=>c.placeholder==='Open another Olympus section').custom_id;
 for(const section of ['status','guides','workshop','branches','council','treasury']){
  r=await send({type:3,custom:menu,values:[section]});
  check('unverified owner opens '+section+' privately with mention suppression',r.initial?.type===5&&r.answer?.embeds?.length>0&&r.answer.allowed_mentions.parse.length===0);
  if(section==='status')check('own status truthfully reports no linked characters',r.answer.embeds[0].description==='No linked characters are currently recorded for this account.');
 }
 r=await send({name:'raid'});check('unverified owner opens the private raid hub under existing organizer checks',r.initial?.type===5&&r.answer?.embeds?.[0]?.title==='Olympus raid & event hub'&&controls(r.answer).some(c=>c.label==='Schedule an event…'));
 for(const name of ['council','branches','launch','stockades','treasury','workshop']){r=await send({name});check('unverified owner can use existing '+name+' utility',r.initial?.type===5&&r.answer?.embeds?.length>0);}
 for(const mode of ['ordinary','revoked','unknown']){
  await freshOwner();await create219(OWNER);const event=one('SELECT * FROM community_events LIMIT 1');
  await send219('raid','remind',{id:event.id,mode:'arm'},OWNER);
  check(mode+' owner can explicitly consent to a reminder without character fabrication',one('SELECT state FROM community_event_reminders WHERE event_id=?',event.id)?.state==='armed'&&one('SELECT COUNT(*) n FROM characters WHERE discord_id=?',OWNER).n===0);
  const reminderEnv=directEnv(over219);
  if(mode==='revoked')reminderEnv.SITE_ADMINS=OTHER;
  if(mode==='unknown')hooks.afterEffect=()=>{throw Error('synthetic lost owner reminder response');};
  await reminders219.runEventReminders(reminderEnv);
  const row=one('SELECT * FROM community_event_reminders WHERE event_id=?',event.id);
  check(mode+' owner reminder retains current authority and one-send custody',mode==='ordinary'?row.state==='posted'&&publicEffects219().length===1:mode==='revoked'?publicEffects219().length===0:row.state==='unknown'&&publicEffects219().length===1);
  hooks.afterEffect=null;await reminders219.runEventReminders(reminderEnv);
  check(mode+' does not replay a reminder',publicEffects219().length===(mode==='revoked'?0:1));
 }
 await freshOwner();
 await fixtureRun("UPDATE characters SET status='left' WHERE discord_id=?",MEMBER);over219.SITE_ADMINS=OWNER+','+MEMBER;
 r=await send({who:MEMBER});check('another site admin with the owner display name still needs a member character',refused(r)&&r.initial?.type===4);
 r=await send({who:OTHER});check('ordinary verified member keeps normal hub access',r.initial?.type===5&&r.answer?.embeds?.[0]?.title==='Olympus · your guild hub'&&!r.answer.embeds[0].footer.text.includes('Owner access'));
 r=await send({who:OTHER,type:3,custom:menu,values:['status']});check('owner controls cannot be used by another verified person',refused(r));
 r=await send({guild:WRONG});check('owner in another guild is ignored',r.status===204&&r.initial===null);
 r=await send({application:WRONG});check('owner interaction for another application is ignored',r.status===400&&r.initial===null);
 r=await send({tamper:true});check('owner identity cannot bypass the Ed25519 signature',r.status===401);
 for(const [label,sql] of [
  ['denied','UPDATE site_users SET denied=1 WHERE discord_id=?'],
  ['departed','UPDATE site_users SET in_server=0 WHERE discord_id=?'],
  ['banned','UPDATE members SET banned=1 WHERE discord_id=?'],
  ['deleted account','DELETE FROM site_users WHERE discord_id=?']]){
  await freshOwner();await fixtureRun(sql,OWNER);r=await send();check(label+' owner is still refused',refused(r)&&r.initial?.type===4);
 }
 await freshOwner();
 const gen=one('SELECT generation FROM privacy_subjects WHERE subject_id=?',OWNER)?.generation??'0'.repeat(32);
 await fixtureRun("INSERT INTO privacy_serving_jobs(operation_id,subject_id,subject_generation,request_digest,original_session_version,original_session_expires,state,created_at,retain_until) VALUES(?,?,?,?,1,?,'waiting_role',?,?)",'a'.repeat(32),OWNER,gen,'b'.repeat(64),at()+3600,at(),at()+31622400);
 r=await send();check('owner erasure job still holds all command access',refused(r)&&r.initial?.type===4);
 for(const change of ['version','configuration','application','guild','deadline','erasure']){
  await freshOwner();const e=directEnv(over219),a=await auth.captureGuildActor219(e,{guild_id:GUILD,member:{user:{id:OWNER}}},at(),at());
  check(change+' fixture captures an owner-only original actor without character proof',a.verification==='bot-owner'&&Object.isFrozen(a));
  if(change==='version')await fixtureRun('UPDATE site_users SET session_version=session_version+1 WHERE discord_id=?',OWNER);
  if(change==='configuration')e.SITE_ADMINS=OTHER;
  if(change==='application')e.DISCORD_APP_ID=WRONG;
  if(change==='guild')e.GUILD_ID=WRONG;
  if(change==='deadline'){T+=181;nativeT=T;}
  if(change==='erasure')await fixtureRun("INSERT INTO privacy_serving_jobs(operation_id,subject_id,subject_generation,request_digest,original_session_version,original_session_expires,state,created_at,retain_until) VALUES(?,?,?,?,1,?,'waiting_role',?,?)",'c'.repeat(32),OWNER,'0'.repeat(32),'d'.repeat(64),at()+3600,at(),at()+31622400);
  check(change+' invalidates already captured owner command authority',!await auth.currentGuildActor219(e,a));
  let held=false;try{await auth.guildActorBatch219(e,a,[e.DB.prepare('SELECT 1 private_result')]);}catch{held=true;}check(change+' also prevents the atomic consuming batch',held);
 }
 await freshOwner();const e=directEnv(over219),a=await auth.captureGuildActor219(e,{guild_id:GUILD,member:{user:{id:OWNER}}},at(),at());
 let forged=false;try{auth.guildActorFence219(e,{...a},1);}catch{forged=true;}check('copying the actor tuple cannot forge its original witness',forged);
 await fixtureRun("UPDATE characters SET status='left' WHERE discord_id=?",MEMBER);
 const sql=load('./discord-member-fence219').discordMemberFenceSql(1,null,one('SELECT account_incarnation FROM site_users WHERE discord_id=?',MEMBER).account_incarnation,true);
 check('even an optional SQL arm cannot exempt a different Discord ID',!one('SELECT 1 ok WHERE '+sql,MEMBER));
 check('no synthetic verification, role, payment, event or public dispatch is introduced',one('SELECT COUNT(*) n FROM characters WHERE discord_id=?',OWNER).n===0&&one('SELECT COUNT(*) n FROM pending').n===0&&one('SELECT COUNT(*) n FROM community_events').n===0&&publicEffects219().length===0);
 check('schema is byte-for-byte unchanged',JSON.stringify(db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all())===schemaBefore);
 console.log('\n'+passed+'/'+total+' owner command access checks passed');process.exit(passed===total?0:1);
}
const inherited225=parent225.slice(start225,end225).replace('async function guildCommands219(){','async function run225(){');
const m225=new Module(__filename,module);m225.filename=__filename;m225.paths=Module._nodeModulePaths(__dirname);m225._compile(fixture225.slice(0,cuts225[0].index)+'\n'+inherited225+'\nawait ('+checks225.toString()+')();\n}\nrun225().catch(e=>{console.error(e.stack);process.exit(1)});',__filename);
