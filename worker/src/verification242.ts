/** Authenticated web verification service. Session and CSRF admission belong to
 * the existing site route; no Discord interaction or character proof is forged. */
import type {Env} from './env';
import {requestCharacterCode242} from './interactions';
import {readPrivacySubject,privacyBoundSubjectEnv} from './privacy-serving-authority';
import {ownRoleStatus242,requestRoleReconciliation242,kickRoleWork242,type RoleWorkDefer242} from './role-reconcile242';

export type VerificationUser242={id:string;username?:string;global_name?:string|null};
const answer=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store, no-transform'}});
export async function handleSiteVerification242(request:Request,env:Env,user:VerificationUser242,defer?:RoleWorkDefer242):Promise<Response>{
 if(!user||!/^[1-9][0-9]{16,19}$/.test(user.id))return answer({error:'authentication_required'},401);
 const capture=await readPrivacySubject(env,user.id);
 if(capture&&capture.state!=='active')return answer({error:'account_held'},403);
 env=privacyBoundSubjectEnv(env,user.id,capture);
 if(request.method==='GET')return answer(await ownRoleStatus242(env,user.id));
 if(request.method!=='POST')return answer({error:'method_not_allowed'},405);
 const raw=await request.text();if(raw.length>1024)return answer({error:'body_too_large'},413);
 let input:{action?:unknown;character?:unknown};try{input=JSON.parse(raw);}catch{return answer({error:'bad_json'},400);}
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>k!=='action'&&k!=='character'))return answer({error:'bad_body'},400);
 if(input.action==='refresh'){
  await requestRoleReconciliation242(env,user.id,'authenticated_web_refresh');
  defer?.('web_role242',()=>kickRoleWork242(env,'requests'));
  return answer({status:'queued',content:'Your existing verified links are being checked against the current trusted roster. A name or snapshot alone cannot verify a new account.'});
 }
 if(input.action!==undefined&&input.action!=='request'||typeof input.character!=='string'||input.character.length>64)return answer({error:'full_character_name_required',content:'Enter your full in-game name as First Last.'},400);
 const response=await requestCharacterCode242(env,user,input.character);
 const message=await response.json() as {data?:{content?:string}};
 defer?.('web_role242',()=>kickRoleWork242(env,'requests'));
 return answer({content:message.data?.content??'The verification request could not be completed.'},response.status);
}
