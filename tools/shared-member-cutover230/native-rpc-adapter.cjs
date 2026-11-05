'use strict';
// Local process-only D1 surface for the exact source issuer. No credentials, SQL or
// caller-selected statement/value is sent on the wire; only reviewed fixed plan IDs.
const {createHash}=require('node:crypto');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),need=(v,s)=>{if(!v)throw Error(s);};
function createAdapter(module,context,send,recovery){
 const plan=recovery?module?.sharedMember230RecoveryPlan:module?.sharedMember230NativePlan;
 need(typeof plan==='function'&&typeof send==='function','ADAPTER_INPUT');
 need(context&&Object.keys(context).sort().join(',')===(recovery?'planJSON,planSHA256':'closureJSON,closureSHA256'),'ADAPTER_CONTEXT');
 const json=recovery?context.planJSON:context.closureJSON,digest=recovery?context.planSHA256:context.closureSHA256;need(typeof json==='string'&&createHash('sha256').update(json).digest('hex')===digest,'ADAPTER_DIGEST');
 const ids=recovery?['recovery-precheck','recovery-fence','recovery-closed-read','recovery-open-off']:['precheck','fence-and-seal','closed-read','open-enabled','open-off-abort'];
 const c=JSON.parse(json),operation=c.operationId,records=new WeakMap();let phase=ids[0],closed=null,dispatched=0,unknown=false;
 const placeholder=JSON.stringify([1,'olympus-write-admission-epoch-2',c.writeEpoch,'closed',0,'','',0,0]);
 const allSQL=new Set(ids.flatMap((id,index)=>plan(id,json,index<2?undefined:placeholder).map(p=>p.sql)));
 const statement=(sql,values)=>{const s=Object.freeze({bind(...next){need(next.every(x=>typeof x==='string'||typeof x==='number'&&Number.isFinite(x)),'ADAPTER_BIND');return statement(sql,Object.freeze(next));}});records.set(s,Object.freeze({sql,values}));return s;};
 const adapter=Object.freeze({
  prepare(sql){need(!unknown&&typeof sql==='string'&&allSQL.has(sql),'ADAPTER_SQL_REFUSED');return statement(sql,Object.freeze([]));},
  async batch(statements){
   need(!unknown&&Array.isArray(statements)&&statements.length>0&&statements.length<=8,'ADAPTER_PHASE');
   const actual=statements.map(s=>{const x=records.get(s);need(x,'ADAPTER_FOREIGN_STATEMENT');return x;});
   const choices=phase==='open'?ids.slice(3):[phase],id=choices.find(p=>same(actual,plan(p,json,closed??undefined)));
   need(id,'ADAPTER_PLAN_OR_BIND_CHANGED');unknown=true;dispatched++;
   // Mark spent before I/O. Even a status503/timeout/lost JSON permanently stops this adapter.
   const response=await send(Object.freeze({planId:id,...(closed===null?{}:{closedTuple:closed})}));
   need(response instanceof Response&&response.status===200&&!response.redirected,'ADAPTER_OUTCOME_UNKNOWN');
   const reader=response.body?.getReader();need(reader,'ADAPTER_BODY');let bytes=0,text='';const decoder=new TextDecoder('utf-8',{fatal:true});try{for(;;){const r=await reader.read();if(r.done)break;bytes+=r.value.byteLength;need(bytes<=4000000,'ADAPTER_BODY_BOUND');text+=decoder.decode(r.value,{stream:true});}text+=decoder.decode();}finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
   const packet=JSON.parse(text);need(packet&&Object.keys(packet).sort().join(',')==='operationId,planId,result,version'&&packet.version===1&&packet.operationId===operation&&packet.planId===id&&Array.isArray(packet.result)&&packet.result.length===actual.length&&packet.result.every(r=>r&&r.success===true&&(!Object.hasOwn(r,'error')||r.error===undefined)),'ADAPTER_PACKET');
   if(id===ids[1]){closed=packet.result[recovery?2:6]?.results?.[0]?.original_tuple;need(typeof closed==='string','ADAPTER_FENCE_TUPLE');phase=ids[2];}
   else if(id===ids[0])phase=ids[1];else if(id===ids[2])phase='open';else phase='complete';
   unknown=false;return packet.result;
  },
 });
 return Object.freeze({database:adapter,observation:()=>Object.freeze({phase,dispatched,unknown,credentialsPresent:false,sqlSent:false})});
}
const createNativeCutover230Adapter=(module,context,send)=>createAdapter(module,context,send,false);
const createNativeRecovery230Adapter=(module,context,send)=>createAdapter(module,context,send,true);
module.exports={createNativeCutover230Adapter,createNativeRecovery230Adapter};
