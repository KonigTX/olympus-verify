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
 const editorHeader='X-Olympus-Application-Editor',browserHeaders={'Sec-Fetch-Site':'same-origin'};
 const editorProof=(await request('GET','/api/me')).body.applicationEditorProof;
 const otherProof=(await request('GET','/api/me',undefined,OTHER)).body.applicationEditorProof;
 const missingProof=await request('PUT','/api/application',body,MEMBER,browserHeaders);
 const changedActor=await request('PUT','/api/application',body,OTHER,{...browserHeaders,[editorHeader]:editorProof});
 check('a browser must prove the original editor account before its first save',missingProof.status===409&&changedActor.status===409&&missingProof.body.error==='application_editor_changed'&&changedActor.body.error==='application_editor_changed'&&/^[A-Za-z0-9_-]{43}$/.test(editorProof)&&editorProof!==otherProof&&!saved()&&!one('SELECT 1 FROM site_applications WHERE discord_id=?',OTHER));
 let r=await request('PUT','/api/application',body,MEMBER,{...browserHeaders,[editorHeader]:editorProof});
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
 const staleWithdraw=await request('DELETE','/api/application',{editToken:initialToken},MEMBER,{...browserHeaders,[editorHeader]:editorProof});
 const foreignWithdraw=await request('DELETE','/api/application',{editToken:r.body.application.editToken},MEMBER,{...browserHeaders,[editorHeader]:otherProof});
 check('a stale withdrawal or a withdrawal from a different editor cannot change the saved row',staleWithdraw.status===409&&staleWithdraw.body.error==='application_changed'&&foreignWithdraw.status===409&&foreignWithdraw.body.error==='application_editor_changed'&&JSON.stringify(saved())===storedAfter);
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
 const ownNote=own.app.querySelector('[data-field="extra"] textarea');
 ownNote.value='Keep this local draft while jumping';fire(ownNote,'input');
 const jumps=[['Role choices','application-choices'],['About you','application-about'],['When you play','application-availability'],['Review and submit','application-submit'],['Back to role choices','application-choices']];
 check('application section jumps focus their destinations and keep the current unsaved draft',jumps.every(([label,id])=>{
  const destination=own.app.querySelector('#'+id),focus=destination.querySelector('h2, h3')||destination;
  byText(own.app,'button',label).click();
  return own.document.activeElement===focus&&focus.getAttribute('tabindex')==='-1';
 })&&ownNote.value==='Keep this local draft while jumping'&&own.location.hash==='#/vote/raider/new');
 const copy=await request('GET','/api/me/export');
 check('own copy includes all declared characters and updated private answers',copy.status===200&&copy.body.site.application.answers.talentBuilds.characters[1].character==='Editor Alt'&&copy.body.site.application.answers.extra==='Updated private note.');
 const concurrentOwn=await request('PUT','/api/application',{...updated,editToken:(await request('GET','/api/me')).body.application.editToken,answers:{...updated.answers,extra:'Saved separately while the editor was open.'}});
 const ownForm=own.app.querySelector('form'),ownAck=ownForm.querySelector('[data-field="ack"] input');
 const ownWrites=[];let ownReplies=0,recoveryReads=0,dropRecoveryRead=true;
 own.before((url,init)=>{
  if(url==='/api/application'&&init.method==='PUT')ownWrites.push(JSON.parse(init.body));
  if(url==='/api/me'&&init.method==='GET'){recoveryReads++;return dropRecoveryRead;}
  return false;
 });
 own.answer((url,init)=>{if(url==='/api/application'&&init.method==='PUT')ownReplies++;return null;});
 ownAck.checked=true;fire(ownForm,'submit');
 await waitFor(()=>ownReplies===1,'stale editor PUT reply',8000);await settle();
 const review=byText(own.app,'button','Check the saved application');
 check('a real stale reply keeps the exact typed draft and blocks another write until review',concurrentOwn.status===200&&!!review&&byText(own.app,'button','Save changes').disabled&&ownNote.value==='Keep this local draft while jumping'&&JSON.parse(saved().answers).extra==='Saved separately while the editor was open.',{concurrentStatus:concurrentOwn.status,review:!!review,saved:JSON.parse(saved().answers).extra,appMessage:own.document.body.textContent.slice(-450)});
 if(review){
  review.click();await waitFor(()=>recoveryReads===1,'failed application recovery read');await settle();await settle();
  check('a failed recovery read holds the draft and permits an explicit retry',!review.disabled&&byText(own.app,'button','Save changes').disabled&&ownNote.value==='Keep this local draft while jumping'&&ownWrites.length===1);
  dropRecoveryRead=false;review.click();
  await waitFor(()=>!!byText(own.app,'button','Keep my draft for the next save'),'current application recovery receipt',8000);
  check('recovery shows the real newer saved answers without automatically sending the draft',own.app.textContent.includes('Saved separately while the editor was open.')&&ownNote.value==='Keep this local draft while jumping'&&recoveryReads===2&&ownWrites.length===1);
  byText(own.app,'button','Keep my draft for the next save').click();
  check('adopting the current token keeps the mounted draft and asks for a fresh acknowledgement',own.app.querySelector('[data-field="extra"] textarea')===ownNote&&!ownAck.checked&&!byText(own.app,'button','Save changes').disabled&&ownWrites.length===1);
  ownAck.checked=true;fire(ownForm,'submit');
  await waitFor(()=>JSON.parse(saved().answers).extra==='Keep this local draft while jumping','explicit updated application PUT',8000);
  check('explicit save uses only the freshly reviewed token and keeps original review history',ownWrites.length===2&&ownWrites[1].editToken===concurrentOwn.body.application.editToken&&saved().created_at===initialTime&&saved().reviewed_by===STAFF&&saved().status==='reviewing');
 }
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
 // Actual application form, Worker and SQLite exercise class-switch draft custody.
 const BUILD_OWNER='300000000000002014';
 await siteUser(BUILD_OWNER);await character(BUILD_OWNER,'Build Main','Player-219-0014');
 await fixtureRun("UPDATE site_settings SET value='1' WHERE key='applicationsOpen'");
 const talentData=JSON.parse(fs.readFileSync(path.join(root,'public/static/talents/data.json'),'utf8'));
 const build=(cls,level)=>'ot1.'+talentData.revision+'.'+cls+'.'+level+'.'+'0'.repeat(talentData.classes.find(row=>row.id===cls).trees.flatMap(tree=>tree.talents).length);
 const warrior30=build('warrior',30),warrior60=build('warrior',60),mage30=build('mage',30),druid30=build('druid',30);
 const legacyWarrior=build('warrior',59),oldLegacyWarrior=legacyWarrior.replace(talentData.revision,'000000000000');
 const alt={character:'Build Alt',class:'priest',build30:build('priest',30),build60:''};
 const started=await request('PUT','/api/application',{...body,character:'Build Main',answers:{...body.answers,talentBuild:legacyWarrior,talentBuilds:{version:1,characters:[{character:'Build Main',class:'warrior',build30:warrior30,build60:''},alt]}}},BUILD_OWNER);
 if(started.status!==200)throw Error('original build editor fixture could not save: '+JSON.stringify(started));
 await fixtureRun("UPDATE site_applications SET answers=json_set(answers,'$.talentBuild',?) WHERE discord_id=?",oldLegacyWarrior,BUILD_OWNER);
 const draftPage=await openPage(BUILD_OWNER);await draftPage.go('#/vote/member/new');
 const draftForm=draftPage.app.querySelector('form'),selectedClass=draftForm.querySelector('[data-field="class"] select');
 const buildRows=draftForm.querySelectorAll('.talent-application-character');
 const [main30,main60]=buildRows[0].querySelectorAll('textarea'),legacy=draftForm.querySelector('[data-field="talentBuild"] input');
 const privateDraft=draftForm.querySelector('[data-field="extra"] textarea');
 const selectClass=value=>{selectedClass.value=value;fire(selectedClass,'change');};
 const storageWrites=[],originalSet=draftPage.sessionStorage.setItem;
 draftPage.sessionStorage.setItem=(key,value)=>{storageWrites.push(String(value));originalSet(key,value);};
 const posts=[];let buildReplies=0;
 draftPage.before((url,init)=>{if(url==='/api/application'&&init.method==='PUT')posts.push(JSON.parse(init.body));return false;});
 draftPage.answer((url,init)=>{if(url==='/api/application'&&init.method==='PUT')buildReplies++;return null;});
 main60.value=warrior60;fire(main60,'input');privateDraft.value='Unsaved applicant text across a class switch.';fire(privateDraft,'input');
 selectClass('mage');
 check('class switch sets aside prior main and legacy builds and explains how to restore them',!main30.value&&!main60.value&&!legacy.value&&draftForm.textContent.includes('Switch back to restore'),draftForm.querySelector('[role="status"]')?.textContent);
 check('changing main class leaves named alt fields and typed answers in place',buildRows[1].querySelector('input').value===alt.character&&buildRows[1].querySelector('select').value===alt.class&&buildRows[1].querySelector('textarea').value===alt.build30&&privateDraft.value==='Unsaved applicant text across a class switch.');
 main30.value=mage30;fire(main30,'input');
 selectClass('warrior');
 check('switching back restores the original main and the exact opaque legacy attachment',main30.value===warrior30&&main60.value===warrior60&&legacy.value===oldLegacyWarrior);
 selectClass('mage');
 check('returning to a second class recovers its own typed build and no legacy from another class',main30.value===mage30&&!main60.value&&!legacy.value);
 selectClass('undecided');main30.value=druid30;fire(main30,'input');selectClass('druid');
 check('choosing the named class keeps a matching build typed while the class was undecided',main30.value===druid30&&!main60.value&&!legacy.value);
 selectClass('mage');
 check('class-switch drafts stay in form memory and are never sent to browser storage',!storageWrites.some(value=>[warrior30,warrior60,mage30,oldLegacyWarrior,privateDraft.value].some(item=>value.includes(item))));

 draftForm.querySelector('[data-field="ack"] input').checked=true;
 const buildBefore=one('SELECT answers FROM site_applications WHERE discord_id=?',BUILD_OWNER).answers;
 main30.value='https://guild.example/#/talents/warrior/'+warrior30;
 const beforeMain=posts.length;fire(draftForm,'submit');await settle();await settle();
 check('a recognizable old-class main build link stops at the form before PUT',posts.length===beforeMain&&main30.getAttribute('aria-invalid')==='true'&&one('SELECT answers FROM site_applications WHERE discord_id=?',BUILD_OWNER).answers===buildBefore);
 main30.value=mage30;main60.value='';legacy.value=oldLegacyWarrior;
 const beforeLegacy=posts.length;fire(draftForm,'submit');await settle();await settle();
 check('a recognizable old-class legacy attachment stops at the form before PUT',posts.length===beforeLegacy&&legacy.getAttribute('aria-invalid')==='true');
 legacy.value='';
 const alt30=buildRows[1].querySelector('textarea');
 alt30.value=warrior30;
 const beforeAlt=posts.length;fire(draftForm,'submit');await settle();await settle();
 check('an alt build for another class stays in its row and stops before PUT',posts.length===beforeAlt&&alt30.getAttribute('aria-invalid')==='true'&&alt30.value===warrior30);
 alt30.value=alt.build30;
 legacy.value='malformed fixture build text';
 const beforeMalformed=posts.length;fire(draftForm,'submit');
 await waitFor(()=>posts.length===beforeMalformed+1&&draftForm.querySelector('[data-field="talentBuild"]').classList.contains('invalid'),'Worker malformed build validation',8000);
 check('malformed text still follows the original Worker validation rather than the mismatch preflight',posts.at(-1).answers.talentBuild==='malformed fixture build text'&&one('SELECT answers FROM site_applications WHERE discord_id=?',BUILD_OWNER).answers===buildBefore);
 legacy.value='';
 fire(draftForm,'submit');
 await waitFor(()=>one('SELECT class FROM site_applications WHERE discord_id=?',BUILD_OWNER).class==='mage','actual corrected application PUT',8000);
 const finalDraft=JSON.parse(one('SELECT answers FROM site_applications WHERE discord_id=?',BUILD_OWNER).answers);
 check('real PUT sends only the selected main builds, the original alt and the typed applicant answer',posts.at(-1).answers.talentBuild===''&&finalDraft.talentBuilds.characters[0].build30===mage30&&finalDraft.talentBuilds.characters[0].build60===''&&JSON.stringify(finalDraft.talentBuilds.characters[1])===JSON.stringify(alt)&&finalDraft.extra==='Unsaved applicant text across a class switch.');
 await waitFor(()=>draftPage.app.querySelector('form')!==draftForm,'updated application editor');
 const undecidedForm=draftPage.app.querySelector('form'),undecidedClass=undecidedForm.querySelector('[data-field="class"] select');
 undecidedClass.value='undecided';fire(undecidedClass,'change');
 undecidedForm.querySelector('[data-field="ack"] input').checked=true;
 const beforeUndecided=posts.length;fire(undecidedForm,'submit');
 await waitFor(()=>buildReplies===beforeUndecided+1,'Undecided save reply');await settle();
 const undecidedRow=one('SELECT * FROM site_applications WHERE discord_id=?',BUILD_OWNER),undecidedAnswers=JSON.parse(undecidedRow.answers);
 check('real editor saves a named Undecided main with parked main builds and the original declared alt',undecidedRow.class==='undecided'&&undecidedAnswers.talentBuilds.characters[0].class==='undecided'&&!undecidedAnswers.talentBuilds.characters[0].build30&&JSON.stringify(undecidedAnswers.talentBuilds.characters[1])===JSON.stringify(alt),{savedClass:undecidedRow.class,posted:posts.at(-1)?.answers.talentBuilds,appMessage:draftPage.document.body.textContent.slice(-450)});
 if(undecidedRow.class==='undecided'){
  const token=(await request('GET','/api/me',undefined,BUILD_OWNER)).body.application.editToken;
  const malformed=posts.at(-1);
  for(const [label,characters] of [
   ['a main build attached to Undecided',[{...undecidedAnswers.talentBuilds.characters[0],build30:mage30},alt]],
   ['an Undecided alt',[undecidedAnswers.talentBuilds.characters[0],{...alt,class:'undecided',build30:''}]],
  ]){
   const invalid=await request('PUT','/api/application',{...malformed,editToken:token,answers:{...malformed.answers,talentBuilds:{version:1,characters}}},BUILD_OWNER);
   check('Worker refuses '+label+' without changing the application',invalid.status===400&&invalid.body.field==='talentBuilds'&&one('SELECT answers FROM site_applications WHERE discord_id=?',BUILD_OWNER).answers===undecidedRow.answers);
  }
 }
 check('application editing uses the exact existing schema',JSON.stringify(db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all())===schemaBefore);
 console.log('\n'+ok+'/'+n+' passed');process.exit(ok===n?0:1);
}
const run219=new Module(__filename,module);run219.filename=__filename;run219.paths=Module._nodeModulePaths(__dirname);
run219._compile(fixture219.slice(0,boundary219[0].index)+'\n('+applicationEdit219.toString()+')().catch(e=>{console.error(e.stack);process.exit(1)});',__filename);
