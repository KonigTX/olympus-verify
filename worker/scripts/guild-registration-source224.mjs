import {verifyGuildCommandReadback224} from './guild-command-plan224.mjs';
/** Generates a short-lived, single-purpose legacy preview. The resulting source
 * includes a private random capability: never write, hash or log that result.
 * It inherits only the existing Discord credential, never downloads it, and is
 * not a production deployment or persistent registration endpoint. */
export function createRegistrationSource224({capability,issuedAt,expiresAt,requestHost,plan}) {
 if(!/^[a-f0-9]{64}$/.test(capability)||!Number.isSafeInteger(issuedAt)||!Number.isSafeInteger(expiresAt)||expiresAt<=issuedAt||expiresAt-issuedAt>180000||!/^olympus-verify\.[a-z0-9-]+\.workers\.dev$/.test(requestHost))throw Error('registration_preview_bounds');
 if(plan?.schema!=='olympus-guild-command-plan224/v1'||plan.applicationId!=='1550176895671341076'||plan.guildId!=='236932545793490944'||plan.expectedCount!==20||!Array.isArray(plan.commands)||plan.commands.length!==20||!Array.isArray(plan.existing)||plan.existing.length!==19||!['head','tree'].every(k=>/^[a-f0-9]{40}$/.test(plan[k]))||!['definitionSHA256','existingSHA256','payloadSHA256'].every(k=>/^[a-f0-9]{64}$/.test(plan[k])))throw Error('registration_preview_plan');
 verifyGuildCommandReadback224(plan,plan.commands.map(r=>({...r,application_id:plan.applicationId,guild_id:plan.guildId})));
 const settings={capability,issuedAt,expiresAt,requestHost,plan};
 return '('+registrationRuntime224.toString()+')('+JSON.stringify(settings)+');\nexport default globalThis.__olympusRegistration224;';
}
function registrationRuntime224({capability,issuedAt,expiresAt,requestHost,plan}) {
 const APP='1550176895671341076',GUILD='236932545793490944',ENDPOINT='https://discord.com/api/v10/applications/'+APP+'/guilds/'+GUILD+'/commands',MAX=500000;
 const commandKeys=['type','name','name_localizations','description','description_localizations','options','default_member_permissions','default_permission','nsfw'];
 const optionKeys=['type','name','name_localizations','description','description_localizations','required','choices','options','channel_types','min_value','max_value','min_length','max_length','autocomplete','file_types'];
 const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
 const digest=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(canonical(v)))))).map(b=>b.toString(16).padStart(2,'0')).join('');
 function option(row,depth=0){
  if(!row||typeof row!=='object'||Array.isArray(row)||depth>2)throw Error('PROVIDER_SHAPE');
  const out=Object.fromEntries(optionKeys.filter(k=>Object.hasOwn(row,k)&&row[k]!==null).map(k=>[k,k==='options'?(Array.isArray(row.options)&&row.options.length<=25?row.options.map(x=>option(x,depth+1)):(()=>{throw Error('PROVIDER_SHAPE')})()):k==='choices'?(Array.isArray(row.choices)&&row.choices.length<=25?row.choices.map(x=>Object.fromEntries(['name','value','name_localizations'].filter(k=>Object.hasOwn(x,k)&&x[k]!==null).map(k=>[k,x[k]]))):(()=>{throw Error('PROVIDER_SHAPE')})()):row[k]]));
  if(out.required===false)delete out.required;if(out.autocomplete===false)delete out.autocomplete;
  for(const k of ['options','choices','channel_types'])if(Array.isArray(out[k])&&!out[k].length)delete out[k];return out;
 }
 function normalize(rows){
  if(!Array.isArray(rows)||rows.length>100||rows.some(r=>!r||r.application_id!==APP||r.guild_id!==GUILD))throw Error('PROVIDER_SCOPE');
  const result=rows.map(row=>{const x=Object.fromEntries(commandKeys.filter(k=>Object.hasOwn(row,k)&&row[k]!==null).map(k=>[k,k==='options'?(Array.isArray(row.options)&&row.options.length<=25?row.options.map(v=>option(v)):(()=>{throw Error('PROVIDER_SHAPE')})()):row[k]]));x.type??=1;if(Array.isArray(x.options)&&!x.options.length)delete x.options;if(x.default_permission===true)delete x.default_permission;if(x.nsfw===false)delete x.nsfw;return x;}).sort((a,b)=>{const x=(a.type??1)+':'+a.name,y=(b.type??1)+':'+b.name;return x<y?-1:x>y?1:0;});
  if(new Set(result.map(r=>(r.type??1)+':'+r.name)).size!==result.length)throw Error('PROVIDER_DUPLICATE');return result;
 }
 async function text(body,limit=MAX){const reader=body?.getReader();if(!reader)throw Error('BODY_MISSING');const decoder=new TextDecoder('utf-8',{fatal:true});let size=0,out='';try{for(;;){const next=await reader.read();if(next.done)break;size+=next.value.byteLength;if(size>limit){await reader.cancel();throw Error('BODY_LIMIT');}out+=decoder.decode(next.value,{stream:true});}return out+decoder.decode();}finally{reader.releaseLock();}}
 const open=()=>Date.now()>=issuedAt-5000&&Date.now()<expiresAt;
 let claimed=false;
 async function provider(method,env){
  if(!open())throw Error('EXPIRED');const token=env?.DISCORD_BOT_TOKEN;
  if(typeof token!=='string'||token.length<21||token.length>4096||/[\r\n]/.test(token))throw Error('SECRET_UNAVAILABLE');
  let response;try{response=await fetch(ENDPOINT,{method,redirect:'manual',signal:AbortSignal.timeout(15000),headers:{Authorization:'Bot '+token,'Content-Type':'application/json'},...(method==='PUT'?{body:JSON.stringify(plan.commands)}:{})});}catch{throw Error(method==='PUT'?'PUT_UNKNOWN':'GET_UNKNOWN');}
  // Never return raw provider errors: no reflected authorization/request details.
  if(response.status!==200){await response.body?.cancel();throw Error(method==='PUT'?'PUT_REFUSED_OR_UNKNOWN':'GET_REFUSED');}
  let parsed;try{parsed=JSON.parse(await text(response.body));}catch{throw Error(method==='PUT'?'PUT_BODY_UNKNOWN':'GET_BODY_UNCONFIRMED');}
  return {raw:parsed,normalized:normalize(parsed)};
 }
 const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
 globalThis.__olympusRegistration224={async fetch(request,env){
  const url=new URL(request.url);
  if(!open()||url.protocol!=='https:'||url.host!==requestHost||url.pathname!=='/commands'||url.search||request.headers.get('X-Olympus-Registration-Capability')!==capability)return new Response(null,{status:404});
  if(!['GET','POST'].includes(request.method))return new Response(null,{status:405});
  try{
   if(await digest(plan.commands)!==plan.payloadSHA256||await digest(plan.existing)!==plan.existingSHA256)throw Error('PLAN_CHANGED');
   if(request.method==='GET'){const r=await provider('GET',env),d=await digest(r.normalized);if(d!==plan.existingSHA256&&d!==plan.payloadSHA256)throw Error('INVENTORY_CHANGED');return json({commands:r.raw,payloadSHA256:d,head:plan.head,tree:plan.tree,definitionSHA256:plan.definitionSHA256});}
   if(claimed)return json({category:'APPLY_ALREADY_CLAIMED',retry:false},409);
   if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type')??''))throw Error('REQUEST_TYPE');
   let input;try{input=JSON.parse(await text(request.body,4096));}catch{throw Error('REQUEST_BODY');}
   if(!input||Array.isArray(input)||Object.keys(input).sort().join(',')!=='definitionSHA256,existingSHA256,head,payloadSHA256,tree'||['definitionSHA256','existingSHA256','head','payloadSHA256','tree'].some(k=>input[k]!==plan[k]))throw Error('REQUEST_CUSTODY');
   // Set before the first await in this attempt. The local owner operation also
   // spends a durable CreateNew intent before its single POST; no automatic retry.
   claimed=true;
   const current=await provider('GET',env);if(await digest(current.normalized)!==plan.existingSHA256)throw Error('ACTIONTIME_INVENTORY_CHANGED');
   if(!open())throw Error('EXPIRED');
   const accepted=await provider('PUT',env);if(await digest(accepted.normalized)!==plan.payloadSHA256)throw Error('PUT_READBACK_MISMATCH');
   return json({outcome:'acknowledged',putAcknowledgement:accepted.raw,payloadSHA256:plan.payloadSHA256,publicMessagesCreated:0});
  }catch(error){const category=/^[A-Z][A-Z0-9_]+$/.test(error?.message??'')?error.message:'STATIC_REGISTRATION_FAILURE';return json({category,retry:false},409);}
 }};
}
