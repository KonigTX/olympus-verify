# Launch .227: Daniel feed agreement and activation boundary

Recorded 3 November 2026 from Daniel's message supplied by the owner. This records
what was agreed and implements a guarded consumer boundary; it is not a report of
a deployed producer or an enabled website feed. Accepted live .226 stays separate.

## Agreement and evidence matrix

| Item | Agreed target / observed source state | Remaining launch evidence |
|---|---|---|
| Transport | Exact HTTPS origin `https://olympus-guild.web.app/`; GET `/companion/v1/site/aggregates?v=1&scope=forever-pve-alliance`, `v` before `scope`; five-minute polling | Authenticated real-producer interoperation, dedicated public-key registration and approved activation |
| v1 choices | Daniel accepts both parts of `docs/daniel-site-feed-reply-draft.md`: linked-account witness deduplication, equal Council weight, direct-compatible strict-majority quorum, masking, independent freshness, complete snapshots and manual fallback | Actual producer implementation and tests; reference fixtures do not establish private quorum or account deduplication |
| Native realm mapping | Daniel will provide actual Forever PvE native realm-group value and minimal aliases from an own-roster capture | Capture, review, pinned mappingVersion and scope. No beta mapping or guessed alias is permitted |
| HS1 producer | Daniel identifies himself as owner/producer and signs on his own machine; re-signing is planned at launch and each Council change | Verify actual payload/key provenance and live-realm binding; define refresh/revocation convergence, signed ordering and rollback/conflicting-version refusal |
| HS1 lifetime | Current producer list has **no expiry**. Replacement by a newer signed list is his stated revocation mechanism | Bounded-lifetime proposal is not agreed. In particular, the suggested seven-day expiry/daily renewal must not be treated as implemented or accepted |
| Raw observations | Maximum 24 hours | Producer retention and erasure evidence |
| Security logs | Redacted, maximum 30 days; no request authorization/JWS/JTI/key logging | Producer logging and deletion evidence |
| Backups | Encrypted, maximum 30 days | Restore barrier test proving erased contributors cannot reappear after a restore |
| Primary erasure | Within 24 hours; promptly remove withdrawn/revoked contributors from active aggregation and recompute | Actual deletion/recomputation tests and a real masked sample. No new website raw/derived identity retention is authorized |
| GM onboarding | Daniel's final message replaces his earlier unrestricted-start suggestion: provisional onboarding with 48 hours for the current GM to install and verify | Producer-side workflow, notification delivery and boundary/transfer/replay tests; consumer constants are not proof that these actions run |
| Producer readiness | Daniel will send producer/replay/erasure tests and a real masked sample once live-realm data exists | These materials have not been supplied in this task |
| Consumer readiness | Existing strict decoder/cache/source-selector/signer plus the .227 guarded polling boundary | Admitted persistence/cron budget/privacy integration and actual qualified activation; consumer remains unmounted and `RELAY_POLICY_V1.finalized` stays false |

The retention and 48-hour values are bound in `RELAY_PRODUCER_COMMITMENTS_V1`.
`hs1MaximumAgeSeconds: null` deliberately represents the current no-expiry answer;
it does not certify that no expiry is suitable for future authorization uses.

## Prepared guarded poll

`pollConfirmedRelayFeedV1` uses only the exact confirmed endpoint. Unlike the
generic low-level fixture signer, it refuses another host, path, query order,
extra query or fragment before a private key is accessed. Its trusted future
server caller must explicitly supply all of the following evidence admissions:

- enabled, finalized contract and confirmed native mapping/version;
- qualified producer, atomic replay protection, erasure/restore and HS1 lifecycle;
- qualified admitted cache/privacy/statement budget;
- confirmed dedicated public-key registration and authorized rollout.

Missing readiness defaults to all false. The flags are **operator admissions**,
not remote attestations or a substitute for the referenced review evidence.
Synthetic true flags in local tests qualify no production service.

One attempt signs a dedicated short-lived Ed25519 request. It uses
`redirect: "error"`, `credentials: "omit"` and `cache: "no-store"`; the prior strong
ETag is validated before use. There is one eight-second deadline for signing,
fetch and body, with no retry. An ignored abort still ends our wait, and a late
response is discarded/cancelled. Redirect/cookie-bearing/oversized/malformed
responses remain refused by the existing bounded consumer. Only fixed refusal
codes escape network failures; no secret, request code, JWS, JTI or provider error
text is logged by this module.

The function returns a complete owned `RelayCacheV1`. It performs no database
write, registration, role grant or game action. The future caller must admit and
persist the complete candidate atomically through a reviewed current-only cache;
it must not patch individual rows. Expired counts hide at display time, a 304 does
not refresh acquisition/source age, and relay/manual candidates are never mixed.
Gold receipts and character verification are independent pipelines, not data
that can be inferred from the aggregate feed.

## GM grace-period handoff requirements

The producer-side implementation must distinguish **provisional onboarding**,
**verified GM control**, **approved affiliated guild** and **ordinary witness**.
None implies the others. Agree and test the following operator semantics before
using the grace period as an authorization boundary:

1. Record a server UTC admission time and notify the current GM and Council. The
   proposed clock starts when admission and GM notification are recorded, rather
   than on arbitrary client login time. Record delivery failures honestly.
2. Show a pending state and due time; remind before the deadline and raise an
   actionable Council follow-up if verification is still incomplete at 48 hours.
   Any automatic notification worker needs its own delivery/replay qualification.
3. Do not let reinstall/rejoin reset the clock or an unverified claimant take
   over a guild. A leadership transfer needs a new control check. Any extension
   or expired pending case is attended, with no automatic kick, ban or invented
   verification result.
4. Pending status cannot issue Council/GM authority, authorise an arbitrary guild
   name or grant Discord roles. A valid code alone proves code/character control;
   appropriate roles still require current trusted affiliated-guild evidence.
5. The website v1 schema remains exactly **Olympus, then Olympus I–X**, Alliance,
   in the pinned native realm group. Broader addon availability cannot silently
   extend that feed scope or its approved-guild membership rules.
6. Council designation counts once with no weighting/quorum override. A stale or
   revoked Council designation does not by itself remove otherwise eligible
   ordinary witness status. Feed counts confer no membership or role authority.

The clock/reminder/expiry handling above is an explicit integration handoff, not
a claim that this consumer runs Daniel's private onboarding implementation.

## Required evidence before mounting or enabling

Keep the feed OFF until the live native capture, masked sample and producer tests
are reviewed. Tests must cover deduplication across accounts/devices/characters,
two independent witnesses, direct-cluster/outlier quorum, masking/complementary
groups, independent expiration, withdrawals/erasure, monotonic snapshots and
nonrefreshing 304s. Replay tests must exercise atomic JTI consumption across
producer instances, expiry/skew and key rotation; restore tests must exercise the
deletion barrier. HS1 replacement/rollback and GM grace boundaries must be tested
against the actual implementation, not this consumer's synthetic flags.

Only then register the dedicated feed request **public** key through the agreed
channel; its private key remains server-side and is separate from Council,
Discord, Companion and Olympus Link key namespaces. Bind the exact qualifications
to the reviewed caller/cache and qualify the release through current review/CI,
backup and rollout safeguards. Do not enable public upload or use a member
session as a feed credential. This task adds no route, cron, credentials, DDL or
production setting change.

## Focused source validation

`node worker/tests/site_relay_launch227_test.cjs` exercises the actual polling
boundary with an injected transport, synthetic qualification flags and ephemeral
keys. It checks precredential gate failures, exact target binding, real local
Ed25519 verification, redirect refusal, 304 age preservation, oversized bodies,
canonical errors, fetch/body cancellation and the actual eight-second default
deadline. The original `site_relay_feed_v1_test.cjs` remains a separate 102-check
consumer test. Neither test is producer, native-client or production acceptance.
