// No HTTP, credentials or provider actions: exercise the actual pure planner.
const assert=require('node:assert/strict'),path=require('node:path'),{Module}=require('node:module');
(async()=>{
 const p=await import('../scripts/guild-command-plan221.mjs'),old=await import('../scripts/guild-command-plan219.mjs');
 const compiled=require('esbuild').buildSync({entryPoints:[path.join(__dirname,'../src/guild-command-definitions221.ts')],bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text;
 const m=new Module(__filename,module);m.filename=__filename;m.paths=module.paths;m._compile(compiled,__filename);
 const {GUILD_COMMANDS_221:u,ACCOUNT_COMMANDS_221:a,ADMIN_SUBCOMMANDS_221:s}=m.exports;
 const originals=await import('../src/guild-command-definitions219.ts');
 const core=['olympus-admin','olympus-intros','olympus-lookup','verify','verify-status'].map(name=>({type:1,name,description:'Retained '+name,options:name==='olympus-admin'?[{type:1,name:'unbind',description:'Explicit unlink',options:[{type:3,name:'character',description:'Character',required:true}]}]:[],default_member_permissions:name==='olympus-admin'?'268435456':null}));
 core.push({type:2,name:'Olympus linked characters',description:'',default_member_permissions:'268435456'});
 const attributed=rows=>rows.map(r=>({...structuredClone(r),application_id:old.VERIFY_APP219,guild_id:old.ASMON_GUILD219}));
 const before=attributed([...core,...originals.GUILD_COMMANDS_219]);
 const custody={head:'a'.repeat(40),tree:'b'.repeat(40),definitionSHA256:'c'.repeat(64),expectedExistingSHA256:old.digestCommands219(old.normalizeCommands219(before))};
 const prepare=(b=before,utility=u,account=a,sub=s,c=custody)=>p.prepareGuildCommandPlan221(b,utility,account,sub,c);
 const plan=prepare(),echo=attributed(plan.commands);let n=0;
 const check=(name,fn)=>{fn();n++;console.log('PASS '+name);};
 check('19 names preserve all legacy core entries and add only the reviewed namespace',()=>{assert.equal(plan.commands.length,19);assert.ok(!plan.commands.some(r=>r.name==='olympus-qr'));assert.equal(p.verifyGuildCommandReadback221(plan,echo).coreCommandsPreserved,true);});
 check('legacy permissions and subcommands survive; admin receives only release and role-sync',()=>{const admin=plan.commands.find(r=>r.name==='olympus-admin');assert.equal(admin.default_member_permissions,'268435456');assert.deepEqual(admin.options[0],core[0].options[0]);assert.deepEqual(admin.options.slice(1).map(r=>r.name),['release','role-sync']);});
 check('provider IDs, defaults and response order normalize without changing payload custody',()=>{assert.equal(p.verifyGuildCommandReadback221(plan,echo.map((r,i)=>({...r,id:String(i+1),version:'synthetic',nsfw:false})).reverse()).count,19);});
 check('an unexpected existing command or changed body cannot be overwritten',()=>{const b=structuredClone(before);b[0].description+=' changed';assert.throws(()=>prepare(b),/inventory_changed/);assert.throws(()=>prepare(before.slice(1)),/inventory_changed/);});
 check('wrong app and guild fail before planning and readback',()=>{for(const k of ['application_id','guild_id']){const b=structuredClone(before);b[0][k]='1549537348516188200';assert.throws(()=>prepare(b),/destination/);const e=structuredClone(echo);e[0][k]=b[0][k];assert.throws(()=>p.verifyGuildCommandReadback221(plan,e),/destination/);}});
 check('all descriptor names, descriptions and option counts fit Discord limits',()=>{const walk=rows=>{for(const r of rows){assert.ok(r.name.length<=32);assert.ok(r.description.length<=100);assert.ok((r.options??[]).length<=25);if(r.options)walk(r.options);}};walk([...u,...a,...s]);});
 check('global registration scope cannot enter this guild-only plan',()=>{for(const field of ['contexts','integration_types','dm_permission']){const bad=structuredClone(u);bad[0][field]=[];assert.throws(()=>prepare(before,bad),/scope/);}});
 check('duplicate, renamed and oversized definitions fail closed',()=>{assert.throws(()=>prepare(before,[...u,u[0]]),/duplicate/);const bad=structuredClone(u);bad[0].name='olympus-qr';assert.throws(()=>prepare(before,bad),/inventory/);bad[0].description='x'.repeat(101);assert.throws(()=>prepare(before,bad),/text/);});
 check('a changed readback or missing account command is refused',()=>{const bad=structuredClone(echo);bad[0].description+=' changed';assert.throws(()=>p.verifyGuildCommandReadback221(plan,bad),/mismatch/);assert.throws(()=>p.verifyGuildCommandReadback221(plan,echo.slice(1)),/mismatch/);});
 check('altered plan custody cannot pass the verifier',()=>{assert.throws(()=>p.verifyGuildCommandReadback221({...plan,existingSHA256:'0'.repeat(64)},echo),/plan_changed/);assert.throws(()=>p.verifyGuildCommandReadback221({...plan,guildId:'1549537348516188200'},echo),/plan_changed/);});
 console.log(n+'/'+n+' .221 registration plan checks passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
