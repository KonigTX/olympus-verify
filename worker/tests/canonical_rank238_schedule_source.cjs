'use strict';
// Static historical-AST oracle only. Never used by a source loader or runtime handler.
const crypto=require('node:crypto'),assert=require('node:assert/strict');
const WINDOWS=[
  {
    "from": "import {EPOCH2_SCHEDULE_QUALIFIED,captureOriginalRosterSchedule,originalRosterScheduleFacts,type OriginalRosterSchedule} from './scheduled-budget';",
    "to": "import {EPOCH2_SCHEDULE_QUALIFIED,CANONICAL_RANK_SCHEDULE_QUALIFIED,CANONICAL_RANK_PASS_STATEMENTS,CANONICAL_RANK_SCHEDULE_HTTP,captureOriginalRosterSchedule,originalRosterScheduleFacts,type OriginalRosterSchedule} from './scheduled-budget';\nimport {captureCanonicalRankConfig233} from './canonical-ranks233';"
  },
  {
    "from": "const resetMinute=scheduled.cron===BETA_RESET_CRON;\n      // An inactive minute callback captures only its original controller/context; it starts no database or provider work.\n      if(resetMinute&&!resetGuardEnabled(env))return;",
    "to": "const resetMinute=scheduled.cron===BETA_RESET_CRON,canonical=resetMinute?captureCanonicalRankConfig233(env):null;\n      const canonicalMinute=resetMinute&&canonical!.present;\n      const beta=canonicalMinute?scheduledDescriptor(env,'BETA_RESET_REMOVALS_ENABLED'):undefined,native=canonicalMinute?scheduledDescriptor(env,'PRIVACY_NATIVE_ERASURE_ENABLED'):undefined;\n      const canonicalCheck=()=>{if(!canonicalMinute)return;const currentBeta=scheduledDescriptor(env,'BETA_RESET_REMOVALS_ENABLED');\n        if(!canonical||canonical.mode!=='enabled'||!canonical.current()||!native||!scheduledHasOwn(native,'value')||native.value!=='true'||!scheduledSame(scheduledDescriptor(env,'PRIVACY_NATIVE_ERASURE_ENABLED'),native)||!admission||admission.value!=='true'||!scheduledSame(scheduledDescriptor(env,'PRIVACY_WRITE_ADMISSION_ENABLED'),admission))throw new PrivacyWriteAdmissionHeld('canonical_rank_minute_native_configuration_held');\n        if(beta?!scheduledHasOwn(beta,'value')||!scheduledSame(currentBeta,beta)||beta.value!==undefined&&beta.value!=='false':currentBeta!==undefined||'BETA_RESET_REMOVALS_ENABLED'in env)throw new PrivacyWriteAdmissionHeld('canonical_rank_minute_beta_collision_or_drift');\n      };\n      // Inactive historical minute remains zero-work; two selected producer purposes never override each other.\n      if(resetMinute&&!canonicalMinute&&!resetGuardEnabled(env))return;\n      canonicalCheck();\n      if(canonicalMinute&&!CANONICAL_RANK_SCHEDULE_QUALIFIED)throw new PrivacyWriteAdmissionHeld('canonical_rank_minute_requires_current_native_qualification');"
  },
  {
    "from": "if(resetMinute&&!BETA_RESET_SCHEDULE_QUALIFIED)",
    "to": "if(resetMinute&&!canonicalMinute&&!BETA_RESET_SCHEDULE_QUALIFIED)"
  },
  {
    "from": "const check=()=>{originalScheduledCallback(original,event,ctx);};\n      const constraint=resetMinute?scheduledFreeze({binding:scheduled.binding,check,costMode:'beta_reset' as const}):scheduledFreeze({binding:scheduled.binding,check});",
    "to": "const check=()=>{originalScheduledCallback(original,event,ctx);canonicalCheck();};\n      const constraint=canonicalMinute?scheduledFreeze({binding:scheduled.binding,check,costMode:'canonical_rank' as const}):resetMinute?scheduledFreeze({binding:scheduled.binding,check,costMode:'beta_reset' as const}):scheduledFreeze({binding:scheduled.binding,check});"
  },
  {
    "from": "return resetMinute?runSourceBetaResetScheduledBody(globalEntry.env,ctx,roleDispatch):runSourceEpoch2ScheduledBody(globalEntry.env,ctx,undefined,roleDispatch,roleSliceCost,newsSliceCost);",
    "to": "return canonicalMinute?runSourceCanonicalRankScheduledBody(globalEntry.env,ctx,check):resetMinute?runSourceBetaResetScheduledBody(globalEntry.env,ctx,roleDispatch):runSourceEpoch2ScheduledBody(globalEntry.env,ctx,undefined,roleDispatch,roleSliceCost,newsSliceCost);"
  },
  {
    "from": "/** Original minute body only; the exported callback retains each schedule's qualification guard.",
    "to": "/** .238 canonical-only minute. Same original callback/cost context and Native issuer;\n * its own388 budget cannot borrow from the unchanged ordinary700/role120 slice. */\nasync function runSourceCanonicalRankScheduledBody(env:Env,ctx:ExecutionContext,check:()=>void):Promise<void>{\n check();assertGlobalServingDispatch(env);env=writeAdmissionEnv(env);\n if(!nativeErasureMode(env)||!isPrivacyWriteAdmissionDatabase(env.DB))throw new PrivacyWriteAdmissionHeld('canonical_rank_minute_native_required');\n const lane=captureLaneConfig(env);if(lane.native232?.mode!=='enabled'||!lane.current())throw new PrivacyWriteAdmissionHeld('canonical_rank_minute_lane_held');\n await ensureSchema(env);check();if(!lane.current())throw new PrivacyWriteAdmissionHeld('canonical_rank_minute_lane_changed');\n deferOriginalServing(ctx,'runCanonicalRankPass',async()=>{check();\n  const pass=await import('./full-release-pass');check();\n  const count={used:0},counted=countStatements(env,count),calls=callBudget(counted);calls.limit=Math.min(calls.limit,CANONICAL_RANK_SCHEDULE_HTTP);\n  await pass.runFreshPass(counted,{calls,adm:pass.nativeAdmission232(count,CANONICAL_RANK_PASS_STATEMENTS)},'scheduled',lane);check();\n });\n}\n\n/** Original minute body only; the exported callback retains each schedule's qualification guard."
  },
  {
    "from": "CANONICAL_RANK_SCHEDULE_QUALIFIED,CANONICAL_RANK_PASS_STATEMENTS,CANONICAL_RANK_SCHEDULE_HTTP",
    "to": "CANONICAL_RANK_SCHEDULE_QUALIFIED,CANONICAL_RANK_CHILD_STATEMENTS,CANONICAL_RANK_SCHEDULE_HTTP"
  },
  {
    "from": "* its own388 budget cannot borrow from the unchanged ordinary700/role120 slice.",
    "to": "* its own390 child budget cannot borrow from the unchanged ordinary700/role120 slice."
  },
  {
    "from": "deferOriginalServing(ctx,'runCanonicalRankPass',async()=>{check();\n  const pass=await import('./full-release-pass');check();\n  const count={used:0},counted=countStatements(env,count),calls=callBudget(counted);calls.limit=Math.min(calls.limit,CANONICAL_RANK_SCHEDULE_HTTP);\n  await pass.runFreshPass(counted,{calls,adm:pass.nativeAdmission232(count,CANONICAL_RANK_PASS_STATEMENTS)},'scheduled',lane);check();",
    "to": "deferOriginalServing(ctx,'runCanonicalRankPass',async()=>{check();\n  const count={used:0},counted=countStatements(env,count);\n  // Scheduling hint only: never stamp an attempt against expired Native evidence.\n  const latest=await counted.DB.prepare(\"SELECT CAST(strftime('%s','now') AS INTEGER) AS at,exported_at,complete,trusted FROM roster_snapshots WHERE id=(SELECT MAX(id) FROM roster_snapshots)\").first<{at:number;exported_at:number;complete:number;trusted:number}>();check();\n  if(!latest||!Number.isSafeInteger(latest.at)||latest.at<1||!Number.isSafeInteger(latest.exported_at)||latest.exported_at<1||latest.exported_at>latest.at||latest.at-latest.exported_at>=600||latest.complete!==1||latest.trusted!==1)return;\n  const pass=await import('./full-release-pass');check();\n  const calls=callBudget(counted);calls.limit=Math.min(calls.limit,CANONICAL_RANK_SCHEDULE_HTTP);\n  await pass.runFreshPass(counted,{calls,adm:pass.nativeAdmission232(count,CANONICAL_RANK_CHILD_STATEMENTS)},'scheduled',lane);check();"
  },
  {
    "from": "const beta=canonicalMinute?scheduledDescriptor(env,'BETA_RESET_REMOVALS_ENABLED'):undefined,native=canonicalMinute?scheduledDescriptor(env,'PRIVACY_NATIVE_ERASURE_ENABLED'):undefined;",
    "to": "const beta=canonicalMinute?scheduledDescriptor(env,'BETA_RESET_REMOVALS_ENABLED'):undefined,native=canonicalMinute?scheduledDescriptor(env,'PRIVACY_NATIVE_ERASURE_ENABLED'):undefined,layout=canonicalMinute?scheduledDescriptor(env,'PRIVACY_WRITE_ADMISSION_LAYOUT'):undefined;"
  },
  {
    "from": "const canonicalCheck=()=>{if(!canonicalMinute)return;const currentBeta=scheduledDescriptor(env,'BETA_RESET_REMOVALS_ENABLED');\n",
    "to": "const canonicalCheck=()=>{if(!canonicalMinute)return;const currentBeta=scheduledDescriptor(env,'BETA_RESET_REMOVALS_ENABLED');\n        if(!layout||!scheduledHasOwn(layout,'value')||layout.value!=='recorded-live-pre-seal-20261017'||!scheduledSame(scheduledDescriptor(env,'PRIVACY_WRITE_ADMISSION_LAYOUT'),layout))throw new PrivacyWriteAdmissionHeld('canonical_rank_minute_layout_unqualified_or_drift');\n"
  }
];
const HISTORICAL_SHA256="973354548ff8d7b64b93280dbe79308fe1eb02bf9596514e21e382af3ffb1893";
function historicalIndexSource238(raw){let out=raw;for(const w of [...WINDOWS].reverse()){assert.equal(out.split(w.to).length,2,'one exact238 source window');out=out.replace(w.to,w.from);}assert.equal(crypto.createHash('sha256').update(out).digest('hex'),HISTORICAL_SHA256,'whole historical index with only Root current BUILD');return out;}
module.exports={historicalIndexSource238,HISTORICAL_SHA256,WINDOWS};
