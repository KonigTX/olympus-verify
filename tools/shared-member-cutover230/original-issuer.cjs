'use strict';
// Exact source-qualified module receiver and own function slots, retained before any await.
function captureOriginalIssuer(module,names){
 const proto=Object.getPrototypeOf(module),slots=names.map(k=>Object.getOwnPropertyDescriptor(module,k));
 if(!slots.every(s=>s&&Object.hasOwn(s,'value')&&typeof s.value==='function'))throw Error('ORIGINAL_ISSUER_REQUIRED');
 const check=()=>{if(Object.getPrototypeOf(module)!==proto)throw Error('ORIGINAL_ISSUER_CHANGED');for(let i=0;i<names.length;i++){const d=Object.getOwnPropertyDescriptor(module,names[i]),s=slots[i];if(!d||!['value','get','set','writable','enumerable','configurable'].every(k=>Object.is(d[k],s[k])))throw Error('ORIGINAL_ISSUER_CHANGED');}};
 check();return Object.freeze({check,call(name,...args){check();const i=names.indexOf(name);if(i<0)throw Error('ORIGINAL_ISSUER_METHOD');const result=Reflect.apply(slots[i].value,module,args);check();return result;}});
}
module.exports={captureOriginalIssuer};
