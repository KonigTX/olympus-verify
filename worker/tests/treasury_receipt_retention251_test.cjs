'use strict';
// POST-DEPLOY ONLY: actual Worker intake/staff routes, genuine fixture session, Native SQLite and original epoch.
const assert=require('node:assert/strict'),{createHash}=require('node:crypto'),J=require('./privacy_rejection_decision_test.cjs');
const T=1800000000,DAY=86400,KEEP=30*DAY,ACTOR='12345678901234567',ACTION='treasury.receipt242';
let checks=0;
const eq=(label,actual,expected)=>{assert.deepEqual(actual,expected,label);checks++;console.log('PASS '+label);};
const yes=(label,value)=>{assert.ok(value,label);checks++;console.log('PASS '+label);};
(async()=>{
 const f=await J.opened('canonical');f.env.WATCHER_TOKEN='synthetic-retention251-only';
 const raw=(sql,...values)=>f.db.prepare(sql).get(...values),count=prefix=>raw('SELECT COUNT(*) AS n FROM audit WHERE action=? AND subject LIKE ?',ACTION,'intake242:'+prefix+'%').n;
 const send=async request=>{const response=await f.fetch(request);for(const pending of f.pending.splice(0))await pending;return response;};
 const intake=async entries=>{const response=await send(new Request('https://bot.invalid/ingest/intake242',{method:'POST',headers:{Authorization:'Bearer '+f.env.WATCHER_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({entries})}));eq('actual authenticated intake succeeds',response.status,200);return response.json();};
 const ledger=async()=>{f.reset();const response=await send(f.req('GET','/api/admin/treasury/ledger'));eq('actual signed staff ledger succeeds',response.status,200);const reads=f.trace.filter(row=>row.sql.startsWith('SELECT id,ts,details FROM audit WHERE'));eq('ledger retains exactly one original three-bind payload read',reads.map(row=>row.values.length),[3]);return response.json();};
 const clock=async at=>{J.fixtureAdvance(at);await f.refreshCookie();};
 const stored=id=>raw('SELECT * FROM audit WHERE action=? AND subject=?',ACTION,'intake242:'+id);
 const seed=async(id,details,at,action=ACTION)=>f.admitted.prepare('INSERT INTO audit(ts,actor,action,subject,details)VALUES(?,?,?,?,?)').bind(at,'watcher',action,'intake242:'+id,typeof details==='string'?details:JSON.stringify(details)).run();
 const original=(id,over={})=>{const value={...JSON.parse(stored('offline-29d').details),sourceId:id,...over};delete value.payloadHash;return {...value,payloadHash:createHash('sha256').update(JSON.stringify(value)).digest('hex')};};
 try{
  const event={id:'offline-29d',type:'donation',source:'mail',character:'Retention Fixture',guid:'Player-1234-00000011',requestedAt:T-29*DAY,donation:{copper:100,items:[],note:'Original observation'}};
  f.reset();const first=await intake([event]);eq('29-day offline receipt is admitted once',first.acknowledgements.map(row=>[row.status,row.outcome]),[['done','unclassified_receipt_recorded']]);
  const originalSql=f.trace.filter(row=>row.sql.startsWith('DELETE FROM audit WHERE id IN(')||row.sql.startsWith('INSERT INTO audit(ts,actor,action,subject,details) SELECT')||row.sql.startsWith('SELECT details FROM audit WHERE action=?1 AND subject=?2'));
  eq('new receipt retains original purge/insert/read SQL and bind counts',originalSql.map(row=>row.values.length),[0,4,2]);
  const firstRow=stored(event.id),details=JSON.parse(firstRow.details);eq('arrival remains audit metadata while original observation fixes the deadline',[firstRow.ts,details.observedAt,details.retainUntil],[T,T-29*DAY,T+DAY]);
  const exactBefore=JSON.stringify(firstRow);eq('exact retry acknowledges the same source event',(await intake([event])).acknowledgements[0].status,'done');eq('retry does not renew arrival, deadline, payload or identity',JSON.stringify(stored(event.id)),exactBefore);
  eq('changed replay retains the original source-key conflict',(await intake([{...event,donation:{...event.donation,copper:101}}])).acknowledgements[0].outcome,'receipt_source_conflict');eq('conflict leaves the original receipt unchanged',JSON.stringify(stored(event.id)),exactBefore);
  await seed('legacy-29d',original('legacy-29d'),T);const legacyId=stored('legacy-29d').id;
  await clock(T+DAY-1);const before=await ledger();eq('late arrival and existing server rows are visible only before their original deadline',before.rows.map(row=>row.id).sort((a,b)=>a-b),[firstRow.id,legacyId]);
  await intake([]);eq('one second before original expiry both rows remain',count(''),2);
  await clock(T+DAY);eq('exact original deadline hides both rows before cleanup',(await ledger()).rows.length,0);eq('visibility is independent of whether cleanup has run',count(''),2);
  await intake([]);eq('exact original deadline deletes both rows despite recent arrival timestamps',count(''),0);
  eq('exact-expiry retry is rejected rather than recreated',(await intake([event])).acknowledgements[0].outcome,'receipt_outside_retention');eq('expired source cannot renew its retention',stored(event.id),undefined);
  await clock(T+DAY+1);eq('after original expiry retry remains rejected',(await intake([event])).acknowledgements[0].outcome,'receipt_outside_retention');eq('after expiry ledger stays empty',(await ledger()).rows.length,0);

  // Unknown historical deadlines are never exposed. Their deletion-only fallback remains arrival+30 days.
  const at=J.fixtureOriginalClock(),valid={version:242,sourceId:'unknown',source:'mail',character:'Retention Fixture',characterKey:'retention fixture',guid:'Player-1234-00000011',copper:1,items:[],note:'Unknown historical deadline',observedAt:at-DAY,classification:'unclassified_receipt',evidence:{kind:'declaration'}};
  await seed('unknown-deadline',valid,at-KEEP+1);await seed('malformed-deadline','malformed receipt JSON',at-KEEP+1);await seed('string-deadline',{...valid,retainUntil:String(at+KEEP)},at-KEEP+1);await seed('foreign-audit','unrelated malformed JSON',at-KEEP-1,'unrelated.action251');
  eq('malformed, missing and string deadlines cannot enter the ledger',(await ledger()).rows.length,0);await intake([]);eq('deletion fallback does not expire one second early',count(''),3);
  await f.admitted.prepare('INSERT INTO members(discord_id,username)VALUES(?,?)').bind(ACTOR,'Synthetic retention owner').run();
  await f.admitted.prepare("INSERT INTO characters(name_key,name,discord_id,status,bound_at,source,guid)VALUES('retention fixture','Retention Fixture',?,'member',?,'fixture','Player-1234-00000011')").bind(ACTOR,at).run();
  const username=raw('SELECT username FROM site_users WHERE discord_id=?',ACTOR).username,eraser=f.L('community-data-registry').communityScopedEraseStatements(f.admittedEnv,ACTOR,['treasury242']);
  await assert.rejects(()=>f.admitted.batch([f.admitted.prepare("UPDATE site_users SET username='must-roll-back' WHERE discord_id=?").bind(ACTOR),...eraser]));checks++;console.log('PASS unchanged receipt eraser still refuses malformed JSON');
  eq('malformed receipt erasure rolls the original whole transaction back',raw('SELECT username FROM site_users WHERE discord_id=?',ACTOR).username,username);eq('malformed erasure leaves all receipt rows in custody',count(''),3);
  await clock(at+1);await intake([]);eq('unknown and malformed deadlines use the exact arrival+30-day deletion bound',count(''),0);yes('receipt cleanup never deletes another audit family',!!raw('SELECT 1 FROM audit WHERE action=? AND subject=?','unrelated.action251','intake242:foreign-audit'));

  const now=J.fixtureOriginalClock(),expired={...valid,observedAt:now-KEEP-1,retainUntil:now-1};
  for(let i=0;i<101;i++)await seed('bounded-'+i,{...expired,sourceId:'bounded-'+i},now-1);
  eq('already expired server rows stay hidden before bounded cleanup',(await ledger()).rows.length,0);
  f.reset();await intake([]);eq('one purge still performs exactly one zero-bind payload statement',f.trace.filter(row=>row.sql.startsWith('DELETE FROM audit WHERE id IN(')).map(row=>row.values.length),[0]);eq('cleanup retains the original100-row cap',count('bounded-'),1);
  eq('the unselected expired remainder is still hidden',(await ledger()).rows.length,0);await intake([]);eq('next bounded cleanup removes the last expired row',count('bounded-'),0);
  console.log('TREASURY_RETENTION251_RESULT '+JSON.stringify({checks,passed:checks,originalObservationAgeDays:29,cleanupRowsPerCall:100,receiptPayloadStatements:3,ledgerPayloadStatements:1,liveProvider:false,nativeAuthorityInvented:false,scheduledBudgetChanged:false}));
 }finally{f.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
