// Current Worker + genuine signed synthetic interactions + Native SQLite.
// Exact owner identity, but no real credentials, Discord traffic or game proof.
const fs226=require('node:fs'),path226=require('node:path'),{Module}=require('node:module');
const parent226=fs226.readFileSync(path226.join(__dirname,'guild_commands219_test.cjs'),'utf8');
const begin226=parent226.indexOf('async function guildCommands219(){'),end226=parent226.indexOf(' await fresh219();',begin226);
let fixture226=fs226.readFileSync(path226.join(__dirname,'community_event_buttons_test.cjs'),'utf8');
const ids226='const GUILD = "300000000000000006", CHANNEL = "300000000000000007", BOT = "300000000000000008", WRONG = "300000000000000009";';
if(fixture226.split(ids226).length!==2||begin226<0||end226<begin226)throw Error('Maintained signed fixture boundary');
fixture226=fixture226.replace(ids226,'const GUILD = "236932545793490944", CHANNEL = "300000000000000007", BOT = "1550176895671341076", WRONG = "300000000000000009";');
const cuts226=[...fixture226.matchAll(/^\(async \(\) => \{/gm)];if(cuts226.length!==1)throw Error('Signed fixture entry');
async function checks226(){
 const OWNER='472099715253796864',cal=load('./guild-calendar219'),auth=load('./guild-command-authority219'),ownerSql=load('./guild-event-owner226');
 const send=async({type=2,name='raid',custom,values,options=[],who=OWNER,roles=[],guild=GUILD,application=BOT,id=nextId()}={})=>{
  const data=type===2?{name,options}:{custom_id:custom,component_type:values?3:2,...(values?{values}:{})};
  const body=JSON.stringify({type,id,application_id:application,token:TOKEN219,guild_id:guild,channel_id:CHANNEL,member:{user:{id:who,username:'Fernmelder'},roles},data}),stamp=String(at()),sig=Buffer.from(await crypto.subtle.sign('Ed25519',keys.privateKey,new TextEncoder().encode(stamp+body))).toString('hex'),pending=[];
  answers219=[];const response=await worker.fetch(new Request('https://verify.example/interactions',{method:'POST',headers:{'Content-Type':'application/json','X-Signature-Timestamp':stamp,'X-Signature-Ed25519':sig},body}),env(over219),{waitUntil:p=>pending.push(p)});
  const text=await response.text();let initial=null;try{initial=text?JSON.parse(text):null;}catch{}await Promise.all(pending);return {status:response.status,initial,answer:answers219.at(-1),id};
 };
 const legacy=(ev,status='yes',extra={})=>send({type:3,custom:`raid:rsvp:${ev.id}:${ev.revision}:${status}`,...extra});
 const remind=(ev,extra={})=>send({type:3,custom:`raid:remind:${ev.id}:${ev.revision}`,...extra});
 const fresh=async()=>{
  await fresh219();Object.assign(over219,{SITE_ADMINS:OWNER,GUILD_ID:GUILD,DISCORD_APP_ID:BOT,ROLE_GUILD_MEMBER:ROLE,COMMUNITY_FEATURES:'events,attendance,directory,crafting',EVENT_DISCORD_DELIVERY:'on',EVENT_DISCORD_REMINDERS:'on'});
  await fixtureRun('INSERT INTO site_users(discord_id,username,global_name,in_server,denied,session_version,first_login,last_login,checked_at) VALUES(?,?,?,1,0,1,?,?,?)',OWNER,'Synthetic owner','Synthetic owner',at(),at(),at());
  await fixtureRun('INSERT INTO members(discord_id,banned) VALUES(?,0)',OWNER);
 };
 const make=async(who=OWNER,capacity=10)=>{const r=await send219('event','create',{title:'Owner226 synthetic event',starts:new Date((at()+1800)*1000).toISOString(),minutes:60,capacity},who);const ev=one('SELECT * FROM community_events ORDER BY created_at,id LIMIT 1');if(!ev)throw Error('Synthetic event unavailable '+JSON.stringify(r.answer));return ev;};
 const roster=async(who=OTHER)=>{const e=directEnv(over219),a=await auth.captureGuildActor219(e,{guild_id:GUILD,member:{user:{id:who}}},at(),at());return cal.calendarRoster219(e,a,event226.id);};
 const jobs=async()=>{const generation=one('SELECT generation FROM privacy_subjects WHERE subject_id=?',OWNER)?.generation??'0'.repeat(32);await fixtureRun("INSERT INTO privacy_serving_jobs(operation_id,subject_id,subject_generation,request_digest,original_session_version,original_session_expires,state,created_at,retain_until) VALUES(?,?,?,?,1,?,'waiting_role',?,?)",'a'.repeat(32),OWNER,generation,'b'.repeat(64),at()+3600,at(),at()+31622400);};
 await fresh();const physicalBefore=JSON.stringify(db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all());let event226=await make();
 for(const status of ['yes','tentative','no']){const r=await legacy(event226,status);check('unverified owner without Guild Member role uses legacy '+status,r.initial?.data?.flags===64&&one('SELECT status FROM community_event_signups WHERE event_id=? AND discord_id=?',event226.id,OWNER)?.status===status);}
 await legacy(event226,'yes');
 let r=await remind(event226);check('unverified owner enables legacy Remind me',one('SELECT remind_mention FROM community_event_signups WHERE event_id=? AND discord_id=?',event226.id,OWNER)?.remind_mention===1&&r.initial.data.content.includes('will be mentioned'));
 r=await remind(event226);check('unverified owner disables legacy Remind me',one('SELECT remind_mention FROM community_event_signups WHERE event_id=? AND discord_id=?',event226.id,OWNER)?.remind_mention===0&&r.initial.data.content.includes('will not be mentioned'));
 const noRepeat=await legacy(event226,'tentative');await send({type:3,custom:`raid:rsvp:${event226.id}:1:no`,id:noRepeat.id});check('legacy interaction replay does not mutate the first result',one('SELECT status FROM community_event_signups WHERE event_id=? AND discord_id=?',event226.id,OWNER).status==='tentative');
 await legacy(event226,'yes');
 for(const [field,value,label]of [['nick','Owner nick','Owner nick'],['global_name','Owner display','Owner display'],['username','owner_username','owner_username'],['username','','Fernmelder']]){
  await fixtureRun('UPDATE site_users SET nick=NULL,global_name=NULL,username=NULL WHERE discord_id=?',OWNER);await fixtureRun('UPDATE site_users SET '+field+'=? WHERE discord_id=?',value,OWNER);
  check('Discord roster includes owner using '+field+' / '+label,(await roster()).some(row=>row.display_name===label));
  const web=await call('GET','/api/community/event?id='+event226.id,undefined,OTHER,over219);check('website roster includes same owner label '+label,web.status===200&&web.body.signups.some(row=>row.displayName===label));
 }
 await fixtureRun("UPDATE site_users SET nick=' ',global_name=' ',username=' ' WHERE discord_id=?",OWNER);check('blank owner labels use clean Fernmelder fallback',(await roster()).some(row=>row.display_name==='Fernmelder'));
 check('owner self roster remains visible without a fabricated character',(await roster(OWNER)).some(row=>row.display_name==='Fernmelder')&&one('SELECT COUNT(*) n FROM characters WHERE discord_id=?',OWNER).n===0);
 const rendered=await send219('event','roster',{id:event226.id},OWNER);check('actual Discord roster renderer displays the clean owner fallback',rendered.answer?.embeds?.[0]?.description.includes('Fernmelder')&&!rendered.answer.embeds[0].description.includes('(declared)'));
 await fresh();event226=await make(OWNER,1);await legacy(event226);r=await legacy(event226,'yes',{who:MEMBER,roles:[ROLE]});check('owner affirmative signup consumes a real capacity place',r.initial.data.content.includes('full')&&!one('SELECT * FROM community_event_signups WHERE event_id=? AND discord_id=?',event226.id,MEMBER));
 // All modern preferences retain visibility; no fake character name is written.
 for(const choice of ['tank','healer','melee','ranged','tentative','bench','absent']){r=await send219('event','rsvp',{id:event226.id,choice},OWNER);check('owner '+choice+' preference stays in Discord roster',(await roster()).length===1&&one('SELECT character_name FROM community_event_signups WHERE discord_id=?',OWNER).character_name===null);}
 await fresh();event226=await make();await legacy(event226);
 r=await send219('event','attendance',{id:event226.id,action:'record',member:OWNER,state:'present'},OWNER);check('owner attendance still refuses before event start',!one('SELECT * FROM community_event_attendance WHERE discord_id=?',OWNER));
 await fixtureRun('UPDATE community_events SET starts_at=?,ends_at=? WHERE id=?',at()-60,at()-60+event226.duration_min*60,event226.id);
 for(const state of ['present','absent','excused','unknown']){r=await send219('event','attendance',{id:event226.id,action:'record',member:OWNER,state},OWNER);check('owner records own post-start '+state+' without a character',one('SELECT state FROM community_event_attendance WHERE event_id=? AND discord_id=?',event226.id,OWNER)?.state===state);}
 check('own attendance is visible only to its owner',(await roster(OWNER))[0]?.attendance==='unknown'&&(await roster(OTHER))[0]?.attendance===null);
 await send219('event','attendance',{id:event226.id,action:'lock'},OWNER);await send219('event','attendance',{id:event226.id,action:'record',member:OWNER,state:'present'},OWNER);check('attendance lock still prevents owner edits',one('SELECT state FROM community_event_attendance WHERE discord_id=?',OWNER).state==='unknown');
 for(const [label,sql]of [['denied','UPDATE site_users SET denied=1 WHERE discord_id=?'],['departed','UPDATE site_users SET in_server=0 WHERE discord_id=?'],['banned','UPDATE members SET banned=1 WHERE discord_id=?'],['deleted','DELETE FROM site_users WHERE discord_id=?'],['erasing',null]]){
  await fresh();event226=await make();await legacy(event226);if(sql)await fixtureRun(sql,OWNER);else await jobs();const before=one('SELECT revision FROM community_event_signups WHERE discord_id=?',OWNER)?.revision;
  await legacy(event226,'no');check(label+' owner cannot change legacy signup',one('SELECT revision FROM community_event_signups WHERE discord_id=?',OWNER)?.revision===before);check(label+' owner is hidden from ordinary roster reader',(await roster()).length===0);
  await fixtureRun('UPDATE community_events SET starts_at=?,ends_at=? WHERE id=?',at()-60,at()-60+event226.duration_min*60,event226.id);await send219('event','attendance',{id:event226.id,action:'record',member:OWNER,state:'present'},ORG);check(label+' owner cannot be an attendance target',!one('SELECT * FROM community_event_attendance WHERE discord_id=?',OWNER));
 }
 for(const setting of ['SITE_ADMINS','DISCORD_APP_ID','GUILD_ID']){
  await fresh();event226=await make();await legacy(event226);const e=directEnv(over219);e[setting]=OTHER;
  check(setting+' revocation removes owner-only participant eligibility',!one('SELECT 1 ok WHERE '+ownerSql.eventParticipantSql226(e,'?1'),OWNER));
 }
 await fresh();event226=await make();await fixtureRun("UPDATE characters SET status='left' WHERE discord_id=?",MEMBER);over219.SITE_ADMINS=OWNER+','+MEMBER;
 r=await legacy(event226,'yes',{who:MEMBER,roles:[ROLE]});check('another admin with owner display name is not exempted',!one('SELECT * FROM community_event_signups WHERE discord_id=?',MEMBER));
 r=await legacy(event226,'yes',{who:OTHER,roles:[]});check('ordinary member still needs the configured Guild Member role',r.initial.data.content.includes('Verify a character first'));
 r=await legacy(event226,'yes',{who:OTHER,roles:[ROLE]});check('ordinary verified member with member role retains legacy access',one('SELECT status FROM community_event_signups WHERE discord_id=?',OTHER)?.status==='yes');
 for(const disabled of ['EVENT_DISCORD_DELIVERY','COMMUNITY_FEATURES']){await fresh();event226=await make();over219[disabled]=disabled==='COMMUNITY_FEATURES'?'directory':'off';r=await legacy(event226);check(disabled+' OFF still blocks the owner',r.initial.data.content.includes('switched off')&&!one('SELECT * FROM community_event_signups WHERE discord_id=?',OWNER));}
 await fresh();event226=await make();r=await legacy(event226,'yes',{guild:WRONG});check('foreign guild still ignored',r.status===204);r=await legacy(event226,'yes',{application:WRONG});check('foreign application still rejected',r.status===400);
 // Original account version must survive a pause before the atomic legacy batch.
 for(const phase of ['version','deadline','erasure']){await fresh();event226=await make();hooks.beforeBatch=async plan=>{if(!plan.some(p=>p.statement.includes('ov226')))return;hooks.beforeBatch=null;if(phase==='version')await fixtureRun('UPDATE site_users SET session_version=session_version+1 WHERE discord_id=?',OWNER);if(phase==='deadline'){nativeT+=181;}if(phase==='erasure')await jobs();};r=await legacy(event226);check('paused owner legacy batch preserves '+phase+' fence',!one('SELECT * FROM community_event_signups WHERE discord_id=?',OWNER));}
 await fresh();event226=await make(ORG);await legacy(event226);await remind(event226);await send219('event','remind',{id:event226.id,mode:'arm'},ORG);const remEnv=directEnv(over219);await reminders219.runEventReminders(remEnv);
 const sent=publicEffects219();check('owner Remind me consent reaches the bounded reminder mention list',sent.length===1&&sent[0].body.allowed_mentions.users?.includes(OWNER));await reminders219.runEventReminders(remEnv);check('owner mention does not cause reminder replay',publicEffects219().length===1);
 await fresh();event226=await make(ORG);await legacy(event226);await remind(event226);await send219('event','remind',{id:event226.id,mode:'arm'},ORG);const changedEnv=directEnv(over219);hooks.afterEffect=()=>{changedEnv.SITE_ADMINS=OTHER;};await reminders219.runEventReminders(changedEnv);const changed=one('SELECT state,cleanup_requested FROM community_event_reminders');check('owner recipient revocation during POST retains unknown cleanup custody',changed.state==='unknown'&&changed.cleanup_requested===1&&publicEffects219().length===1);hooks.afterEffect=null;await reminders219.runEventReminders(changedEnv);check('unknown owner-recipient result is never resent',publicEffects219().length===1);
 await fresh();check('schema remains byte-for-byte unchanged',JSON.stringify(db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all())===physicalBefore);check('no owner character, role or pending verification is fabricated',one('SELECT COUNT(*) n FROM characters WHERE discord_id=?',OWNER).n===0&&one('SELECT COUNT(*) n FROM pending').n===0&&publicEffects219().length===0);
 console.log('\n'+passed+'/'+total+' owner event226 checks passed');process.exit(passed===total?0:1);
}
const inherited226=parent226.slice(begin226,end226).replace('async function guildCommands219(){','async function run226(){');
const module226=new Module(__filename,module);module226.filename=__filename;module226.paths=Module._nodeModulePaths(__dirname);module226._compile(fixture226.slice(0,cuts226[0].index)+'\n'+inherited226+'\nawait ('+checks226.toString()+')();\n}\nrun226().catch(e=>{console.error(e.stack);process.exit(1)});',__filename);
