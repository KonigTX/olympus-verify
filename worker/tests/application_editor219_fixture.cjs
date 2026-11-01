// Upgrade selected HTTP fixture clients to the current applicant editor: open a
// genuine own view and carry its token. Does not mint a cookie, proof or token.
// Explicit token/stale/legacy-refusal tests call the Worker directly instead.
exports.applicationEnvelope219=async(body,ownView)=>{
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.hasOwn(body,'consentOnly')||Object.hasOwn(body,'editToken'))return body;
 const view=await ownView();
 if(!view||!view.application)return {...body,editToken:null};
 if(typeof view.application.editToken!=='string')throw Error('current_application_fixture_own_view');
 return {...body,editToken:view.application.editToken};
};
exports.currentApplicationCall219=original=>async function(method,path,options={}){
 if(method==='PUT'&&path==='/api/application'&&options.who){
  options={...options,body:await exports.applicationEnvelope219(options.body,async()=>{
   const response=await original('GET','/api/me',{who:options.who,host:options.host});
   return response.status===200?response.json():null;
  })};
 }
 return original(method,path,options);
};
