# Launch verification readiness: owner Watcher and official individual QR

3 November 2026. Baseline: accepted .226 / `4035063a6454a4829b857378450a08ad004c2e50`.
This document separates implemented candidate code, required live evidence and a distinct live-QR successor. It is not a production activation receipt.

## Owner source decision

Only the owner runs Olympus Verify and its local Watcher. Sister-guild membership must use Daniel's existing official individual character-verification QR → website → Discord workflow. There is no recommendation or requirement to distribute this Watcher, its bearer or its verification secret to branch GMs.

The aggregate Army census QR/relay contains counts, not individual character authority. It must never grant Discord membership, Council or staff roles. The official individual membership QR format must be identified from the actual maintained producer before implementing a live decoder. Similar names do not make the two formats interchangeable.

## Implemented main-guild candidate

`VERIFY_MEMBERSHIP_ONLY="true"` selects restricted verification. It does not activate Army aggregation, Treasury dispatch, Olympus Link, historical QR or rank mapping.

Its required operator scope pin is canonical JSON:

```json
{"version":1,"guild":"<exact native approved Olympus guild name>","realm":"<exact native GetRealmName value>"}
```

Those angle-bracket strings are documentation placeholders and are refused by the decoder. No beta, unknown, pending or unconfirmed realm is accepted. The guild must be one of Olympus or Olympus I–X; scope matching then uses the exact native guild and realm strings, including case. This pins one owner-observed guild, not all eleven at once. The real live realm still requires an actual native capture and reviewed configuration.

The owner addon captures `GetGuildInfo("player")` and `GetRealmName()` before and after its roster read. The Watcher forwards `nativeGuild` and `nativeRealm`. These must match the pin at `POST /ingest/roster` before any roster write, membership effect or role operation. A missing/mismatched native envelope is refused; missing or invalid operator configuration holds the route.

Accepted scope provenance is stored in the existing non-personal `roster_snapshots.source` TEXT column as `addon-native-v1:<canonical scope JSON>`. No schema object is added. A changed provenance creates a new snapshot rather than upgrading an old unscoped row by refreshing its timestamp. Historic snapshots retain their old source.

For a valid whisper request, the candidate requires:

1. The native whisper sender GUID, with the existing signed-addon/Watcher trust boundary.
2. The latest own-roster snapshot: complete, trusted and storing exactly its declared number of members.
3. An export less than ten minutes old, no future time and on/after the existing launch cutoff.
4. Exact name/GUID membership in that snapshot and exact pinned native-scope provenance.
5. A per-whisper owner-addon native membership MAC for this exact code/GUID/scope, with `member:true`, no older than600 seconds and no more than5 seconds in the future. A false/missing/invalid assertion cannot borrow a positive cached roster.

A valid code alone cannot queue an invite in this mode. A typed guild name, a plain chat line or a `/who` claim is not enough.

The roster remains a bounded observation. To avoid accepting someone who left after that export, the candidate additionally verifies the owner's per-whisper native membership assertion. The addon must use actual own-roster membership APIs and hold missing/unreadable observations, not turn unknown into false or a positive claim. The assertion is bound to the original normalized character/code, native GUID, exact guild/realm scope hash and observation time. These are owner-host attestations, not a Blizzard-signed identity service. They do not make the subsequent D1 and Discord actions atomic.

The exact `nativeMembership` object is `{version:1,member:boolean,observedAt:integer,scopeHash:16-lower-hex,mac:32-lower-hex}`. `scopeHash` is the first16 hex characters of SHA256 UTF-8 `native-scope|1|<exact native guild>|<exact native realm>`. The truncated128-bit MAC is HMAC-SHA256 with `VERIFY_SECRET` over `membership|1|<normalizeCharacter(name)>|<native GUID>|<normalizeCode(code)>|<1 or 0>|<observedAt>|<scopeHash>`, first32 hex characters. The Worker copies the closed object before its first await and independently verifies it. Neither the MAC nor a verification secret is added to persistent Worker storage or logs. Its timestamp is repeated in Native consumption/promotion/dispatch predicates, and a changed secret/policy cannot replace the captured one.

The original snapshot ID, export time, GUID, name key, provenance, launch cutoff and mode are captured. SQL repeats that selection in request consumption, promotion and the central dispatch claim. A new snapshot cannot repair the old selection. Registered Native admission aliases and the final provider `beforeDispatch` hook preserve the original mode/policy witness through awaits.

The central writer also requires pinned provenance for other new roster-based grants under this mode, so status/restore/rank callers cannot bypass the scope check. Historical beta proofs are not a live-scope grant shortcut. Restricted operation requires central membership custody; its old beta legacy writer is not substituted.

The scoped-only final source read after policy awaits has an actual budget regression: `launch_scoped_rank_budget227_test.cjs` runs all68 maintained Native rank-continuation cases with the launch scope selected. Its observed maxima are34 logical statements,94 physical statements and20 HTTP requests at the existing two-effect cap, within the unchanged35-statement/20-request reservation. This is scoped-source evidence; it does not certify future added jobs or an untested configuration.

An already-linked member who supplies a fresh qualified native proof reaches the existing writer immediately to repair a missing role. An attempted or unknown old role operation is never replayed as a new PUT.

## Refusal and recovery

Main-roster absence does not prove whether someone has no guild, belongs to an unaffiliated guild, belongs to an approved sister guild or simply lacks fresh evidence. The reply says membership is not confirmed, grants no role and creates no character link, review or invite.

A cryptographically valid `member:false` assertion may contradict a positive cached own-roster row. Only when it matches the original character GUID/name and pinned provenance, and is at least as new as the captured export, the refusal's original admitted atomic group can set that exact still-latest snapshot's `trusted` flag to zero. This is a restriction, not a guild-departure finding or a role-removal instruction. It prevents an ordinary restore or sweep from granting from contradicted cache. Missing, invalid, stale, foreign-scope or foreign-GUID assertions cannot poison a snapshot; an export replaced/refreshed while the refusal awaits is not quarantined. A failed or lost Native acknowledgement remains unknown. A fresh genuinely changed export or attended correction must establish trust again; an identical refresh cannot silently lift quarantine.

A definitive negative admission decision closes only the original pending request using its fingerprint and privacy-generation admission. The exact HTTP409 response contains:

- `result:"membership_not_confirmed"`
- a human `error` directing the member to Get my code after the source is refreshed
- `roleGranted:false`
- `inviteQueued:false`
- `pendingConsumed:true`
- `requestRefused:true`

Only that exact closed-request refusal may be acknowledged by the Watcher. Its old code remains deduplicated. With request-ticket codes enabled/on or a ready upgraded host under auto mode, Get my code issues a genuinely fresh nonce. Forced legacy name/day codes cannot promise a different code that day and are not the qualified recovery path.

Configuration changes, replaced/expired pending rows, lost Native acknowledgements and unknown outcomes remain held/unknown. They cannot be converted to the definitive-refusal acknowledgement. A consumed code or fresh lookup does not authorize replay of a spent provider operation.

## Existing QR and role machinery

| Existing mechanism | Reuse | Boundary |
| --- | --- | --- |
| Official individual character-verification QR | Intended sister-guild path after actual producer/wire review | Must contain verifiable individual native identity and approved affiliation; counts-only QR cannot substitute. |
| `QR_PHASE1`, `QR_PROFILE`, B1 Fern window | Historical regression evidence and source patterns | Fixed beta realm/build/signer facts. Preserve their rows and formats; never rebind them to launch. |
| `verification_requests`, `verification_proofs`, councillor keys/challenges | Existing request and cryptographic-custody architecture | Current readers enforce the historical profile. A distinct live protocol needs its own explicit admission path. |
| `role_settlements` | Original intent, one attempt, unknown-state GET-only reconciliation, inventory/hierarchy/blocker checks | New live-QR source predicates must be supported explicitly. |
| `native-rank-adapter.ts` | Exact ten-rank name/index matching and protected role separation | Public labels are not Council appointments or permission. Independent OFF gates remain required. |
| Approved-guild paste/directory, HS1/HT1 | Approved affiliation and authority metadata with their stated provenance | These alone do not prove a character controls a Discord request or enroll a trusted signing key. |

The native ten-rank hierarchy stays unchanged. Main Guild Leader/Officer and Branch GM/Branch Officer remain distinct. Cosmetic rank labels may use reviewed server-owned role maps. Native High Council rank, a title, provisional GM onboarding or a paid contribution never invents a Council appointment or website authority.

## Host capability and rollback boundary

The strict Watcher checks the private health response for `members-only`, a pinned
native scope and membership-proof version1 before its loop can start. Its queue
poll is presence-only: it preserves old queue files and unknown acknowledgements
and never renders invitations or sends `/queue/written`.

Every strict-host queue/ingest HTTP request also carries the exact query marker
`keyVersion=launch-membership-v1`. Pre-.227 source rejects that field before queue
or ingest effects, preventing a later binary rollback from interpreting the new
proof as an ordinary legacy request. The new receiver accepts only that sole
marker on the named ingestion routes under the current valid strict selection,
or on an explicitly presence-only queue poll. The original request body and
local custody route remain unchanged; the marker is added at HTTP serialization.
Malformed/duplicate markers and body `keyVersion` fields remain refused.

Presence-only polls on the new receiver do not claim invitations or schedule
queue-driven role work even if its membership selection changes to legacy.

## Concrete live individual-QR successor

This section is a reviewed implementation plan, not a claim that the current candidate already accepts live sister-guild membership.

1. Identify Daniel's actual individual membership QR producer and signed wire, separate from the Army exporter. Freeze version, domain separation, canonical encoding and its actual signature/key chain. Do not invent a decoder from a screenshot or infer authenticity from a QR image.
2. Add a distinct live profile/version and route, for example `POST /api/qr/live/prepare` and `POST /api/qr/live/proof`, under the current signed website session, same-origin and Native account/generation fences. Preserve the existing beta route, parser, profile constants, rows and failure history.
3. The proof must bind the original Discord request/challenge, requester account incarnation/generation, character GUID and exact native name, native approved guild and live realm-group mapping version, faction, observation time, expiry, signer identity/key and signature. No caller-supplied role IDs.
4. Verify the official key chain and current revocation/revision semantics. Persist a high-water mark and reject rollback or conflicting equal versions. Use the agreed real live realm mapping; beta aliases and unconfirmed scope remain held. Membership authority and HS1 Council designation must remain distinct.
5. Resolve the character into exactly one current approved affiliation. Reject a positive no-guild or unaffiliated proof with an explanatory message and no role. Hold missing, stale, conflicting, untrusted or unmapped evidence without falsely asserting a departure.
6. Consume the original request and record proof/intents in one admitted Native group with its immutable source/policy version. A later proof cannot repair a stale captured request. Bound replay consumption across instances.
7. Queue explicit live-QR purposes in the existing central role writer. Validate original proof, approved guild/realm policy, current signer authority and subject lifecycle in claim/admit SQL and immediately before provider dispatch. Existing unknown operations remain GET-only.
8. Apply only the reviewed corresponding membership/native-rank/branch-role targets derived from server configuration. The owner must review actual Discord role IDs, privileges and bot hierarchy before activation. No source-provided role name or rank index can select an arbitrary Discord role.
9. Give the website a precise own-result readback: accepted affiliation, pending/confirmed role outcome or concrete refusal. A proof acceptance is not itself a Discord provider acknowledgement.
10. Qualify real producer fixtures, signature/replay/expiry/revocation, account/character replacement, privacy erasure, restore and native in-game acceptance before activation.

If Daniel's current individual QR does not contain a signed guild affiliation, it cannot prove sister-guild membership by itself. That is a concrete producer dependency, not permission to treat Army counts as proof.

## Storage and privacy without DDL

Existing schema can support a successor without adding D1 objects, but it is not automatic:

- `site_settings` can hold bounded versioned JSON policy/current-proof records with dedicated namespace keys. Do not scan the whole table; use exact indexed keys and closed JSON schemas.
- `role_settlements.purpose` and `proof_id` are open text. New live-QR purposes can reference a distinct admitted proof namespace without modifying the historical beta proof schema, but every currentness/dispatch/reconciliation reader must explicitly recognize them.
- `community_alt_claims.proof` is not a JSON escape hatch: its CHECK allows only `self` or `keeper`, and alt labels are not independent character-control proof.
- Any new personal-data namespace must be registered before first write and included in actual Native E2 own-copy, erasure, export and backup-restore tests. Schema object count alone does not qualify new data semantics.
- Own-copy exposes only the subject's original owned proof/character facts, not another member's roster or private key. Identify-copy must stay below100 physical statements.
- Erasure must remove owned native identity/proof and requester/signer references under original-generation authority, invalidate affected grants and prevent old uploads or restored backups from resurrecting erased identity.
- Preserve the owner's zero-retention directory decision. Do not retain raw or derived Discord IDs as new suppression/relisting tombstones. Purpose-specific retained receipts need their existing minimal finite disposition.
- Keep at most bounded current proofs. Any new historical retention policy must be stated explicitly instead of inheriting Daniel's public aggregate retention limits by assumption.

## Expiry, departures and GM grace

Expired/unavailable evidence cannot create a new grant. Unknown source state is not positive departure evidence and must not automatically strip a legitimate role. A source's positive departure/revocation must pass the corresponding central reconciliation and current subject/privacy fences.

Before removing an account-level membership role, inspect its other proven approved characters. An unaffiliated alt or departed character cannot strip access still supported by another valid character. Do not reinterpret an unverified claim as that support.

The 48-hour GM grace concerns provisional administrative onboarding. It does not install or require a branch Watcher, enroll signing keys automatically, grant Council status or bypass individual proof. Record notification/start/deadline, provide Council follow-up and prevent reinstalls from resetting the clock. Unresolved cases go to staff review without an automatic member kick/ban.

## Required acceptance evidence

- Actual live owner native guild/realm/build/interface/GUID capture and the exact operator scope pin, plus the corresponding main whisper-to-role check.
- Actual maintained official individual QR wire/key chain and at least one real masked sister-guild sample, with approved live mapping.
- Source tests for main/sister/no-guild/unaffiliated/conflicting affiliation, same name/different GUID, stale or partial proof, replay, signer revocation and policy changes.
- Races before consumption, promotion, Discord lookup, final dispatch and after a landed PUT. D1 and Discord are not one atomic transaction; lost results remain unknown with custody.
- Native E2 and below100 identify-copy evidence for all new JSON proof semantics.
- Exact-head local/hosted/review/release gates, reviewed host/addon installation and real in-game acceptance after world entry. Offline fixtures and matching installed hashes are separate evidence.
- Existing Treasury/Army/Link and privileged-rank activation gates remain independent.

Report the present scope precisely: main native-scope and request/dispatch hardening is implemented in the candidate; live scope installation/acceptance and the distinct official live-QR sister integration remain separate gates until their actual producer/native evidence exists.
