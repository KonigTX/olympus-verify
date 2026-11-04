'use strict';
// Actual current parser graph. Synthetic structural signatures intentionally do
// NOT verify: successful parsing must confer no membership/role authority.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadPureSource218}=require('./helpers/pure_source218.cjs');
const worker=path.resolve(__dirname,'..'),source=loadPureSource218(worker,'launch-qr227');
const {parseLaunchQrCandidate227:parse,LAUNCH_QR_PAGE227:page}=source;
const sig='A'.repeat(86),pub='A'.repeat(43),proof=['1800000000','fixture001','Council One-Realm','r',sig,pub,'c','1800086400',sig].join(',');
const raw=['OLB5','Fern Melder-Realm','Olympus II','Alliance','a'.repeat(16),'7K3M9QX2TB','b'.repeat(16),proof].join('~');let checks=0;
function check(label,fn){fn();checks++;console.log('PASS '+label);}
function refuses(label,input,code){check(label,()=>assert.throws(()=>parse(input),error=>error instanceof source.LaunchQrRefusal227&&(!code||error.code===code)));}
const candidate=parse(raw);
check('actual OLB5 format is understood without inventing producer fields',()=>{assert.equal(candidate.protocol,'OLB5');assert.equal(candidate.requester,'Fern Melder-Realm');assert.equal(candidate.canonicalGuild,'Olympus II');assert.equal(candidate.proofs[0].gv,'r');assert.equal(candidate.proofs[0].certExp,1800086400);});
check('all-zero structural signatures remain explicitly unverified',()=>{assert.equal(candidate.trust,'unverified_signed_claims');assert.equal(candidate.canGrantRoles,false);assert.equal(candidate.requesterGuid,null);assert.equal(candidate.nativeRank,null);assert.equal(candidate.realmGroup,null);});
check('candidate and copied proof graph are immutable',()=>{assert.ok(Object.isFrozen(candidate));assert.ok(Object.isFrozen(candidate.proofs));assert.ok(Object.isFrozen(candidate.proofs[0]));});
for(const input of [page+'#b='+encodeURIComponent(raw),'#b='+encodeURIComponent(raw),'b='+encodeURIComponent(raw),' '+raw+' '])check('upstream QR URL/fragment or pasted bundle round trips exact signed bytes',()=>assert.equal(parse(input).wire,raw));
check('case-insensitive guild lookup never rewrites signed guild text',()=>{const c=parse(raw.replace('Olympus II','OLYMPUS II'));assert.equal(c.canonicalGuild,'Olympus II');assert.equal(c.signedGuild,'OLYMPUS II');assert.ok(c.wire.includes('OLYMPUS II'));});
for(const guild of ['Olympus','Olympus I','Olympus II','Olympus III','Olympus IV','Olympus V','Olympus VI','Olympus VII','Olympus VIII','Olympus IX','Olympus X'])check('exact affiliated guild '+guild+' has a structural candidate only',()=>{const c=parse(raw.replace('Olympus II',guild));assert.equal(c.canonicalGuild,guild);assert.equal(c.canGrantRoles,false);});
for(const guild of ['Other Guild','Olympus XI','Olympus II impostor',' Olympus II','Olympus  II','Оlympus II'])refuses('unaffiliated/confusable guild is not normalized into membership',raw.replace('Olympus II',guild),'unaffiliated_guild_or_faction');
refuses('wrong faction cannot borrow an affiliated guild name',raw.replace('Alliance','Horde'),'unaffiliated_guild_or_faction');
refuses('a real signed claimed-only guild would still be insufficient',raw.replace(',r,',',c,'),'claimed_only_guild');
check('existing w evidence is parsed but still requires real cryptographic and freshness review',()=>{const c=parse(raw.replace(',r,',',w,'));assert.equal(c.proofs[0].gv,'w');assert.equal(c.canGrantRoles,false);});
for(const input of ['OLCS2|a|b|001|001|c','{"format":"olympus-stat-observation-v2"}','{"schema":"olympus-site-aggregate"}'])refuses('aggregate census can never be a membership credential',input,'census_is_not_membership');
for(const input of ['OLC2.private-code','/oly discord OLC2.private-code','/olympus discord OLC2.private-code'])refuses('private command is not accepted as a public proof',input,'private_code_is_not_proof');
for(const prefix of ['https://evil.invalid/','http://dnl-gentile.github.io/olympus-addon/','https://olympus-guild.web.app/','https://dnl-gentile.github.io/other/'])refuses('another origin cannot masquerade as the membership page',prefix+'#b='+encodeURIComponent(raw),'unsupported_qr_origin');
for(const input of [page+'?query=1#b='+encodeURIComponent(raw),page+'#b='+encodeURIComponent(raw)+'&other=value','#b='+encodeURIComponent(raw)+'&other=value',page.replace('https://','https://user:password@')+'#b='+encodeURIComponent(raw)])refuses('extra URL credentials/query/fragment fields are refused',input);
for(const input of [null,{},'OLB5~bad',raw+'~extra',raw.replace(',r,',',x,'),raw.replace('fixture001','INVALID'),raw.replace('a'.repeat(16),'z'.repeat(16)),raw.replace(sig,'!'.repeat(86)),raw+';'+proof+';'+proof+';'+proof+';'+proof,'x'.repeat(8193)])refuses('malformed/oversized producer wire is refused',input);
check('existing beta profile and native proof rules remain historical',()=>{const qr=fs.readFileSync(path.join(worker,'src/qr-phase1.ts'),'utf8');assert.ok(qr.includes("realm:'Classic Beta PvP 2'"));assert.ok(qr.includes('build:70205'));assert.ok(!fs.readFileSync(path.join(worker,'src/index.ts'),'utf8').includes('launch-qr227'));});
check('legacy Link core still has only its original gated importer',()=>{const dir=path.join(worker,'src');const names=fs.readdirSync(dir).filter(name=>name.endsWith('.ts')&&name!=='link-core.ts'&&/link-core/.test(fs.readFileSync(path.join(dir,name),'utf8').replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g,'')));assert.deepEqual(names,['link.ts']);});
console.log('launch_qr227_test: '+checks+' passed; structural compatibility only, no signatures/keys/network/database/roles/activation qualified.');
