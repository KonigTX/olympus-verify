'use strict';
// Root-only composition: protected close-only/Erec deploy happens BEFORE this new
// original Native fence. Role debt is preserved. There is no enable or prior-ACK input.
const need=(v,s)=>{if(!v)throw Error(s);};
const {captureOriginalIssuer}=require('./original-issuer.cjs');
async function runOwnedRecovery230({nativeModule,nativeDatabase,planJSON,planSHA256,effects}){
 const p=JSON.parse(planJSON),native=captureOriginalIssuer(nativeModule,['captureSharedMember230RecoveryFence','executeSharedMember230RecoveryFence','sharedMember230RecoveryFenceFacts','captureSharedMember230RecoveryOpen','executeSharedMember230RecoveryOpen','sharedMember230RecoveryOpenFacts']),names=['production','transition','record'],proto=Object.getPrototypeOf(effects),slots=names.map(k=>Object.getOwnPropertyDescriptor(effects,k));
 need(Reflect.ownKeys(effects).length===names.length&&slots.every(s=>s&&Object.hasOwn(s,'value')&&typeof s.value==='function'),'RECOVERY_EFFECTS');
 const live=()=>need(Date.now()<p.expiresAt*1000,'RECOVERY_WINDOW_EXPIRED');
 const check=()=>{native.check();need(Object.getPrototypeOf(effects)===proto,'RECOVERY_EFFECTS_CHANGED');for(let i=0;i<names.length;i++){const d=Object.getOwnPropertyDescriptor(effects,names[i]),s=slots[i];need(d&&['value','writable','enumerable','configurable'].every(k=>Object.is(d[k],s[k])),'RECOVERY_EFFECTS_CHANGED');}};
 const record=(n,d)=>slots[2].value.call(effects,n,d),production=()=>slots[0].value.call(effects),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);let dispatched=false,ack=null,opened=false;
 const provider=v=>{need(v&&v.worker==='olympus-verify'&&v.percentage===100&&v.sourceCommit===p.sourceCommit&&v.sourceTree===p.sourceTree&&v.bundleSHA256===p.bundleSHA256&&v.epoch===p.writeEpoch&&v.mode==='close-only'&&typeof v.version==='string','RECOVERY_PROVIDER_NOT_OFF');return v;};
 try{check();live();record('recovery-intent',{mode:'off',oldACKAdoption:false,roleDebtPreserved:true,automaticRetry:false});check();live();await slots[1].value.call(effects);check();live();const before=provider(await production());check();record('recovery-provider',before);
  check();live();const fence=await native.call('captureSharedMember230RecoveryFence',nativeDatabase,planJSON,planSHA256);check();live();dispatched=true;ack=await native.call('executeSharedMember230RecoveryFence',fence);check();record('recovery-fence-ack',native.call('sharedMember230RecoveryFenceFacts',ack));
  check();live();const current=provider(await production());check();need(same(current,before),'RECOVERY_PROVIDER_DRIFT');live();const cap=await native.call('captureSharedMember230RecoveryOpen',ack);check();live();const result=await native.call('executeSharedMember230RecoveryOpen',cap);opened=true;check();const facts=native.call('sharedMember230RecoveryOpenFacts',result);record('recovery-open-off-ack',facts);
  check();const after=provider(await production());check();need(same(after,current),'RECOVERY_FINAL_PROVIDER_DRIFT');record('recovery-provider-after',after);return Object.freeze({mode:'off',nativeOpened:true,roleDebtPreserved:true,roleReuseQualified:false,automaticRetry:false});
 }catch(e){record('recovery-held',{dispatched,originalNewFenceAcknowledged:!!ack,nativeOpenAcknowledged:opened,oldACKAdopted:false,automaticRetry:false});throw e;}
}
module.exports={runOwnedRecovery230};
