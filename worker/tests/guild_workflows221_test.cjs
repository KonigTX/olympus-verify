// The original real-Worker/Ed25519/Native SQLite scaffold, with focused .221 scenarios.
// Initial signed staff roles match the same fixture's fresh fake-provider staff set.
const fs221=require('node:fs'),path221=require('node:path'),crypto221=require('node:crypto'),{Module}=require('node:module');
const original221=fs221.readFileSync(path221.join(__dirname,'guild_commands219_test.cjs'),'utf8');
const begin221=original221.indexOf('async function guildCommands219(){'),end221=original221.indexOf(" const authority219=load('./guild-command-authority219');"),footer221=original221.lastIndexOf('\nconst mod219=');
if(begin221<0||end221<begin221||footer221<end221)throw Error('guild221_original_scaffold_boundary');
// Pin the exact historical scaffold this leaf executes. The parent scenario body is replaced below.
const hash221=value=>crypto221.createHash('sha256').update(value).digest('hex');
if(hash221(original221.slice(0,end221))!=='b0c5320c3c0b0a9218710e8eeb59099163429b630eb96e2cd771f801b18129d4'
  ||hash221(original221.slice(footer221))!=='52fcd8a688396ce873bf49419eaf0014912f0bbdb2289c51e6dd03072f0ccf3e')throw Error('guild221_original_scaffold_drift');
let setup221=original221.slice(begin221,end221);
const roleClaim221="member:{user:{id:who,username:'Synthetic'},roles:[ROLE]}";
if(setup221.split(roleClaim221).length!==2)throw Error('guild221_signed_staff_role_boundary');
setup221=setup221.replace(roleClaim221,"member:{user:{id:who,username:'Synthetic'},roles:staff219.has(who)?[ROLE,OFFICER]:[ROLE]}");
const scenarios221=String.raw`
 const schema221=JSON.stringify(db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all());
 let defs221;try{defs221=load('./guild-command-definitions221');}catch{}
 check('current guild catalogue exposes ten unique utility names and three namespaced account entries',defs221?.GUILD_COMMANDS_221.length===10&&new Set(defs221.GUILD_COMMANDS_221.map(x=>x.name)).size===10&&defs221.ACCOUNT_COMMANDS_221.length===3);
 const accountBefore221=JSON.stringify(db.prepare('SELECT discord_id,session_version,in_server,denied FROM site_users ORDER BY discord_id').all());
 for(const name of ['olympus-privacy','olympus-unlink']){
  const r=await send219(name,null);const text=r.initial?.data?.content??'';
  check(name+' replies privately with a direct privacy connection, without a destructive action',r.status===200&&r.initial.type===4&&r.initial.data.flags===64&&text.includes('/privacy/access)')&&!text.includes('/#/data')&&!text.includes('Unknown command'));
 }
 check('account guidance leaves site identities and session versions untouched',JSON.stringify(db.prepare('SELECT discord_id,session_version,in_server,denied FROM site_users ORDER BY discord_id').all())===accountBefore221);
 let r=await send219('olympus-status',null);
 check('namespaced status reaches the existing verification-status workflow',r.status===200&&r.initial.type===4&&r.initial.data.flags===64&&!r.initial.data.content.includes('Unknown command'));
 const catalogue221=JSON.parse(fs.readFileSync(path.join(root,'public/static/guides218.json'),'utf8')),preset221=catalogue221.presets[0];
 r=await send219('forever','guide',{class:'warrior'});
 check('Forever guide reaches the existing pinned class guide privately',r.initial.type===5&&r.answer?.embeds?.[0]?.url.includes('/#/guides/class/warrior')&&r.answer.allowed_mentions.parse.length===0);
 r=await send219('forever','talents',{build:preset221.code});
 check('Forever talents decodes the current real catalogue permalink',r.initial.type===5&&r.answer?.embeds?.[0]?.title.startsWith('Talent preview')&&r.answer.embeds[0].url.includes(preset221.code));
 r=await send219('forever','consumables');
 check('Forever consumables uses evidence-graded current catalogue data',r.initial.type===5&&r.answer?.embeds?.[0]?.title==='Raid consumable checklist'&&r.answer.embeds[0].footer.text.includes('Grades:'));
 r=await send219('forever','attunement',{raid:'onyxia'});
 check('Forever attunement uses the same current raid preparation guide',r.initial.type===5&&r.answer?.embeds?.[0]?.url.endsWith('/#/guides/tools/attunements'));
 r=await send219('workshop','order',{recipe:'Synthetic Elixir',quantity:7,when:'Before our next agreed raid',materials:'I can supply the herbs'});
 check('Workshop order prepares a useful private commission draft without claiming delivery',r.initial.type===5&&r.answer?.embeds?.[0]?.title==='Commission request · draft'&&r.answer.embeds[0].description.includes('not been sent')&&r.answer.embeds[0].fields.some(x=>x.name==='Quantity'&&x.value==='7'));
 const publicPosts221=publicEffects219().length;
 r=await send219('workshop','order',{recipe:'@everyone <unsafe>',quantity:0});
 check('invalid order quantities are refused and never publish a message',r.initial.type===5&&!r.answer?.embeds?.length&&publicEffects219().length===publicPosts221);
 // The inherited fixture deliberately uses an unrelated privacy-canary display
 // name and a numeric name_key. Seed a genuine normalized character pair for
 // this new lookup scenario; do not alter that older disclosure canary.
 const releaseName221='Release One',releaseKey221=load('./codes').normalizeCharacter(releaseName221);
 await fixtureRun("INSERT INTO characters(name_key,name,discord_id,status,bound_at) VALUES(?,?,?,'member',?)",releaseKey221,releaseName221,ORG,at());
 const bound221=one("SELECT name,status FROM characters WHERE name_key=? AND discord_id=? AND status<>'unbound'",releaseKey221,ORG);
 if(!bound221)throw Error('Current signed fixture must include an actually bound organizer character');
 const chars221=JSON.stringify(db.prepare('SELECT * FROM characters ORDER BY name_key').all());
 r=await send219('olympus-admin','release',{character:bound221.name});
 if(r.initial.type!==4||!/unbind/i.test(r.initial.data?.content??''))console.error('RELEASE221_SYNTHETIC_REFUSAL',JSON.stringify({initial:r.initial,boundStatus:bound221.status}));
 check('request release cannot unlink an existing character binding',r.initial.type===4&&/unbind/i.test(r.initial.data.content)&&!r.initial.data.content.includes('Unknown')&&JSON.stringify(db.prepare('SELECT * FROM characters ORDER BY name_key').all())===chars221);
 const pendingName221='Pending Release',pendingKey221=load('./codes').normalizeCharacter(pendingName221);
 await fixtureRun('INSERT INTO pending(discord_id,name_key,name,created_at,expires_at) VALUES(?,?,?,?,?)',ORG,pendingKey221,pendingName221,at(),at()+3600);
 r=await send219('olympus-admin','release',{character:pendingName221});
 check('authorized release closes an open request without removing any binding',r.initial.type===4&&r.initial.data.content.includes('is closed')&&one('SELECT consumed_source FROM pending WHERE name_key=?',pendingKey221)?.consumed_source==='release'&&JSON.stringify(db.prepare('SELECT * FROM characters ORDER BY name_key').all())===chars221);
 r=await send219('olympus-admin','release',{character:releaseName221},MEMBER);
 check('a normal member cannot use the request-release alias',r.initial.type===4&&r.initial.data.content==='High Council only.'&&JSON.stringify(db.prepare('SELECT * FROM characters ORDER BY name_key').all())===chars221);
 const index221=load('./index');
 check('account guidance is read-only while release and role-sync retain the durable write ledger',index221.isReadOnly({type:2,data:{name:'olympus-privacy'}})&&index221.isReadOnly({type:2,data:{name:'olympus-unlink'}})&&!index221.isReadOnly({type:2,data:{name:'olympus-admin',options:[{type:1,name:'release'}]}})&&!index221.isReadOnly({type:2,data:{name:'olympus-admin',options:[{type:1,name:'role-sync'}]}}));
 check('guild workflow additions preserve the existing physical schema',JSON.stringify(db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").all())===schema221);
 console.log('\n'+passed+'/'+total+' .221 signed workflow checks passed');process.exit(passed===total?0:1);
`;
const mod221=new Module(__filename,module);mod221.filename=__filename;mod221.paths=Module._nodeModulePaths(__dirname);
mod221._compile(original221.slice(0,begin221)+setup221+scenarios221+'\n}\n'+original221.slice(footer221),__filename);
