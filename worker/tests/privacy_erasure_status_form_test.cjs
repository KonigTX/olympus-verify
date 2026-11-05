// Actual form and JSON routes with the established synthetic Native provider and database.
const { runNativeErasureFixture } = require('./helpers/registered_native_erasure_fixture.cjs');

runNativeErasureFixture(async function review() {
async function accountForm(f,route,session){
 const page=await f.call('GET','/privacy/account',{cookie:session}),html=await page.text();
 const body=html.split('<form method="post" action="'+route+'">')[1].split('</form>')[0];
 const form=Object.fromEntries([...body.matchAll(/<input type="hidden" name="([^"]+)" value="([^"]+)">/g)].map(([,k,v])=>[k,v]));
 const cookie=Object.entries(cookies(page)).map(([k,v])=>k+'='+v).concat(session?[session]:[]).join('; ');
 return {form,cookie,html};
}
async function erasureStatusForms(){
 const statusPath='/privacy/account/erasure-status',erasePath='/privacy/account/full-erase';
 const unavailable='No erasure request matches this ID and private code. After erasure, use the private status code saved with the request.';
 const f=fixture();
 try{
  const session=await f.signIn(ID),{form,cookie,html}=await accountForm(f,statusPath);
  const signedInForm=await accountForm(f,statusPath,session);
  const out=await request(f,session),token=out.body.statusToken;
  assert.equal(out.response.status,202);assert.ok(token);
  const job=await finish(f);
  assert.equal(job?.state,'complete');assert.equal(f.raw('SELECT 1 FROM site_users WHERE discord_id=?',ID),undefined);
  const post=(operationId,statusToken,entry={form,cookie})=>f.call('POST',statusPath,{cookie:entry.cookie,form:{...entry.form,operationId,statusToken}});
  const wrongToken=token.replace(/\.([A-Za-z0-9_-])/,(_,first)=>'.'+(first==='A'?'B':'A'));
  const before=JSON.stringify(job),providerCalls=f.http.length;
  const mismatches=[
   ['other ID with the original code','e'.repeat(32),token],['wrong MAC',OP,wrongToken],
   ['malformed operation ID','not-an-id',token],['missing code without the original session',OP,''],
   ['unknown operation with no code','e'.repeat(32),''],
   ['malformed code',OP,'bad code'],['oversized code',OP,'s'.repeat(1025)]
  ];
  const cleanBody=value=>value.replace(/(<input type="hidden" name="csrf" value=")[^"]+(">)/,'$1[csrf]$2');
  let originalRefusal;
  for(const [label,operationId,statusToken]of mismatches){
   const formReply=await post(operationId,statusToken),text=await formReply.text();
   const apiReply=await f.call('POST','/api/me/erasure/status',{body:{operationId,...(statusToken?{statusToken}:{})}});
   check(label+' returns uniform 404 in both normal routes',formReply.status===404&&apiReply.status===404&&(await json(apiReply))?.error==='not_found');
   const body=cleanBody(text);
   if(originalRefusal===undefined)originalRefusal=body;
   check(label+' status form discloses no identifier, token or completion',body===originalRefusal&&text.includes(unavailable)&&!text.includes(operationId)&&(!statusToken||!text.includes(statusToken))&&!text.includes('Serving account records were erased')&&formReply.headers.get('Cache-Control').includes('no-store'));
  }
  check('status form distinguishes basic status from a completion claim',html.includes('Use the original session for basic status. Confirming completion requires the private status code.'));
  const valid=await post(OP,token),validHtml=await valid.text(),apiReply=await f.status(OP,token),api=await json(apiReply);
  check('genuine code still confirms only local completion in both routes after deletion',valid.status===200&&validHtml.includes('<strong>complete</strong>')&&validHtml.includes('does not mean every copy was erased')&&apiReply.status===200&&api?.servingLocalErased===true&&api.allCopiesErased===false);
  check('the completed read retains only the original body code and no personal details or provider action',validHtml.includes('<pre class="privacy-status-code">'+token+'</pre>')&&!validHtml.includes(ID)&&!validHtml.includes('native-owner')&&!valid.url.includes(token)&&api.statusToken===token&&api.statusExpires===job.retain_until&&f.http.length===providerCalls&&JSON.stringify(f.raw('SELECT * FROM privacy_serving_jobs WHERE operation_id=?',OP))===before);
  const withoutCode=await post(OP,'',signedInForm),noCodeHtml=await withoutCode.text();
  const withoutCodeApi=await f.call('POST','/api/me/erasure/status',{cookie:session,body:{operationId:OP}}),noCodeJson=await json(withoutCodeApi);
  check('original signed cookie sees the completed job without claiming completion or reviving the account',withoutCode.status===200&&noCodeHtml.includes('Completion can be confirmed only with your private status code.')&&!noCodeHtml.includes('The request is queued or held')&&!noCodeHtml.includes('Serving account records were erased')&&!noCodeHtml.includes('<pre class="privacy-status-code">')&&(await f.call('GET','/api/me',{cookie:session})).status===401);
  check('no-proof status preserves the original conservative JSON contract',withoutCodeApi.status===200&&noCodeJson?.state==='held'&&noCodeJson?.holdReason==='independent_suppression_status_unconfirmed'&&noCodeJson?.servingAccountErased===false&&noCodeJson?.statusToken==='');
  f.failSql=sql=>sql.startsWith('SELECT state,hold_reason,staff_access,request_digest');
  const failedRead=await post(OP,token),failedReadHtml=await failedRead.text();
  check('an actual unknown read outcome remains 503 and never reflects submitted proof',failedRead.status===503&&failedReadHtml.includes('Outcome not confirmed')&&!failedReadHtml.includes(token));
  f.failSql=null;
  clock=job.retain_until;
  const expired=await post(OP,token,await accountForm(f,statusPath)),expiredApi=await f.status(OP,token);
  check('expired original code gives the same uninformative 404 in both routes',expired.status===404&&cleanBody(await expired.text())===originalRefusal&&expiredApi.status===404&&(await json(expiredApi))?.error==='not_found');
 }finally{f.close();}
 const lost=fixture();
 try{
  const session=await lost.signIn(ID),entry=await accountForm(lost,erasePath,session);
  lost.loseAdmission=true;
  lost.failSql=sql=>lost.admissionReplyLost&&sql.startsWith('SELECT state,hold_reason,staff_access,request_digest');
  const reply=await lost.call('POST',erasePath,{cookie:entry.cookie,form:{...entry.form,confirm:'erase'}}),text=await reply.text();
  const job=lost.raw('SELECT state FROM privacy_serving_jobs WHERE operation_id=?',entry.form.operationId);
  check('lost committed erasure admission still returns 503 and preserves the original operation ID',reply.status===503&&job?.state==='waiting_role'&&text.includes(entry.form.operationId)&&text.includes('do not submit a different erasure request')&&!text.includes('<pre class="privacy-status-code">')&&!text.includes(unavailable));
 }finally{lost.close();}
}

 await erasureStatusForms();
 console.log(`${checks}/${checks} erasure status form checks passed`);
}, { lostAdmission: true }).catch(error=>{console.error(error);process.exitCode=1;});
