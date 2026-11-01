# Guild commands — Build .219

Olympus Verify owns this suite in Asmongold's server (`236932545793490944`, application `1550176895671341076`). Olympus Forever retains its separate private verification namespace. Registration preserves Verify's existing six commands and adds only the nine names below; it does not enable the dormant `/olympus-qr` command, change intents, or install the companion in the main server.

## Calendar and attendance

`/raid` and `/event` use the same D1 calendar as the website.

| Subcommand | Behaviour | Access |
| --- | --- | --- |
| `schedule` / `create` | Future ISO time with `Z` or an explicit UTC offset; title, duration, optional capacity and preparation notes. Returns a private confirmation, website link and buttons. | Current Raid Leader, Officer, High Council/Leader or site Admin; roster-confirmed eligible site account |
| `list` | Five upcoming events per page; buttons apply to the first event, explicitly labelled. | Verified guild members |
| `roster` | Twenty current eligible signups per page; preferences and separate officer roster decisions. Other people's attendance stays private. | Verified guild members |
| `rsvp` / buttons | Tank, Healer, Melee, Ranged, Tentative, Bench request or Absent. | Verified guild members, own signup only |
| `remind arm` | Explicitly arm one durable reminder for an event. | Current authorized organizer role |
| `remind now` | Arm and attempt that same operation if it is within one hour before start. Outside that window it remains armed for the ordinary cron. | Current authorized organizer role |
| `remind cancel` | Cancel unused consent or preserve an in-flight/known message as cleanup debt. | Current authorized organizer role |
| `attendance record` | After start, record an explicitly observed present/absent/excused/unknown result for one signup or listed member. | Current authorized organizer role |
| `attendance lock` | Finalize the post-start record against later website and command edits. No missing member is inferred absent. | Current authorized organizer role |

Creation does **not** automatically publish a raid-channel announcement. The existing website publication preview/confirmation remains available. Command replies and RSVP results are ephemeral. Only an explicitly armed reminder posts to the existing `raid-signups` channel ID; emoji in its display name does not affect routing.

The existing ordinary quarter-hour cron attempts at most one eligible event reminder per invocation. This means one reminder at the next eligible tick in the hour before start, **not** a public post every fifteen minutes. Claimed, posted and unknown operations cannot be rearmed. A definite no-effect refusal may be retried only with fresh explicit consent. A lost or ambiguous result needs the existing website reconciliation process; there is no automatic resend.

Bench is an applicant preference, not an organizer's bench decision. Melee/Ranged both retain the existing schema's `damage` role and have a separate exact-write-bound preference. A later website or historical button write invalidates an older preference rather than mislabelling the new answer. The account copy includes the current preference.

## Guides and references

| Command | Source and limitations |
| --- | --- |
| `/guide class` | Current class/spec guide catalogue and one-click pinned talent presets; beta/provisional evidence remains labelled |
| `/guide talent` | Local current-code/share-URL validation; class, level, points and tree allocation preview. No remote URL fetch or character ownership claim |
| `/guide consumes` / `buffs` | Existing evidence-graded lists and current rule notes, with the complete website checklist linked |
| `/guide attunement` | Onyxia steps from the existing catalogue. MC/BWL disclose that they are not launch raids and have no confirmed current Forever chain; Classic steps are not invented as live requirements |
| `/workshop` | Current opted-in, roster-confirmed members and their self-reported recipes/skill. Not delivery, recipe-ownership or escrow proof |
| `/treasury` | Fernmelder, in-game gold only, current Royal Writs reference switch. No payment or role dispatch |
| `/stockades` | Free ordinary appeals; separately reviewed eligible conditional clemency at 100g, or a reasoned 250–500g. Severe safety/ToS offenses are excluded; no automatic unban |
| `/council` | Exact ten-rank ladder; Guild Master chair plus twelve distinct reserved Council portfolios, without inventing holders or authority |
| `/branches` | Ten canonical branch contexts and dated accepted Army aggregates. Invalid/missing/stale data is held/unknown; small-population suppression remains intact |
| `/launch` | Announced 4 November 2026, 23:00 UTC countdown; after that time, service availability still requires Blizzard's notices |

All references require the original eligible guild account. Treasury cosmetic dispatch, Army publisher activation, Olympus Link and Daniel's unmounted relay are unchanged and remain OFF unless separately authorized and qualified.

## Authority, privacy and operations

The HTTP interaction signature, application ID, guild ID and replay ledger remain at the original Worker entry. Discord commands never manufacture a browser session. Writes consume an original account incarnation, session version, privacy generation and short signed-request deadline inside a guarded Native batch. Officer actions use a fresh Discord member/role read, never display names or a saved interaction-role snapshot. Officer Alt alone grants no command authority.

Reminder execution consumes the exact selected consent operation and its namespaced event-change marker. It rechecks current roles before claim, before the public POST and after the response. Revocation during a send retains the exact known pointer as unknown cleanup debt. New marker rows use the existing parent retention and actor-erasure handling; they contain no Discord IDs or character names inside their JSON fields. Export/history projections withhold internal nonces and operation anchors. No DDL or new privacy family is introduced.

The reviewed guild command payload must preserve all existing Verify definitions and be read back after one authorized registration. A registration GET/list check sends no public message. Production verification must not create a synthetic event, RSVP on a real member's behalf, post a test reminder or change a role.

Tests: `application_edit219_test.cjs` and `guild_commands219_test.cjs` join the hosted expansion. The signed-command harness uses genuine Ed25519 requests, the real Worker/ledger/Native D1/deferred path and synthetic Discord transport. It does not prove a live provider delivery or real in-game acceptance.
