# Post-.218 bot, intent and emoji-channel audit

Dated 31 October 2026 (America/Chicago); raw observations use UTC. This is an audit and isolated preparation, not a deployment/activation or exhaustive live feature acceptance. Companion source baseline: 6d273d1bc53a2a7cde97f3225e6edf9156d715c3. Verify baseline: 6a0b3b9cae5cde7bea4b84c2fe03eb2052902ec3.

## Current deployment and authority inventory

| Item | Verify | Forever |
|---|---|---|
| Discord application | 1550176895671341076 | 1552073500167110767 |
| Current live guild scope | Asmongold 236932545793490944 | Test A 1552088658159337512 and Test B 1552089022430711991 |
| Worker deployment observed | 7debff62-e92c-41d1-a071-387d9477d003, accepted .218 | 2fa93aa9-ea2c-4ec6-bc1b-b876dae4a1d6, created 1 October 2026; latest merged source is not thereby deployed |
| Browser domain binding | olympus.roachcouncil.com (also guild.roachcouncil.com) | olympusforever.roachcouncil.com |
| Portal interactions URL observed | https://olympus-verify.roach-council.workers.dev/interactions | https://olympus-forever.roach-council.workers.dev/interactions |
| Server Members Intent observed | ON | OFF |
| Presence / Message Content | OFF / OFF | OFF / OFF |
| Public Bot / Requires OAuth2 Code Grant | false / false | false / false |
| Scheduler observed | every quarter hour | three offset schedules: every ten minutes; minutes 2/12/22/32/42/52; minutes 5/15/25/35/45/55 |

Fresh provider readbacks and normal Portal UI established those facts; no tokens, public-key private counterparts or secret binding values were exported. Asmongold's normal Integrations inventory showed Verify and no Forever entry. This agrees with Forever's private live guild targets. It does not prove a future public rollout is collision-free.

The newly merged Forever source and its prospective top-level real-guild configuration must not be mistaken for the October 1 private deployment. A future top-level deployment would also need an explicit domain/route adoption plan: some older checked-in public configuration points at the keeper's browser domain. Do not deploy that configuration as-is over Verify.

## Feature-by-feature reconciliation

| Feature / source entry | Verify | Forever | Qualification and outstanding boundary |
|---|---|---|---|
| Signed HTTP interactions | index.ts, interactions.ts, replay ledger, application/public-key checks | bot/interactions.ts, request timestamp/signature/replay checks | Source and focused fixtures; both Portal URLs present. No Gateway process is required. |
| Member verification | /verify, /verify-status, Get my code/My status buttons; whisper/mail-controlled character proof and officer roster | /verify, /status, /unlink; Battle.net freshness plus officer/qualified roster route | They have different semantics. Keep Verify as the Asmongold onboarding flow; do not make optional Verify Battle.net linking mandatory by importing Forever's policy. |
| Staff commands | /olympus-admin unbind/ban/unban/queue/sync/roster/lookup/refresh-guide/post-guide | /olympus-resync, hold, pending, approve, unapprove only in OFFICER_GUILD_ID | Source authorization rechecks remain necessary beyond Discord command visibility. No commands were executed or registered by this audit. |
| Identity/lookup | Olympus linked characters context command; /olympus-lookup | Own status and officer target actions | Current app/guild namespaces, not channel names, determine ownership. |
| Guides/intros | /olympus-intros, existing message/pin/forum custody and /olympus-admin guide actions | No duplicate intro publisher | Verify guide tests 99/99; live guide already visible. The current join-olympus and raid-signups bot overrides explicitly allow View Channel, Send Messages, Embed Links, Pin Messages and Read Message History; no guide refresh was triggered. |
| QR/peer verification | /olympus-qr code exists behind separate phase gates; Link and Army remain separate | No equivalent public authority from this feed | Six live Verify registrations omit this extra gated source definition. Do not register it merely to match a bulk script or infer activation from a definition. |
| Calendar/scheduling | community-events.ts, authorized organizers, revisioned calendar and capacity/RSVP | events.ts, its own calendar/RSVP/ICS | Different stores/calendars are not automatically synchronized. Verify owns the live Asmongold flow; Forever remains private. |
| Discord RSVP buttons | community-event-buttons.ts, registered message custody and original account/privacy/consent fences | No Discord raid RSVP publisher/handler in current source; only unlink confirmation buttons | Verify 99/99 button checks. Do not advertise Forever website RSVP as Discord button delivery. |
| Raid/event publication | community-event-delivery.ts, preview then exact channel/guild/message custody; durable ambiguous-outcome hold | No duplicate raid-announcement publisher | 94/94 final delivery checks, including four emoji names. Real user publication not performed. |
| Event reminders | community-event-reminders.ts, events plus delivery/reminder flags, explicitly armed event/consenting recipients | No calendar reminder scheduler; officer digest is a different feature | Verify 107/107 reminder checks. At most one due opted event per eligible ordinary tick, around 60 minutes before start; next quarter-hour tick, not an exact-minute promise. Unknown sends hold rather than resend. |
| Guild Member/rank reconciliation | roster effects + bounded sweep + native rank planner; keeper role 1552077551839617104 | separate desired-role jobs and membership/Battle.net rules, shared-role keeper guard | Focused role budget/sweep tests and Forever shared-role tests. No live grant/removal triggered. New prospective Asmongold shared flag prevents Forever from revoking a keeper-owned role after BNet unlink/expiry. |
| Departed-member cleanup | definitive member GET 404, denied/screening/privacy gates, departure intake/retention | membership index, definitive absence, role jobs, departure review | Verify 46/46 departure tests; Forever membership/departure/cron tests. Transport/429/5xx is not departure; intent approval does not authorize reset workflows. |
| Member directory/search | on-demand REST List Guild Members; member/name searches; no persistent complete mirror | local eligible member directory and existing profile/verification model | One live Verify page loaded with 3 eligible members and more pages available. That proves current List Members access, not a full server census or a role mutation. |
| Officer digest / coverage | community-digest.ts + bounded existing DB observations, scheduled digest | officer-digest.ts with independent consent/channel ID/unknown-send discipline | Distinct schedules/data. No duplicate main-server Forever digest established. Coverage report does not fetch every Discord role holder. |
| Profiles, crafting, attendance, trials, restrictions, departures, contributions, own-copy/erasure | Existing community APIs and Native E2 admission/retention, feature gates | Corresponding separately stored guild feature modules, current consumer contract | Not slash commands or automatic cross-app synchronization. Selected source tests cover relevant event/membership paths; this audit is not a full rerun of every website suite. |
| News/Town Crier, Stockades, Treasury, Army, Link | Existing separate publication/provider/reset/activation authorities | No new authority through this audit or relay | MEE6 appeals ticketing is independent. No reset, webhook test, provider switch or live membership action was performed. Treasury cosmetics, Army aggregate and Link remain OFF. |

## Members Intent: what actually changes

Discord's GUILD_MEMBERS gate applies to REST List Guild Members, not just Gateway subscriptions. The Portal flag is ON for Verify, and the current normal directory path succeeded. Neither Worker opens a Gateway connection; enabling this flag does not install a new join/leave listener or automatically run a whole-server reconciliation.

community-discord-directory.ts reads one Discord source page (max 1,000) and returns at most 100 eligible rows. The original-session encrypted cursor expires after fifteen minutes; traversal is non-atomic. It creates no accounts or roles, logs no member payload, and writes no permanent roster mirror. Existing opt-out and zero-retention erasure behavior remains intact. Other bounded member/search paths use the same application's entitlement; full-list beta/reset helpers remain separately gated and were not executed.

Known-account role reconciliation uses individual membership reads, bounded scheduled work and existing roster authority. Definitive absence may initiate cleanup; temporary provider errors fail closed. No newly approved intent is authority to grant staff roles, trust an addon claim, run a reset, or collect presence/message content.

The older COVERAGE_LIMITATIONS wording in community-digest.ts mentions listing being impossible without GUILD_MEMBERS. Read that as a general API prerequisite, not a claim that approval is still disabled. The report still intentionally uses existing local roster/site facts only; it has not become a complete role-holder audit. No served runtime copy was changed in this preparation-only pass.

## Observed Discord registrations and permissions

Verify has six live Asmongold registrations matching its enabled core flows; the extra source /olympus-qr remains separately gated. Forever has three member commands in Test A and all eight member/staff commands in Test B. Both private bot roles are above their member target; Test Officer remains above the Test B bot. Asmongold Verify is above Guild Member and native/live rank targets. Those are read-only configuration observations, not real role effects.

Verify guild-base permissions omit Embed Links and Pin Messages, but the exact join-olympus and raid-signups role overrides explicitly allow both, plus View/Send/Read History. Therefore those two channel overrides resolve the apparent base-permission gap. Other guide/forum destinations and ordinary-officer command overrides were not exhaustively exercised. The raid-signups channel topic still describes thread replies; the current intro source also explains RSVP buttons. Suggested topic copy is included in the operator checklist for the next authorized content maintenance; no channel settings were written.

## Concrete compatibility fix prepared in Forever

Before: top-level Asmongold ROLE_DESTINATIONS omitted keepIfOlympusVerifyMember while the second destination enabled it. A future adoption could remove the shared Asmongold Guild Member role when Forever's independent link/approval eligibility expired, even though Verify still held in-game membership.

After: prospective Asmongold target explicitly sets keepIfOlympusVerifyMember=true. A regression loads the actual checked-in production flag into synthetic destination IDs, confirms sticky protection, unlinks Battle.net and proves both keeper-owned roles survive without a DELETE. The existing strict config assertion is updated from false to true for that exact flag. The private-test configuration remains unchanged; no live switch was made. This is bounded protection, not a new shared eligibility policy or an approval of a public Forever rollout.

## Emoji-prefixed channel names

Runtime routing in both repositories uses snowflake IDs. INTROS_CHANNELS keys such as raid-signups are stable logical configuration keys, not comparisons with Discord display names. Keep raid-signups=1554266022444408872 even if that channel is renamed to 📅raid-schedule. Guide references resolve to <#ID>. Do not replace keys with emoji names, strip arbitrary prefixes, guess channels or fall back to fuzzy matching.

The audit checked channel_id/channelId, channel.name/name equality, find/search/name parsing, configured channels and Discord /channels/... call sites in both source trees and operational scripts. The name comparison in intros.ts is a managed forum thread's title, not a channel destination lookup. Forum tag matching is separate authored metadata. Forever guildName/roleName are labels; guildId/roleId remain authority. Staff command channel arguments are Discord Channel IDs. No runtime destination-name parser requiring a patch was found.

Four added real-handler fixture publications use display names ⚡olympus-verify, 📅raid-schedule, ⚖️the-stockades and 💰imperial-treasury, preserving the same channel ID and actual POST destination. No Discord channels were renamed. Guide copy should use clickable channel mentions; accompanying human descriptions may include the decorative prefix.

## Evidence limits

Source/local fixtures, current Portal/provider observations, live directory read and actual delivered notifications are separate. No real reminder, test event, role grant/removal, slash registration, bot invitation, credential change, deployment or provider setting write occurred. Therefore this audit cannot honestly assert zero broken features or live end-to-end reminder delivery. Remaining live acceptance requires an owner-designated test event/consenting participants or inspection of an already delivered intended reminder and original custody, plus effective channel/ordinary-member command permission checks. Full live list reconciliation was not run.

No DDL, schema/object count change, identify-copy expansion, E2 policy change, whole-server mirror or identity-retention exception is introduced.

## Official references

- [Discord Gateway intents](https://github.com/discord/discord-api-docs/blob/main/developers/events/gateway.mdx) and [Guild REST resource](https://github.com/discord/discord-api-docs/blob/main/developers/resources/guild.mdx): REST member-list entitlement and Gateway distinction.
- [Application commands](https://docs.discord.com/developers/interactions/application-commands): per-application/guild command scope and registration.
- [Role permissions/hierarchy](https://github.com/discord/discord-api-docs/blob/main/developers/topics/permissions.mdx): manageability depends on actual hierarchy and effective permissions.
- [Privileged intent access changes](https://support-dev.discord.com/hc/en-us/articles/40281523410967-Changes-to-Privileged-Intent-Access-for-Discord-Apps): use current Portal/review requirements; do not copy obsolete server-count thresholds.
