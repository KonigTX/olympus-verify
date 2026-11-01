/** A commission drafting aid, not an order ledger, payment or notification.
 * The signed command's existing current-account fence still wraps its reply. */
import type { Env } from './env';
import { communityFeatures } from './community-context';
import { destination } from './community-event-delivery';
import { safeDiscordText219, type GuildEmbed219 } from './guild-utilities219';

export function workshopOrderDraft221(env:Env,v:Record<string,unknown>):GuildEmbed219 {
 if(!communityFeatures(env).has('crafting'))throw Error('The guild Workshop is switched off.');
 const clean=(value:unknown,max:number,required=false):string=>{
  if(value===undefined&&!required)return '';
  if(typeof value!=='string')throw Error('Use plain text for the commission details.');
  const text=value.normalize('NFC').trim();
  if(text.length>max||(required&&text.length<2)||/[\u0000-\u001f\u007f]/.test(text))throw Error('Check the commission text and its field limits.');
  return safeDiscordText219(text,max*2);
 };
 const recipe=clean(v.recipe,60,true),when=clean(v.when,80),materials=clean(v.materials,160);
 if(!Number.isSafeInteger(v.quantity)||Number(v.quantity)<1||Number(v.quantity)>1000)throw Error('Choose a whole quantity from 1 to 1,000.');
 return {title:'Commission request · draft',url:'https://'+destination(env)!.host+'/#/community/workshop',
  description:'Your request has not been sent. Choose an opted-in crafter in the Workshop, review this draft and agree availability, materials and any permitted in-game-gold fee before sending it yourself.',
  fields:[{name:'Recipe / item',value:recipe},{name:'Quantity',value:String(v.quantity)},
   {name:'Proposed timing',value:when||'To agree with the crafter'},
   {name:'Materials supplied',value:materials||'To agree with the crafter'},
   {name:'Before handing over materials',value:'Confirm the item, quantity, recipient, materials, any fee and delivery plan. Listings are self-reported; check recipe availability directly.'}],
  footer:{text:'Private draft only. No order was stored, no crafter was notified, and no gold, escrow, role or bank action occurred.'}};
}
