# Daniel site relay feed v1: review and integration boundary

Review date: 31 October 2026 (America/Chicago); evidence timestamps use UTC. Status: **draft compatibility prepared, not an agreed or activated contract**.

Baseline: accepted Verify main 6a0b3b9cae5cde7bea4b84c2fe03eb2052902ec3. Review branch: codex/feed-bots-emoji218. Daniel's four files are third-party reference material; their REQUIRED/PROPOSED wording does not authorize deployment, credentials or policy changes.

## Input custody and execution

ZIP found in Downloads only among the three requested directories. SHA-256: 9a2418483e114a03cb7933fcc9eb071a2dd3d57a49285271d92c888ee432a3c5, 19,009 bytes. Four bounded ordinary entries extracted; no extra/traversal entries. Original file hashes and byte counts are retained in the local audit input-custody.json. The originals are copied unchanged under worker/tests/fixtures/site-relay-feed-v1/.

The original validate-site-feed-fixtures.mjs completed **2,084 structure/policy checks**. It explicitly does not establish a real relay, production cryptography, atomic replay consumption, account deduplication, aggregation, storage, erasure or addon runtime. Our separate actual-source consumer tests exercise ephemeral Ed25519 signing and verification; that still does not verify Daniel's relay implementation.

## Complete contract reading record

All 566 lines were read in order; the following contiguous ranges cover the entire document, including its preamble and final activation warning. A line-indexed copy and per-line disposition are retained in the local audit folder.

| Lines | Section | Audit disposition |
|---|---|---|
| 1–22 | Preamble | Draft semantics retained; manual export, QR and Link remain independent. |
| 23–36 | 1 Purpose/trust | Counts are roster characters, not unique humans, membership, identity or authority. |
| 37–60 | 2 Endpoint | Separate read-only relay GET; five-minute polling; origin/query still need freezing. |
| 61–112 | 3 Request JWS | Dedicated Ed25519 namespace, exact target and 60-second claims; relay must implement atomic replay protection. |
| 113–142 | 4 Scope | Eleven rows: Olympus, then Olympus I–X. Native realm mapping is unresolved. |
| 143–171 | 5 Contributors | Established linked-account dedup first; native own-roster observations only; no unverified claim merges. |
| 172–191 | 6 Council | Council counts once, no weighting/tie-break/override; HS1 authority and lifecycle unresolved. |
| 192–243 | 7 Time | Independent metric freshness, oldest participating bounded interval, no HTTP/cache age reset. |
| 244–300 | 8 Agreement | Unique largest directly compatible cluster, at least two witnesses, strict majority of all eligible witnesses including outliers. Even median remains open. |
| 301–314 | 9 Masking | Mask 1–4 after aggregation; exact zero valid; protect complementary remainder. |
| 315–395 | 10 Schema | Closed schema; reject unknown/missing/identity fields and noncanonical rows atomically. |
| 396–412 | 11 Withdrawal | Complete replacement; explicit unavailable/tombstone withdraws previous relay values. |
| 413–430 | 12 Sequence/cache | Monotonic scope sequence and strong ETag; 304 never refreshes age; expiry requires changed snapshot. |
| 431–452 | 13 Manual coexistence | Separate candidates/storage; whole-interval comparison; overlap conservatively prefers manual. |
| 453–467 | 14 Privacy | No person IDs, names, Council participation, witness totals, partitions, raw counts, JWS or replay identifiers at website. |
| 468–505 | 15 Retention | Producer recomputes on revocation/erasure and applies restore barrier; durations/history still proposed. No new website identity retention. |
| 506–513 | 16 Versioning | Shape or semantic change requires v2; proposed 90-day transition needs agreement. |
| 514–547 | 17 Fixtures | Preserve every listed case and the reference-validator limitation. Consumer cannot prove private quorum internals. |
| 548–566 | 18 Decisions | All eleven decisions below remain draft until confirmed. No key exchange/activation inferred. |

## All eleven decisions and recommended reply

These are recommendations for Daniel and the owner to freeze together, not unilateral production policy.

| # | Open decision | Recommended v1 choice / missing evidence |
|---|---|---|
| 1 | Endpoint and query | GET /companion/v1/site/aggregates?v=1&scope=forever-pve-alliance; Daniel must supply the exact HTTPS origin. Pin canonical order and redirects refused. |
| 2 | Native realm mapping | Daniel supplies an actual Forever PvE own-roster realm-group capture and minimal native aliases; mappingVersion=1 only after review. No invented realm, free-form combination or beta alias. |
| 3 | Unverified witnesses | Do not count them. Only authenticated established linked accounts; one newest eligible observation per deduplicated linked account per guild/metric. This is not unique-human proof. |
| 4 | Council source/lifecycle | Use current signed HS1 membership, not HT1 titles. Daniel must identify authoritative producer/owner, exact payload verification, refresh cadence, expiry and immediate revocation. Council has ordinary witness weight only; losing designation alone does not invalidate ordinary eligibility. |
| 5 | Tolerances | Characters max(5, ceil(0.05 * max(a,b))); online max(2, ceil(0.05 * max(a,b))). Direct min/max compatibility, unique largest cluster, >=2 and >50% of all eligible witnesses. |
| 6 | Freshness/skew | Characters 1,800s; online 900s; maximum clock skew 5s; oldest accepted source notBefore determines validUntil. Five-minute-rounded interval has width 299s. |
| 7 | Even median | Option A: floor((lowerMiddle + upperMiddle + 1)/2). Mark approximate if accepted values differ. |
| 8 | Online gate | Independent online quorum AND an accepted visible character total; exact online zero valid; mask positive 1–4 and hide complementary small remainder. |
| 9 | Manual precedence | Relay wins only when its whole interval is strictly newer. Overlap/tie chooses manual; unavailable/withdrawn relay falls back to the independent valid manual candidate. Never mix sources' total/online fields. |
| 10 | Retention/erasure | Website keeps current masked candidate only, no masked history and no new person identifiers. Propose relay raw <=24h, redacted security logs <=30d, encrypted backups <=30d, primary erasure <=24h; immediate active-set removal/recomputation and restore deletion barrier. Daniel must document minimal deletion-ledger representation/lifetime so it cannot recreate erased identity; this is not permission to retain raw/derived Discord IDs on our website. |
| 11 | Operational defaults | 30 requests/minute per credential with 429/Retry-After; normal polling 300s; v1 available >=90 days after v2 with Deprecation/Sunset. Dedicated request lifetime <=60s and two-key rotation overlap only. |

The current upstream council-sign.py distinguishes HS1 names from HT1 titles and signs its Council artifacts using RSA-2048/SHA-256. That namespace is separate from this feed's Ed25519 request key. Its historical ClassicBetaPvP+ClassicBetaPvP2 default is not a Forever mapping. Do not infer HS1 lifetime from the separate HA1 authority manifest. Source: [upstream signer](https://github.com/dnl-gentile/olympus-addon/blob/main/scripts/council-sign.py).

## Existing Army endpoint comparison

| Concern | Accepted .218 manual path | Proposed relay |
|---|---|---|
| Transport | Authenticated Army preview/publish/delete; member-gated GET/HEAD /api/army; /army redirects to #/army | Website polls Daniel's HTTPS GET server-to-server. No new anonymous upload/public receiver. |
| Wire schema | Addon manual export is olympus-site-aggregate; reviewed browser converts to olympus-stat-observation-v2 | olympus-site-relay-feed version 1, producer olympus-relay/site.1 |
| Scope | own-guild / volunteer-client, exactly one canonical guild per upload | complete:true, all eleven ordered canonical rows, pinned mappingVersion |
| Payload bound | Existing manual 1,023-byte bound, unchanged | Prepared consumer max 16 KiB before strict decode; confirm producer envelope compatibility before wiring |
| Time | Existing manual character 24h / online 900s | Proposed characters 1,800s / online 900s, bounded interval and independent expiry |
| Trust | SourceVerified/membershipProof false; reporter's review does not create membership | Linked-account quorum internal to relay; public aggregate grants no membership or Council authority |
| Storage | Existing site_settings army:census:v2: namespace | Future separate admitted cache; this branch adds no storage or schema objects |
| Auth | Existing authenticated reporter/site session | Dedicated short-lived Ed25519 request JWS; never reuse website sessions, Discord keys or Link keys |
| Cache | Existing manual candidate independent | Atomic complete replacements, monotonic sequence, strong ETag, 304 no freshness extension |
| Production | ARMY_SITE_AGGREGATE_ENABLED absent/OFF at audit | No route, cron import, binding, credential, real endpoint or activation added |

Do not broaden the manual parser to accept relay responses. Do not mount this relay at /api/army/publish. Reject another scope/faction rather than normalize it. The consumer does not run a second quorum algorithm over masked values.

## Prepared compatibility surface

worker/src/site-relay-feed-v1.ts supplies a strict data-only snapshot decoder, duplicate JSON-key/UTF-8/depth checks, bounded HTTP response consumption with cancellation/deadline, cache/sequence/tombstone validation, display-time expiry, whole-source selection and dedicated request signing. It performs no fetch, database write or key lookup. It is unimported by the deployed entry point. RELAY_POLICY_V1.finalized remains false; explicit signer flags exist solely for a future reviewed caller and synthetic tests.

The 102 actual-source checks include a real ephemeral Ed25519 signature, independent JTI generation, exact request target, forbidden fields, count bounds, masking, source intervals, HTTP failures/oversized/stalled streams, nonrefreshing 304, rollback, changed sequence, withdrawal and manual fallback. All four originals remain byte-exact. These tests are registered in test:all; they do not turn a review draft into an agreement.

Before wiring: freeze the eleven decisions; review producer implementation and real fixtures for dedup/quorum/replay/erasure/restore; verify actual native mapping and Council lifecycle; exchange only a dedicated public feed key through the agreed channel; design bounded cache admission/budgets and privacy coverage; qualify hosted CI/review and owner-authorized rollout separately. ARMY, Treasury dispatch and Olympus Link stay OFF.
