# Olympus guides and tools (.218)

The site's own class, spec and profession guides and raid preparation tools. They live at `#/resources` (the hub),
`#/guides/class/<class>[/<spec>]`, `#/guides/profession/<key>` and `#/guides/tools/<attunements|buffs|raid-structure|changes>`. `#/guides`
itself is unchanged: it is still the reviewed publisher library (`resources169`).

The raid structure tool adapts Fox’s guild leadership guidelines into a planning reference for roster grouping,
progression stability and farm rotations. It links to the standing raid and loot rules.

## Files
- `worker/public/static/guides218.js`: the renderer (`window.OlympusGuides.mount(box, options)`). It validates the whole catalogue
  before drawing anything and refuses it as a whole when any field is out of shape. It builds the page with `createElement`
  and `textContent` only: no HTML strings, inline styles, storage, eval or randomness.
- `worker/public/static/guides218.css`: scoped `.guides218-*` styles, no `url()`, reduced-motion and forced-colors rules,
  restacking at 560 px.
- `worker/public/static/guides218.json` is the maintained catalogue. Member access is required to load it on the site.

## Honesty rules
Every fact carries a grade, and the page explains the grades once:

| Grade | Meaning |
|---|---|
| A | Exact client data from the pinned talent snapshot (1.60.1.70425) |
| B | Official Blizzard announcement, notes or developer Q&A for Forever |
| C | Published Forever guide or community source |
| D | Derived estimate from Classic reference — not Forever-verified |
| E | Classic reference — not Forever-verified |
| U | Unavailable (shown as "Unavailable", never 0 or a guess) |

- Classic numbers are never presented as Forever facts.
- Presets are "starting points", never "best", "optimal" or "BiS".
- There is no GDKP content. Every profession gold note ends with "subject to Blizzard policy".
- The prose is original Olympus writing. Sources are linked on an allow-listed set of hosts.

## Presets, "Load" and "Attach"
- Every preset is computed from authored talent ranks with the calculator's own rules: talent order, tier gating, requirements
  and the full point budget at level 30 or 60. `guides218_test.cjs` checks that each code parses in `calculator.js`, validates
  at its level and is accepted unchanged by `talentBuildAttachment`.
- "Load this build in the talent calculator" is a plain link to `#/talents/<class>/<code>`.
- "Attach to my application" only carries the build into the open application form. It fills the main character's level 30
  or 60 slot, sets the class only when none was chosen, marks the form unsaved and says nothing has been sent. It never saves,
  never ticks the confirmation and never changes board sharing. Applicants review and save as usual. A pending attachment
  lives in page memory for five minutes and is used once.

## Authoring
The October 31 release was built from the archived `perfection-2026-10-31/claude/l2/` authoring files. Since November 4,
maintain copy and references in the tracked `guides218.json` catalogue. The October generator reproduces the historical
catalogue. For current updates, preserve existing source indices and preset codes, add dated references for changed claims,
and check the catalogue through `guides218_test.cjs` and the asset projection checks. The talent-change counts come from
`talents/data.json`, which remains the source for the frozen build snapshot.

The buff tool uses Classic Era client build `1.15.9.69722` for the grade-E Songflower, Dire Maul and flask corrections.
The linked Spell, SpellEffect, SpellMisc and SpellDuration exports identify the precise effects and durations.
The three flask rows use a unique `classicFlaskSpellId`, grade E and a recorded duration. The tool compares one flask
at a time outside both encounter previews, following the client tooltip's one-flask rule. These rows carry no additive
`stats`. An encounter preview reports how many selections lack a recorded duration.

## Tests
- `worker/tests/guides218_test.cjs`: source policy, closed validation and refusals, preset round trips, talent-count parity,
  every view, attach shape and disabled state, "Unavailable" rendering, failure and teardown.
- `worker/tests/frontend218_guides_test.cjs`: the real page script and Worker, covering the Resources entry, hub and sub-route
  mounts, titles, the unchanged publisher library, and the attach prefill with zero application writes.
