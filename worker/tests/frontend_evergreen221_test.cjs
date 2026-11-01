// Current SPA and real Worker/Native SQLite. Synthetic clocks and identities only.
const fs221=require('node:fs'),path221=require('node:path'),crypto221=require('node:crypto'),{Module}=require('node:module');
const original221=fs221.readFileSync(path221.join(__dirname,'frontend_check.cjs'),'utf8');
const cuts221=[...original221.matchAll(/\(async \(\) => \{\r?\n  await siteUser\(MEMBER/g)];
if(cuts221.length!==1)throw Error('evergreen221_original_frontend_boundary');
const prefix221=original221.slice(0,cuts221[0].index);
if(crypto221.createHash('sha256').update(require('./frontend_fixture_prefix217.cjs').historicalFrontendPrefix217(prefix221)).digest('hex')!=='bd05ccad75ca07e71647d20b9169636ed1d73d33ee2bbb3a7c1e763a8121c1c5')throw Error('evergreen221_original_frontend_prefix_drift');
async function evergreen221(){
 await siteUser(MEMBER,{global_name:'Evergreen reader'});await character(MEMBER,'Reader One','Player-221-0001');
 const page=await openPage(MEMBER,{}, {clockNow:Date.parse('2026-11-01T12:00:00Z')});
 await page.go('#/roles');
 const search=page.app.querySelector('#application-role-search201');
 const visible=key=>{const family=page.app.querySelector('[data-role-family203="'+key+'"]');return !!family&&!family.hidden;};
 for(const query of ['Raid Leader NA','NA raid lead','Raid Leader (NA)','Ｒａｉｄ Ｌｅａｄｅｒ ＮＡ']){
  search.value=query;fire(search,'input');
  check('punctuation, order and full-width search finds the NA Raid Leader: '+query,visible('raid_leader')&&page.app.querySelector('[data-role-family203="raid_leader"] .role-search-match203').textContent.includes('NA'));
 }
 search.value='PvP Lead NA';fire(search,'input');check('PvP regional search has its own reserved family',visible('pvp_leadership')&&!page.app.querySelector('[data-role-family203="pvp_leadership"] [data-family-apply203]'));
 search.value='rank 5';fire(search,'input');check('the public rank number finds the Raid Leader family',visible('raid_leader'));
 search.value='NA';fire(search,'input');check('a short region token does not match Finance',!visible('bank_custody')&&!visible('treasurer'));
 search.value='<img src=x onerror=alert(1)>';fire(search,'input');check('hostile search stays text and creates no executable node',!page.app.querySelector('img[onerror],script[src="x"]'));
 search.value='';fire(search,'input');
 const council=page.app.querySelector('[data-rank-crosswalk="2"]');
 const cells=council.querySelectorAll('td');
 check('Council portal guidance is one specification rather than concatenated near-duplicates',(cells[3].textContent.match(/High Council access requires/g)||[]).length<=1&&!/appointment;.*appointment;/s.test(cells[3].textContent));
 check('statutory titles follow canonical I to V order',cells[1].textContent.includes('Title I / II / III / IV / V'));
 const before=await openPage(MEMBER,{}, {clockNow:Date.parse('2026-11-02T12:00:00Z')});await before.go('#/apply');
 const copy=before.app.querySelector('.launch-application-copy218');
 check('application instructions have no orphan separator after their sentence',!!copy&&!copy.textContent.includes('.  · ')&&!copy.textContent.includes('. · '));
 const after=await openPage(MEMBER,{}, {clockNow:Date.parse('2026-11-05T12:00:00Z')});
 const afterNotice=after.app.querySelector('.launch-notice218');
 check('the launch milestone advances to the announced December raid date',!!afterNotice&&afterNotice.textContent.includes('9 December 2026')&&afterNotice.textContent.includes('regional')&&!afterNotice.querySelector('[role="timer"]'));
 check('post-reservation instructions do not ask people to claim early names',!!afterNotice&&!afterNotice.querySelector('.launch-application-copy218').textContent.startsWith('Claim'));
 const later=await openPage(MEMBER,{}, {clockNow:Date.parse('2026-12-10T12:00:00Z')});
 const laterNotice=later.app.querySelector('.launch-notice218');
 check('a passed raid date never asserts observed server availability',!!laterNotice&&laterNotice.textContent.includes('announced raid date has passed')&&laterNotice.textContent.includes('actual availability')&&!laterNotice.querySelector('[role="timer"]'));
 console.log('\n'+ok+'/'+n+' passed');process.exit(ok===n?0:1);
}
const run221=new Module(__filename,module);run221.filename=__filename;run221.paths=Module._nodeModulePaths(__dirname);
run221._compile(prefix221+'\n('+evergreen221.toString()+')().catch(e=>{console.error(e.stack);process.exit(1)});',__filename);
