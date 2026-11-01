# Daniel reply draft

Proposed decisions for confirmation; not sent and not production activation. Both parts fit the normal 2,000-character Discord message limit.

## Part 1

Daniel — I audited all four files and ran your validator: 2,084 structure/policy checks passed. The manual export stays as a separate fallback; the relay will not verify membership or grant roles.

Here are the proposed v1 choices to freeze together (not an activation):
• GET /companion/v1/site/aggregates?v=1&scope=forever-pve-alliance, polled every 5 minutes. Please confirm the exact HTTPS origin and query order.
• Please send the actual native Forever PvE realm-group value and minimal aliases from an own-roster capture. We will pin mappingVersion=1 after review, with no placeholder or inherited beta mapping.
• Qualifying witnesses: authenticated, established linked accounts only; newest own-roster observation per linked account/guild/metric. Devices/characters cannot multiply a witness, and unverified claims cannot force merges. These are roster characters and linked-account witnesses, not unique humans.
• Council counts once like everyone else: no weighting, tie-break, quorum override or public participation flag. Please confirm the authoritative signed HS1 membership producer/owner, refresh cadence, expiry and immediate revocation process. HT1 titles alone do not establish membership; losing Council designation alone need not remove ordinary witness eligibility.
• Keep all 11 ordered rows: Olympus, then Olympus I–X. Require a unique largest directly compatible cluster, at least 2 witnesses and >50% of ALL eligible witnesses including outliers. No transitive chaining. Tolerances: characters max(5,ceil(5% × max)); online max(2,ceil(5% × max)). Even median: Option A, rounded middle pair; differing accepted values are approximate.

Part 2 follows with privacy, freshness and transport defaults.

## Part 2

Part 2/2 — proposed v1 defaults:
• Characters expire after 1,800s; online after 900s, independently. Use the oldest participating bounded interval (width ≤299s), 5s maximum clock skew. Online needs its own quorum AND an accepted visible character total. Zero is exact; mask positive 1–4 after aggregation and protect complementary small groups.
• Complete atomic snapshots (UTF-8 JSON ≤16 KiB), monotonic per-scope sequence and strong ETag. Missing/malformed rows reject the whole reply. Withdrawal/revocation/expiry emits a new snapshot/sequence/ETag; 304 never refreshes age or resurrects a value.
• Relay wins only when its whole source interval is strictly newer than manual. Overlap/tie prefers manual; unavailable relay falls back to valid manual. Never mix their total/online fields or use manual uploads as quorum witnesses.
• Dedicated server-only Ed25519 request key, separate from Council/Discord/Companion/Link keys. Pin EdDSA, typ, kid, v/iss/aud, GET, exact URL and scope; lifetime ≤60s; fresh ≥128-bit jti consumed atomically across relay instances through expiry+skew. No auth/JWS/jti/key logging.
• Website: current masked candidate only, no history or person IDs. Proposed relay maxima: raw observations 24h, redacted security logs 30d, encrypted backups 30d, primary erasure within 24h. Remove/recompute revoked contributors immediately; document minimal deletion records and a restore barrier that cannot recreate erased identity. No new website ID retention. Please confirm these durations and implementation.
• Rate: 30 requests/minute/credential with 429 + Retry-After; 90-day minimum v1 deprecation after v2. Strict schema changes need v2/new fixtures.

The website consumer is prepared and tested in an isolated branch, unmounted and OFF. Please confirm the choices, origin, native mapping and HS1 lifecycle, then send producer/replay/erasure tests and a real masked sample. Reference fixtures do not prove live behavior. No key exchange or activation yet.
