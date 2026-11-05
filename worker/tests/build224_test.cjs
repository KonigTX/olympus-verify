{ const r=require('node:child_process').spawnSync(process.execPath,[require('node:path').join(__dirname,'guild_registration224_test.cjs')],{stdio:'inherit',windowsHide:true});if(r.status!==0)process.exit(r.status||1); }
// Actual signed Worker, Native SQLite and existing transport fixture. No live writes.
const fs224=require('node:fs'),path224=require('node:path'),{Module}=require('node:module');
const parent224=fs224.readFileSync(path224.join(__dirname,'guild_commands219_test.cjs'),'utf8'),pre224=parent224.indexOf('async function guildCommands219(){'),end224=parent224.indexOf(' await fresh219();',pre224),fixture224=fs224.readFileSync(path224.join(__dirname,'community_event_buttons_test.cjs'),'utf8'),cut224=[...fixture224.matchAll(/^\(async \(\) => \{/gm)];
if(pre224<0||end224<pre224||cut224.length!==1)throw Error('Original signed fixture boundary');
async function checks224(){
 const expected=[['office_19','Hand of the Sovereign · Co-Guild Master'],['office_86','Lord High Treasurer · Minister of the Imperial Exchequer'],['office_101','Lord High Justiciar · Minister of Justice & The Privy Court'],['office_97','Lord High Marshal of PvE · Minister of Raid Campaigns'],['office_98','Lord High Marshal of PvP · Minister of Battlegrounds & Honor'],['office_99','Lord High Inquisitor · Minister of Internal Security'],['office_14','Lord High Chancellor · Minister of the Chancery & Imperial Census'],['office_100','Lord High Legate · Minister of the Grand Concordat'],['office_58','Lord High Artificer · Minister of Artisanry & The Guild Workshop'],['office_96','Lord High Factor · Minister of Trading & Markets'],['office_102','Lord High Herald · Minister of Propaganda'],['office_59','Lord High Seneschal · Minister of Court Protocol & Crown Estates']];
 const org=JSON.parse(fs.readFileSync(path.join(root,'public/static/governance/organization.json'))),directory=load('./site-role-directory203').ROLE_DIRECTORY_203;
 for(const[key,title]of expected){check('current canonical Cabinet title '+key,org.terms.find(x=>x.officeKey===key)?.label===title&&directory.families.find(x=>x.primaryKey===key)?.label===title);}
 check('the twelve earlier Cabinet portfolios remain intact beside the added appointment',org.terms.length===103&&org.appointments.length===139&&org.councilComposition.currentSeats.length===14&&org.councilComposition.currentSeats.at(-1).officeKeys[0]==='office_103'&&expected.every(([key,title])=>org.councilComposition.currentSeats.some(s=>s.officeKeys.includes(key)&&s.label===title)));
 check('former office names stay aliases without opening leadership applications',org.terms.find(x=>x.officeKey==='office_59').applicationAliases.includes('Minister of Heraldry')&&expected.every(([key])=>org.terms.find(x=>x.officeKey===key).applicationEligible===false));
 check('Seneschal remit separates protocol and estates from publicity',org.terms.find(x=>x.officeKey==='office_59').note.includes('court protocol')&&org.nodes.find(x=>x.id==='heraldry').limits.includes('No ownership'));
 const send=async({type=2,name='olympus',custom,values,fields,who=MEMBER,id=nextId(),guild=GUILD}={})=>{const data=type===2?{name,options:[]}:{custom_id:custom,...(type===3?{component_type:values?3:2,...(values?{values}:{})}:{components:fields.map(([custom_id,value])=>({type:1,components:[{type:4,custom_id,value}]}))})};const body=JSON.stringify({type,id,application_id:BOT,token:TOKEN219,guild_id:guild,channel_id:CHANNEL,member:{user:{id:who,username:'Synthetic'},roles:[ROLE]},data}),ts=String(at()),sig=Buffer.from(await crypto.subtle.sign('Ed25519',keys.privateKey,new TextEncoder().encode(ts+body))).toString('hex'),pending=[];const r=await worker.fetch(new Request('https://verify.example/interactions',{method:'POST',headers:{'Content-Type':'application/json','X-Signature-Timestamp':ts,'X-Signature-Ed25519':sig},body}),env(over219),{waitUntil:p=>pending.push(p)});const text=await r.text(),initial=text?JSON.parse(text):null;await Promise.all(pending);return{status:r.status,initial,answer:answers219.at(-1)};};
 const controls=a=>(a?.components??[]).flatMap(r=>r.components),ctl=(a,label)=>controls(a).find(c=>c.label===label||c.placeholder===label)?.custom_id;
 await fresh219();let r=await send();
 check('bare /olympus is routed to an ephemeral private hub',r.initial?.type===5&&r.initial.data.flags===64&&r.answer?.embeds?.[0]?.title==='Olympus · your guild hub');
 if(!fs.existsSync(path.join(root,'src/olympus-hub224.ts'))){console.log('\n'+passed+'/'+total+' build224 checks passed (baseline)');process.exit(passed===total?0:1);}
 check('historical Cabinet application keys remain readable with canonical display labels', ['office_14','office_58','office_59','co_gm','treasurer'].every(key=>load('./site-data').POSITION_KEYS.has(key))&&load('./site-data').POSITIONS.find(x=>x.key==='co_gm').label===expected[0][1]);
 const intent224=load('./application-track199');check('all three historical Council intents remain readable while current saves stay reserved',['office_14','office_58','office_59'].every(key=>intent224.applicationRoleKeys199(key).join(',')===key&&intent224.applicationIntentDto199({applicationTrack:'high_council',targetOffice:key})?.targetOffice===key&&intent224.reservedApplication201({applicationTrack:'high_council',targetOffice:key})?.error==='reserved_seat'));
 const defs=load('./guild-command-definitions224'),old=load('./guild-command-definitions222');check('one new hub preserves every established utility and /raid definition',defs.GUILD_COMMANDS_224.length===old.GUILD_COMMANDS_222.length+1&&JSON.stringify(defs.GUILD_COMMANDS_224.filter(x=>x.name!=='olympus'))===JSON.stringify(old.GUILD_COMMANDS_222));
 const shortened=ctl(r.answer,'Open another Olympus section').replace(/:[0-9]{10}:/,':'+(at()+60)+':');
 r=await send({type:3,custom:shortened,values:['guides']});
 check('navigation preserves the original control deadline',controls(r.answer).filter(c=>c.custom_id).every(c=>c.custom_id.split(':')[2]===String(at()+60)));
 r=await send({type:3,custom:ctl(r.answer,'Decode talent build…')});
 check('opening a lookup modal preserves the original deadline',r.initial.type===9&&r.initial.data.custom_id.split(':')[2]===String(at()+60));
 r=await send();
 const menu=ctl(r.answer,'Open another Olympus section');check('the private hub has all six one-click sections',controls(r.answer).find(c=>c.custom_id===menu)?.options.length===6);
 r=await send({type:3,custom:menu,values:['status']});check('status reads only the current account without issuing a verification code',r.answer.embeds?.[0]?.title==='Your verification & character status'&&r.answer.embeds[0].fields[0].value.includes('issues no code'));
 r=await send({type:3,custom:menu,values:['guides']});const classMenu=ctl(r.answer,'Choose your class'),talent=ctl(r.answer,'Decode talent build…');check('guide menu offers all nine classes and preparation tools',controls(r.answer).find(c=>c.custom_id===classMenu)?.options.length===9&&!!talent&&controls(r.answer).some(c=>c.label==='Attunement checklist'));
 check('signed Olympus guide links carry only the admitted root return query',
  r.answer.embeds[0].url==='https://guild.example/?to=resources'
  && controls(r.answer).find(c=>c.label==='Attunement checklist')?.url==='https://guild.example/?to=guides%2Ftools%2Fattunements');
 const classChoices=controls(r.answer).find(c=>c.custom_id===classMenu)?.options;
 const alphabeticalClasses=['Druid','Hunter','Mage','Paladin','Priest','Rogue','Shaman','Warlock','Warrior'];
 check('signed private Olympus class picker alphabetizes labels and preserves all stored choice IDs',
  JSON.stringify(classChoices)===JSON.stringify(alphabeticalClasses.map(label=>({label,value:label.toLowerCase()}))));
 r=await send({type:3,custom:classMenu,values:['warrior']});check('class selection uses the existing pinned guide reader',r.answer.embeds?.[0]?.title==='Warrior');
 r=await send({type:3,custom:classMenu,values:['administrator']});check('unknown class values are refused',!r.answer.embeds?.length&&/nine classes/.test(r.answer.content));
 r=await send({type:3,custom:talent});check('talent decoder opens an initial-response modal',r.initial.type===9&&r.initial.data.components.length===1);const talentForm=r.initial.data.custom_id;
 r=await send({type:5,custom:talentForm,fields:[['build','not-a-valid-code']]});check('invalid talent codes are refused without fetching third-party URLs',!r.answer.embeds?.length&&/valid current Olympus talent/.test(r.answer.content));
 r=await send({type:3,custom:menu,values:['workshop']});const crafter=ctl(r.answer,'Find a crafter or recipe…');check('Workshop opens an opted-in directory with a search control',!!crafter&&r.answer.embeds?.length===1);
 r=await send({type:3,custom:crafter});check('crafter search opens a bounded private modal',r.initial.type===9&&r.initial.data.components[0].components[0].max_length===60);
 r=await send({type:5,custom:r.initial.data.custom_id,fields:[['query','alchemy']]});check('recipe lookup uses the existing privacy-filtered Workshop query',r.initial.type===5&&r.answer.embeds?.length===1);
 r=await send({type:3,custom:menu,values:['council']});check('Council hub displays all twelve canonical titles and reserved applications',expected.every(([,title])=>JSON.stringify(r.answer).includes(title))&&JSON.stringify(r.answer).includes('reserved')&&controls(r.answer).some(x=>x.url==='https://guild.example/?to=apply'));
 check('CC-015 Council hub shares the 13-line Cabinet roster without relaxing mention suppression',
  r.answer.embeds?.[0]?.fields.find(f=>f.name==='Current Council portfolios')?.value.split('\n').length===13&&r.answer.allowed_mentions.parse.length===0);
 r=await send({type:3,custom:menu,values:['branches']});check('branch hub includes current launch evidence and unknown-capacity guardrails',r.answer.embeds?.length===2&&JSON.stringify(r.answer).includes('unknown'));
 check('CC-018 branch hub shares the compact unpublished-capacity disclosure and preserves the launch embed',
  r.answer.embeds?.length===2&&r.answer.embeds[0].description.includes('No published capacity snapshot for Olympus I–X yet.')&&!r.answer.embeds[0].fields?.length);
 r=await send({type:3,custom:menu,values:['treasury']});check('Treasury stays paused and ordinary appeals remain free with excluded safety offenses',JSON.stringify(r.answer).includes('OFF')&&JSON.stringify(r.answer).includes('Ordinary appeals are free')&&JSON.stringify(r.answer).includes('100g')&&JSON.stringify(r.answer).includes('Doxxing'));
 r=await send({type:3,custom:menu.replace(MEMBER,ORG),values:['status']});check('a component for another actor cannot disclose status',!(r.initial.type===4?r.initial.data:r.answer).embeds?.length&&/expired/.test((r.initial.type===4?r.initial.data:r.answer).content));
 const seen=one('SELECT COUNT(*) n FROM seen_interactions').n;r=await send({guild:WRONG});check('other guilds are ignored before replay or account effects',r.status===204&&r.initial===null&&one('SELECT COUNT(*) n FROM seen_interactions').n===seen);
 T+=181;nativeT=T;r=await send({type:3,custom:menu,values:['status']});check('controls never extend their original three-minute window',!(r.initial.type===4?r.initial.data:r.answer).embeds?.length&&/expired/.test((r.initial.type===4?r.initial.data:r.answer).content));
 check('hub tests create no event, signup, public message or provider role effect',one('SELECT COUNT(*) n FROM community_events').n===0&&one('SELECT COUNT(*) n FROM community_event_signups').n===0&&publicEffects219().length===0);
 T=1793833210;nativeT=T;
 const launch=await send219('launch',null,{},MEMBER);
 const launchHub=await send();
 const launchMenu=ctl(launchHub.answer,'Open another Olympus section');
 const launchBranch=await send({type:3,custom:launchMenu,values:['branches']});
 const launchEmbed=launch.answer?.embeds?.[0];
 check('signed /launch and the hub share the official raid date and opening-time guidance',
  launch.initial?.type===5&&launch.initial.data.flags===64&&launchBranch.initial?.type===5&&launchBranch.initial.data.flags===64
  &&launch.answer.allowed_mentions.parse.length===0&&launchBranch.answer.allowed_mentions.parse.length===0
  &&launchEmbed?.description.includes('The announced launch time <t:1793833200:F> has passed. Check Blizzard for current availability.')
  &&launchEmbed.description.includes('The first raids are scheduled for 9 December 2026. Check Blizzard for the opening time.')
  &&launchEmbed.fields?.some(field=>field.value==='https://news.blizzard.com/en-us/article/24315820/world-of-warcraft-forever-now-live')
  &&JSON.stringify(launchBranch.answer.embeds?.[1])===JSON.stringify(launchEmbed)&&publicEffects219().length===0,launchEmbed?.description);
 console.log('\n'+passed+'/'+total+' signed build224 checks passed');process.exit(passed===total?0:1);
}
const inherited224=parent224.slice(pre224,end224).replace('async function guildCommands219(){','async function run224(){'),module224=new Module(__filename,module);module224.filename=__filename;module224.paths=Module._nodeModulePaths(__dirname);module224._compile(fixture224.slice(0,cut224[0].index)+'\n'+inherited224+'\nawait ('+checks224.toString()+')();\n}\nrun224().catch(e=>{console.error(e.stack);process.exit(1)});',__filename);
