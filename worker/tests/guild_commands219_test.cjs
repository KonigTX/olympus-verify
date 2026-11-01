// Genuine Ed25519 -> actual Worker/ledger/Native D1 -> original deferred work.
// Discord transport and fixture identities are synthetic; no provider is contacted.
const fs219=require('node:fs'),path219=require('node:path'),{Module}=require('node:module');
const source219=fs219.readFileSync(path219.join(__dirname,'community_event_buttons_test.cjs'),'utf8'),cuts219=[...source219.matchAll(/^\(async \(\) => \{/gm)];
if(cuts219.length!==1)throw Error('original signed interaction fixture boundary');
async function guildCommands219(){
 keys=await crypto.subtle.generateKey({name:'Ed25519'},true,['sign','verify']);pub=Buffer.from(await crypto.subtle.exportKey('raw',keys.publicKey)).toString('hex');
 const reminders219=load('./community-event-reminders'),metadata219=load('./guild-calendar-metadata219');
 const command219=load('./guild-commands219'),catalog219=load('./guild-command-definitions219');
 const OFFICER='300000000000000219',TOKEN219='synthetic-interaction-token-219';
 let staff219=new Set([ORG,STAFF]),answers219=[],memberGets219=0,epoch219=0;
 const over219={GUILD_ID:GUILD,DISCORD_PUBLIC_KEY:pub,ROLE_OFFICER:OFFICER,ROLE_GUILD_MEMBER:ROLE,EVENT_DISCORD_REMINDERS:'on',COMMUNITY_FEATURES:'events,attendance,directory,crafting',ASSETS:{fetch:async request=>{
  const pathname=new URL(request.url).pathname;if(!['/static/guides218.json','/static/governance/organization.json'].includes(pathname))return new Response(null,{status:404});
  return new Response(fs.readFileSync(path.join(root,'public',pathname)),{headers:{'Content-Type':'application/json'}});
 }}};
 const transport219=()=>{hooks.http=async req=>{
  if(req.method==='PATCH'&&req.url===`/api/v10/webhooks/${BOT}/${TOKEN219}/messages/@original`){answers219.push(req.body);return new Response(null,{status:204});}
  const match=req.url.match(new RegExp('^/api/v10/guilds/'+GUILD+'/members/([0-9]+)$'));
  if(match){memberGets219++;return Response.json({user:{id:match[1],bot:false},pending:false,roles:staff219.has(match[1])?[OFFICER]:[]});}
 };};
 const fresh219=async()=>{await seed();T+=61*(epoch219++);nativeT=T;answers219=[];staff219=new Set([ORG,STAFF]);memberGets219=0;transport219();};
 const send219=async(name,sub,values={},who=ORG,{id=nextId(),custom,guild=GUILD}={})=>{
  const data=custom?{custom_id:custom,component_type:2}:{name,options:sub?[{type:1,name:sub,options:Object.entries(values).map(([name,value])=>({name,type:typeof value==='number'?4:3,value}))}]:Object.entries(values).map(([name,value])=>({name,type:typeof value==='number'?4:3,value}))};
  const i={type:custom?3:2,id,application_id:BOT,token:TOKEN219,guild_id:guild,channel_id:CHANNEL,member:{user:{id:who,username:'Synthetic'},roles:[ROLE]},data},body=JSON.stringify(i),ts=String(at()),sig=Buffer.from(await crypto.subtle.sign('Ed25519',keys.privateKey,new TextEncoder().encode(ts+body))).toString('hex'),pending=[];
  const response=await worker.fetch(new Request('https://verify.example/interactions',{method:'POST',headers:{'Content-Type':'application/json','X-Signature-Timestamp':ts,'X-Signature-Ed25519':sig},body}),env(over219),{waitUntil:p=>pending.push(p)});
  const initial=await response.json();await Promise.all(pending);return {status:response.status,initial,answer:answers219.at(-1),id};
 };
 const publicEffects219=()=>requests.filter(r=>r.method==='POST'&&r.url===`/api/v10/channels/${CHANNEL}/messages`);
 const create219=async(who=ORG)=>send219('raid','schedule',{title:'Synthetic .219 raid',starts:new Date((at()+1800)*1000).toISOString(),minutes:120,capacity:10,details:'Synthetic preparation notes.'},who);
 await fresh219();
 const authority219=load('./guild-command-authority219');
 for(const [label,body] of [['pending',{user:{id:ORG,bot:false},pending:true,roles:[OFFICER]}],['pending-malformed',{user:{id:ORG,bot:false},pending:'false',roles:[OFFICER]}],['bot',{user:{id:ORG,bot:true},pending:false,roles:[OFFICER]}],['bot-malformed',{user:{id:ORG,bot:'false'},pending:false,roles:[OFFICER]}]]){
  hooks.http=async()=>Response.json(body);check(label+' current member response cannot authorize a staff write',!await authority219.guildOrganizerMemberNow219(directEnv(over219),ORG,GUILD));
 }
 transport219();
 const schema219=JSON.stringify(db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all());
 check('Verify has nine distinct guild command names and no private Forever verification collision',catalog219.GUILD_COMMANDS_219.length===9&&new Set(catalog219.GUILD_COMMANDS_219.map(x=>x.name)).size===9&&!catalog219.GUILD_COMMANDS_219.some(x=>['verify','status','unlink'].includes(x.name)));
 let r=await create219(),event219=one('SELECT * FROM community_events ORDER BY created_at,id LIMIT 1');
 check('genuine signed staff schedule defers privately then creates the same website calendar row',r.status===200&&r.initial.type===5&&r.initial.data.flags===64&&!!event219&&event219.created_by===ORG&&r.answer?.embeds?.[0]?.description.includes('<t:'+event219.starts_at+':F>'),r);
 check('schedule returns seven revision-bound one-click preferences across two valid action rows',r.answer?.components?.length===2&&r.answer.components.every(x=>x.components.length<=5)&&r.answer.components.flatMap(x=>x.components).filter(x=>x.custom_id).length===7&&r.answer.allowed_mentions.parse.length===0);
 check('schedule does not post a public announcement or arm a reminder implicitly',publicEffects219().length===0&&!one('SELECT 1 FROM community_event_reminders'));
 const replay=await send219('raid','schedule',{},ORG,{id:r.id});
 check('replayed scheduling interaction returns only its deferred acknowledgement and creates no second event',replay.initial.type===5&&one('SELECT COUNT(*) n FROM community_events').n===1);
 const before219=one('SELECT COUNT(*) n FROM community_events').n;
 r=await create219(MEMBER);check('a member cannot create even with a forged signed role snapshot or configured organizer list',one('SELECT COUNT(*) n FROM community_events').n===before219&&r.answer.content.includes('Only a currently verified'));
 for(const choice of ['tank','healer','melee','ranged','tentative','bench','absent']){
  r=await send219('',null,{},MEMBER,{custom:`raid219:rsvp:${event219.id}:1:${choice}`});
  const row=one('SELECT * FROM community_event_signups WHERE event_id=? AND discord_id=?',event219.id,MEMBER),marker=one("SELECT fields FROM community_event_changes WHERE event_id=? AND actor=? AND json_extract(fields,'$[0]')='rsvp219'",event219.id,MEMBER);
  check('signed '+choice+' button updates one bounded preference without altering staff decisions',!!row&&!!marker&&JSON.parse(marker.fields)[1]===choice&&JSON.parse(marker.fields)[2]===row.write_nonce&&(choice!=='bench'||row.decision===null));
 }
 let copies=await call('GET','/api/me/export',undefined,MEMBER,over219);
 check('own copy contains current preference and hides internal nonce anchors',copies.status===200&&copies.body.community.events.signups[0].preference==='absent'&&!JSON.stringify(copies.body).includes(JSON.parse(one("SELECT fields FROM community_event_changes WHERE actor=? AND json_extract(fields,'$[0]')='rsvp219'",MEMBER).fields)[2]));
 let old=one('SELECT revision FROM community_event_signups WHERE event_id=? AND discord_id=?',event219.id,MEMBER);
 await call('PUT','/api/community/events/rsvp',{eventId:event219.id,status:'yes',character:'Synthetic Member',raidRole:'healer',revision:old.revision},MEMBER,over219);
 let actor219=await load('./guild-command-authority219').captureGuildActor219(directEnv(over219),{guild_id:GUILD,member:{user:{id:MEMBER}}},at(),at());
 // Use a fresh exact environment because the actor witness is environment-bound.
 const envRead219=directEnv(over219);actor219=await load('./guild-command-authority219').captureGuildActor219(envRead219,{guild_id:GUILD,member:{user:{id:MEMBER}}},at(),at());
 let roster219=await load('./guild-calendar219').calendarRoster219(envRead219,actor219,event219.id);
 check('later website edit invalidates the old same-second Discord preference',roster219[0].preference===null&&roster219[0].raid_role==='healer');
 r=await send219('raid','roster',{id:event219.id},MEMBER);check('verified member roster read is fresh and never ledger-caches private output',r.answer?.embeds?.[0]?.description.includes('healer')&&command219.guildCommandReadOnly219({type:2,data:{name:'raid',options:[{type:1,name:'roster'}]}}));
 r=await send219('raid','remind',{id:event219.id,mode:'arm'});let reminder219=one('SELECT * FROM community_event_reminders WHERE event_id=?',event219.id);
 check('officer slash reminder arms an exact-op marker without a fabricated browser session',reminder219?.state==='armed'&&metadata219.organizerMarker219(JSON.stringify(db.prepare("SELECT id,at,fields,actor FROM community_event_changes WHERE event_id=? AND actor=? AND json_extract(fields,'$[0]')='organizer219' ORDER BY id").all(event219.id,ORG)),ORG,reminder219.op_id)===true&&publicEffects219().length===0,r.answer);
 await reminders219.runEventReminders(directEnv(over219));reminder219=one('SELECT * FROM community_event_reminders WHERE event_id=?',event219.id);
 check('ordinary reminder worker uses fresh officer roles and posts exactly once under original custody',reminder219.state==='posted'&&publicEffects219().length===1&&memberGets219>=4,reminder219.state);
 await reminders219.runEventReminders(directEnv(over219));check('next ordinary invocation never resends a posted reminder',publicEffects219().length===1);
 await fixtureRun('UPDATE community_events SET starts_at=?,ends_at=? WHERE id=?',at()-60,at()-60+7200,event219.id);
 r=await send219('raid','attendance',{id:event219.id,action:'record',member:MEMBER,state:'present'});
 check('staff records explicit attendance after the event starts',one('SELECT state FROM community_event_attendance WHERE event_id=? AND discord_id=?',event219.id,MEMBER)?.state==='present',r.answer);
 r=await send219('raid','attendance',{id:event219.id,action:'lock'});
 check('staff can lock a post-start record without inferring other absences',r.answer.content.includes('locked')&&one('SELECT COUNT(*) n FROM community_event_attendance').n===1);
 r=await send219('raid','attendance',{id:event219.id,action:'record',member:MEMBER,state:'absent'});
 check('locked attendance rejects a later command edit',one('SELECT state FROM community_event_attendance WHERE event_id=? AND discord_id=?',event219.id,MEMBER).state==='present'&&r.answer.content.includes('Nothing changed'));
 const memberRef=one('SELECT ref FROM community_refs WHERE discord_id=?',MEMBER).ref;
 let webAttendance=await call('POST','/api/community/attendance/record',{eventId:event219.id,entries:[{ref:memberRef,state:'absent',revision:1}]},ORG,over219);
 check('same lock also prevents website attendance mutation',webAttendance.status===409&&one('SELECT state FROM community_event_attendance WHERE event_id=? AND discord_id=?',event219.id,MEMBER).state==='present');
 for(const [name,sub,v] of [['guide','class',{class:'warrior',spec:'arms'}],['guide','talent',{build:JSON.parse(fs.readFileSync(path.join(root,'public/static/guides218.json'))).presets[0].code}],['guide','consumes',{}],['guide','buffs',{}],['guide','attunement',{raid:'onyxia'}],['guide','attunement',{raid:'mc'}],['workshop',null,{}],['treasury',null,{}],['stockades',null,{}],['council',null,{}],['branches',null,{}],['launch',null,{}]]){
  r=await send219(name,sub,v,MEMBER);check(name+' '+(sub??'reference')+' uses current source and a private no-mention response',r.initial.type===5&&r.answer?.embeds?.length===1&&r.answer.allowed_mentions.parse.length===0,r.answer?.content);
 }
 const envOther219=directEnv(over219),otherActor219=await load('./guild-command-authority219').captureGuildActor219(envOther219,{guild_id:GUILD,member:{user:{id:OTHER}}},at(),at());
 const otherRoster219=await load('./guild-calendar219').calendarRoster219(envOther219,otherActor219,event219.id);
 check('general roster reader cannot see another member’s attendance',otherRoster219[0].attendance===null&&otherRoster219[0].attendance_visible===0);
 const envNoAttendance219=directEnv({...over219,COMMUNITY_FEATURES:'events'}),noAttendanceActor219=await load('./guild-command-authority219').captureGuildActor219(envNoAttendance219,{guild_id:GUILD,member:{user:{id:MEMBER}}},at(),at());
 const hiddenOwn219=await load('./guild-calendar219').calendarRoster219(envNoAttendance219,noAttendanceActor219,event219.id);
 check('attendance feature OFF suppresses even the viewer’s own attendance field',hiddenOwn219[0].attendance===null&&hiddenOwn219[0].attendance_visible===0);
 for(let j=0;j<21;j++){
  const id=String(810000000000219000n+BigInt(j));
  await fixtureRun('INSERT INTO site_users(discord_id,username,global_name,in_server,denied,session_version,first_login,last_login,checked_at) VALUES(?,?,?,1,0,1,?,?,?)',id,'Synthetic',('*'.repeat(58)+String(j).padStart(2,'0')),at(),at(),at());
  await fixtureRun("INSERT INTO members(discord_id,banned) VALUES(?,0)",id);
  await fixtureRun("INSERT INTO characters(name_key,name,discord_id,status,bound_at) VALUES(?,?,?,'member',?)",id,'Synthetic Character',id,at());
  await fixtureRun("INSERT INTO community_event_signups(event_id,discord_id,status,character_name,character_key,raid_role,revision,rsvp_starts_at,updated_at,write_nonce,decision,decided_at) VALUES(?,?,'tentative',?,?,'damage',1,?,?,?,'accepted',?)",event219.id,id,'*'.repeat(40),'*'.repeat(40),event219.starts_at,at(),'Z'.repeat(22),at());
 }
 r=await send219('raid','roster',{id:event219.id,page:1},MEMBER);
 command219.assertGuildAnswer219(r.answer);
 check('maximal escaped names fit a complete20-row roster page with a next-page hint',r.answer.embeds?.[0].description.split('\n').length===20&&r.answer.embeds[0].description.length<=4096&&r.answer.embeds[0].footer.text.includes('More rows'));
 r=await send219('raid','roster',{id:event219.id,page:2},MEMBER);
 check('page2 returns the remaining rows without silently skipping5 entries',r.answer.embeds?.[0].description.split('\n').length===2);
 check('guild registration definitions exclude global-only fields and obey recursive option limits',catalog219.GUILD_COMMANDS_219.every(command=>!Object.hasOwn(command,'dm_permission')&&!Object.hasOwn(command,'contexts')&&!Object.hasOwn(command,'integration_types')&&command.description.length<=100&&command.options.length<=25&&command.options.every(option=>option.description.length<=100&&(!option.options||option.options.length<=25&&option.options.every(x=>x.description.length<=100)))));
 const prepareReminder219=async()=>{await fresh219();await create219();const event=one('SELECT * FROM community_events LIMIT 1');await send219('raid','remind',{id:event.id,mode:'arm'});return event;};
 for(const phase of ['role-before-post','role-during-post','marker-during-get','duplicate-marker','operation-replaced','unknown-post','erase-during-get']){
  const target=await prepareReminder219(),oldHttp=hooks.http;let roleChecks=0,changed=false;
  if(phase==='duplicate-marker')await fixtureRun("INSERT INTO community_event_changes(event_id,action,actor,at,fields) SELECT event_id,action,actor,at,fields FROM community_event_changes WHERE event_id=? AND json_extract(fields,'$[0]')='organizer219'",target.id);
  hooks.http=async req=>{
   if(req.url===`/api/v10/guilds/${GUILD}/members/${ORG}`&&phase==='role-before-post'&&++roleChecks===2){staff219.delete(ORG);changed=true;}
   if(!changed&&req.url===`/api/v10/channels/${CHANNEL}`&&['marker-during-get','operation-replaced','erase-during-get'].includes(phase)){
    changed=true;
    if(phase==='marker-during-get')await fixtureRun("UPDATE community_event_changes SET at=at+1 WHERE event_id=? AND json_extract(fields,'$[0]')='organizer219'",target.id);
    if(phase==='operation-replaced')await fixtureRun('UPDATE community_event_reminders SET op_id=? WHERE event_id=?',NEXT,target.id);
    if(phase==='erase-during-get')await deleteThroughOriginalRoute(ORG,STAFF);
   }
   return oldHttp(req);
  };
  if(phase==='role-during-post')hooks.afterEffect=()=>{staff219.delete(ORG);changed=true;};
  if(phase==='unknown-post')hooks.afterEffect=()=>{changed=true;throw Error('synthetic lost POST answer');};
  await reminders219.runEventReminders(directEnv(over219));
  const result=one('SELECT * FROM community_event_reminders WHERE event_id=?',target.id);
  if(phase==='role-during-post')check('role revocation during POST retains exact pointer as unknown cleanup debt',changed&&result.state==='unknown'&&!!result.message_id&&result.cleanup_requested===1&&publicEffects219().length===1,{state:result.state,pointer:!!result.message_id,cleanup:result.cleanup_requested});
  else if(phase==='unknown-post')check('lost POST answer remains unknown and never dispatches a second message',changed&&result.state==='unknown'&&!result.message_id&&publicEffects219().length===1);
  else check(phase+' cannot authorize a public send',publicEffects219().length===0&&(phase==='duplicate-marker'||changed),result?.state);
  hooks.afterEffect=null;transport219();await reminders219.runEventReminders(directEnv(over219));
  if(['role-during-post','unknown-post'].includes(phase))check(phase+' is not retried on another ordinary invocation',publicEffects219().length===1);
 }
 check('all calendar and metadata changes preserve the exact existing schema',JSON.stringify(db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all())===schema219);
 console.log('\n'+passed+'/'+total+' .219 signed command checks passed');process.exit(passed===total?0:1);
}
const mod219=new Module(__filename,module);mod219.filename=__filename;mod219.paths=Module._nodeModulePaths(__dirname);
mod219._compile(source219.slice(0,cuts219[0].index)+'\n('+guildCommands219.toString()+')().catch(e=>{console.error(e.stack);process.exit(1)});',__filename);
