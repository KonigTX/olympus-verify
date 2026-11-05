'use strict';
// Static inverse for the reviewed guide copy change in 70fd78d. Callers
// execute current interactions.ts; these bytes only recover the SEN-01 input.
const {createHash}=require('node:crypto');
const sha=value=>createHash('sha256').update(value).digest('hex');
const edits=[
 [
  'import { GUIDE_FIELD, GUIDE_MODAL, GUIDE_STATUS, GUIDE_VERIFY, guideMessage, usesLegacyInviteQueue, verifyModal, visitorChat } from "./guide";\n',
  'import { GUIDE_FIELD, GUIDE_MODAL, GUIDE_STATUS, GUIDE_VERIFY, guideMessage, verifyModal, visitorChat } from "./guide";\n',
 ],
 [
  '  await editMessage(env, channel, mine[0].id, guideMessage(env, snapshot.profile, freshGrantText(lane), await usesLegacyInviteQueue(env)));\n',
  '  await editMessage(env, channel, mine[0].id, guideMessage(env, snapshot.profile, freshGrantText(lane)));\n',
 ],
 [
  '        const msg = await postMessage(env, channel, guideMessage(env, snapshot.profile, freshGrantText(lane), await usesLegacyInviteQueue(env)));\n',
  '        const msg = await postMessage(env, channel, guideMessage(env, snapshot.profile, freshGrantText(lane)));\n',
 ],
];
function originalGuideInteractions(raw){
 if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return null;
 if(Buffer.byteLength(raw)!==68164||sha(raw)!=='d0518919909c436b8bd5d009e00352079392f49200e2e22a6f23aed1dc02e1bd')return null;
 let source=raw.toString('utf8');
 for(const [after,before] of edits){
  if(source.split(after).length!==2)return null;
  source=source.replace(after,before);
 }
 return Buffer.byteLength(source)===68073&&sha(source)==='06e66e9eaa284b6fb29b9e73f164d96ee2dc9fe01ef1d8dbf5d638f238f0b953'?source:null;
}
module.exports=Object.freeze({originalGuideInteractions});
