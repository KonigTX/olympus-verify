'use strict';
// Composition engine for Root's qualified release helper. Deliberately no standalone
// live CLI: Root supplies its pinned preview lifecycle and protected deploy effects.
// All original Native capabilities remain in THIS invocation/module instance.
const need=(v,s)=>{if(!v)throw Error(s);};
const {captureOriginalIssuer}=require('./original-issuer.cjs');
function originalEffects(effects){
 const names=['production','transition','record'],proto=Object.getPrototypeOf(effects),slots=names.map(k=>Object.getOwnPropertyDescriptor(effects,k));
 need(Reflect.ownKeys(effects).length===names.length&&slots.every(d=>d&&Object.hasOwn(d,'value')&&typeof d.value==='function'),'OPERATOR_EFFECTS');
 const check=()=>{need(Object.getPrototypeOf(effects)===proto,'OPERATOR_EFFECTS_CHANGED');for(let i=0;i<names.length;i++){const d=Object.getOwnPropertyDescriptor(effects,names[i]),s=slots[i];need(d&&['value','writable','enumerable','configurable'].every(k=>Object.is(d[k],s[k])),'OPERATOR_EFFECTS_CHANGED');}};
 return {check,production:()=>slots[0].value.call(effects),transition:()=>slots[1].value.call(effects),record:(name,data)=>slots[2].value.call(effects,name,data)};
}
async function runOwnedCutover230({nativeModule,nativeDatabase,closureJSON,closureSHA256,effects}){
 const c=JSON.parse(closureJSON),effectsCapture=originalEffects(effects),native=captureOriginalIssuer(nativeModule,['captureSharedMember230Fence','executeSharedMember230Fence','sharedMember230FenceFacts','captureSharedMember230Open','executeSharedMember230Open','sharedMember230OpenFacts']);
 const e={...effectsCapture,check(){effectsCapture.check();native.check();}};let fenceDispatched=false,ack=null,opened=false;
 const live=()=>need(Date.now()<c.expiresAt*1000,'OPERATOR_ORIGINAL_WINDOW_EXPIRED');
 function provider(p,kind){
  need(p&&p.worker==='olympus-verify'&&p.percentage===100&&p.sourceCommit===c.sourceCommit&&p.sourceTree===c.sourceTree&&p.bundleSHA256===c.bundleSHA256&&typeof p.version==='string','OPERATOR_PROVIDER_CUSTODY');
  if(kind==='A')need(p.version===c.providerA&&p.epoch===c.priorEpoch&&p.mode==='close-only','OPERATOR_A_CHANGED');
  else need(p.version!==c.providerA&&p.epoch===c.writeEpoch&&(p.mode==='enabled'||p.mode==='close-only')&&p.closureSHA256===closureSHA256,'OPERATOR_SUCCESSOR_CHANGED');
  return p;
 }
 try{
  e.check();live();const before=provider(await e.production(),'A');e.check();live();e.record('provider-A',before);
  e.check();live();
  const fence=await native.call('captureSharedMember230Fence',nativeDatabase,closureJSON,closureSHA256);e.check();live();
  e.record('S2-intent',{oneAttempt:true,automaticRetry:false,globalNativeHold:true});
  e.check();live();fenceDispatched=true;
  ack=await native.call('executeSharedMember230Fence',fence);e.check();e.record('S2-ack',native.call('sharedMember230FenceFacts',ack));live();
  // transition is Root's prequalified protected deployment, with real main/signature,
  // source/config/uploaded bytes/100% custody gates. It must return only after ACK.
  // A throw, timeout, ambiguous upload or unconfirmed status stops CLOSED; no retry/abort.
  e.check();live();await e.transition();e.check();live();const successor=provider(await e.production(),'successor');e.check();live();
  e.record('provider-successor',successor);const mode=successor.mode==='enabled'?'enabled':'off';e.check();live();
  const open=await native.call('captureSharedMember230Open',ack,mode);e.check();live();
  e.record('S4-intent',{mode,oneAttempt:true,automaticRetry:false});e.check();live();const result=await native.call('executeSharedMember230Open',open);opened=true;e.check();
  const facts=native.call('sharedMember230OpenFacts',result);e.record('S4-ack',facts);
  e.check();const after=provider(await e.production(),'successor');e.check();need(JSON.stringify(after)===JSON.stringify(successor),'OPERATOR_FINAL_PROVIDER_CHANGED');e.record('provider-after',after);
  return Object.freeze({nativeOpened:true,mode,providerVersion:after.version,providerDrainClaim:false,automaticRetry:false});
 }catch(error){e.record('held',{category:'CUTOVER_HELD_OR_UNKNOWN',fenceDispatched,originalFenceAcknowledged:!!ack,nativeOpenAcknowledged:opened,retry:false,ackSerialization:false});throw error;}
}
module.exports={runOwnedCutover230};
