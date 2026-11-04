# Live launch QR integration: actual producer compatibility and no-DDL design

3 November 2026. Latest owner direction: only Fern Melder runs Olympus Verify and
its local Watcher. Sister-guild census and individual membership use Daniel's
official addon and QR-to-website path. No branch Watcher rollout is proposed.

This is a concrete implementation handoff, not a claim that the live QR role
pipeline is enabled. The minimal structural compatibility module is implemented;
the cryptographic/runtime/privacy/role integration below still needs completion
and qualification against real live inputs before activation.

## Public source actually checked

GitHub plugin reads bind this audit to
`dnl-gentile/olympus-addon@71bc357c251b49a167821cc0b7f922eb69fa35b6`, the PR #72
merge. No private keys or private files were fetched. Targeted sources:

- [Olympus/ArmyExport.lua](https://github.com/dnl-gentile/olympus-addon/blob/71bc357c251b49a167821cc0b7f922eb69fa35b6/Olympus/ArmyExport.lua): `OLCS2`, own-guild aggregate observations; `ACTIVATION_ENABLED = false`.
- [Olympus/Link.lua, lines 1-120](https://github.com/dnl-gentile/olympus-addon/blob/71bc357c251b49a167821cc0b7f922eb69fa35b6/Olympus/Link.lua#L1-L120): individual `OLC2` codes and `OLB5` signed bundles; backend public-key placeholder, Council authority OFF and membership page address.
- [web/public/core.js, lines 65-165](https://github.com/dnl-gentile/olympus-addon/blob/71bc357c251b49a167821cc0b7f922eb69fa35b6/web/public/core.js#L65-L165): actual structural grammar, canonical encoding and signed-message construction.
- [web/FERN.md](https://github.com/dnl-gentile/olympus-addon/blob/71bc357c251b49a167821cc0b7f922eb69fa35b6/web/FERN.md): upstream backend integration and key-registration requirements.
- [web/WORKER.md](https://github.com/dnl-gentile/olympus-addon/blob/71bc357c251b49a167821cc0b7f922eb69fa35b6/web/WORKER.md): confirmation tiers, request ownership and verified-versus-claimed guild policy.

## Three separate mechanisms

| Mechanism | Actual wire / meaning | Allowed conclusion |
|---|---|---|
| Owner whisper | Olympus Verify HMAC code plus the owner's fresh, complete, trusted own-guild roster and native GUID | Main-guild character control/membership under its exact live guild/realm source; central role writer still applies |
| Official census QR | `OLCS2` frames carrying `olympus-stat-observation-v2`; `sourceVerified:false`, `membershipProof:false` | Aggregate counts only. No individual identity, Discord role or Council authority |
| Official individual QR | `OLC2` private signed request becomes `OLB5` peer-signed membership bundle via `/oly discord <code>` | A candidate for cryptographic/request/replay/current-guild validation; syntax alone grants nothing |

The Firebase origin `https://olympus-guild.web.app/` confirmed for the aggregate
relay feed is **not** the current individual membership page. The actual
`ns.LINK_SITE` and page config still name
`https://dnl-gentile.github.io/olympus-addon/`. Do not silently change the CORS or
OAuth destination to the feed origin.

## Exact existing individual producer wire

```text
OLB5~requester Name-Realm~guild~faction~nonce~R~tag~proof;proof;...

proof = issued,keyId,confirmer Name-Realm,gv,sig,pub,tier,certExp,certSig
gv = r (own roster), w (recent /who), c (claimed only)
tier = c (Council confirmer key) or p (drawn verified-player key)
```

There are at most four proofs and 2,400 UTF-8 bundle bytes. Each proof signs:

```text
OLY4~requester~guild~gv~faction~nonce~R~tag~issued~keyId~confirmer
```

Its `OLK2` certificate binds the confirmer's public key, tier, character and expiry
to a configured backend/explicitly approved authority key. `tag` is derived from
the private `OLC2` token signature and requester; the public QR does not include
that token signature. Thus parsing, a public `R`, a printed Council title, a QR
screenshot or a census total cannot replace the original request-owner check.

The existing bundle contains **no requester GUID, native rank, game build or realm
group**. Never fabricate them to insert a row in historical `verification_proofs`
or to satisfy `QR_PROFILE`. Membership of Olympus II does not prove Branch GM,
Officer, High Council or another native rank. Those roles need their own actual
authority evidence/appointment; ordinary affiliation can be mapped separately.

`r/w/c` fields are untrusted until signature/certificate and registered-key checks
pass. Claimed-only `c` is insufficient for the owner's live guild-membership rule.
Even `r` is a registered peer's attestation, not Blizzard-certified game origin.

## Minimal implemented compatibility boundary

`worker/src/launch-qr227.ts` independently implements only the bounded public
`OLB5` structural grammar, with upstream MIT provenance retained. The generated
legacy core is unchanged and keeps its sole gated importer. The wrapper:

- accepts raw bundles and the exact current membership-page URL/fragment;
- rejects another origin/query/credentials, private `OLC2` commands and `OLCS2` census;
- limits input and accepts only Alliance plus Olympus and Olympus I-X, preserving
  the original signed guild bytes while resolving an exact case-insensitive name;
- rejects claimed-only bundles and malformed/confusable/unaffiliated guild names;
- freezes an explicitly **unverified** candidate with `canGrantRoles:false` and
  unknown GUID/native rank/realm group.

Its 54 focused tests intentionally include structurally valid zero signatures.
Those parse as unverified data and cannot grant a role. This is compatibility
coverage, not actual producer/native or cryptographic acceptance. The module is
unmounted; existing `LINK_ENABLED`, `QR_PHASE1_ENABLED` and Army gates are unchanged.

## Concrete live successor without schema changes

Use a **new live route/profile/purpose**, not an altered beta proof table. Proposed
route names below are design identifiers, not mounted APIs.

1. `/api/launch-link/request` uses the site's original signed-in Discord session,
   current main-server membership/rules screening, account incarnation, active
   privacy generation, same-origin/X-Olympus and rate limits. It must not require
   an already verified game character, since that would block first verification.
   Issue the exact existing `OLC2` grammar using a dedicated reviewed backend key.
2. Store bounded request/quota/claim state in an owned namespaced `site_settings`
   JSON row (`key,value,updated_at,updated_by` already exist). Capture subject,
   account incarnation, generation, original session, request identifier, expiry,
   revision and operation nonce. Keep the private pasted token/signature out of
   logs and public responses; reconstruct or securely bind its expected tag
   server-side. Define exact count/byte/retention limits before writing.
3. `/api/launch-link/proof` decodes only the chosen QR bundle locally/privately.
   Validate request ownership/tag, exact original pending row, freshness/expiry,
   registered key/certificate/revocation state, distinct eligible confirmers and
   the configured launch confirmation mode. Mode `c` is a registered Council
   confirmation; mode `a` additionally needs the actual deterministic draw and
   quorum. A tier string or HS1 display list does not enrol a cryptographic key.
4. Pin live native realm suffix/group aliases from an actual own-roster capture.
   Match the **signed** character suffix, Alliance and exact approved guild
   against that reviewed scope. Unknown realm/guild/claim returns a clear no-role
   error. Do not inherit beta names or broaden a guild prefix match.
5. Atomically consume the original request and create one live membership
   operation using Native admission/CAS guards over its exact JSON revision,
   account/session/generation, expiry, current key registry and configuration.
   A replacement request cannot be consumed; lost ACK is unknown, never assumed
   rollback or automatically replaced. Repeating the same proof reads its own
   operation outcome instead of minting another PUT.
6. Extend the central `role_settlements` writer with an explicit
   `live_link_membership` purpose and dedicated source predicate. Existing
   `request_digest`, generation, claim/deadline/state/attempt fields can bind the
   consumed JSON evidence; `purpose` is already text. Do not invent `native_guid`,
   native rank or a historical `proof_id`. Add the new purpose only with complete
   current-source SQL/admission/provider guards; the present writer correctly
   rejects an unrecognized purpose. Never call `addRole` from a new QR handler.
7. Resolve ordinary member/approved branch identity targets from a separately
   reviewed role map and current Discord inventory/hierarchy. Canonical Guild
   Member remains protected; high-level/office roles require their separate
   real authority. Unknown/malformed mappings hold all grants. Spent/unknown
   provider operations stay one-use and require existing honest reconciliation.
8. Register the new owned JSON family for own-copy, erasure, Native E2 identify,
   restore handling and cleanup **before** any storage. Include reference/registry
   projections where a confirmer is identified; not every row is owned solely
   by the requester. Measure the combined physical statement count below 100,
   bound every JSON row/response and keep 443 live/442 portable objects exactly.

This successor leaves the historical beta `QR_PHASE1` profile, its proof rows and
its immutable beta-window/key triggers unchanged. The current separate Olympus
Link adapter is not a shortcut: it requires `LINK_DB`, writes a separate
zero-permission `LINK_ROLE_ID`, and explicitly forbids collisions with canonical
Guild Member/native/staff roles. Enabling its flag cannot implement this mapping.

## Actual blockers and activation acceptance

- Public main still has `ns.LINK_BACKEND_KEYS = { "PASTE-THE-BOT-PUBLIC-KEY-HEX-HERE" }`.
  Daniel must ship the reviewed backend **public** key; private seeds stay with
  their owners. Do not enable the old weak in-game entropy/auto-CA path merely to
  avoid registering confirmer keys (`LINK_COUNCIL_AUTHORITY` currently false).
- Confirm/register/rotate/revoke actual Council confirmer public keys and their
  character-bound certificates; verify actual HS1/authority lifecycle separately.
- Supply live realm mapping and a real masked census sample plus an individual
  `OLB5` sample. No GUID/rank claim can be added without an actual new producer
  format and separate review.
- Complete the above live request/crypto/JSON/privacy/central-writer integration,
  regression tests, Native E2/budget checks, hosted CI/review and current backup/
  rollout qualification. Current structural helper is not that integration.
- Exercise actual user flow on the live client: request, Accept in official
  addon, qualified confirmation, QR-to-site, one proper role grant, replay,
  missing/no/unaffiliated guild refusal, departure/revocation/erasure and recovery.
  No real user or protected role is a synthetic fixture.
- Official census `ArmyExport.lua` also remains activation-disabled upstream;
  Daniel and the owner must qualify its native receiver workflow before enabling.

There is no new dependency, DDL, key generation/exchange, provider configuration,
branch Watcher, real-game action or production activation in this audit.


## Owner ruling recorded 3 November 2026

The owner explicitly selected **Require GUID; keep guild roles held** in this chat. Existing name-only OLB5 must not grant Guild Member or native/staff rank roles. A versioned producer extension must bind the requester stable native GUID inside the canonical signed proof, not an unsigned outer claim. Real live mapping/signers/keys and Native acceptance remain prerequisites. Native rank and privileged role grants require their own authenticated native evidence and qualification; a GUID by itself does not establish a rank.
