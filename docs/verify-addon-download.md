# Olympus Verify officer addon download

The unified addon setup page links to `/static/olympus-verify/olympus-verify-0.6.21.zip` and `/static/olympus-verify/version.json`. These two code-only files accept public GET/HEAD requests on the site host. They do not require a cookie or query the database. Other static files retain their existing access rules.

Olympus Verify is the officer verification addon. The separate **Olympus Guild** CurseForge connection and its optional site aggregate exporter are unchanged. The retired standalone Army addon remains unavailable.

Exit the game before updating. Extract the `OlympusVerify` folder into `Interface/AddOns`, merging the public files. Preserve the existing private `Config.lua`, generated `OlympusQueue.lua`, `OlympusLaunchQueue.lua`, `OlympusVerifyLists.lua`, and SavedVariables. The ZIP deliberately omits them. A new officer installation still needs its separately authorized private configuration and Watcher setup; `Config.example.lua` is an example, not an active configuration. Downloading the addon grants no membership, invite or role authority.

From the repository root, `node scripts/build-verify-addon.cjs --write` rebuilds the two tracked outputs from exactly 17 listed source files. `--check` (the default) verifies them without writing. ZIP entries use a fixed order, stored bytes, Unix mode 0644 and the fixed date 1980-01-01. The version manifest includes every entry's size and SHA-256 plus the complete ZIP digest. The generator pins the three reviewed 0.6.21 performance-repair files; the remaining payload is copied byte for byte. It never scans local installations, configuration, SavedVariables or exchange files.

`node scripts/tests/verify-addon-package.test.cjs` checks archive/source/manifest parity, reproducibility and exclusion boundaries. `node scripts/tests/verify-addon-download.test.cjs` exercises the actual Worker entry and server-rendered setup page with a fixed fake asset binding and database/provider traps. Hosted release qualification, deployment and native-client acceptance remain separate from these local checks.
