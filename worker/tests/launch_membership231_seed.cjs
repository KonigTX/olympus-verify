'use strict';
// A fresh, synthetic pre-seal snapshot from the existing real-source fixture.
// Separate process: its SQLite fixture clock cannot replace Workerd's real clock.
const fs=require('node:fs'),path=require('node:path'),{Module}=require('node:module'),assert=require('node:assert/strict');
const file=path.join(__dirname,'launch_membership230_native_test.cjs'),out=process.argv[2];
assert(path.isAbsolute(out)&&!fs.existsSync(out),'fresh_absolute_seed_required');let source=fs.readFileSync(file,'utf8');
const start=' let code=await fresh(),reply=await invoke(code);',stop=" load('./privacy-access-history');";
assert.equal(source.split(start).length,2);assert.equal(source.split(stop).length,2);
source=source.replace(start,' let code=await fresh();globalThis.__seed231(db,env,code,T);let reply=await invoke(code);')
 .replace(stop," globalThis.__seed231Complete(reply,rows());db.close();return;\n"+stop);
globalThis.__seed231=(db,env,code,now)=>{
 const objects=db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE sql IS NOT NULL ORDER BY CASE type WHEN 'table' THEN 0 WHEN 'index' THEN 1 ELSE 2 END,name").all(),tables=[];
 for(const t of objects.filter(x=>x.type==='table'&&!x.name.startsWith('sqlite_'))){const rows=db.prepare('SELECT * FROM "'+t.name.replaceAll('"','""')+'"').all();if(rows.length)tables.push({name:t.name,rows});}
 const config=Object.fromEntries(Object.entries(env).filter(([k,v])=>k!=='DB'&&['string','number','boolean'].includes(typeof v)));
 fs.writeFileSync(out,JSON.stringify({schema:'launch231-synthetic-preverify-seed-v1',synthetic:true,now,code,config,objects,tables},null,2)+'\n',{flag:'wx'});
};
globalThis.__seed231Complete=(reply,rows)=>{assert.equal(reply.status,200);assert.equal(reply.body.roleGranted,true);assert(rows.some(r=>r.reason==='launch230_put_acknowledged_and_confirmed'));};
const m=new Module(file,module);m.filename=file;m.paths=module.paths;m._compile(source,file);
