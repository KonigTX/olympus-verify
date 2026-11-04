// The original OAuth route, Native/SQLite and a synthetic one-use Discord authorization code.
const { runNativeErasureFixture } = require('./helpers/registered_native_erasure_fixture.cjs');

runNativeErasureFixture(async function review() {
 const memberPath='/users/@me/guilds/'+GUILD+'/member';
 const refused='Your sign-in could not be completed while account controls are updating.';
 const copy={
  missing:'Join the Asmongold Discord server before using the guild site.',
  pending:'Finish the Discord server membership screening, then sign in again.',
 };
 const changes=f=>f.raw('SELECT total_changes() AS n').n;
 const readSubject=f=>f.raw('SELECT * FROM privacy_subjects WHERE subject_id=?',ID);
 const isReadOnlyProvider=http=>http.every(row=>row.method==='GET'||row.method==='POST'&&row.url.endsWith('/oauth2/token'));
 function cookiesCleared(reply){
  const returned=reply.headers.getSetCookie();
  return ['__Host-olg_state','__Host-olg'].every(key=>returned.some(value=>value.startsWith(key+'=;')&&value.includes('Max-Age=0')))
   &&!returned.some(value=>/^__Host-olg=[^;]/.test(value));
 }
 async function start(f){
  const reply=await f.call('GET','/auth/login'),state=new URL(reply.headers.get('Location')).searchParams.get('state');
  assert.equal(reply.status,302);
  const code='code-'+ID;
  return {path:'/auth/callback?code='+code+'&state='+encodeURIComponent(state),stateCookie:'__Host-olg_state='+cookies(reply)['__Host-olg_state']};
 }
 function provider(f,kind,{onMember}={}){
  const original=f.provider,used=new Set();
  f.provider=async(url,init)=>{
   const method=init.method||'GET',path=new URL(url).pathname;
   if(method==='POST'&&path.endsWith('/oauth2/token')){
    const code=new URLSearchParams(init.body).get('code');
    if(used.has(code)){
     f.http.push({method,url});
     return new Response(JSON.stringify({error:'invalid_grant'}),{status:400});
    }
    used.add(code);
   }
   if(method==='GET'&&path.endsWith(memberPath)){
    f.http.push({method,url});
    await onMember?.();
    if(kind==='missing')return new Response(JSON.stringify({code:10007}),{status:404});
    if(kind==='pending'||kind==='malformed')return new Response(JSON.stringify({pending:kind==='pending'?true:'true'}));
    return new Response(JSON.stringify({pending:false,roles:[]}));
   }
   return original(url,init);
  };
 }
 async function retire(f,session){
  const admitted=await request(f,session);
  assert.equal(admitted.response.status,202);
  assert.equal((await finish(f))?.state,'complete');
  assert.equal(readSubject(f)?.state,'retired');
  assert.equal(f.raw('SELECT 1 FROM site_users WHERE discord_id=?',ID),undefined);
 }
 const callback=(f,flow,session)=>f.call('GET',flow.path,{cookie:flow.stateCookie+(session?'; '+session:'')});

 for(const kind of ['missing','pending']){
  const f=fixture();
  try{
   const old=await f.signIn(ID);await retire(f,old);clock++;
   const flow=await start(f);
   provider(f,kind);
   const before=changes(f),retired=JSON.stringify(readSubject(f)),http=f.http.length;
   const reply=await callback(f,flow,old),html=await reply.text();
   check('exact retired '+kind+' returns the existing 403 without a new session',reply.status===403&&html.includes(copy[kind])&&cookiesCleared(reply));
   check('exact retired '+kind+' preserves every database row and has only the original provider reads/exchange',changes(f)===before&&JSON.stringify(readSubject(f))===retired&&f.http.length-http===3&&isReadOnlyProvider(f.http.slice(http)));
   const retryBefore=f.http.length,replay=await callback(f,flow,old);
   check('replayed authorization code cannot reacquire account or membership evidence',replay.status===502&&f.http.length-retryBefore===1&&f.http[retryBefore].url.endsWith('/oauth2/token')&&!cookies(replay)['__Host-olg']&&JSON.stringify(readSubject(f))===retired&&!f.raw('SELECT 1 FROM site_users WHERE discord_id=?',ID));
  }finally{f.close();}
 }
 for(const kind of ['missing','pending']){
  const absent=fixture();
  try{
   const flow=await start(absent);
   provider(absent,kind);
   const before=changes(absent),reply=await callback(absent,flow),html=await reply.text();
   check('exact absent '+kind+' has neither profile nor audit mutation',reply.status===403&&html.includes(copy[kind])&&cookiesCleared(reply)&&changes(absent)===before&&!readSubject(absent)&&!absent.raw('SELECT 1 FROM site_users WHERE discord_id=?',ID)&&isReadOnlyProvider(absent.http));
  }finally{absent.close();}
  for(const legacy of [false,true]){
   const active=fixture();
   try{
    let session;
    if(legacy)await active.write('INSERT INTO site_users(discord_id,first_login,last_login,in_server,session_version) VALUES(?,?,?,1,7)',ID,clock,clock);
    else session=await active.signIn(ID);
    const before=active.raw('SELECT session_version FROM site_users WHERE discord_id=?',ID).session_version;
    const flow=await start(active),http=active.http.length;
    provider(active,kind);
    const reply=await callback(active,flow,session),html=await reply.text(),row=active.raw('SELECT in_server,session_version FROM site_users WHERE discord_id=?',ID);
    check((legacy?'legacy account':'active account')+' still revokes its existing local session on '+kind,reply.status===403&&html.includes(copy[kind])&&cookiesCleared(reply)&&row?.in_server===0&&row.session_version===before+1&&isReadOnlyProvider(active.http.slice(http)));
   }finally{active.close();}
  }
 }

 for(const race of ['old-state','expired-state','future-state','revision','storage','surviving-row','malformed']){
  const f=fixture();
  try{
   const session=await f.signIn(ID),old=await start(f);
   await retire(f,session);clock++;
   const flow=race==='old-state'?old:await start(f);
   if(race==='expired-state')clock+=601;
   if(race==='future-state')clock--;
   if(race==='surviving-row')await f.write('INSERT INTO site_users(discord_id,first_login,last_login,in_server,session_version) VALUES(?,?,?,1,7)',ID,clock,clock);
   const retired=readSubject(f),http=f.http.length,siteRow=JSON.stringify(f.raw('SELECT * FROM site_users WHERE discord_id=?',ID));
   if(race==='storage')f.failSql=sql=>sql.includes(' AS negative_membership');
   provider(f,race==='malformed'?'malformed':'missing',{onMember:race==='revision'?async()=>f.write('UPDATE privacy_subjects SET revision=revision+1 WHERE subject_id=?',ID):undefined});
   const reply=await callback(f,flow,session),html=await reply.text();
   check(race+' has no qualified negative shortcut',reply.status===503&&html.includes(refused)&&cookiesCleared(reply)&&readSubject(f)?.generation===retired.generation&&readSubject(f)?.state==='retired'&&JSON.stringify(f.raw('SELECT * FROM site_users WHERE discord_id=?',ID))===siteRow&&isReadOnlyProvider(f.http.slice(http)));
  }finally{f.close();}
 }
 {
  const f=fixture();
  try{
   const flow=await start(f);
   let afterConcurrentWrite;
   provider(f,'missing',{onMember:async()=>{
    await f.write("INSERT INTO privacy_subjects(subject_id,generation,state,revision,created_at,updated_at) VALUES(?,?,'active',1,?,?)",ID,'b'.repeat(32),clock,clock);
    await f.write('INSERT INTO site_users(discord_id,first_login,last_login,in_server,session_version) VALUES(?,?,?,1,7)',ID,clock,clock);
    afterConcurrentWrite=changes(f);
   }});
   const reply=await callback(f,flow),html=await reply.text();
   const row=f.raw('SELECT in_server,session_version FROM site_users WHERE discord_id=?',ID);
   check('old absence cannot revoke an account created during the provider lookup',reply.status===503&&html.includes(refused)&&cookiesCleared(reply)&&row?.in_server===1&&row.session_version===7&&readSubject(f)?.generation==='b'.repeat(32)&&changes(f)===afterConcurrentWrite);
  }finally{f.close();}
 }
 for(const kind of ['missing','positive']){
  const f=fixture();
  try{
   const session=await f.signIn(ID);f.inventoryUnavailable=true;
   assert.equal((await request(f,session)).response.status,202);
   assert.equal(readSubject(f)?.state,'retiring');
   const flow=await start(f);
   provider(f,kind);
   const persisted=()=>JSON.stringify(['site_users','privacy_subjects','privacy_serving_jobs','privacy_denial_markers','privacy_write_admission'].map(table=>f.rows('SELECT * FROM '+table+' ORDER BY rowid')));
   const before=persisted(),reply=await callback(f,flow,session);
   check('retiring '+kind+' remains held with no new session',reply.status===(kind==='positive'?409:503)&&!/^__Host-olg=[^;]/m.test(reply.headers.getSetCookie().join('\n'))&&readSubject(f)?.state==='retiring'&&persisted()===before);
  }finally{f.close();}
 }
 console.log(`${checks}/${checks} OAuth negative membership checks passed`);
}).catch(error=>{console.error(error);process.exitCode=1;});
