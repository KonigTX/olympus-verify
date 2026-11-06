// Actual pre-seal Native/D1-shaped SQLite admission. Discord GET only is synthetic.
'use strict';
const fs233=require('node:fs'),path233=require('node:path'),{Module:Module233}=require('node:module');
const file233=path233.join(__dirname,'launch_membership230_native_test.cjs'),base233=fs233.readFileSync(file233,'utf8');
const marker233=' async function invoke(code)',start233=' let code=await fresh(),reply=await invoke(code);';
if(base233.split(marker233).length!==2||base233.split(start233).length!==2)throw Error('officer233_native_fixture_boundary');
const tag233='const body230=String.raw`',bodyStart233=base233.indexOf(tag233);if(bodyStart233<0)throw Error('officer233_raw_fixture_boundary');
const head233=base233.slice(0,bodyStart233),inner233=base233.slice(bodyStart233+tag233.length,base233.indexOf(marker233));
const body233=String.raw`
 const O=load('./officer-invites233');let roleHTTP=0,readOnlyMethod=true,callback233=null,responseStatus233=200,roles233=[];
 stubs['./discord'].credentialFetch=async(url,init,before)=>{before?.();roleHTTP++;readOnlyMethod=readOnlyMethod&&init.method==='GET'&&url==='https://discord.com/api/v10/guilds/'+G+'/members/'+A;await callback233?.();return new Response(JSON.stringify({user:{id:A},roles:roles233}),{status:responseStatus233});};
 function input233(code){const hash=h('native-scope|1|'+scope.guild+'|'+scope.realm).slice(0,16),name='Fresh Candidate',guid='Player-4613-ABCDEF12';
  const b={character:name,code,guid,source:'whisper',nativeInvite:{version:233,proofId:'1'.repeat(32),fullName:name,unitGuid:guid,unitFullName:name,whisperAt:T,requestedAt:T,observedAt:T,scopeHash:hash,guildState:'unguilded',source:'native-who-unit-v233',before:'2'.repeat(64),after:'3'.repeat(64),mac:''}};
  b.nativeInvite.mac=crypto230.createHmac('sha256',SECRET).update(O.officerInviteMessage233(b)).digest('hex').slice(0,32);return b;
 }
 async function setup233(){const code=await fresh();env={...env,SITE_GUILD_ID:G};roleHTTP=0;readOnlyMethod=true;callback233=null;responseStatus233=200;roles233=[load('./launch-operations229').KNIGHT_ROLE_IDS229[0]];return input233(code);}
 const rows=()=>db.prepare('SELECT * FROM role_settlements').all();
 const queue233=()=>db.prepare('SELECT * FROM invite_queue').all(),pending233=()=>JSON.stringify(db.prepare('SELECT * FROM pending').all());
 let b=await setup233(),beforePending=pending233(),beforeSchema=JSON.stringify(db.prepare('SELECT type,name,sql FROM sqlite_master ORDER BY type,name').all()),reply=await O.postOfficerInvite233(env,b);
 check('actual Native admission queues exactly one bounded Knight/WHO/unit original',reply.status===200&&reply.body.result==='queued'&&queue233().length===1&&queue233()[0].approved_by==='officer233'&&roleHTTP===1&&readOnlyMethod);
 check('queue admission never consumes pending or grants membership/Discord roles',pending233()===beforePending&&reply.body.pendingConsumed===false&&reply.body.roleGranted===false&&rows().length===0&&http.length===0);
 const q=queue233()[0],note=JSON.parse(q.note),expiry=reply.body.expiresAt;
 check('private note has original GUID/scope/G/pending relation but no code',note.guid===b.guid&&note.pendingId===db.prepare('SELECT id FROM pending').get().id&&note.generation===null&&!q.note.includes(b.code)&&note.expiresAt===T+60);
 let zero={limit:0,attempts:0,retries:0},view=await O.readOfficerInvites233(env,zero,3,T);
 check('zero read budget yields no role HTTP or candidate',view.invites.length===0&&roleHTTP===1&&zero.attempts===0);
 const budget={limit:3,attempts:0,retries:0};view=await O.readOfficerInvites233(env,budget,3,T);
 check('read emits exact privacy-minimal source-owned DTO and spends one GET',view.invites.length===1&&view.invites[0].queueId===q.id&&view.invites[0].proofId===note.proofId&&budget.attempts===1&&roleHTTP===2&&!Object.hasOwn(view.invites[0],'code')&&!Object.hasOwn(view.invites[0],'discord_id')&&!Object.hasOwn(view.invites[0],'generation'));
 check('read never renews proof expiry or writes queue/control/schema',view.invites[0].expiresAt===expiry&&JSON.stringify(queue233()[0])===JSON.stringify(q)&&JSON.stringify(db.prepare('SELECT type,name,sql FROM sqlite_master ORDER BY type,name').all())===beforeSchema&&db.prepare('SELECT mode,active,nonce,purpose FROM privacy_write_admission').get().active===0);
 reply=await O.postOfficerInvite233(env,b);check('original or fresh source cannot replace an unresolved invite row',reply.body.result==='held'&&queue233().length===1&&queue233()[0].note===q.note);db.close();
 for(const kind of ['mac','unknownGuild','unitGuid','unitName','sameCache','future','expired','name','code','scope','extra','getter']){
  b=await setup233();if(kind==='mac')b.nativeInvite.mac='0'.repeat(32);else if(kind==='unknownGuild')b.nativeInvite.guildState='unknown';else if(kind==='unitGuid')b.nativeInvite.unitGuid='Player-4613-00000001';else if(kind==='unitName')b.nativeInvite.unitFullName='Other';else if(kind==='sameCache')b.nativeInvite.after=b.nativeInvite.before;else if(kind==='future')b.nativeInvite.observedAt=T+6;else if(kind==='expired')b.nativeInvite.observedAt=T-60;else if(kind==='name')b.character='Other';else if(kind==='code')b.code='AAAAAAA';else if(kind==='scope')b.nativeInvite.scopeHash='0'.repeat(16);else if(kind==='extra')b.nativeInvite.autoInvite=true;else{let touched=0;Object.defineProperty(b.nativeInvite,'mac',{get(){touched++;throw Error('getter');}});b.getterTouches=()=>touched;}
  const r=await O.postOfficerInvite233(env,b);check(kind+' input cannot write queue or issue provider mutation',r.body.inviteQueued===false&&queue233().length===0&&roleHTTP===0&&http.length===0);db.close();
 }
 for(const kind of ['nonKnight','provider429','providerUnknown','banned','denied','rename','member','differentOwner','privacyRetired','rosterIncomplete']){
  b=await setup233();beforePending=pending233();
  if(kind==='nonKnight')roles233=[];else if(kind==='provider429')responseStatus233=429;else if(kind==='providerUnknown')callback233=async()=>{throw Error('read unknown');};
  else if(kind==='banned')await env.DB.prepare('INSERT INTO members(discord_id,banned,activity_at)VALUES(?1,1,?2)').bind(A,T).run();
  else if(kind==='denied')await env.DB.prepare('INSERT INTO site_users(discord_id,denied,first_login,last_login)VALUES(?1,1,?2,?2)').bind(A,T).run();
  else if(kind==='rename')await env.DB.prepare("INSERT INTO rename_holds(discord_id,char_key,old_name,new_name,guid,nonce,state,decided_by,decided_at)VALUES(?1,'fresh candidate','Fresh Candidate','Other',?2,'fixture','reapply',?1,?3)").bind(A,b.guid,T).run();
  else if(kind==='member'||kind==='differentOwner'){await env.DB.prepare('INSERT INTO members(discord_id,banned,activity_at)VALUES(?1,0,?2)').bind(kind==='member'?A:B,T).run();await env.DB.prepare("INSERT INTO characters(name_key,name,discord_id,status,bound_at,verified_at,guid)VALUES('fresh candidate','Fresh Candidate',?1,?2,?3,?3,?4)").bind(kind==='member'?A:B,kind==='member'?'member':'verified',T,b.guid).run();}
  else if(kind==='privacyRetired')await env.DB.prepare("INSERT INTO privacy_subjects(subject_id,generation,state,revision,created_at,updated_at,erased_at,retain_until)VALUES(?1,?2,'retired',1,?3,?3,?3,?3+31622400)").bind(A,'a'.repeat(32),T).run();
  else await env.DB.prepare('UPDATE roster_snapshots SET complete=0').run();
  const r=await O.postOfficerInvite233(env,b);check(kind+' policy remains held without pending consumption or queue mutation',r.body.result==='held'&&queue233().length===0&&pending233()===beforePending&&roleHTTP<=1&&http.length===0);db.close();
 }
 b=await setup233();callback233=async()=>{callback233=null;await env.DB.prepare('UPDATE pending SET nonce=?1').bind('P7K').run();};reply=await O.postOfficerInvite233(env,b);check('pending changed across fresh-role await refuses exact original admission',reply.body.result==='held'&&queue233().length===0);db.close();
 b=await setup233();callback233=async()=>{callback233=null;env.VERIFY_MEMBERSHIP_ONLY='false';};reply=await O.postOfficerInvite233(env,b);check('entry config change cannot adopt replacement mode',reply.body.result==='held'&&queue233().length===0);db.close();
 b=await setup233();await env.DB.prepare("UPDATE pending SET consumed_at=?1,consumed_source='membership_refused'").bind(T).run();beforePending=pending233();reply=await O.postOfficerInvite233(env,b);check('exact historical membership_refused can supply invitation request without reopening it',reply.body.result==='queued'&&pending233()===beforePending&&reply.body.pendingConsumed===false);db.close();
 b=await setup233();await env.DB.prepare("UPDATE pending SET consumed_at=?1,consumed_source='whisper'").bind(T).run();reply=await O.postOfficerInvite233(env,b);check('other consumed request purposes cannot acquire invite approval',reply.body.result==='held'&&queue233().length===0&&roleHTTP===0);db.close();
 b=await setup233();reply=await O.postOfficerInvite233(env,b);roles233=[];let budget2={limit:3,attempts:0,retries:0};view=await O.readOfficerInvites233(env,budget2,3,T);check('fresh entitlement loss removes action projection without deleting custody',view.invites.length===0&&queue233().length===1&&budget2.attempts===1);db.close();
 b=await setup233();reply=await O.postOfficerInvite233(env,b);responseStatus233=429;budget2={limit:3,attempts:0,retries:0};roleHTTP=0;view=await O.readOfficerInvites233(env,budget2,3,T);check('projection429 is held without provider retry',view.invites.length===0&&roleHTTP===1&&budget2.attempts===1&&budget2.retries===0);db.close();

 b=await setup233();
 const oldNotes=[];
 for(let i=0;i<6;i++){
  const note={version:233,proofId:String(i+2).repeat(32),guid:'Player-4613-ABCD000'+i,fullName:'Old Candidate '+i,scopeHash:b.nativeInvite.scopeHash,observedAt:T-61,expiresAt:T-1,generation:null,pendingId:1,source:'native-who-unit-v233'};
  let text=JSON.stringify(note);if(i===3)text='{';if(i===4)text=JSON.stringify({...note,observedAt:T,expiresAt:String(T+60)});if(i===5){delete note.expiresAt;text=JSON.stringify(note);}
  await env.DB.prepare("INSERT INTO invite_queue(name_key,name,discord_id,note,status,created_at,approved_by,priority)VALUES(?1,?2,?3,?4,'queued',?5,'officer233',0)").bind('old candidate '+i,'Old Candidate '+i,'30000000000000000'+i,text,T-61).run();
 }
 const priorRows=JSON.stringify(queue233());reply=await O.postOfficerInvite233(env,b);roleHTTP=0;budget2={limit:3,attempts:0,retries:0};view=await O.readOfficerInvites233(env,budget2,3,T);
 check('expired or invalid other-subject approvals cannot starve a later genuine fresh candidate before LIMIT',reply.body.result==='queued'&&view.invites.length===1&&view.invites[0].queueId===queue233()[6].id&&roleHTTP===1&&budget2.attempts===1);
 check('reader skips old deadlines without deleting renewing or treating attempts0 as a native outcome',JSON.stringify(queue233().slice(0,6))===priorRows&&view.invites[0]?.expiresAt===T+60);db.close();

 for(const phase of ['lost-first','lost-publication','late-config','graph-before-publication','failure-first','missing-first','failure-publication','missing-publication']){
  b=await setup233();let originalAck233=null;
  const admission=load('./privacy-write-admission'),oldAlias233=admission.createPrivacyAdmissionAlias;
  if(phase==='graph-before-publication')admission.createPrivacyAdmissionAlias=(...a)=>{if(originalAck233)originalAck233.meta.changes=2;return oldAlias233(...a);};
  batchHook=(plan,out)=>{
   const statements=plan.map(x=>x.statement||x.sql||'');
   if(statements.some(x=>/^INSERT INTO invite_queue\(/.test(x))){
    originalAck233=out.find(x=>x.results?.some(r=>Object.hasOwn(r,'created_at')&&Object.hasOwn(r,'id')));
    if(phase==='lost-first'){batchHook=null;throw Error('synthetic lost ACK1');}
    if(phase==='late-config')env.VERIFY_MEMBERSHIP_ONLY='false';
    if(phase==='failure-first')originalAck233.success=false;
    if(phase==='missing-first')delete originalAck233.success;
   }
   if(phase==='lost-publication'&&statements.some(x=>/^UPDATE invite_queue SET approved_by='officer233'/.test(x))){batchHook=null;throw Error('synthetic lost ACK2');}
   if((phase==='failure-publication'||phase==='missing-publication')&&statements.some(x=>/^UPDATE invite_queue SET approved_by='officer233'/.test(x))){
    const ack=out.find(x=>x.results?.some(r=>Object.hasOwn(r,'id')));if(phase==='failure-publication')ack.success=false;else delete ack.success;
   }
  };
  reply=await O.postOfficerInvite233(env,b);admission.createPrivacyAdmissionAlias=oldAlias233;batchHook=null;
  check(phase+' unknown retains one exact source row and does not report approval',reply.status===503&&reply.body.result==='unknown'&&queue233().length===1);
  if(phase==='late-config')env.VERIFY_MEMBERSHIP_ONLY='true';
  view=await O.readOfficerInvites233(env,{limit:3,attempts:0,retries:0},3,T);
  if(phase.endsWith('publication')&&phase!=='graph-before-publication')check(phase+' published row attests prior original ACK1, never adopts ACK2 or renews expiry',queue233()[0].approved_by==='officer233'&&view.invites.length===1&&view.invites[0].expiresAt===T+60);
  else check(phase+' pending row cannot be published by poll or serialized stage claim',queue233()[0].approved_by==='officer233-pending'&&view.invites.length===0);
  const before=JSON.stringify(queue233());reply=await O.postOfficerInvite233(env,{...b,originalAck:{stage:1,id:queue233()[0].id}});
  check(phase+' caller-claimed ACK cannot mint publication',reply.body.result==='held'&&JSON.stringify(queue233())===before);db.close();
 }
 console.log(ok+'/'+n+' officer233 Native checks passed');process.exitCode=ok===n?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});`;
const m233=new Module233(__filename,module);m233.filename=__filename;m233.paths=module.paths;m233._compile(head233+"\nconst body230="+JSON.stringify(inner233+body233)+";\nconst runner230=new Module230(__filename,module);runner230.filename=__filename;runner230.paths=module.paths;runner230._compile(fixture230+body230,__filename);",__filename);
