'use strict';
// C09 static source-only inverse for b521557 and 6812624. Its output is
// only compared against the unchanged .197, .196 and .164 source seals.
// The Worker loader and trace oracles still consume actual current source.
const crypto = require('node:crypto');
const sha = raw => crypto.createHash('sha256').update(raw).digest('hex');

const sources = {
  "privacy-serving-erase": {
    current: [39564, "4879ac191a77e6e9c9d3c274b883058a6f3008d712b54b53c31f4b1a15f4b205"],
    historical: [39120, "aca1c0e136c1374b58235d5ec9cc8c9f02f3e209fc5b12e90881035ce98b4a12"],
    edits: [
      {
        label: "preflight import",
        from: "import {readNativeErasureRejectionPreflight,rejectionErasureMarkerStatements} from './privacy-rejection-decision';\n",
        to: "import {rejectionErasureMarkerStatements} from './privacy-rejection-decision';\n",
      },
      {
        label: "staff hold reason",
        from: "export const STAFF_REVIEW_REQUIRED='staff_review_required';\n",
        to: "",
      },
      {
        label: "original current-proof position",
        from: " if(fence){if(!attempt)return held('erasure_attempt_identity_required');enterOriginalErasureAttempt(attempt,env,proof);}else if(attempt)return held('erasure_attempt_identity_unexpected');\n",
        to: [
          " if(fence){if(!attempt)return held('erasure_attempt_identity_required');enterOriginalErasureAttempt(attempt,env,proof);}else if(attempt)return held('erasure_attempt_identity_unexpected');\n",
          " // The original six-field job proof was captured before the feature check and first await.\n",
          " // Retain its original birth/absence purpose through the ED01 Native current/clear ACK.\n",
          " if(!await currentAccountErasureProof(env,proof))return held('request_not_current');\n"
        ].join(''),
      },
      {
        label: "Native decision preflight",
        from: [
          "  // Read original decision evidence under the same current job and birth, before any cleanup.\n",
          "  const subjectKey=proof.accountIncarnation===null?null:await privacySubjectKey(env,proof.subject);\n",
          "  const disposition=await readNativeErasureRejectionPreflight(env,proof,subjectKey,STAFF_REVIEW_REQUIRED);\n",
          "  if(disposition==='staff_review')return held(STAFF_REVIEW_REQUIRED);\n",
          "  if(disposition==='unknown')return held('native_rejection_preflight_unconfirmed','unknown');\n",
          "  if(disposition!=='ready')return held('request_not_current');\n"
        ].join(''),
        to: "",
      },
      {
        label: "configured current-proof position",
        from: [
          " }\n",
          " if(!await currentAccountErasureProof(env,proof))return held('request_not_current');\n",
          " const central=await import('./roles') as unknown as Partial<CentralRoleAdapter>;\n"
        ].join(''),
        to: [
          " }\n",
          " const central=await import('./roles') as unknown as Partial<CentralRoleAdapter>;\n"
        ].join(''),
      },
    ],
  },
  "privacy-serving-jobs": {
    current: [12041, "7b49a251c12f2c49e0775afb31ed5a3868e638c273530a4840fbe45c9c5df11b"],
    historical: [11775, "720459ac03bf518a86c835383d9cc2ce8372fd28c764ad4f6a3a5b0c3fbf5c7a"],
    edits: [
      {
        label: "staff hold reason import",
        from: "import {continueServingErasure,erasureAttemptDiscipline,ERASURE_ATTEMPT_UNRESOLVED,STAFF_REVIEW_REQUIRED} from './privacy-serving-erase';\n",
        to: "import {continueServingErasure,erasureAttemptDiscipline,ERASURE_ATTEMPT_UNRESOLVED} from './privacy-serving-erase';\n",
      },
      {
        label: "staff hold exclusion",
        from: [
          "// A deliberate staff hold is excluded from both the queue and its consuming claim.\n",
          "const STAFF_REVIEW_EXCLUSION=` AND COALESCE(hold_reason,'')<>'${STAFF_REVIEW_REQUIRED}'`;\n",
          "/** Attempt discipline only: an attempt that may have reached terminal custody is never selected or claimed again automatically. */\n",
          "const DISCIPLINE_EXCLUSION=`${STAFF_REVIEW_EXCLUSION} AND COALESCE(hold_reason,'') NOT IN('${ERASURE_ATTEMPT_UNRESOLVED}','independent_suppression_outcome_unknown')`;\n"
        ].join(''),
        to: [
          "/** Attempt discipline only: an attempt that may have reached terminal custody is never selected or claimed again automatically. */\n",
          "const DISCIPLINE_EXCLUSION=` AND COALESCE(hold_reason,'') NOT IN('${ERASURE_ATTEMPT_UNRESOLVED}','independent_suppression_outcome_unknown')`;\n"
        ].join(''),
      },
      {
        label: "queue selection",
        from: " FROM privacy_serving_jobs WHERE state IN('waiting_role','held') AND retain_until>${PRIVACY_DB_NOW} AND (last_attempt_at IS NULL OR last_attempt_at<=${PRIVACY_DB_NOW}-120)${discipline?DISCIPLINE_EXCLUSION:STAFF_REVIEW_EXCLUSION}\n",
        to: " FROM privacy_serving_jobs WHERE state IN('waiting_role','held') AND retain_until>${PRIVACY_DB_NOW} AND (last_attempt_at IS NULL OR last_attempt_at<=${PRIVACY_DB_NOW}-120)${discipline?DISCIPLINE_EXCLUSION:''}\n",
      },
      {
        label: "consuming claim",
        from: " const claim=await env.DB.prepare(`UPDATE privacy_serving_jobs SET last_attempt_at=${PRIVACY_DB_NOW} WHERE operation_id=?1 AND last_attempt_at IS ?5${STAFF_REVIEW_EXCLUSION} AND ${CURRENT_ERASURE_SQL} AND EXISTS(SELECT 1 FROM privacy_serving_jobs j WHERE j.operation_id=?1 AND ${originalErasureJobBirthSql(proof)})`)\n",
        to: " const claim=await env.DB.prepare(`UPDATE privacy_serving_jobs SET last_attempt_at=${PRIVACY_DB_NOW} WHERE operation_id=?1 AND last_attempt_at IS ?5 AND ${CURRENT_ERASURE_SQL} AND EXISTS(SELECT 1 FROM privacy_serving_jobs j WHERE j.operation_id=?1 AND ${originalErasureJobBirthSql(proof)})`)\n",
      },
    ],
  },
};

function matches(raw, [bytes, digest]) {
  return typeof raw === 'string' && Buffer.byteLength(raw) === bytes && sha(raw) === digest;
}

function restore(name, raw) {
  if (!Object.hasOwn(sources, name)) return null;
  const {current, historical, edits} = sources[name];
  if (!matches(raw, current)) return null;
  let original = raw;
  for (const {from, to} of edits) {
    if (original.split(from).length !== 2) return null;
    original = original.replace(from, () => to);
  }
  return matches(original, historical) ? original : null;
}

function originalSource(name, raw) {
  return Object.hasOwn(sources, name) ? restore(name, raw) : raw;
}

function controls(name, raw) {
  const original = restore(name, raw);
  if (original === null) return [{label: "exact current source", refused: false}];
  const probes = [
    ["predecessor bytes", original],
    ["unrelated prefix", "// unrelated C09\n" + raw],
    ["unrelated suffix", raw + "// unrelated C09\n"],
    ["raw line endings", raw.replace(/\n/g, "\r\n")],
    ["non-string input", Buffer.from(raw)],
  ];
  for (const {label, from} of sources[name].edits) {
    probes.push(["missing " + label, raw.replace(from, "")]);
    probes.push(["duplicated " + label, raw.replace(from, () => from + from)]);
  }
  return probes.map(([label, value]) => ({label, refused: value !== raw && restore(name, value) === null}));
}

module.exports = Object.freeze({restore, originalSource, controls});
