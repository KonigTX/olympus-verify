// Run the maintained actual-source Native rank/HTTP worst cases WITH the selected
// launch scope, including the additional final original-source admission read.
const fs227=require('node:fs'),path227=require('node:path'),{Module:Module227}=require('node:module');
let source227=fs227.readFileSync(path227.join(__dirname,'role_rank_continuation_test.cjs'),'utf8');
const replacements227=[
  ["VALUES(?,?,?,'test',10,'test',1,1)","VALUES(?,?,?,?,10,'test',1,1)"],
  ['.run(id,clock,clock)','.run(id,clock,clock,scopedProvenance227)'],
  ['env={DB:','env={VERIFY_MEMBERSHIP_ONLY:\'true\',VERIFY_NATIVE_SCOPE:scopedPin227,DB:'],
];
for(const [before,after]of replacements227){if(source227.split(before).length!==2)throw Error('maintained scoped rank fixture boundary changed: '+before);source227=source227.replace(before,after);}
const setup227="const scopedPin227=JSON.stringify({version:1,guild:'Olympus',realm:'Fixture Live Realm'}),scopedProvenance227='addon-native-v1:'+scopedPin227;\n";
const compiled227=new Module227(__filename,module);compiled227.filename=__filename;compiled227.paths=module.paths;
compiled227._compile(setup227+source227,__filename);
