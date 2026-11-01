#!/usr/bin/env node

// Reference-fixture validator only. It checks declared structure/policy coherence. It does not
// contact or test production, execute the production aggregation or atomic replay-store
// algorithms, validate server storage, exercise the addon, or verify Ed25519/JWS signatures.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(here, "site-feed-v1-fixtures.json");
const publicPath = join(here, "site-feed-v1-public-example.json");
const fixtures = JSON.parse(readFileSync(fixturePath, "utf8"));
const example = JSON.parse(readFileSync(publicPath, "utf8"));
let checks = 0;

function check(condition, message) {
  checks += 1;
  assert.ok(condition, message);
}

function exactKeys(object, keys, label) {
  check(object && typeof object === "object" && !Array.isArray(object), `${label} must be an object`);
  check(JSON.stringify(Object.keys(object).sort()) === JSON.stringify([...keys].sort()), `${label} has unknown or missing keys`);
}

const guilds = [
  "Olympus", "Olympus I", "Olympus II", "Olympus III", "Olympus IV", "Olympus V",
  "Olympus VI", "Olympus VII", "Olympus VIII", "Olympus IX", "Olympus X"
];
const reasons = new Set([
  "not-observed", "no-quorum", "no-fresh-quorum", "conflict", "expired", "revoked",
  "deleted", "withdrawn", "complementary-small-group"
]);
const forbiddenPublicKeys = new Set([
  "witness", "witnesses", "witnesscount", "contributor", "contributors", "contributorcount",
  "partition", "partitions", "councilwitness", "councilparticipation", "account",
  "accountwitness", "verifiedlinkgroup", "unverifiedclaimedlink", "characterclaim",
  "characterclaimverified", "jti", "claims", "rawobservations", "hash", "hashes"
]);
const forbiddenPublicStrings = [
  "fixture-account-", "fixture-link-", "fixture-character-", "fixture-person-",
  "discord.com", "authorization: bearer", "private key"
];

function walk(value, visitor, path = "$") {
  visitor(value, path);
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visitor, `${path}[${index}]`));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      visitor({ __key: key }, `${path}.${key}`);
      walk(item, visitor, `${path}.${key}`);
    }
  }
}

function validateNoPublicEvidence(value, label) {
  walk(value, (item, path) => {
    if (item && typeof item === "object" && Object.hasOwn(item, "__key")) {
      const normalized = item.__key.toLowerCase().replace(/[^a-z0-9]/g, "");
      check(!forbiddenPublicKeys.has(normalized), `${label} leaks forbidden key ${item.__key} at ${path}`);
    } else if (typeof item === "string") {
      const lower = item.toLowerCase();
      for (const forbidden of forbiddenPublicStrings) {
        check(!lower.includes(forbidden), `${label} leaks forbidden text ${forbidden} at ${path}`);
      }
    }
  });
}

function validateSource(source, label, allowNull = false) {
  if (allowNull && source === null) return;
  exactKeys(source, ["notBefore", "notAfter"], label);
  check(Number.isInteger(source.notBefore) && Number.isInteger(source.notAfter), `${label} bounds must be integers`);
  check(source.notBefore > 0 && source.notAfter >= source.notBefore, `${label} interval order is invalid`);
  check(source.notAfter - source.notBefore <= 299, `${label} is wider than one declared five-minute rounding interval`);
}

function validateMetric(metric, label) {
  check(metric && typeof metric === "object" && !Array.isArray(metric), `${label} must be an object`);
  if (metric.status === "available") {
    exactKeys(metric, ["status", "value", "precision", "sourceTime", "validUntil"], label);
    check(Number.isInteger(metric.value) && metric.value >= 0, `${label} available value must be a non-negative integer`);
    check(metric.value === 0 || metric.value >= 5, `${label} exposes a positive small count`);
    check(metric.precision === "exact" || metric.precision === "approximate", `${label} precision is invalid`);
    validateSource(metric.sourceTime, `${label}.sourceTime`);
    check(Number.isInteger(metric.validUntil) && metric.validUntil > metric.sourceTime.notBefore, `${label} validUntil is invalid`);
  } else if (metric.status === "masked") {
    exactKeys(metric, ["status", "band", "precision", "sourceTime", "validUntil"], label);
    check(metric.band === "few", `${label} must use the nonnumeric few band`);
    check(metric.precision === "exact" || metric.precision === "approximate", `${label} precision is invalid`);
    validateSource(metric.sourceTime, `${label}.sourceTime`);
    check(Number.isInteger(metric.validUntil) && metric.validUntil > metric.sourceTime.notBefore, `${label} validUntil is invalid`);
  } else if (metric.status === "unavailable") {
    exactKeys(metric, ["status", "reason", "sourceTime"], label);
    check(reasons.has(metric.reason), `${label} unavailable reason is invalid`);
    validateSource(metric.sourceTime, `${label}.sourceTime`, metric.reason === "not-observed");
    if (metric.reason === "not-observed") check(metric.sourceTime === null, `${label} not-observed sourceTime must be null`);
  } else {
    check(false, `${label} status is invalid`);
  }
}

function validateRow(row, expectedGuild, label) {
  exactKeys(row, ["guild", "source", "basis", "characters", "online"], label);
  check(row.guild === expectedGuild, `${label} guild/order mismatch`);
  check(row.source === "companion-relay", `${label} source must be companion-relay`);
  check(row.basis === "own-roster", `${label} basis must be own-roster`);
  validateMetric(row.characters, `${label}.characters`);
  validateMetric(row.online, `${label}.online`);
}

check(fixtures.schema === "olympus-site-relay-feed-fixtures" && fixtures.version === 1, "fixture schema mismatch");
check(fixtures.status === "reference-proposal-not-production", "fixtures must be explicitly non-production");
check(Array.isArray(fixtures.nonGoals) && fixtures.nonGoals.some((line) => line.includes("cryptographically")),
  "fixtures must disclaim cryptographic verification");
check(fixtures.proposedPolicy.manualRelaySeparation === true, "manual and relay candidates must remain separate");
check(JSON.stringify(fixtures.proposedPolicy.allowedGuilds) === JSON.stringify(guilds), "fixture allowlist mismatch");
check(Array.isArray(fixtures.cases) && fixtures.cases.length >= 30, "fixture matrix is unexpectedly incomplete");

const caseById = new Map();
for (const item of fixtures.cases) {
  check(typeof item.id === "string" && item.id.length > 0, "fixture case has no id");
  check(!caseById.has(item.id), `duplicate fixture id ${item.id}`);
  caseById.set(item.id, item);
  for (const key of ["expectedMetric", "expectedCharacters", "expectedOnline"]) {
    if (item[key]) {
      validateMetric(item[key], `${item.id}.${key}`);
      validateNoPublicEvidence(item[key], `${item.id}.${key}`);
    }
  }
}

const requiredCases = [
  "exact-two-witness-agreement", "approximate-three-witness-agreement",
  "different-observation-times-use-conservative-source-interval",
  "olympus-ii-four-to-one-majority", "single-source-no-quorum", "two-to-two-conflict",
  "nontransitive-chain-conflict", "verified-linked-account-dedup",
  "unverified-link-claim-remains-nonqualifying", "council-alone-cannot-publish",
  "council-plus-ordinary-count-once-each", "character-quorum-online-stale",
  "online-zero-is-valid", "small-total-masked-after-aggregation",
  "small-online-masked-after-aggregation", "small-complement-hidden",
  "relay-expiry-withdraws-old-value", "revocation-loses-quorum",
  "erasure-recomputes-and-cannot-recreate", "complete-snapshot-disappearance",
  "explicit-tombstone-row-in-complete-snapshot", "manual-fallback-after-relay-withdrawal",
  "upstream-304-identical-snapshot", "aging-crosses-expiry-before-304",
  "rounded-relay-and-exact-manual-overlap", "wrong-scope-is-rejected",
  "wrong-faction-is-rejected", "wrong-guild-is-rejected", "jws-structurally-bound-request",
  "jws-wrong-alg-rejected", "jws-wrong-kid-rejected", "jws-wrong-iss-rejected",
  "jws-wrong-aud-rejected", "jws-wrong-method-rejected", "jws-wrong-target-rejected",
  "jws-wrong-scope-rejected", "jws-expiry-over-sixty-seconds-rejected",
  "jws-token-expired-rejected", "jws-iat-too-far-future-rejected", "jws-replay-rejected"
];
for (const id of requiredCases) check(caseById.has(id), `missing fixture ${id}`);

const majority = caseById.get("olympus-ii-four-to-one-majority");
check(majority.input.observations.length === 5, "Olympus II denominator changed");
check(majority.expectedMetric.status === "available" && majority.expectedMetric.precision === "approximate",
  "Olympus II four-to-one must be accepted as approximate");
check(caseById.get("single-source-no-quorum").expectedMetric.reason === "no-quorum", "single source must not publish");
check(caseById.get("two-to-two-conflict").expectedMetric.reason === "conflict", "two-to-two must conflict");
check(caseById.get("unverified-link-claim-remains-nonqualifying").expectedMetric.reason === "no-quorum",
  "an unverified link claim must not create quorum under the proposed safer v1 rule");
check(caseById.get("online-zero-is-valid").expectedOnline.value === 0, "corroborated online zero must remain zero");

const response304 = caseById.get("upstream-304-identical-snapshot");
const expiry200 = caseById.get("aging-crosses-expiry-before-304");
check(response304.expectedHttp.status === 304 && response304.expectedHttp.body === null, "304 fixture must have no body");
check(expiry200.expectedHttp.status === 200 && expiry200.expectedHttp.sequence > response304.expectedHttp.sequenceRemains,
  "expiry transition must emit a newer HTTP 200 snapshot");

const acceptedAuth = caseById.get("jws-structurally-bound-request");
const expectedHeader = { alg: "EdDSA", kid: "fixture-feed-key-1", typ: "olympus-feed-request+jwt" };
const expectedClaims = {
  v: 1,
  iss: "olympus-site",
  aud: "olympus-site-aggregates",
  iat: 1800001800,
  exp: 1800001860,
  jti: "fixture-000102030405060708090a0b0c0d0e0f",
  htm: "GET",
  htu: "https://relay.fixture.invalid/companion/v1/site/aggregates?v=1&scope=forever-pve-alliance",
  scope: "forever-pve-alliance"
};

function setDotted(target, dotted, value) {
  const parts = dotted.split(".");
  let cursor = target;
  for (let i = 0; i < parts.length - 1; i += 1) cursor = cursor[parts[i]];
  cursor[parts.at(-1)] = value;
}

function structuralAuthResult(item) {
  const header = structuredClone(expectedHeader);
  const claims = structuredClone(expectedClaims);
  const request = { header, claims };
  for (const [path, value] of Object.entries(item.input.override || {})) setDotted(request, path, value);
  if (header.alg !== "EdDSA") return { structurallyAccepted: false, reason: "alg" };
  if (header.kid !== "fixture-feed-key-1") return { structurallyAccepted: false, reason: "kid" };
  if (header.typ !== "olympus-feed-request+jwt") return { structurallyAccepted: false, reason: "typ" };
  if (claims.iss !== "olympus-site") return { structurallyAccepted: false, reason: "iss" };
  if (claims.aud !== "olympus-site-aggregates") return { structurallyAccepted: false, reason: "aud" };
  if (!Number.isInteger(claims.iat) || !Number.isInteger(claims.exp) || claims.exp <= claims.iat || claims.exp - claims.iat > 60) {
    return { structurallyAccepted: false, reason: "lifetime" };
  }
  const requestNow = item.requestNow ?? acceptedAuth.requestNow;
  const allowedClockSkew = 5;
  if (claims.exp < requestNow - allowedClockSkew) return { structurallyAccepted: false, reason: "expired" };
  if (claims.iat > requestNow + allowedClockSkew) return { structurallyAccepted: false, reason: "future-iat" };
  if (claims.htm !== "GET") return { structurallyAccepted: false, reason: "htm" };
  if (claims.htu !== expectedClaims.htu) return { structurallyAccepted: false, reason: "htu" };
  if (claims.scope !== "forever-pve-alliance") return { structurallyAccepted: false, reason: "scope" };
  if (typeof claims.jti !== "string" || claims.jti.length < 32) return { structurallyAccepted: false, reason: "jti" };
  if ((item.input.replayStoreResult || "atomically-consumed") !== "atomically-consumed") {
    return { structurallyAccepted: false, reason: "replay" };
  }
  return { structurallyAccepted: true, cryptographicVerification: "not-tested-by-reference-validator" };
}

check(JSON.stringify(acceptedAuth.input.header) === JSON.stringify(expectedHeader), "accepted JWS header mismatch");
check(JSON.stringify(acceptedAuth.input.claims) === JSON.stringify(expectedClaims), "accepted JWS claims mismatch");
for (const item of fixtures.cases.filter((entry) => entry.kind === "request-auth-structure")) {
  check(JSON.stringify(structuralAuthResult(item)) === JSON.stringify(item.expectedAuth), `${item.id} structural result mismatch`);
}

exactKeys(example, ["schema", "version", "producer", "sequence", "generatedAt", "complete", "scope", "guilds"], "public example");
check(example.schema === "olympus-site-relay-feed" && example.version === 1, "public example schema mismatch");
check(example.producer === "olympus-relay/site.1", "public example producer mismatch");
check(example.complete === true, "public example must be complete");
exactKeys(example.scope, ["id", "mappingVersion", "faction"], "public example scope");
check(example.scope.id === "forever-pve-alliance" && example.scope.faction === "Alliance", "public scope mismatch");
check(Number.isInteger(example.scope.mappingVersion) && example.scope.mappingVersion > 0, "mappingVersion is invalid");
check(Number.isInteger(example.sequence) && Number.isInteger(example.generatedAt), "public metadata is invalid");
check(Array.isArray(example.guilds) && example.guilds.length === 11, "public HTTP 200 example must have exactly eleven rows");
example.guilds.forEach((row, index) => validateRow(row, guilds[index], `public row ${index}`));
validateNoPublicEvidence(example, "public example");

const serialized = JSON.stringify([fixtures, example]).toLowerCase();
check(!serialized.includes("discord.com"), "package contains a Discord host");
check(!serialized.includes("authorization: bearer"), "package contains bearer material");
check(!serialized.includes("begin private key"), "package contains private-key material");
for (const match of serialized.matchAll(/https:\/\/[^/\" ]+/g)) {
  check(match[0] === "https://relay.fixture.invalid", `package contains a non-fixture host ${match[0]}`);
}

// Consistency checks for this frozen review package only.
check(fixtures.proposedPolicy.fixtureMedianRule === "rounded-middle-pair-provisional-option-a", "fixture median assumption is missing");
const timeCase = caseById.get("different-observation-times-use-conservative-source-interval");
const oldest = [...timeCase.input.observations].sort((a,b) => a.interval.notBefore-b.interval.notBefore || a.interval.notAfter-b.interval.notAfter || a.witness.localeCompare(b.witness))[0];
check(JSON.stringify(timeCase.expectedMetric.sourceTime) === JSON.stringify(oldest.interval), "time fixture must publish the oldest source bucket");
const evenCase = caseById.get("character-quorum-online-stale");
const middleValues = evenCase.input.observations.map(o=>o.characters).sort((a,b)=>a-b);
const middle = Math.floor((middleValues[0] + middleValues[1] + 1) / 2);
check(evenCase.expectedCharacters.value === middle, "example must follow provisional Option A median");

console.log(`Site feed reference fixtures: ${checks} structure/policy checks passed.`);
console.log("REFERENCE ONLY: this does not test production, network behavior, server storage, the production aggregation algorithm, atomic replay storage, addon runtime, or cryptographic signature verification.");
