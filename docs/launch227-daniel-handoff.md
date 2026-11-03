# Launch .227: draft handoff to Daniel

Prepared 3 November 2026. **Draft for the owner to copy and send; not sent.**
The owner selected “Require GUID; keep guild roles held.” No private key, real
verification code, credential or live player record belongs in this message.
The two messages below distinguish the agreed feed from the still-needed live
producer and individual-proof work.

## Copy-paste message 1: aggregate feed and onboarding

```text
Hey Daniel — thanks, this locks in the feed target:
https://olympus-guild.web.app/companion/v1/site/aggregates?v=1&scope=forever-pve-alliance
GET, v first, then scope. We retain the v1 choices from both parts: linked-account deduplication, equal Council weight, independent witnesses/strict-majority quorum, masking, freshness, complete snapshots and manual fallback. Council weight must never become membership or Discord authority.

Confirmed retention: raw observations ≤24h; redacted security logs ≤30d; encrypted backups ≤30d; primary erasure ≤24h, with erased contributors removed from aggregation and protected against resurrection on restore.

HS1: you are the producer, signing on your own machine and re-signing at launch/Council changes. Your current list has no expiry; newer signed lists revoke/replace older ones. Our earlier seven-day max-age/daily-renewal idea is NOT agreed. We still need a tested signed ordering/rollback/revocation lifecycle before activation.

We accept your corrected 48h GM onboarding direction. Let’s record server UTC admission/notification time, show the due time, remind the GM and Council, and escalate unverified cases at 48h. Rejoins/reinstalls must not reset the clock. Pending onboarding is not verified GM control or authorization for roles; no automatic kick/ban. Please confirm the exact clock/notification semantics before building those actions.

Our feed remains OFF until we review the real PvE realm-group/aliases, masked sample, producer/replay/erasure+restore tests, and exchange/register dedicated public keys. No beta mapping. Website scope remains Olympus plus Olympus I–X, Alliance. Broader addon adoption must not silently expand that allowlist.
```

## Copy-paste message 2: individual QR verification and stable GUID

```text
For individual verification, we want your official addon → individual QR → website → Discord flow for sister guilds. Only Fern Melder runs our officer addon/Watcher; sister GMs do not need our Watcher or its secret.

I checked public main 71bc357c: ArmyExport OLCS2 is aggregate census only (membershipProof:false), so it cannot grant an individual role. Link.lua’s OLB5 individual proof binds requester Name-Realm, guild, faction, challenge and confirmer signatures, but has NO requester native GUID or native rank. Our owner requires GUID: existing name-only OLB5 stays nongranting.

Could you extend the producer with a NEW, mutually agreed version? The stable requester Player-… GUID must be inside the canonical signed confirmation transcript, bound to the same full Name-Realm, native guild/faction/live scope, challenge/request and signing identity. An unsigned GUID next to an old signature is insufficient. Please send the proposed exact wire/canonicalization plus valid and tampered GUID/name/guild/scope/replay fixtures; we will review that version before accepting it. We are not inventing a version or accepting new fields on OLB5.

Please also ship/register the actual reviewed backend public key (the current LINK_BACKEND_KEYS entry is a placeholder), legitimate character-bound confirmer keys/certificates and revocation handling. Council designation/HS1 alone is not a confirmer certificate; do not enable the weak in-game auto-CA path to skip registration.

With live mapping, keys, GUID proofs and acceptance tests qualified, we can grant the appropriate ordinary affiliated-member role via our central writer. No guild, unaffiliated guild, stale/replayed/invalid proof: no grant and a clear refusal. HC/Officer/Branch-GM ranks remain held until separately authenticated native-rank evidence is qualified. GUID alone does not prove a rank.
```

## Review and acceptance boundary

The messages propose notification/clock semantics and a GUID-bearing successor;
they do not claim Daniel has accepted or shipped either. Do not label the new
wire `OLB6` (or another identifier) as an agreed protocol before Daniel confirms
it. Preserve the existing historical beta QR profile and `OLB5` decoder.

Required before a sister-guild role adapter can be enabled:

- Actual versioned producer specification and canonical signed GUID transcript;
  no unsigned field, fabricated GUID or name-only fallback.
- Live native realm mapping, registered public keys and authenticated confirmer
  certificates with expiry/revocation/ordering rules qualified against the actual
  implementation. The feed’s HS1 maximum age is still unresolved.
- Live native evidence for the exact affiliated guild. Census counts and the
  48-hour provisional onboarding state confer no individual membership.
- Bound request/account incarnation, one-use challenge, freshness, replay and
  replacement safeguards; negative, foreign-guild and erasure/recovery cases.
- Existing JSON storage only, Native E2 own-copy/erasure/restore coverage, bounded
  statements and the central role writer. No DDL or direct role-dispatch bypass.
- Current local/hosted review and real client end-to-end acceptance. Structural
  parser tests and synthetic keys are not live producer or native acceptance.

The owner’s single-host whisper path is independent: an authenticated fresh
native GUID/current own-roster observation can support that pinned guild only.
An own-roster absence must not be relabeled as absence from every sister guild.
Gold receipt capture is a separate observational pipeline; census/QR proofs do
not prove a completed trade, mail receipt or payment.

## Public producer sources reviewed

- [Individual producer, Link.lua](https://github.com/dnl-gentile/olympus-addon/blob/71bc357c251b49a167821cc0b7f922eb69fa35b6/Olympus/Link.lua)
- [Aggregate producer, ArmyExport.lua](https://github.com/dnl-gentile/olympus-addon/blob/71bc357c251b49a167821cc0b7f922eb69fa35b6/Olympus/ArmyExport.lua)
- [Existing individual QR consumer](https://github.com/dnl-gentile/olympus-addon/blob/71bc357c251b49a167821cc0b7f922eb69fa35b6/web/public/core.js)

Local context: `launch227-feed-contract.md` and
`launch227-live-qr-proposal.md`. Production activation remains a distinct gated
operation; this draft sends no message and enables no service.
