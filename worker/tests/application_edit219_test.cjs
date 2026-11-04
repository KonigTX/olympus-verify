// Real Worker, original cookies, Native admission and SQLite; no production or provider writes.
const fs219=require('node:fs'),path219=require('node:path'),{Module}=require('node:module');
const fixture219=fs219.readFileSync(path219.join(__dirname,'frontend_check.cjs'),'utf8');
const boundary219=[...fixture219.matchAll(/\(async \(\) => \{\r?\n  await siteUser\(MEMBER/g)];
if(boundary219.length!==1)throw Error('original frontend fixture boundary');
async function applicationEdit219(){
 await siteUser(MEMBER,{global_name:'Application editor'});await character(MEMBER,'Editor One','Player-219-0001');
 await siteUser(OTHER,{global_name:'Other applicant'});await character(OTHER,'Other One','Player-219-0002');
 await siteUser(STAFF);
 const schemaBefore=JSON.stringify(db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all());
 const request=async(method,url,body,who=MEMBER,headers={},native)=>{
  const response=await indexMod.default.fetch(new Request('https://guild.example'+url,{method,headers:{Cookie:await cookieFor(who),Origin:'https://guild.example','X-Olympus':siteCore.PAGE_VERSION,...(body===undefined?{}:{'Content-Type':'application/json'}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})}),env(native?{DB:native}:{}),ctx);
  return {status:response.status,body:await response.clone().json().catch(()=>null)};
 };
 const saved=()=>one('SELECT * FROM site_applications WHERE discord_id=?',MEMBER);
 const body={position:'member',backups:[],class:'warrior',role:'tank',region:'eu',character:'Editor One',fallback:true,ack:true,board:false,avail:'f'.repeat(42),availTz:'Europe/Stockholm',applicationTrack:'member',targetOffice:null,editToken:null,
  answers:{experience:'I have played with groups and will follow the agreed plan.',why:'I want to help the guild and learn with other members.',leadership:'I help organize a fictional group.',scenario:'Hear both accounts and follow the agreed rules.',hours:'10to20',voice:'yes',extra:'Original private note.'}};
 let r=await request('PUT','/api/application',body);
 check('new ordinary application is saved with a private content token',r.status===200&&r.body?.application?.editToken?.length===64,r);
 const initialTime=saved().created_at,initialToken=r.body.application.editToken;
 await fixtureRun("UPDATE site_applications SET status='reviewing',reviewed_at=?,reviewed_by=?,admin_note='' WHERE discord_id=?",now-10,STAFF,MEMBER);
 await fixtureRun("INSERT INTO site_settings(key,value,updated_at) VALUES('applicationsOpen','0',1) ON CONFLICT(key) DO UPDATE SET value='0'");
 let me=await request('GET','/api/me'),token=me.body.application.editToken;
 check('review status alone preserves the own token without disclosing staff notes',token===initialToken&&!Object.hasOwn(me.body.application,'adminNote'));
 const staff=await openPage(STAFF);let staffPosts=0;
 staff.before((p,i)=>{if(p.endsWith('/status')&&i.method==='POST')staffPosts++;return false;});
 await staff.go('#/admin/applications/'+MEMBER);
 await waitFor(()=>!!byText(staff.app,'button','Save note'),'original RT16 view',8000);
 const collection={version:1,characters:[{character:'Editor Main',class:'mage',build30:'',build60:''},{character:'Editor Alt',class:'priest',build30:'',build60:''}]};
 const updated={...body,position:'raider',class:'mage',role:'dps',character:'Editor Main',region:'na_east',availTz:'America/New_York',applicationTrack:'raider',editToken:token,answers:{...body.answers,extra:'Updated private note.',specialization:'frost',talentBuilds:collection}};
 r=await request('PUT','/api/application',updated);
 check('under-review applicant can change track, class, main, alts, timezone and answers while admissions are paused',r.status===200&&saved().position==='raider'&&saved().character==='Editor Main'&&saved().class==='mage'&&saved().avail_tz==='America/New_York',r);
 check('original submission and staff review remain intact',saved().created_at===initialTime&&saved().status==='reviewing'&&saved().reviewed_by===STAFF&&saved().reviewed_at===now-10&&saved().admin_note==='');
 check('declared alts without build codes survive without becoming verified characters',JSON.stringify(JSON.parse(saved().answers).talentBuilds)===JSON.stringify(collection)&&!one('SELECT 1 FROM characters WHERE name=?','Editor Alt'));
 check('declared specialization is class-bound and preserved privately',JSON.parse(saved().answers).specialization==='frost');
 check('same-second own edit refreshes the exact content digest',r.body.application.editToken!==token&&r.body.application.editToken.length===64);
 const storedAfter=JSON.stringify(saved());
 const oldClient={...updated};delete oldClient.editToken;
 const missing=await request('PUT','/api/application',oldClient);
 check('a pre-.219 editor without its own token must reload',missing.status===409&&missing.body.error==='stale_application'&&JSON.stringify(saved())===storedAfter);
 const wrongSpec=await request('PUT','/api/application',{...updated,editToken:r.body.application.editToken,answers:{...updated.answers,specialization:'holy'}});
 check('a specialization from another class is rejected without changing the application',wrongSpec.status===400&&wrongSpec.body.field==='specialization'&&JSON.stringify(saved())===storedAfter);
 const stale=await request('PUT','/api/application',{...updated,answers:{...updated.answers,extra:'Stale overwrite'}});
 check('old editor cannot overwrite a newer same-second application',stale.status===409&&stale.body.error==='stale_application'&&JSON.stringify(saved())===storedAfter);
 byText(staff.app,'button','Save note').click();
 await waitFor(()=>staff.app.textContent.includes('The decision result could not be confirmed.'),'RT16 stale content refusal',8000);
 check('RT16 digest refuses the stale empty-note view after applicant content changes',staffPosts===1&&saved().admin_note===''&&saved().status==='reviewing');
 const refreshed=await openPage(STAFF);await refreshed.go('#/admin/applications/'+MEMBER);
 await waitFor(()=>!!byText(refreshed.app,'button','Save note'),'fresh RT16 view',8000);
 let freshPosts=0;refreshed.before((p,i)=>{if(p.endsWith('/status')&&i.method==='POST')freshPosts++;return false;});
 byText(refreshed.app,'button','Save note').click();
 await waitFor(()=>freshPosts===1,'fresh empty note save');await settle();await settle();
 check('fresh RT16 view saves the already empty note without destroying content',freshPosts===1&&saved().admin_note===''&&JSON.parse(saved().answers).extra==='Updated private note.');
 const own=await openPage(MEMBER);await own.go('#/vote/raider/new');
 check('track editor preloads current values and exposes Edit application and Save changes while paused',!!byText(own.app,'button','Edit application')&&!!byText(own.app,'button','Save changes')&&own.app.querySelector('[data-field="character"] input')?.value==='Editor Main'&&own.app.textContent.includes('original submission time'));
 check('track chooser remains usable for an existing open applicant during pause',!own.app.querySelector('[data-family-apply203="member"]').disabled);
 const copy=await request('GET','/api/me/export');
 check('own copy includes all declared characters and updated private answers',copy.status===200&&copy.body.site.application.answers.talentBuilds.characters[1].character==='Editor Alt'&&copy.body.site.application.answers.extra==='Updated private note.');
 r=await request('PUT','/api/application',{...body,character:'Other One'},OTHER);
 check('paused admissions still reject a new applicant',r.status===403&&r.body.error==='closed'&&!one('SELECT 1 FROM site_applications WHERE discord_id=?',OTHER));
 me=await request('GET','/api/me');
 r=await request('PUT','/api/application',{...updated,position:'officer',applicationTrack:'officer',editToken:me.body.application.editToken});
 check('an existing ordinary application cannot open a new reserved seat',r.status===403&&r.body.error==='reserved_seat'&&saved().position==='raider');
 await fixtureRun("UPDATE site_applications SET status='accepted' WHERE discord_id=?",MEMBER);
 me=await request('GET','/api/me');
 r=await request('PUT','/api/application',{...updated,editToken:me.body.application.editToken});
 check('a final decision remains immutable to the applicant',r.status===403||r.status===409);
 const HIST='300000000000002199';await siteUser(HIST,{global_name:'Historical appointed applicant'});await character(HIST,'History Main','Player-219-0099');
 const historical={...body,position:'class_lead',classLead:'mage',class:'mage',character:'History Main',backups:['raid_leader_eu'],region:'eu',applicationTrack:'officer',targetOffice:'class_lead:mage',board:true};delete historical.editToken;
 const seeded=await require('./historical_application201_fixture.cjs').historicalApplicationFixture201({validate:load('./site-api').validateApplication,run:fixtureRun,previous:id=>one('SELECT * FROM site_applications WHERE discord_id=?',id),id:HIST,payload:historical,time:now-3600});
 if('error' in seeded.validation)throw Error('historical appointed fixture validation');
 await fixtureRun("INSERT INTO site_settings(key,value,updated_at) VALUES('appointed',?,1) ON CONFLICT(key) DO UPDATE SET value=excluded.value",JSON.stringify({office_18:'Class holder',office_74:'Raid holder'}));
 const historyBefore=one('SELECT * FROM site_applications WHERE discord_id=?',HIST),historyPage=await openPage(HIST);let historySent=null;
 historyPage.before((p,i)=>{if(p==='/api/application'&&i.method==='PUT')historySent=JSON.parse(i.body);return false;});
 await historyPage.go('#/vote/officer/new');
 const historyForm=historyPage.app.querySelector('form');
 check('historical reserved track opens its existing editor even through the track URL',!!historyForm&&!!byText(historyPage.app,'button','Edit application'));
 if(historyForm){historyForm.querySelector('[data-field="extra"] textarea').value='Corrected historical private answer.';historyForm.querySelector('[data-field="ack"] input').checked=true;fire(historyForm,'submit');await waitFor(()=>JSON.parse(one('SELECT answers FROM site_applications WHERE discord_id=?',HIST).answers).extra==='Corrected historical private answer.','actual appointed historical editor save',8000);}
 const historyAfter=one('SELECT * FROM site_applications WHERE discord_id=?',HIST);
 check('parent-office-only filled first and backup seats permit a real UI save without invented board consent',historySent?.board===false&&historySent?.editToken?.length===64&&JSON.parse(historyAfter.answers).extra==='Corrected historical private answer.'&&historyAfter.position==='class_lead'&&historyAfter.backup1==='raid_leader_eu'&&historyAfter.created_at===historyBefore.created_at&&historyAfter.board_at===null);
 // Exercise both actual staff transitions and the atomic window before the save.
 await fixtureRun("UPDATE site_settings SET value='1' WHERE key='applicationsOpen'");
 const otherBody={...body,character:'Other One'};
 const first=await request('PUT','/api/application',otherBody,OTHER);
 check('the real first submit still accepts a null edit token',first.status===200&&first.body.application.status==='submitted',first);
 const otherRow=()=>one('SELECT * FROM site_applications WHERE discord_id=?',OTHER);
 const otherOwn=async()=> (await request('GET','/api/me',undefined,OTHER)).body.application;
 const target=()=>request('GET','/api/admin/users/'+OTHER+'/decision-target?route=status&decisionAction=business_only',undefined,STAFF);
 const status=async(value,note,prepared)=>{
  const proof=prepared??(await target()).body?.targetToken;
  if(typeof proof!=='string')throw Error('original staff status proof');
  return request('POST','/api/admin/applications/'+OTHER+'/status',{status:value,note},STAFF,{'X-Olympus-Decision-Target':proof,'X-Olympus-Decision-Action':'business_only'});
 };
 const edit=(editToken,extra,native)=>request('PUT','/api/application',{...otherBody,editToken,answers:{...otherBody.answers,extra}},OTHER,{},native);
 await fixtureRun('UPDATE site_applications SET created_at=?,updated_at=? WHERE discord_id=?',now-120,now-60,OTHER);
 await fixtureRun("UPDATE site_settings SET value='0' WHERE key='applicationsOpen'");
 const submitted=await otherOwn(),beforeReview=otherRow(),staleStaff=(await target()).body?.targetToken;
 const reviewing=await status('reviewing','Private review note');
 const afterReview=otherRow();
 check('actual RT16 review changes its staff fields and leaves applicant updated_at intact',reviewing.status===200&&afterReview.status==='reviewing'&&afterReview.admin_note==='Private review note'&&afterReview.reviewed_by===STAFF&&afterReview.updated_at===beforeReview.updated_at,reviewing);
 const refusedStaff=await status('reviewing','Stale staff overwrite',staleStaff);
 check('RT16 still rejects a stale proof after status and staff metadata change',refusedStaff.status===409&&otherRow().admin_note==='Private review note',refusedStaff);
 const forward=await edit(submitted.editToken,'Forward applicant edit');
 check('submitted token saves after actual review starts while admissions are paused',forward.status===200&&otherRow().status==='reviewing'&&otherRow().admin_note===afterReview.admin_note&&otherRow().reviewed_at===afterReview.reviewed_at&&otherRow().created_at===beforeReview.created_at,forward);

 const reviewToken=(await otherOwn()).editToken;
 // Reproduce the original v1 raw review spelling emitted to open pre-release editors.
 const oldFields=['position','class_lead','backup1','backup2','fallback','character','char_key','class','role','region','avail','avail_tz','fit_na','fit_eu','board_at','answers','status','created_at','updated_at'];
 const rawReview=otherRow();
 const legacyReview=require('node:crypto').createHash('sha256').update('application-own-edit/v1\0'+JSON.stringify(oldFields.map(key=>rawReview[key]))).digest('hex');
 const submittedAgain=await status('submitted','Staff moved it back');
 const reverse=await edit(reviewToken,'Reverse applicant edit');
 check('review token saves after actual return to submitted and preserves the staff decision',submittedAgain.status===200&&reverse.status===200&&otherRow().status==='submitted'&&otherRow().admin_note==='Staff moved it back',reverse);
 // Reset only the test row's original content and clock so the original proof can be exercised independently.
 await fixtureRun('UPDATE site_applications SET answers=?,updated_at=? WHERE discord_id=?',rawReview.answers,rawReview.updated_at,OTHER);
 const oldBrowser=await edit(legacyReview,'Pre-release applicant edit');
 check('pre-release raw reviewing token remains usable only for the same open application content',oldBrowser.status===200&&otherRow().status==='submitted',oldBrowser);
 await fixtureRun("UPDATE site_applications SET answers=json_set(answers,'$.extra',?),updated_at=? WHERE discord_id=?",'New same-second applicant content',rawReview.updated_at,OTHER);
 const sameSecondContent=otherRow().answers;
 const oldReplay=await edit(legacyReview,'Overwrite from a stale pre-release tab');
 check('the pre-release token cannot overwrite changed raw content at the exact same updated_at',oldReplay.status===409&&oldReplay.body.error==='stale_application'&&otherRow().answers===sameSecondContent&&otherRow().updated_at===rawReview.updated_at,oldReplay);

 const beforeRace=await otherOwn();
 let racedReview=null;
 const reviewPort=entry.originalNativePort(db,{beforeRun:async sql=>{
  if(!racedReview&&/^INSERT INTO site_applications/.test(sql))racedReview=await status('reviewing','Concurrent staff review');
 }});
 const concurrent=await edit(beforeRace.editToken,'Applicant edit alongside review',reviewPort);
 check('an admitted staff review between read and CAS still allows the applicant write and keeps the staff state',racedReview?.status===200&&concurrent.status===200&&otherRow().status==='reviewing'&&otherRow().admin_note==='Concurrent staff review'&&JSON.parse(otherRow().answers).extra==='Applicant edit alongside review',{racedReview,concurrent});

 const beforeMixed=await otherOwn(),mixedClock=otherRow().updated_at;
 let mixedReview=null,mixedAnswers=null;
 const mixedPort=entry.originalNativePort(db,{beforeRun:async sql=>{
  if(!mixedReview&&/^INSERT INTO site_applications/.test(sql)){
   mixedReview=await status('submitted','Concurrent return to submitted');
   await fixtureRun("UPDATE site_applications SET answers=json_set(answers,'$.extra',?) WHERE discord_id=?",'Different bytes at the same second',OTHER);
   mixedAnswers=otherRow().answers;
  }
 }});
 const mixed=await edit(beforeMixed.editToken,'Must not overwrite same-second content',mixedPort);
 check('a concurrent open transition plus a same-second raw edit still refuses at the CAS',mixedReview?.status===200&&mixed.status===409&&mixed.body.error==='application_changed'&&otherRow().status==='submitted'&&otherRow().updated_at===mixedClock&&otherRow().answers===mixedAnswers,{mixedReview,mixed});

 const consent={...JSON.parse(otherRow().answers),boardPortraitOptIn:true};
 await fixtureRun('UPDATE site_applications SET answers=? WHERE discord_id=?',JSON.stringify(consent),OTHER);
 const beforeConsent=(await otherOwn()).editToken;
 const withdrawn=await request('PUT','/api/application',{consentOnly:true,boardPortrait:false},OTHER);
 const afterConsent=otherRow();
 const staleConsent=await edit(beforeConsent,'Stale after withdrawal');
 check('real board withdrawal remains an exact applicant content conflict',withdrawn.status===200&&JSON.parse(afterConsent.answers).boardPortraitOptIn===false&&staleConsent.status===409&&staleConsent.body.error==='stale_application'&&otherRow().answers===afterConsent.answers,{withdrawn,staleConsent});

 const beforeTerminal=await otherOwn();
 let racedTerminal=null;
 const terminalPort=entry.originalNativePort(db,{beforeRun:async sql=>{
  if(!racedTerminal&&/^INSERT INTO site_applications/.test(sql))racedTerminal=await status('accepted','Concurrent terminal decision');
 }});
 const terminal=await edit(beforeTerminal.editToken,'Must not rewrite accepted application',terminalPort);
 check('a real terminal decision racing the CAS wins and keeps original applicant answers',racedTerminal?.status===200&&terminal.status===409&&terminal.body.error==='decided'&&otherRow().status==='accepted'&&otherRow().answers===afterConsent.answers,{racedTerminal,terminal});
 check('application editing uses the exact existing schema',JSON.stringify(db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all())===schemaBefore);
 console.log('\n'+ok+'/'+n+' passed');process.exit(ok===n?0:1);
}
const run219=new Module(__filename,module);run219.filename=__filename;run219.paths=Module._nodeModulePaths(__dirname);
run219._compile(fixture219.slice(0,boundary219[0].index)+'\n('+applicationEdit219.toString()+')().catch(e=>{console.error(e.stack);process.exit(1)});',__filename);
