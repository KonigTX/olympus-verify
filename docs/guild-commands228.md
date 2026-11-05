# Olympus Verify Discord command reference

This reference covers Verify in Asmongold's server. The retained authenticated guild registry readback at **2 November 2026, 23:01:48 UTC** recorded 19 slash commands and one user-context command for Verify application `1550176895671341076` in guild `236932545793490944`. Use the registry column when interpreting that dated evidence. Current availability and role or channel overrides require a fresh attended check.

## Command catalogue

| Registered command | Options in the retained registry | What it does |
| --- | --- | --- |
| `/branches` | | Show branch capacity and the status of accepted Army data. |
| `/council` | | Show the Council and native ranks. |
| `/event` | `schedule`, `create`, `list`, `roster`, `rsvp`, `remind`, `attendance` | Read the shared calendar or record your signup. Scheduling, reminder consent and attendance changes require current organizer authority. |
| `/forever` | `guide`, `talents`, `consumables`, `buffs`, `attunement` | Open the same guide tools as `/guide` with Forever command names. |
| `/guide` | `class`, `talent`, `consumes`, `buffs`, `attunement` | Find class and preparation guidance or preview a talent code. |
| `/launch` | | Read the launch and raid timing guidance. Check Blizzard for service availability. |
| `/olympus` | | Open the private verification, guides, Workshop, branches, Council and Treasury hub. |
| `/olympus-admin` | `unbind`, `ban`, `unban`, `queue`, `sync`, `roster`, `lookup`, `refresh-guide`, `post-guide`, `release`, `role-sync` | Staff verification, roster and guide operations. `release` closes an open request and refuses an existing character binding. `unbind` is the separate guarded binding operation. |
| `/olympus-intros` | `refresh`, `status` | Inspect intro publication records or refresh configured introductions with staff authority. |
| `/olympus-lookup` | Optional `member` or `character` | Look up permitted linked-character data with staff authority. |
| `/olympus-privacy` | | Open the normal authenticated website controls for account copy and erasure. |
| `/olympus-status` | | Use the same status workflow as `/verify-status`, including guarded role restoration where applicable. |
| `/olympus-unlink` | | Open the website and character-unlink instructions. Account changes require their respective separate workflows. |
| `/raid` | Optional autocomplete `find` | Open the private raid hub or find an event. The retained registry uses `/event` for the seven direct calendar subcommands. |
| `/stockades` | | Read appeal and conditional-clemency guidance. |
| `/treasury` | | Read the in-game Treasury reference. |
| `/verify` | Optional autocomplete `character` | Issue a verification request code, optionally bound to a character. |
| `/verify-status` | | Show verification status and run existing guarded role restoration where applicable. |
| `/workshop` | `search`, `order` | Find opted-in crafters or preview a private commission draft for the member to send. The draft creates no order or notification. |
| **Olympus linked characters** | User context menu | Open the staff lookup for the selected Discord member. |

The retained registry gives `/olympus-admin` the Manage Roles default and records a default of `0` for intros, lookup and the user-context command. Discord overrides and the Worker's handler checks are separate. Guild utilities require a current eligible account. The configured owner exception applies to the eligible command paths and preserves existing organizer and operation checks.

The .228 Worker source accepts both the existing bare raid hub and the proposed `/raid hub` form, including their autocomplete. The proposed `/raid` registration also adds the seven direct `/event` subcommands with identical options and preserves the `/event` alias. The [reviewed registration planner](../worker/scripts/guild-command-plan228.mjs) permits only the `/raid` definition to change. The [candidate catalogue](../worker/src/guild-command-definitions228.ts) also describes alphabetical class choices for `/guide class` and `/forever guide`. Those Discord slash options require separately qualified registration. The hub's class dropdown comes from the Worker response and follows the deployed Worker version.

## Buttons, dropdowns and forms

| Surface | Controls to inventory | What to exercise only with appropriate authorization |
| --- | --- | --- |
| Pinned verification guide | Get my code, My status, and any retained legacy character form. | Code issuance, legacy form submission and status paths that may restore a role. |
| Staff review and ban cards | Approve, Deny, Leave it and any enabled Discord ban control. | Approval, denial, card edits and bans require their own authorized workflow. |
| Private `/olympus` hub | Section and class dropdowns, home and section buttons, talent preview and crafter search forms, and website links. | Use synthetic or approved inputs and verify that the replies stay private. |
| Private raid hub | Event autocomplete and dropdown, paging, roster, RSVP preference dropdown, organizer attendance selectors, and schedule, find, reminder and attendance-lock forms. | Opening a modal is separate from submission. RSVP, schedule, reminder and attendance submissions can change state. |
| Direct calendar replies | Seven private signup-preference RSVP buttons and an Open calendar link where an event is eligible. | These buttons write the acting member's signup preference. |
| Public raid notices | Sign up, Tentative, Can't make it and Remind me on applicable current notices. | These are the legacy notice controls. RSVP writes and reminder-mention consent belong to the acting eligible member and current event revision. |

The registration receipt proves the command definitions. The local signed-interaction suites exercise Worker behavior with synthetic Discord transport. Use the [operator checklist](discord-bots-operator-checklist.md) to record an attended inspection by role, app, guild and channel. Record rendering, permission outcomes and any separately authorized delivery as distinct observations.

The dormant QR command and Olympus Forever's private Verify commands are outside this guild registry. The [build .219 reference](guild-commands219.md) describes the earlier catalogue.
