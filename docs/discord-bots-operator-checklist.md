# Discord operator checklist: Verify and Forever

## Current .221 preparation — 1 November 2026

The dated observations below remain history. The .219 operation registered15 Verify commands (six core plus nine guild utilities), and .220 changed the channel guidance without re-registering them. The .221 candidate prepares19: retain all six core entries and their permissions, retain the existing guide/event/raid/reference names, add `/olympus-status`, `/olympus-unlink`, `/olympus-privacy` and `/forever`, update `/workshop` to `search` and private-draft `order`, and append staff `release` and `role-sync` aliases. Only the exact qualified, action-time registration receipt establishes that they are live. `release` can close an open verification request and refuses an existing binding; explicit `unbind` remains a separate reviewed staff action. The namespaced account links open the normal authenticated website controls, and do not erase or unlink immediately. `/olympus-status` keeps the existing status workflow, including any already-authorized guarded role restoration.

The registration planner binds the actual15-command readback and its digest, preserves the six core definitions and permissions, permits only the two named admin additions, and verifies the final19-command readback. Dormant `/olympus-qr`, global commands, application metadata, role assignments and the private companion namespace remain outside this operation. Do not use the historical bulk `register.mjs` for the current catalogue. Workshop commission drafts store no order and notify no crafter; the member reviews and sends their own request.

The34 channel renames and raid topic were already acknowledged in .220. Keep snowflake IDs and the existing `raid-signups` routing key; do not replay renames to match an illustrative emoji spelling. Verify Server Members entitlement is recorded under ticket69051883 with renewal review before23 October2027. This is a REST directory entitlement, not a claim that a Gateway connection or the private companion uses it. Keep shared membership role1552077551839617104 protected in companion current main `b27052c`. Portal toggles, ordinary-member/officer command permissions and actual opted-in reminder delivery require their own live observations; local signed fixtures alone do not prove them.

Audit: 31 October 2026, accepted Verify .218. Checked means observed read-only, not newly changed. This is not a registration/deployment instruction to execute automatically.

## Developer Portal

| Check | Verify 1550176895671341076 | Forever 1552073500167110767 |
|---|---|---|
| Application/key belongs to correct Worker | Compare app public key with that Worker's configured key at approved deployment; never export bot token | Separate app/key, never copy Verify credentials |
| Interactions URL (observed) | https://olympus-verify.roach-council.workers.dev/interactions | https://olympus-forever.roach-council.workers.dev/interactions |
| Server Members Intent | Checked ON; retain current approved directory use and review entitlement before 23 Oct 2027 per recorded owner approval | Checked OFF; current HTTP-only per-account reconciliation does not require full member enumeration |
| Presence / Message Content | Checked OFF / OFF | Checked OFF / OFF |
| Public Bot / Requires OAuth2 Code Grant | Checked false / false | Checked false / false |
| Install contexts/scopes | Server install, bot + applications.commands; member web sign-in is separate | Same, only the explicit destination guilds |
| Discord OAuth redirects needed by source (not newly registered or fully inspected) | Website https://olympus.roachcouncil.com/auth/callback; optional linked-role flow https://olympus-verify.roach-council.workers.dev/oauth/callback | Private current https://olympusforever.roachcouncil.com/auth/discord/callback; do not substitute the keeper's browser host |

The Bot page permission calculator is not a view of installed guild permissions. Read Server Settings → Integrations and channel overrides instead. No privileged-intent toggle, key, OAuth redirect, install or Portal setting was changed.

## Slash commands and access

- Verify in Asmongold: **six observed** registrations: /verify, /verify-status, /olympus-admin, /olympus-intros, /olympus-lookup, and the Olympus linked characters user-context command. The four staff/lookup entries show overrides; ordinary-member restrictions still need their own account acceptance.
- Verify source bulk register also defines /olympus-qr, behind its separate QR phase gates. Its absence from the live six is disclosed, not silently fixed or treated as permission to activate QR.
- Forever Test A: **three observed** /verify, /status, /unlink.
- Forever Test B: **eight observed**: the same three plus /olympus-resync, /olympus-hold, /olympus-pending, /olympus-approve, /olympus-unapprove. Staff handlers recheck OFFICER_GUILD_ID and OFFICER_ROLE_IDS. A logged-in owner is not an ordinary-officer permission test.
- Forever was not present in Asmongold's observed integrations. Keep its current private targets unless a separate public-adoption plan is authorized. Its /verify means Battle.net + approval, unlike Verify's in-game code flow. If ever installed alongside Verify, agree on command/app labeling or a namespaced migration before registering either, rather than silently replacing the main onboarding flow.
- Bulk PUT registration replaces only that application's command list in the named guild. Verify's full register includes shared intros/lookup/context definitions when guilds coincide; the separate intro registrar upserts. Never execute a registrar merely to inspect definitions. No registrar was executed in this audit.

## Roles and channel permissions

- Current Asmongold high-to-low displayed order: Olympus Verify, Olympus Guild Leader, Olympus Officer, Olympus Raid Leader, Olympus Council GM, Olympus Council Officer, Olympus Guild Member, then addon/native/live rank roles. Verify is above the configured member/native role targets. Observed Guild Member count: 157, not an in-game census.
- Verify has guild-level Manage Roles, View Channels, Send Messages, Send Messages in Threads and Read Message History. Administrator is denied. Embed Links and Pin Messages are denied at guild base; join-olympus and raid-signups explicitly allow both, plus View/Send/Read History for Olympus Verify. Confirm the other guide/forum targets before a refresh; the base flag alone is not a publish failure.
- Keep each bot above every role it is actually authorized to manage. Where possible keep unrelated staff/administrator authority roles above bots; do not blindly reorder around native rank targets. Configured native rank keys and staff authority roles are distinct.
- Canonical Asmongold Guild Member ID: **1552077551839617104**. Never use the retired duplicate or infer authority from a role's display name.
- Forever prospective top-level Asmongold destination now has keepIfOlympusVerifyMember=true in the isolated branch. Review/install it before any public adoption; the current private deployment did not change. Unknown keeper state must continue to hold removals.
- Forever Test A displayed order: Quarantine, Olympus Forever, Guild Member. Test B: Test Officer, Olympus Forever, Guild Member. Both bot roles are above their synthetic member target; this is not Asmongold installation acceptance.
- Verify raid destination: logical key raid-signups → **1554266022444408872**, guild **236932545793490944**. Check View Channel, Send Messages and Read Message History for plain text reminder/publication, plus applicable embed/thread/pin permissions only for enabled guide features. No Administrator, Mention Everyone, Kick or Ban permission is required by these bot features.
- Emoji display names are safe. Keep stable keys and Channel IDs. Do not change raid-signups=ID to 📅raid-schedule=ID; rename only the human-visible Discord channel if separately requested.

## Remaining attended acceptance

Confirm an intended real event's current publication custody, opted reminder consent and delivery result; or authorize a labelled test with explicit consenting participants. The join-olympus and raid-signups role overrides are verified; inspect other guide/forum targets and ordinary-member/officer command access. Do not trigger reminders, sync roles, reset members or create a real event just for this read-only audit. Local fixtures and a successful directory page do not establish those live effects.

[Complete feature audit](post218-bot-channel-audit.md) · [Feed contract decisions](site-relay-feed-v1-review.md)

References: [Discord command scope](https://docs.discord.com/developers/interactions/application-commands), [permissions and hierarchy](https://github.com/discord/discord-api-docs/blob/main/developers/topics/permissions.mdx), [REST member-list entitlement](https://github.com/discord/discord-api-docs/blob/main/developers/resources/guild.mdx).

Suggested raid-signups topic for the next authorized content-maintenance action: “Use the RSVP buttons on a current raid notice or the website calendar. If a notice has no buttons, use its linked thread with character, class/spec, role and availability. A sign-up requests a place; only the raid leader confirms the roster. Update your RSVP if plans change.” This is proposed copy only; no channel was edited.
