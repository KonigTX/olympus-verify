/** Private, read-only guild navigation. Every interaction uses the existing
 * original-account/privacy fence; no hub state or interaction token is stored. */
import type { Env } from './env';
import type { Interaction } from './discord';
import { now } from './db';
import { destination } from './community-event-delivery';
import { guildActorBatch219, type GuildActor219 } from './guild-command-authority219';
import { guideLookup219, workshopLookup219, referenceLookup219, safeDiscordText219, type GuildEmbed219 } from './guild-utilities219';
import type { HubAnswer222, HubRow222 } from './raid-hub222';
import { siteMemberLink } from './site-return';
import { CLASSES, classDisplayChoices } from './site-data';

const CID=/^o224:([0-9]{17,20}):([0-9]{10}):([a-z]{2,16})$/;
const SECTIONS=[['status','Verification & character status'],['guides','Forever guides & preparation'],['workshop','Workshop crafters & recipes'],['branches','Branch capacity & launch'],['council','Council, ranks & applications'],['treasury','Treasury & Stockades appeals']] as const;
const controlDeadlines=new WeakMap<GuildActor219,number>();
const id=(a:GuildActor219,action:string)=>`o224:${a.id}:${controlDeadlines.get(a)??a.deadline}:${action}`;
const button=(a:GuildActor219,label:string,action:string)=>({type:2 as const,style:2,label,custom_id:id(a,action)});
const link=(label:string,url:string)=>({type:2 as const,style:5,label,url});
const row=(...components:HubRow222['components']):HubRow222=>({type:1,components});
export const isOlympusHub224=(i:Interaction)=>i.type===2&&i.data?.name==='olympus'||[3,5].includes(i.type)&&(i.data?.custom_id??'').startsWith('o224:');
function action(i:Interaction,a:GuildActor219):string {
 if(i.type===2)return 'home';
 const m=CID.exec(i.data?.custom_id??'');
 if(!m||m[1]!==a.id||Number(m[2])<=now()||Number(m[2])>a.deadline)throw Error('This private control expired. Run /olympus for a fresh hub.');
 controlDeadlines.set(a,Number(m[2]));
 return m[3]!;
}
function selected(i:Interaction):string {
 if(i.type!==3||i.data?.component_type!==3||i.data.values?.length!==1||typeof i.data.values[0]!=='string')throw Error('Choose one current option.');
 return i.data.values[0];
}
function field(i:Interaction,key:string,max:number):string {
 const rows=i.data?.components;
 if(i.type!==5||!Array.isArray(rows)||rows.length!==1||rows[0]?.type!==1||rows[0].components?.length!==1)throw Error('The form is incomplete.');
 const f=rows[0].components[0];
 if(f?.type!==4||f.custom_id!==key||typeof f.value!=='string'||f.value.length>max||/[\u0000-\u001f\u007f]/.test(f.value))throw Error('Use the current form and its stated length limit.');
 return f.value.trim();
}
export function olympusModal224(i:Interaction,a:GuildActor219):unknown|null {
 if(i.type!==3)return null;
 const p=action(i,a),spec=p==='talent'?['talents','Preview a talent build','build','Olympus talent code or site share URL',512]:p==='findcrafter'?['crafters','Find an opted-in crafter','query','Recipe, profession or crafter',60]:null;
 if(!spec)return null;
 return {type:9,data:{custom_id:id(a,String(spec[0])),title:spec[1],components:[{type:1,components:[{type:4,custom_id:spec[2],label:spec[3],style:1,max_length:spec[4],required:true}]}]}};
}
export async function olympusHub224(env:Env,a:GuildActor219,i:Interaction):Promise<HubAnswer222> {
 let p=action(i,a);const host=destination(env)!.host,base='https://'+host;
 const open=(route:string)=>siteMemberLink(host,route);
 if(p==='section'){p=selected(i);if(!SECTIONS.some(([v])=>v===p))throw Error('Choose one current hub section.');}
 let embeds:GuildEmbed219[]=[];const components:HubRow222[]=[];
 if(p==='home'){
  embeds=[{title:'Olympus · your guild hub',description:'Choose a section below. These replies are private. Existing commands, including /raid, remain available. No invitation, role change, payment, appeal decision or game action is performed here.',footer:{text:'Controls expire after three minutes. Your account and server eligibility are checked again on every interaction.'+(a.verification==='bot-owner'?' Owner access does not verify a character or grant any role.':'')}}];
 }else if(p==='status'){
  const out=await guildActorBatch219(env,a,[env.DB.prepare('SELECT name,status FROM characters WHERE discord_id=?1 ORDER BY name_key LIMIT 11').bind(a.id)]);
  const chars=out[0]!.results as unknown as {name:string;status:string}[];
  embeds=[{title:'Your verification & character status',url:base+'/#/',description:chars.length?chars.slice(0,10).map(c=>safeDiscordText219(c.name,40)+' — '+safeDiscordText219(c.status,20)).join('\n'):'No linked characters are currently recorded for this account.',fields:[{name:'Verify a character',value:'Run /verify for the existing officer-attested verification workflow. This hub issues no code and grants no role. Stored beta records are historical, not proof of current launch membership.'}],footer:{text:(chars.length>10?'First10 records shown. ':'')+'Only your own current account is read. Open the website or /olympus-status for the complete status view.'}}];
  components.push(row(link('My guild account',base+'/#/'),link('Account & privacy controls',base+'/#/data')));
 }else if(p==='guides'){
  embeds=[{title:'Forever guides & preparation',url:open('resources'),description:'Choose a class for its current guide, decode an Olympus talent build, or open the profession and raid-preparation tools. Every fact shows its source grade; pinned data comes from the beta, and the released game can differ.'}];
  components.push(row({type:3,custom_id:id(a,'class'),placeholder:'Choose your class',min_values:1,max_values:1,options:classDisplayChoices().map(({name,value})=>({label:name,value}))}));
  components.push(row(button(a,'Decode talent build…','talent'),button(a,'Consumable checklist','consumes'),link('Professions',open('resources')),link('Attunement checklist',open('guides/tools/attunements'))));
 }else if(p==='class'){
  const cls=selected(i);if(!CLASSES.some(c=>c.key===cls))throw Error('Choose one of the nine classes.');embeds=[await guideLookup219(env,a,'class',{class:cls})];
 }else if(p==='talents')embeds=[await guideLookup219(env,a,'talent',{build:field(i,'build',512)})];
 else if(p==='consumes')embeds=[await guideLookup219(env,a,'consumes',{})];
 else if(p==='workshop'){
  embeds=[await workshopLookup219(env,a,'',1)];
  components.push(row(button(a,'Find a crafter or recipe…','findcrafter'),link('Workshop directory',open('community/workshop'))));
 }else if(p==='crafters')embeds=[await workshopLookup219(env,a,field(i,'query',60),1)];
 else if(p==='branches'){
  embeds=[await referenceLookup219(env,a,'branches'),await referenceLookup219(env,a,'launch')];
  components.push(row(link('Olympus / Olympus I–X capacity',open('army')),link('Launch & admission',base+'/#/')));
 }else if(p==='council'){
  embeds=[await referenceLookup219(env,a,'council')];
  components.push(row(link('Ranks & duties',open('roles')),link('Organization chart',open('organization')),link('Open applications',open('apply')),link('Application board',open('vote'))));
 }else if(p==='treasury'){
  embeds=[await referenceLookup219(env,a,'treasury'),await referenceLookup219(env,a,'stockades')];
  components.push(row(link('Treasury charter',open('governance')),link('Appeal rules',open('governance'))));
 }else throw Error('This private control is unavailable. Run /olympus for a fresh hub.');
 components.push(row({type:3,custom_id:id(a,'section'),placeholder:'Open another Olympus section',min_values:1,max_values:1,options:SECTIONS.map(([value,label])=>({value,label}))}));
 components.push(row(button(a,'Guild hub home','home'),link('Open Olympus',base+'/#/')));
 if((controlDeadlines.get(a)??a.deadline)<=now())throw Error('This private control expired. Run /olympus for a fresh hub.');
 return {embeds,components};
}
