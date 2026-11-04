'use strict';
// Actual current-source polling boundary; transport alone is replaced. All keys,
// qualification flags and responses below are synthetic, never launch evidence.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadPureSource218}=require('./helpers/pure_source218.cjs');
const worker=path.resolve(__dirname,'..'),source=loadPureSource218(worker,'site-relay-feed-v1');
const {pollConfirmedRelayFeedV1:poll,RELAY_ENDPOINT_V1:endpoint,RELAY_PENDING_READINESS_V1:pending,RELAY_PRODUCER_COMMITMENTS_V1:commitments}=source;
const example=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/site-relay-feed-v1/site-feed-v1-public-example.json'),'utf8'));
const now=1800001800,body=JSON.stringify(example);let checks=0;
function check(name,fn){fn();checks++;console.log('PASS '+name);}
async function rejects(name,fn,code){await assert.rejects(fn,error=>error instanceof source.RelayFeedRefusal&&error.code===code);checks++;console.log('PASS '+name);}
const response=()=>new Response(body,{headers:{'content-type':'application/json',etag:'"launch227-83"'}});
async function main(){
 const pair=await crypto.subtle.generateKey('Ed25519',false,['sign','verify']);
 const config={enabled:true,contractFinalized:true,nativeMappingConfirmed:true,endpoint,mappingVersion:1,kid:'launch227-synthetic',privateKey:pair.privateKey,readiness:Object.fromEntries(Object.keys(pending).map(key=>[key,true]))};
 let calls=0,keyReads=0;
 const noTransport=async()=>{calls++;throw Error('unexpected transport');};
 function withoutKey(patch){const value={...config,...patch};Object.defineProperty(value,'privateKey',{get(){keyReads++;throw Error('unexpected key read');}});return value;}
 check('confirmed production origin and canonical query are pinned',()=>assert.equal(endpoint,'https://olympus-guild.web.app/companion/v1/site/aggregates?v=1&scope=forever-pve-alliance'));
 check('all launch qualification gates default to false',()=>{assert.ok(Object.isFrozen(pending));assert.ok(Object.values(pending).every(value=>value===false));});
 check('confirmed retention limits do not invent an HS1 expiry',()=>assert.deepEqual(commitments,{rawObservationSeconds:86400,securityLogSeconds:2592000,encryptedBackupSeconds:2592000,primaryErasureSeconds:86400,gmVerificationGraceSeconds:172800,hs1MaximumAgeSeconds:null}));
 for(const field of ['enabled','contractFinalized','nativeMappingConfirmed'])await rejects(field+' refuses before credentials or network',()=>poll(withoutKey({[field]:false}),null,now,noTransport),'feed_disabled_or_unfinalized');
 for(const field of Object.keys(pending))await rejects(field+' missing qualification holds polling',()=>poll(withoutKey({readiness:{...config.readiness,[field]:false}}),null,now,noTransport),'feed_launch_evidence_pending');
 await rejects('omitted readiness keeps every gate held',()=>poll(withoutKey({readiness:undefined}),null,now,noTransport),'feed_launch_evidence_pending');
 await rejects('truthy strings cannot qualify launch evidence',()=>poll(withoutKey({readiness:{...config.readiness,producerQualified:'true'}}),null,now,noTransport),'feed_launch_evidence_pending');
 await rejects('unknown readiness fields are rejected',()=>poll(withoutKey({readiness:{...config.readiness,extra:true}}),null,now,noTransport),'unknown_or_missing_keys');
 for(const target of [endpoint.replace('olympus-guild.web.app','other.invalid'),endpoint.replace('https:','http:'),endpoint.replace('?v=1&scope=forever-pve-alliance','?scope=forever-pve-alliance&v=1'),endpoint+'&extra=1',endpoint+'#fragment',endpoint.replace('/companion/','/other/')])await rejects('noncanonical target cannot receive credentials',()=>poll(withoutKey({endpoint:target}),null,now,noTransport),'invalid_confirmed_configuration');
 for(const mappingVersion of [0,1.5,NaN,'1'])await rejects('invalid mapping version is held',()=>poll(withoutKey({mappingVersion}),null,now,noTransport),'invalid_confirmed_configuration');
 const alreadyAborted=new AbortController();alreadyAborted.abort();
 await rejects('already-aborted caller cannot sign a request',()=>poll(withoutKey({}),null,now,noTransport,alreadyAborted.signal),'response_timeout');
 check('all preflight refusals used neither key nor transport',()=>{assert.equal(calls,0);assert.equal(keyReads,0);});
 let sent;
 const first=await poll(config,null,now,async request=>{calls++;sent=request;return response();});
 check('qualified synthetic boundary accepts a complete actual-source snapshot',()=>{assert.equal(first.snapshot.guilds.length,11);assert.equal(first.snapshot.sequence,83);});
 check('request cannot follow redirects or forward ambient credentials',()=>{assert.equal(sent.url,endpoint);assert.equal(sent.method,'GET');assert.equal(sent.redirect,'error');assert.equal(sent.credentials,'omit');assert.equal(sent.cache,'no-store');assert.equal(sent.headers.get('cookie'),null);assert.equal(sent.headers.get('accept'),'application/json');assert.equal(sent.headers.get('if-none-match'),null);});
 const parts=sent.headers.get('authorization').slice(7).split('.'),claims=JSON.parse(Buffer.from(parts[1],'base64url'));
 assert.equal(await crypto.subtle.verify('Ed25519',pair.publicKey,Buffer.from(parts[2],'base64url'),new TextEncoder().encode(parts[0]+'.'+parts[1])),true);checks++;console.log('PASS actual wrapper signature verifies with ephemeral public key');
 check('signed request binds confirmed target and short lifetime',()=>{assert.equal(claims.htu,endpoint);assert.equal(claims.htm,'GET');assert.equal(claims.scope,'forever-pve-alliance');assert.equal(claims.exp,now+60);});
 const unchanged=await poll(config,first,now+1,async request=>{check('subsequent poll sends only validated strong ETag',()=>assert.equal(request.headers.get('if-none-match'),first.etag));return new Response(null,{status:304,headers:{etag:first.etag}});});
 check('HTTP304 preserves original acquisition and source age',()=>assert.deepEqual(unchanged,first));
 await rejects('malformed prior cache is refused before signing',()=>poll(withoutKey({}),{...first,etag:'"bad"\r\nauthorization: invalid'},now+1,noTransport),'invalid_prior');
 check('invalid prior did not read the key or call transport',()=>{assert.equal(calls,1);assert.equal(keyReads,0);});
 let redirects=0,redirectCancelled=false;
 await rejects('redirect response is refused without a follow-up request',()=>poll(config,null,now,async request=>{redirects++;assert.equal(request.redirect,'error');return new Response(new ReadableStream({cancel(){redirectCancelled=true;}}),{status:302,headers:{location:'https://attacker.invalid/'}});}),'unexpected_transport');
 check('redirect is not retried and unread body is cancelled',()=>{assert.equal(redirects,1);assert.equal(redirectCancelled,true);});
 await rejects('declared oversize body is bounded',()=>poll(config,null,now,async()=>new Response('{}',{headers:{'content-type':'application/json',etag:'"x"','content-length':'16385'}})),'body_limit');
 await rejects('streamed oversize body is bounded',()=>poll(config,null,now,async()=>new Response(' '.repeat(16385),{headers:{'content-type':'application/json',etag:'"x"'}})),'body_limit');
 await rejects('provider errors expose only a fixed refusal code',()=>poll(config,null,now,async request=>{throw Error('provider accidentally included '+request.headers.get('authorization'));}),'relay_transport_failed');
 let finishLate,lateCancelled=false,lateRequest;
 const stop=new AbortController();
 const hung=poll(config,null,now,request=>{lateRequest=request;setTimeout(()=>stop.abort(),10);return new Promise(resolve=>{finishLate=resolve;});},stop.signal);
 await rejects('caller abort bounds an uncooperative fetch',()=>hung,'response_timeout');
 check('transport request receives cancellation',()=>assert.equal(lateRequest.signal.aborted,true));
 finishLate(new Response(new ReadableStream({cancel(){lateCancelled=true;}}),{headers:{'content-type':'application/json',etag:'"late"'}}));
 await new Promise(resolve=>setImmediate(resolve));
 check('response arriving after cancellation is discarded and cancelled',()=>assert.equal(lateCancelled,true));
 let stalledCancelled=false;
 const bodyStop=new AbortController();
 await rejects('same deadline covers the response body',()=>poll(config,null,now,async()=>{setTimeout(()=>bodyStop.abort(),10);return new Response(new ReadableStream({pull(){return new Promise(()=>{});},cancel(){stalledCancelled=true;}}),{headers:{'content-type':'application/json',etag:'"stalled"'}});},bodyStop.signal),'response_timeout');
 check('body cancellation releases a stalled response',()=>assert.equal(stalledCancelled,true));
 await rejects('built-in eight-second deadline bounds fetch without an external signal',()=>poll(config,null,now,()=>new Promise(()=>{})),'response_timeout');
 check('production entry remains unmounted and policy unfinalized',()=>{assert.equal(source.RELAY_POLICY_V1.finalized,false);assert.ok(!fs.readFileSync(path.join(worker,'src/index.ts'),'utf8').includes('site-relay-feed-v1'));});
 console.log('site_relay_launch227_test: '+checks+' passed; synthetic qualification flags, ephemeral keys, no real fetch/storage/activation.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
