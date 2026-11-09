'use strict';
// Test-only outer-command selection (.239 CI review, 2026-11-08). The existing
// Native adapter scanner is reused verbatim except returning its final cursor.
// This does not execute SQL or supply production admission/ownership authority.
function originalFixtureCommand(sql) {
  if (typeof sql !== 'string' || sql.length > 1000000 || sql.includes('\0')) throw Error('entry Native SQL command bounds');
  let at=0;
  const fail=()=>{throw Error('entry Native SQL command shape');};
  const skip=()=>{
    for (;;) {
      while (at<sql.length && /\s/.test(sql[at])) at++;
      if (sql.startsWith('--',at)) { const end=sql.indexOf('\n',at+2);at=end<0?sql.length:end+1;continue; }
      if (sql.startsWith('/*',at)) { const end=sql.indexOf('*/',at+2);if(end<0)fail();at=end+2;continue; }
      break;
    }
  };
  const quoted=()=>{
    const open=sql[at++],close=open==='['?']':open;
    while(at<sql.length){if(sql[at++]!==close)continue;if(sql[at]===close){at++;continue;}return;}
    fail();
  };
  const word=()=>{skip();const start=at;while(at<sql.length&&/[A-Za-z0-9_$\u0080-\uffff]/.test(sql[at]))at++;if(at===start)fail();return sql.slice(start,at).toUpperCase();};
  const group=()=>{
    skip();if(sql[at++]!=='(')fail();let depth=1;
    while(at<sql.length){skip();if(at>=sql.length)break;const c=sql[at];
      if(c==="'"||c==='"'||c==='`'||c==='['){quoted();continue;}
      at++;if(c==='('){if(++depth>1024)fail();}else if(c===')'&&--depth===0)return;
    }
    fail();
  };
  const first=word();if(first!=='WITH')return {command:first,withClause:false,afterCommand:at};
  skip();const recursiveAt=at;if(/[A-Za-z0-9_$\u0080-\uffff]/.test(sql[at]||'')){if(word()!=='RECURSIVE')at=recursiveAt;}
  for (;;) {
    skip();if(sql[at]==="'"||sql[at]==='"'||sql[at]==='`'||sql[at]==='[')quoted();else word();
    skip();if(sql[at]==='(')group();
    if(word()!=='AS')fail();skip();
    if(sql[at]!=='('){const modifier=word();if(modifier==='NOT'){if(word()!=='MATERIALIZED')fail();}else if(modifier!=='MATERIALIZED')fail();}
    group();skip();if(sql[at]!==',')break;at++;
  }
  return {command:word(),withClause:true,afterCommand:at};
}
function isRoleSettlementDelete239(sql){
  const found=originalFixtureCommand(sql);
  return found.command==='DELETE'&&/^ FROM role_settlements WHERE(?![A-Za-z0-9_$\u0080-\uffff])/.test(sql.slice(found.afterCommand));
}
module.exports={isRoleSettlementDelete239};
