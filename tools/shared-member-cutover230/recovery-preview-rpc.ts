/** Ephemeral Root-only transport. Compile with one literal reviewed context; never mount
 * in the serving Worker. The wire carries only four OFF-only plan IDs and the original closed tuple. */
import {sharedMember230SHA256} from '../../worker/src/shared-membership-cutover230';
import {parseSharedMember230RecoveryPlan} from '../../worker/src/privacy-shared-member-recovery230';
import {sharedMember230RecoveryPlan,type SharedMember230RecoveryPlanId} from '../../worker/src/privacy-shared-member-recovery230';
import {SUCCESSOR_NATIVE_SEAMS as N} from '../../worker/src/privacy-cookie-profile-migration';
type Context=Readonly<{planJSON:string;planSHA256:string;capability:string;requestHost:string}>;
function need(v:unknown,s:string):asserts v{if(!v)throw Error(s);}
export function createSharedMember230RecoveryRPC(input:Context){
 const keys=['planJSON','planSHA256','capability','requestHost'] as const;
 need(input&&Reflect.ownKeys(input).length===keys.length,'RPC_CONTEXT');
 const c=Object.freeze(Object.fromEntries(keys.map(k=>{const d=Object.getOwnPropertyDescriptor(input,k);need(d&&Object.hasOwn(d,'value'),'RPC_CONTEXT');return[k,d.value];}))) as Context;
 const closure=parseSharedMember230RecoveryPlan(c.planJSON);need(keys.every(k=>typeof c[k]==='string')&&/^[0-9a-f]{64}$/.test(c.planSHA256)&&/^[0-9a-f]{64}$/.test(c.capability)&&/^olympus-verify\.[a-z0-9-]+\.workers\.dev$/.test(c.requestHost),'RPC_CONTEXT');
 const live=()=>Date.now()>=closure.createdAt*1000-5000&&Date.now()<closure.expiresAt*1000;
 return Object.freeze({async fetch(request:Request,env:{DB:D1Database}):Promise<Response>{
  const url=new URL(request.url);if(!live()||url.protocol!=='https:'||url.host!==c.requestHost||url.pathname!=='/_membership230/recovery-native'||url.search||request.headers.get('X-Olympus-Cutover230')!==c.capability)return new Response(null,{status:404});
  if(request.method!=='POST')return new Response(null,{status:405});
  try{
   need(request.headers.get('content-type')==='application/json','RPC_BODY');const reader=request.body?.getReader();need(reader,'RPC_BODY');let size=0,text='';const decoder=new TextDecoder('utf-8',{fatal:true});
   try{for(;;){const r=await reader.read();if(r.done)break;size+=r.value.byteLength;need(size<=2048,'RPC_BODY_BOUND');text+=decoder.decode(r.value,{stream:true});}text+=decoder.decode();}finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
   const body=JSON.parse(text),keys=Object.keys(body).sort();need(body&&typeof body==='object'&&!Array.isArray(body)&&JSON.stringify(keys)===JSON.stringify(body.closedTuple===undefined?['planId']:['closedTuple','planId']),'RPC_BODY');
   need(['recovery-precheck','recovery-fence','recovery-closed-read','recovery-open-off'].includes(body.planId),'RPC_PLAN');
   need(body.planId==='recovery-precheck'||body.planId==='recovery-fence'?body.closedTuple===undefined:typeof body.closedTuple==='string','RPC_TUPLE');
   need(await sharedMember230SHA256(c.planJSON)===c.planSHA256&&live(),'RPC_CONTEXT_DIGEST');
   const slot=Object.getOwnPropertyDescriptor(env,'DB');need(slot&&Object.hasOwn(slot,'value'),'RPC_DB');const native=slot.value as D1Database,witness=N.methods(native),plan=sharedMember230RecoveryPlan(body.planId as SharedMember230RecoveryPlanId,c.planJSON,body.closedTuple);
   const prepared=plan.map(p=>N.prepared(native,witness,p.sql,p.values)),check=()=>{need(live()&&Object.getOwnPropertyDescriptor(env,'DB')?.value===native,'RPC_DB_CHANGED');witness.assert();for(const p of prepared)p.witness.assert();};check();
   // ONE actual Native batch. Never split, retry, normalize or convert failed packets to success.
   const result=await native.batch(prepared.map(p=>p.statement));check();const graph=N.graph(result);graph.witness.assert();const output=JSON.stringify({version:1,operationId:closure.operationId,planId:body.planId,result});check();graph.witness.assert();need(new TextEncoder().encode(output).length<=4000000,'RPC_RESPONSE_BOUND');
   return new Response(output,{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}});
  }catch{return new Response(JSON.stringify({category:'NATIVE_BATCH_OUTCOME_UNCONFIRMED',retry:false}),{status:503,headers:{'content-type':'application/json','cache-control':'no-store'}});}
 }});
}
