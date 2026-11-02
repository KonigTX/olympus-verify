'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const b=fs.readFileSync(path.join(__dirname,'../docs/governance-roles222.json')),sha=v=>crypto.createHash('sha256').update(v).digest('hex');
if(sha(b)!=='6bfda2e25bdffe9ec68ff03b9ba217b7c9e3d0080aa2ee2314851fc36e516237')throw Error('Finite role222 manifest changed');
const m=JSON.parse(b);
function originalTerms222(terms){
 if(!Array.isArray(terms)||![95,96,101,102].includes(terms.length)||terms.some((t,i)=>t.ordinal!==i+1)||terms.filter(t=>t.officeKey==='office_03').length!==1||terms.filter(t=>t.officeKey==='office_102').length!==(terms.length===102?1:0)||JSON.stringify(terms.find(t=>t.officeKey==='office_03'))!==JSON.stringify(m.afterArchitect)||(terms.length===102&&JSON.stringify(terms.find(t=>t.officeKey==='office_102'))!==JSON.stringify(m.addedPropaganda)))throw Error('Role222 exceeds its two exact authorized records');
 return terms.filter(t=>t.officeKey!=='office_102').map(t=>t.officeKey==='office_03'?structuredClone(m.beforeArchitect):t);
}
module.exports={originalTerms222};
