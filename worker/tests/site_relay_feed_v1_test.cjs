'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadPureSource218}=require('./helpers/pure_source218.cjs');
const worker=path.resolve(__dirname,'..'),source=loadPureSource218(worker,'site-relay-feed-v1');
const {validateRelaySnapshotV1:validate,decodeRelaySnapshotV1:decode,acceptRelayReplyV1:accept,relayMetricAtV1:at,selectArmySourceV1:select,createRelayRequestV1:sign}=source;
const fixtures=path.join(__dirname,'fixtures','site-relay-feed-v1'),example=JSON.parse(fs.readFileSync(path.join(fixtures,'site-feed-v1-public-example.json'),'utf8'));
const original=JSON.stringify(example),now=1800001800,encode=v=>new TextEncoder().encode(typeof v==='string'?v:JSON.stringify(v));let checks=0;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
function refuses(name,mutate,code){check(name,()=>{const value=structuredClone(example);mutate(value);assert.throws(()=>validate(value,now,1),e=>e instanceof source.RelayFeedRefusal&&(!code||e.code===code));});}
check('complete eleven-row public example',()=>assert.equal(validate(example,now,1).guilds.length,11));
check('wire decoding uses actual source parser',()=>assert.equal(decode(encode(original),now,1).sequence,83));
check('original inputs remain byte-identical',()=>assert.equal(JSON.stringify(example),original));
for(const [name,mutation] of [
 ['top identity',v=>v.discordId='fixture-private'],['nested identity',v=>v.guilds[0].characters.contributors=2],
 ['Council field',v=>v.guilds[0].council=true],['extra scope',v=>v.scope.realmGroup='RealmA+RealmB'],
 ['wrong schema',v=>v.schema='olympus-stat-observation-v2'],['wrong version',v=>v.version=2],
 ['wrong producer',v=>v.producer='any'],['partial response',v=>v.complete=false],
 ['missing guild',v=>v.guilds.pop()],['duplicate guild',v=>v.guilds[1]=v.guilds[0]],
 ['reordered guilds',v=>v.guilds.reverse()],['unknown guild',v=>v.guilds[0].guild='Olympian'],
 ['Horde',v=>v.scope.faction='Horde'],['mapping mismatch',v=>v.scope.mappingVersion=2],
 ['wrong logical scope',v=>v.scope.id='beta'],['unsafe sequence',v=>v.sequence=2**53],
 ['future generation',v=>v.generatedAt=now+6],['fractional sequence',v=>v.sequence=1.5],
 ['wrong source',v=>v.guilds[0].source='manual'],['secondhand roster',v=>v.guilds[0].basis='seen'],
 ['positive small count',v=>v.guilds[0].characters.value=3],['over capacity',v=>v.guilds[0].characters.value=1001],
 ['negative online',v=>v.guilds[0].online.value=-1],['online above total',v=>v.guilds[0].online.value=501],
 ['complementary group',v=>v.guilds[0].online.value=498],['fractional count',v=>v.guilds[0].online.value=5.5],
 ['approximate zero',v=>v.guilds[0].online.precision='approximate'],['invented precision',v=>v.guilds[0].characters.precision='verified'],
 ['wide bucket',v=>v.guilds[0].characters.sourceTime.notAfter+=1],['reversed bucket',v=>v.guilds[0].characters.sourceTime.notAfter=1],
 ['future source',v=>v.guilds[0].characters.sourceTime.notBefore=now+6],
 ['extended expiry',v=>v.guilds[0].characters.validUntil++],['already expired',v=>{v.guilds[0].online.sourceTime={notBefore:now-900,notAfter:now-900};v.guilds[0].online.validUntil=now;}],
 ['unavailable leaks count',v=>v.guilds[4].characters.value=10],['invented unavailable reason',v=>v.guilds[4].characters.reason='unknown'],
 ['missing not-observed null',v=>v.guilds[5].characters.sourceTime={notBefore:now,notAfter:now}],
 ['unavailable other state null',v=>v.guilds[4].characters.sourceTime=null],['numeric mask',v=>v.guilds[3].characters.band=4],
 ['online while total hidden',v=>v.guilds[3].online=structuredClone(v.guilds[0].online)],
 ['masked online above zero total',v=>{v.guilds[0].characters.value=0;v.guilds[0].online=structuredClone(v.guilds[7].online);}]
]) refuses(name,mutation);
check('invalid UTF8 refused',()=>assert.throws(()=>decode(new Uint8Array([255]),now,1)));
check('oversized body refused before JSON',()=>assert.throws(()=>decode(new Uint8Array(16385),now,1),/body_limit/));
check('duplicate keys refused rather than last-wins',()=>assert.throws(()=>decode(encode(original.replace('"version":1','"version":1,"version":1')),now,1),/duplicate_key/));
check('escaped duplicate keys refused',()=>assert.throws(()=>decode(encode(original.replace('"version":1','"version":1,"\\u0076ersion":1')),now,1),/duplicate_key/));
check('deep unknown JSON is bounded',()=>assert.throws(()=>decode(encode('['.repeat(15)+'0'+']'.repeat(15)),now,1),/excessive_json_depth/));
check('accessor refused without invoking it',()=>{let ran=false;const v=structuredClone(example);Object.defineProperty(v.guilds[0].online,'status',{get(){ran=true;return 'available'},enumerable:true});assert.throws(()=>validate(v,now,1),/non_data_object/);assert.equal(ran,false);});
const cache=accept(200,encode(example),'"fixture-83"',null,now,1);
check('304 preserves acquisition time and source age',()=>{const out=accept(304,new Uint8Array(),'"fixture-83"',cache,now+10,1);assert.deepEqual(out,cache);assert.notEqual(out,cache);});
check('304 cannot cross earliest available expiry',()=>assert.throws(()=>accept(304,new Uint8Array(),'"fixture-83"',cache,1800002100,1),/expiry_requires_new_snapshot/));
check('expired metric exposes no count without network',()=>assert.deepEqual(at(cache.snapshot.guilds[0].online,1800002400),{status:'unavailable',reason:'expired',sourceTime:{notBefore:1800001500,notAfter:1800001500}}));
for(const [name,status,body,etag,prior,time] of [
 ['304 without previous state',304,new Uint8Array(),'"fixture-83"',null,now],
 ['304 with body',304,encode('{}'),'"fixture-83"',cache,now],
 ['304 changed ETag',304,new Uint8Array(),'"changed"',cache,now],
 ['weak ETag',200,encode(example),'W/"fixture-83"',null,now],
 ['unquoted ETag',200,encode(example),'fixture-83',null,now],
 ['upstream failure',500,encode('{}'),'"failure"',cache,now],
 ['backwards local clock',304,new Uint8Array(),'"fixture-83"',cache,now-1],
])check(name,()=>assert.throws(()=>accept(status,body,etag,prior,time,1)));
check('same sequence cannot mutate snapshot',()=>{const v=structuredClone(example);v.guilds[0].characters.value++;assert.throws(()=>accept(200,encode(v),'"new"',cache,now,1),/same_sequence_changed/);});
check('old sequence cannot replace state',()=>{const v=structuredClone(example);v.sequence--;assert.throws(()=>accept(200,encode(v),'"old"',cache,now,1),/rollback/);});
check('new sequence must change ETag',()=>{const v=structuredClone(example);v.sequence++;assert.throws(()=>accept(200,encode(v),cache.etag,cache,now,1),/changed_sequence_same_etag/);});
check('complete tombstones replace old accepted values',()=>{const v=structuredClone(example);v.sequence++;v.generatedAt++;v.guilds[0].characters={status:'unavailable',reason:'withdrawn',sourceTime:{notBefore:now,notAfter:now}};v.guilds[0].online=structuredClone(v.guilds[0].characters);const out=accept(200,encode(v),'"next"',cache,now+1,1);assert.equal(out.snapshot.guilds[0].characters.status,'unavailable');assert.equal(cache.snapshot.guilds[0].characters.status,'available');});
const manual={source:'manual',available:true,sourceTime:{notBefore:now,notAfter:now},validUntil:now+86400};
const relay={source:'companion-relay',available:true,sourceTime:{notBefore:now-100,notAfter:now+199},validUntil:now+1700};
check('overlapping intervals retain manual',()=>assert.equal(select(manual,relay,now),'manual'));
check('strictly newer relay may be selected',()=>assert.equal(select(manual,{...relay,sourceTime:{notBefore:now+1,notAfter:now+1}},now),'companion-relay'));
check('withdrawn relay falls back to independent manual',()=>assert.equal(select(manual,{...relay,available:false},now),'manual'));
check('expired candidates never resurrect from cache',()=>assert.equal(select({...manual,sourceTime:{notBefore:now-1,notAfter:now-1},validUntil:now},{...relay,validUntil:now},now),null));
for(const [name,patch] of [['infinite expiry',{validUntil:Infinity}],['string availability',{available:'true'}],['wrong provenance',{source:'companion-relay'}],['backwards interval',{sourceTime:{notBefore:now,notAfter:now-1}}],['future interval',{sourceTime:{notBefore:now+6,notAfter:now+6}}],['overwide interval',{sourceTime:{notBefore:now-300,notAfter:now}}],['expiry before observation',{validUntil:now-1}],['unknown candidate field',{witnessCount:3}]]) {
 check('source selection rejects '+name,()=>assert.throws(()=>select({...manual,...patch},relay,now)));
}
check('both sources absent stays unavailable',()=>assert.equal(select(null,null,now),null));
check('no route or cron mount',()=>assert.ok(!fs.readFileSync(path.join(worker,'src','index.ts'),'utf8').includes('site-relay-feed-v1')));
check('manual Army parser remains separate',()=>{const armySource=fs.readFileSync(path.join(worker,'src','army-census.ts'),'utf8');assert.ok(armySource.includes('olympus-stat-observation-v2'));assert.ok(!armySource.includes('site-relay-feed-v1'));});
async function main(){
 const http=await source.consumeRelayResponseV1(new Response(original,{headers:{'content-type':'application/json; charset=utf-8',etag:'"http-83"'}}),null,now,1);
 check('actual bounded HTTP response consumer',()=>assert.equal(http.snapshot.sequence,83));
 const http304=await source.consumeRelayResponseV1(new Response(null,{status:304,headers:{etag:'"http-83"'}}),http,now+1,1);
 check('bodyless HTTP304 retains original acquisition',()=>assert.equal(http304.acquiredAt,now));
 for(const [name,response,code] of [
  ['HTTP500',new Response('failure',{status:500}),'upstream_unavailable'],
  ['HTML instead of JSON',new Response(original,{headers:{'content-type':'text/html',etag:'"x"'}}),'wrong_content_type'],
  ['cookie-bearing upstream',new Response(original,{headers:{'content-type':'application/json',etag:'"x"','set-cookie':'fixture=none'}}),'unexpected_transport'],
  ['redirect',new Response(null,{status:302,headers:{location:'https://else.fixture.invalid/'}}),'unexpected_transport'],
  ['oversized declared length',new Response('{}',{headers:{'content-type':'application/json',etag:'"x"','content-length':'16385'}}),'body_limit'],
  ['oversized streamed body',new Response(' '.repeat(16385),{headers:{'content-type':'application/json',etag:'"x"'}}),'body_limit'],
 ]){await assert.rejects(()=>source.consumeRelayResponseV1(response,null,now,1),new RegExp(code));checks++;console.log('PASS '+name);}
 let cancelled=false;
 const stalled=new Response(new ReadableStream({pull(){return new Promise(()=>{})},cancel(){cancelled=true}}),{headers:{'content-type':'application/json',etag:'"x"'}});
 const deadline=new AbortController(),timer=setTimeout(()=>deadline.abort(),10);
 try{await assert.rejects(()=>source.consumeRelayResponseV1(stalled,null,now,1,deadline.signal),/response_timeout/);}finally{clearTimeout(timer);}
 checks++;console.log('PASS stalled response deadline');
 check('deadline cancels the unread stream',()=>assert.equal(cancelled,true));
 const aging=structuredClone(example.guilds[0]);aging.online={status:'available',value:5,precision:'exact',sourceTime:{notBefore:1800002900,notAfter:1800002900},validUntil:1800003800};
 check('character expiry hides even independently fresh online',()=>{const out=source.relayRowAtV1(aging,1800003000);assert.equal(out.characters.status,'unavailable');assert.equal(out.online.status,'unavailable');assert.equal(out.online.reason,'expired');assert.equal(aging.online.status,'available');});
 const pair=await crypto.subtle.generateKey('Ed25519',false,['sign','verify']);
 const config={enabled:true,contractFinalized:true,nativeMappingConfirmed:true,endpoint:'https://relay.fixture.invalid/companion/v1/site/aggregates?v=1&scope=forever-pve-alliance',kid:'fixture-feed-key-1',privateKey:pair.privateKey};
 for(const key of ['enabled','contractFinalized','nativeMappingConfirmed']){await assert.rejects(()=>sign({...config,[key]:false},now),/feed_disabled_or_unfinalized/);checks++;console.log('PASS '+key+' gate prevents signing');}
 for(const endpoint of ['http://relay.fixture.invalid/companion/v1/site/aggregates?v=1&scope=forever-pve-alliance',config.endpoint+'&x=1',config.endpoint.replace('?v=1&scope=forever-pve-alliance','?scope=forever-pve-alliance&v=1'),config.endpoint+'#x',config.endpoint.replace('/companion/','/other/')]){await assert.rejects(()=>sign({...config,endpoint},now),/invalid_endpoint/);checks++;console.log('PASS exact request target refused');}
 const a=await sign(config,now),b=await sign(config,now),parts=a.authorization.slice(7).split('.'),unpack=s=>JSON.parse(Buffer.from(s,'base64url'));
 check('dedicated Ed25519 signature genuinely verifies locally',()=>assert.equal(parts.length,3));
 assert.equal(await crypto.subtle.verify('Ed25519',pair.publicKey,Buffer.from(parts[2],'base64url'),encode(parts[0]+'.'+parts[1])),true);checks++;console.log('PASS actual Ed25519 verification');
 const header=unpack(parts[0]),claims=unpack(parts[1]);
 check('protected header exact namespace',()=>assert.deepEqual(header,{alg:'EdDSA',kid:config.kid,typ:'olympus-feed-request+jwt'}));
 check('request claims bind canonical method target scope and lifetime',()=>{assert.equal(claims.htm,'GET');assert.equal(claims.htu,config.endpoint);assert.equal(claims.scope,'forever-pve-alliance');assert.equal(claims.exp-claims.iat,60);assert.equal(claims.v,1);assert.equal(claims.iss,'olympus-site');assert.equal(claims.aud,'olympus-site-aggregates');assert.match(claims.jti,/^[0-9a-f]{32}$/);});
 check('fresh requests have separate non-reusable identifiers',()=>assert.notEqual(claims.jti,unpack(b.authorization.slice(7).split('.')[1]).jti));
 assert.equal(JSON.stringify(example),original);console.log('site_relay_feed_v1_test: '+checks+' passed; no network, real keys, database, route or feature activation.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
