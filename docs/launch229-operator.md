# Launch .229 operator guide

Use the qualified, fast-forwarded primary checkout at `C:\Users\vikto\OneDrive\Apps\Olympus\olympus-verify`. Production must report Build .229 with `members-only`, `nativeScopePinned: true` and native proof version 1 before ingestion starts. The pinned raw scope is `OLYMPUS PRIME` / `CAMWOW US2 Realm 3 PvE`. Native exports and HMAC proofs keep those exact bytes; display aliases do not rewrite them.

## Three steps on Fern Melder's PC

1. Open PowerShell and start from the primary watcher folder. This preflight uses the existing private configuration internally; do not print or copy it. Run only one watcher. If another writer owns the state lease, stop and inspect the existing instance; do not delete its state or lock.

   ```powershell
   Set-Location -LiteralPath 'C:\Users\vikto\OneDrive\Apps\Olympus\olympus-verify\watcher'
   python .\watcher.py --config .\config.json --check
   ```

   After a successful preflight, start the launcher and retain its output outside OneDrive:

   ```powershell
   New-Item -ItemType Directory -Path "$env:LOCALAPPDATA\OlympusVerify" -Force | Out-Null
   & .\run-watcher.cmd 2>&1 | Tee-Object -FilePath "$env:LOCALAPPDATA\OlympusVerify\watcher-launch229.log" -Append
   ```

   A CMD alternative from the same folder is `run-watcher.cmd`. Leave its window open. Closing the window stops collection. The launcher offers a restart after exit; inspect a storage/custody error before accepting that restart.

2. Open a second PowerShell window to monitor the private local log:

   ```powershell
   Get-Content -LiteralPath "$env:LOCALAPPDATA\OlympusVerify\watcher-launch229.log" -Tail 40 -Wait
   ```

   Check the reported watcher version, expected WoW SavedVariables path, accepted native roster and successful Worker responses. A configuration hold, rate limit, stale snapshot, unknown result or custody error is a hold. Never turn off membership-only mode or delete state to bypass one. Stop the monitoring command with Ctrl+C; this does not stop the first window's watcher.

3. In WoW, log in as Fern Melder in OLYMPUS PRIME, then use `/reload` and `/olv diagnostics`. `/olv diagnostics scope` prints two clean lines with the exact guild/realm, rank slot, GUID and addon version. Keep custom scripts disabled. Verify the exact guild/realm and API capability report. Use the existing Discord verification button in `#olympus-verify`, follow its own ephemeral code instructions, and whisper the code to Fern Melder. Confirm the accepted GUID-bound native verification and the shared Olympus Guild Member role. Do not post verification codes into logs or public chat.

   Open `/olv launch`, then click **Scan + reload**. This signs one local read request and reloads to persist it; no extra `/reload` is needed for that control. The watcher deliberately fetches at most one page per five seconds, interleaved with ordinary ingestion. Up to 50 discovery pages take at least 245 seconds, then at most three refreshed pages take another 15 seconds. It never automatically restarts a stopped, refused or expired scan. **Stop + reload** stops that scan and immediately holds its loaded action data.

   When discovery and its bounded refresh finish, use **Sync & reload** in the launch window to load the generated projection. Discovery completeness does not mean all rows are action-fresh: each candidate page has its own 60-second role deadline, and the native roster must have updated within 15 seconds at the action. The automatic final refresh covers page 0 for MOTD plus at most two other candidate-bearing pages, prioritizing Veteran targets. Other rows remain stale advice. Use **Recheck page + reload** for the displayed promotion page, wait for that one page to refresh, then **Sync & reload** again promptly. Recheck does not extend the original 600-second scan/native-source deadline. If that deadline or any roster fact changes, start a new explicit scan instead of retrying the old one.

   A promotion row button or `/olv promote <GUID-or-displayed-index>` performs at most one attended request and rechecks that page's freshness, the native roster identity, rank, scope and permission. Direct rank assignment is capability- and permission-checked; a supported fallback requests only one rank per separate click, waiting for a newer native roster before another. `/olv buffer` prints review-only space advice. `/olv motd` displays the proposed text; `/olv motd set` requests one attended setter action. Native confirmation remains necessary.

The launch scan covers at most 1,000 native roster rows in 50 pages. A scan's original lifetime is at most 600 seconds and never outlives its roster. Each page's Discord role eligibility lasts at most 60 seconds. Examined rows may therefore be stale advisory rows when the scan completes. Recheck a bounded candidate batch for fresh action eligibility. Reload exports are coalesced only while the same watcher process has a positive trusted receipt for the original complete roster and every native roster field except the export timestamp is byte-identical. The original source date is retained. Any change, missing/uncertain receipt, restart or expiry holds the old scan and follows ordinary ingestion. Whisper/proof and presence ingestion continue normally. No timer promotes, invites, removes a character or sets the MOTD. Native API symbol availability alone does not prove permission or successful hardware behavior.

## Current operational boundaries

Knight-or-higher means one of the exact nine current Asmongold ladder role IDs; arbitrary higher-position roles confer no entitlement. Linked Knights below Veteran can be recommended for slot 5. Other verified Initiates can be recommended for Member slot 7. Pending, unknown, denied, banned, privacy-held and ambiguous identities are held. Unverified Initiates are a review-only space buffer, ordered by lower level then longer known offline time; there is no automatic purge.

Knight invitations remain held until a qualified positive unguilded observation can bind the current whispering GUID. A nil `GetGuildInfo` result and Daniel's cached WHO record do not supply that proof. No unknown-guild priority queue or invite API dispatch is enabled. Reserved-name automatic invite queuing remains off.

The attached third-party addon is 1.4.4. Its Link key placeholder and name-based signed wire do not qualify the separate GUID-bound Link backend. HS1 ordering exists, but seven-day expiry at every authority read was not established. The 48-hour GM grace exists. See `launch229-addon-audit.md` and the unsent `launch229-daniel-reply.txt`. Fern Melder remains the WoW gold-mail recipient; Fernmelder is the Discord name. Gold intake never grants a role or benefit automatically.
