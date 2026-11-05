-- .229 launch operations. Projections expire; only explicit slash/button hardware paths may act.
-- No event/timer handler invites, promotes, removes or sets MOTD. Unknown unguilded proof stays held.
local ADDON = ...
local Q = { generation = 0, pending = {}, directBlocked = false }
OlympusLaunch229 = Q
local H, cfg = OlympusHmac, OlympusVerifyConfig or {}
local function Say(text) DEFAULT_CHAT_FRAME:AddMessage("|cffc9a227Olympus|r: " .. text) end
local function Text(value, limit)
  if type(issecretvalue) == "function" then local ok, secret = pcall(issecretvalue, value); if not ok or secret then return nil end end
  return type(value) == "string" and #value <= (limit or 128) and not value:find("[%c|]") and value or nil
end
local function Number(value, low, high)
  if type(issecretvalue) == "function" then local ok, secret = pcall(issecretvalue, value); if not ok or secret then return false end end
  return type(value) == "number" and value == value and value == math.floor(value) and value >= low and value <= high
end
local function Read(fn, ...)
  if type(fn) ~= "function" then return nil end
  local ok, value = pcall(fn, ...)
  if not ok then return nil end
  if type(issecretvalue) == "function" then local known, secret = pcall(issecretvalue, value); if not known or secret then return nil end end
  return value
end
function Q.CanonicalGuild(value)
  value = Text(value, 96)
  if not value then return nil end
  value = value:match("^%s*(.-)%s*$"):lower()
  if value == "olympus prime" or value == "olympus" or value == "olympus i" then return "OLYMPUS PRIME" end
  for _, numeral in ipairs({ "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X" }) do
    if value == "olympus " .. numeral:lower() then return "Olympus " .. numeral end
  end
end
local function Identity()
  if Read(IsInGuild) ~= true or type(GetGuildInfo) ~= "function" then return nil end
  local ok, guild, _, rank = pcall(GetGuildInfo, "player")
  guild = ok and Text(guild) or nil
  local realm, guid = Text(Read(GetRealmName)), Text(Read(UnitGUID, "player"), 40)
  if not guild or guild ~= guild:match("^%s*(.-)%s*$") or not realm or realm == "" or not guid or not Number(rank, 0, 9)
    or Q.CanonicalGuild(guild) ~= "OLYMPUS PRIME" or not H or type(H.sha256hex) ~= "function" then return nil end
  return { guild = guild, realm = realm, guid = guid, rank = rank, scopeHash = H.sha256hex("native-scope|1|" .. guild .. "|" .. realm):sub(1, 16) }
end
local function Preview()
  return OlympusVerifyUI and OlympusVerifyUI.preview ~= nil
    or OlympusVerifyPreview and OlympusVerifyPreview.State and OlympusVerifyPreview.State() ~= nil
end
function Q.Current()
  local identity, now, data = Identity(), time(), OlympusLaunchQueue
  if cfg.membershipOnly ~= true or not identity then return nil, "Current native Prime identity is unavailable; launch actions held." end
  if Q.scopeChanged then return nil, "Native guild identity changed. Refresh the watcher and reload; launch actions held." end
  if Q.loadedIdentity and (Q.loadedIdentity.guild ~= identity.guild or Q.loadedIdentity.realm ~= identity.realm or Q.loadedIdentity.guid ~= identity.guid) then
    Q.scopeChanged = true; return nil, "Native guild/character identity changed; launch actions held." end
  if Preview() then return nil, "Preview is display only; launch actions held." end
  if type(data) ~= "table" or data.version ~= 2 or type(data.pages) ~= "table" or #data.pages < 1 or #data.pages > 50 then
    return nil, "No dated launch projection is loaded. Run the watcher, then sync and reload." end
  local control = OlympusVerifyDB and OlympusVerifyDB.launchControl
  local held = data.stoppedReason or control and (control.action == "stop" or control.id ~= data.controlId)
  local result = { identity = identity, promotions = {}, riskBuffer = {}, held = {}, partial = data.scanComplete ~= true,
    pages = data.pages, actionHeld = held, freshness = {}, scanComplete = data.scanComplete == true, stalePages = 0 }
  local first, guids = data.pages[1], {}
  if type(first) ~= "table" or type(first.scan) ~= "table" or not Text(first.scan.id, 32) or #first.scan.id ~= 32
    or not first.scan.id:match("^%x+$") or not Number(first.scan.startedAt, 1, now + 5)
    or not Number(first.scan.expiresAt, first.scan.startedAt + 1, first.scan.startedAt + 600) then return nil, "Invalid scan identity; actions held." end
  for index, page in ipairs(data.pages) do
    if type(page) ~= "table" or page.protocol ~= "launch-operations-v1" or (page.status ~= "ready" and page.status ~= "partial")
      or not Number(page.fetchedAt, 1, 2147483647) or not Number(page.expiresAt, page.fetchedAt, page.fetchedAt + 60)
      or page.fetchedAt > now + 5 or not Number(page.snapshotAt, 1, page.fetchedAt)
      or page.fetchedAt - page.snapshotAt >= 600 or not Number(page.snapshotId, 1, 2147483647)
      or page.guild ~= identity.guild or page.realm ~= identity.realm or page.scopeHash ~= identity.scopeHash
      or page.canonicalGuild ~= "OLYMPUS PRIME" or page.snapshotId ~= first.snapshotId or page.snapshotAt ~= first.snapshotAt
      or type(page.scan) ~= "table" or page.scan.id ~= first.scan.id or page.scan.startedAt ~= first.scan.startedAt or page.scan.expiresAt ~= first.scan.expiresAt
      or page.scan.expiresAt > page.snapshotAt + 600 or page.fetchedAt < page.scan.startedAt or page.fetchedAt >= page.scan.expiresAt
      or type(page.entitlements) ~= "table" or page.entitlements.offset ~= (index-1)*20 or page.entitlements.total ~= first.entitlements.total
      or type(page.invites) ~= "table" or #page.invites ~= 0
      or type(page.actions) ~= "table" or page.actions.automatic ~= false or page.actions.roleGrants ~= false
      or page.actions.removals ~= false or page.actions.requiresNativeRecheck ~= true then
      return nil, "Launch projection is held, expired, mismatched or contains unsupported invitations. Refresh; no action taken." end
    if now >= page.expiresAt or now >= page.scan.expiresAt then result.stalePages = result.stalePages + 1 end
    for _, label in ipairs({ "promotions", "riskBuffer", "held" }) do
      local rows = page[label]
      if type(rows) ~= "table" or #rows > 20 then return nil, "Malformed launch projection; no action taken." end
      for _, row in ipairs(rows) do
        if type(row) ~= "table" or not Text(row.name, 100) or row.name == "" or not Text(row.guid, 40)
          or not row.guid:match("^Player%-%d+%-%x+$") or guids[row.guid] then return nil, "Ambiguous launch identities; no action taken." end
        guids[row.guid] = true
        result.freshness[row.guid] = { expiresAt = page.expiresAt, scanExpiresAt = page.scan.expiresAt, offset = page.entitlements.offset }
        if label == "promotions" then
          if not Number(row.currentSlot, 6, 9) or (row.targetSlot ~= 5 and row.targetSlot ~= 7) or row.targetSlot >= row.currentSlot
            or row.reason ~= (row.targetSlot == 5 and "knight-veteran" or "verified-initiate") then return nil, "Unsupported promotion target; no action taken." end
        elseif label == "riskBuffer" and (row.currentSlot ~= 9 or row.reviewOnly ~= true or row.reason ~= "unverified-initiate") then
          return nil, "Unsupported risk-buffer entry; no action taken."
        end
        result[label][#result[label] + 1] = row
      end
    end
  end
  Q.loadedIdentity = identity
  return result
end
local function RequestRoster()
  local cg = type(C_GuildInfo) == "table" and C_GuildInfo or {}
  local fn = type(cg.GuildRoster) == "function" and cg.GuildRoster or GuildRoster
  if type(fn) == "function" then pcall(fn) end
end
local function NativeRoster(identity)
  if not Q.rosterAt or time() < Q.rosterAt or time() - Q.rosterAt > 15 then RequestRoster(); return nil, "Refresh the native roster, then click again." end
  if Read(GetGuildRosterShowOffline) ~= true then return nil, "A complete native offline-inclusive roster is required." end
  local count = Read(GetNumGuildMembers)
  if not Number(count, 1, 1000) or type(GetGuildRosterInfo) ~= "function" then return nil, "Native roster is unknown." end
  local rows, names = {}, {}
  for index = 1, count do
    local ok, name, _, slot, level, _, _, note, officerNote, online, _, _, _, _, _, _, _, guid = pcall(GetGuildRosterInfo, index)
    name, guid = ok and Text(name, 100), ok and Text(guid, 40)
    local key = name and H.normalizeCharacter(name)
    if not name or not guid or not key or not Number(slot, 0, 9) or rows[guid] or names[key] then return nil, "Native roster is incomplete or ambiguous." end
    local onlineKnown = type(online) == "boolean"
    if type(issecretvalue) == "function" then local known, secret = pcall(issecretvalue, online); if not known or secret then onlineKnown = false end end
    rows[guid] = { name = name, guid = guid, slot = slot, level = level, note = note, officerNote = officerNote,
      online = onlineKnown and online == true, onlineKnown = onlineKnown, index = index }
    names[key] = true
  end
  local final = Identity()
  if not final or final.guild ~= identity.guild or final.realm ~= identity.realm or final.guid ~= identity.guid then return nil, "Native identity changed; no action taken." end
  return rows
end
local function ActionContext()
  local current, why = Q.Current()
  if not current then return nil, why end
  if Read(InCombatLockdown) ~= false then return nil, "Leave combat before a hardware action." end
  local roster, held = NativeRoster(current.identity)
  if not roster then return nil, held end
  return current, roster
end
function Q.Print()
  local current, why = Q.Current()
  if not current then Say(why); return false end
  Say(string.format("Launch projection: %d promotion(s), %d risk review(s), %d held; %s. No automatic actions.",
    #current.promotions, #current.riskBuffer, #current.held, current.partial and "partial discovery" or "discovery complete"))
  Say("Discovery and action freshness are separate. Stale rows are advisory; Scan/Stop/Recheck are explicit local controls.")
  Say("Knight invites are held until explicit unguilded evidence is available; no unknown/manual invite is queued.")
  for i, row in ipairs(current.promotions) do if i <= 40 then local fresh = current.freshness[row.guid]; Say(string.format("%d. %s -> slot%d (%s; %s). /olv promote %s", i, row.name, row.targetSlot, row.reason,
    not current.actionHeld and time() < fresh.expiresAt and time() < fresh.scanExpiresAt and "fresh" or "STALE/held", row.guid)) end end
  return true
end
-- Called only by the explicit slash/button hardware path. Events merely invalidate/confirm state.
function Q.HardwarePromote(target)
  local current, roster = ActionContext()
  if not current then Say(roster); return false end
  local row
  for index, value in ipairs(current.promotions) do if value.guid == target or tostring(index) == target then row = value; break end end
  if not row then Say("No current promotion matches that GUID/index."); return false end
  local fresh = current.freshness[row.guid]
  if current.actionHeld or not fresh or time() >= fresh.expiresAt or time() >= fresh.scanExpiresAt then Say("This page is stale or stopped. Explicitly recheck it and reload before acting."); return false end
  local native, pending = roster[row.guid], Q.pending[row.guid]
  if not native or H.normalizeCharacter(native.name) ~= H.normalizeCharacter(row.name) or native.guid == current.identity.guid
    or row.targetSlot <= current.identity.rank or Read(CanGuildPromote) ~= true then Say("Current native identity/rank/permission does not admit this promotion."); return false end
  if native.slot <= row.targetSlot then Q.pending[row.guid] = nil; Say("Native target rank already reached; no action taken."); return false end
  if pending then
    if pending.failed or pending.scopeHash ~= current.identity.scopeHash or pending.snapshotId ~= current.pages[1].snapshotId
      or pending.target ~= row.targetSlot or Q.generation <= pending.generation or native.slot ~= pending.expected
      or pending.attempts >= pending.maximum then Say("Prior attempt is unconfirmed or changed; no automatic retry. Refresh and review the native roster."); return false end
  elseif native.slot ~= row.currentSlot then Say("The native rank changed since this projection; refresh it."); return false end
  if Q.directBlockedGeneration and Q.generation <= Q.directBlockedGeneration then Say("Refresh the native roster before using the hardware fallback."); return false end
  local cg = type(C_GuildInfo) == "table" and C_GuildInfo or {}
  local direct = not Q.directBlocked and type(cg.SetGuildRankOrder) == "function"
  if direct and Read(cg.IsGuildRankAssignmentAllowed, native.guid, row.targetSlot + 1) ~= true then Say("The client does not allow assigning this native rank."); return false end
  local fn = direct and cg.SetGuildRankOrder or (type(cg.Promote) == "function" and cg.Promote or GuildPromote)
  if type(fn) ~= "function" then Say("No native promotion API is available; use the normal guild UI."); return false end
  local attempt = { scopeHash = current.identity.scopeHash, snapshotId = current.pages[1].snapshotId, target = row.targetSlot,
    generation = Q.generation, expected = direct and row.targetSlot or native.slot - 1,
    attempts = (pending and pending.attempts or 0) + 1, maximum = pending and pending.maximum or native.slot - row.targetSlot }
  Q.pending[row.guid], Q.activeAttempt, Q.inAction = attempt, attempt, direct and "direct" or "fallback"
  local ok
  if direct then ok = pcall(fn, native.guid, row.targetSlot + 1) else ok = pcall(fn, native.name) end
  Q.inAction, Q.activeAttempt = nil, nil
  if attempt.blocked then
    Q.pending[row.guid] = nil
    Say("This client blocked the direct API. Refresh the roster; a later click may use one-rank hardware fallback.")
    return false
  end
  if not ok then attempt.failed = true; Say("Native promotion outcome is unknown; no retry was queued."); return false end
  Say("One native promotion requested. Wait for a fresh roster; another rank needs a separate click.")
  return true
end
function Q.RiskBuffer()
  local current, roster = ActionContext()
  if not current then Say(roster); return {} end
  local rows = {}
  for _, row in ipairs(current.riskBuffer) do
    local native = roster[row.guid]
    if native and native.slot == 9 and native.guid ~= current.identity.guid and native.onlineKnown and not native.online and Number(native.level, 1, 255)
      and Text(native.note, 1024) and Text(native.officerNote, 1024)
      and not (native.note .. " " .. native.officerNote):lower():find((cfg.holdNote or "hold"):lower(), 1, true)
      and type(GetGuildRosterLastOnline) == "function" then
      local ok, years, months, days, hours = pcall(GetGuildRosterLastOnline, native.index)
      hours = Read(function() return hours end)
      if ok and Number(years, 0, 100) and Number(months, 0, 12) and Number(days, 0, 31) and type(hours) == "number" and hours >= 0 and hours <= 24 then
        local away = years * 365 + months * 30 + days + hours / 24
        if away > 0 then rows[#rows + 1] = { name = native.name, guid = native.guid, level = native.level, days = away } end
      end
    end
  end
  table.sort(rows, function(a, b) if a.level ~= b.level then return a.level < b.level end; if a.days ~= b.days then return a.days > b.days end; return a.name < b.name end)
  Say("Risk buffer is review only. Nothing is removed or automatically selected for removal.")
  for i = 1, math.min(20, #rows) do local row = rows[i]; Say(string.format("%d. %s level%d, offline %.1fd", i, row.name, row.level, row.days)) end
  return rows
end
function Q.Motd(action)
  local current, why = Q.Current()
  if not current then Say(why); return false end
  local motd = current.pages[1].motd
  if type(motd) ~= "table" or not Text(motd.short, 128) or motd.short == "" or motd.maxBytes ~= 128 or motd.bytes ~= #motd.short then Say("Invalid MOTD projection; no action taken."); return false end
  if action ~= "set" then Say("MOTD proposal: " .. motd.short); Say("/olv motd set requests this text once from a hardware action."); return true end
  if current.actionHeld or time() >= current.pages[1].expiresAt or time() >= current.pages[1].scan.expiresAt then Say("MOTD page is stale or stopped. Recheck page0 and reload."); return false end
  if Preview() or Read(InCombatLockdown) ~= false or Read(CanEditMOTD) ~= true then Say("Current native MOTD permission/combat state does not admit a setter."); return false end
  if Q.motdAttempt then Say("A MOTD attempt is already recorded this session. Check the native guild UI; no automatic retry."); return false end
  local cg = type(C_GuildInfo) == "table" and C_GuildInfo or {}
  local fn = type(cg.SetMOTD) == "function" and cg.SetMOTD or GuildSetMOTD
  if type(fn) ~= "function" then Say("No native MOTD setter is available."); return false end
  Q.motdAttempt = { text = motd.short, scopeHash = current.identity.scopeHash }
  local ok = pcall(fn, motd.short)
  Say(ok and "One MOTD update requested. Confirm it in the native guild UI." or "MOTD outcome is unknown; no retry was queued.")
  return ok
end
-- Local signed read control only. SavedVariables reaches the watcher at the hardware reload;
-- it cannot authorize an invite, Discord role, removal or a protected native action.
function Q.Control(action, offset)
  local identity = Identity()
  if cfg.membershipOnly ~= true or not identity or Q.scopeChanged or Preview() or Read(InCombatLockdown) ~= false
    or (action ~= "scan" and action ~= "stop" and action ~= "recheck")
    or not Text(cfg.secret, 1024) or #cfg.secret < 16 or cfg.secret:find("REPLACE", 1, true)
    or not H or type(H.hmacSha256hex) ~= "function" or not OlympusVerifyAPI or type(OlympusVerifyAPI.Sync) ~= "function" then
    Say("Native identity, local signing or sync is unavailable; scan control held."); return false end
  offset = offset or 0
  if not Number(offset, 0, 980) or offset % 20 ~= 0 or action ~= "recheck" and offset ~= 0 then return false end
  OlympusVerifyDB = OlympusVerifyDB or {}
  local db, now = OlympusVerifyDB, time()
  local sequence = Number(db.launchSequence, 0, 999999999) and db.launchSequence + 1 or 1
  db.launchSequence = sequence
  local value = { version = 1, action = action, id = tostring(now) .. ":" .. tostring(sequence), observedAt = now,
    scopeHash = identity.scopeHash, guid = identity.guid, offset = offset }
  value.mac = H.hmacSha256hex(cfg.secret, table.concat({ "launch-control", "1", action, value.id, tostring(now), identity.scopeHash, identity.guid, tostring(offset) }, "|")):sub(1, 32)
  db.launchControl = value -- immediately invalidates the loaded old projection, including Stop before reload.
  Say("Local " .. action .. " request saved. The watcher reads it after this reload; use Sync & reload later to load its dated results.")
  OlympusVerifyAPI.Sync()
  return true
end
function Q.Show()
  if not Q.window then
    local frame = CreateFrame("Frame", "OlympusLaunch229Window", UIParent, "BasicFrameTemplateWithInset")
    frame:SetSize(560, 480); frame:SetPoint("CENTER"); frame:SetMovable(true); frame:EnableMouse(true)
    frame:RegisterForDrag("LeftButton"); frame:SetScript("OnDragStart", frame.StartMoving); frame:SetScript("OnDragStop", frame.StopMovingOrSizing)
    local title = frame:CreateFontString(nil, "OVERLAY", "GameFontNormalLarge"); title:SetPoint("TOP", 0, -12); title:SetText("OLYMPUS PRIME launch review")
    local info = frame:CreateFontString(nil, "OVERLAY", "GameFontHighlightSmall"); info:SetPoint("TOPLEFT", 18, -42); info:SetWidth(520); info:SetJustifyH("LEFT")
    local function button(label, x, y, width, fn)
      local b = CreateFrame("Button", nil, frame, "UIPanelButtonTemplate"); b:SetSize(width, 24); b:SetPoint("TOPLEFT", x, y); b:SetText(label); b:SetScript("OnClick", fn); return b
    end
    Q.window, Q.windowInfo, Q.rowButtons, Q.rowRecheckButtons, Q.listPage = frame, info, {}, {}, 1
    button("Scan + reload", 18, -110, 125, function() Q.Control("scan") end)
    button("Stop + reload", 150, -110, 125, function() Q.Control("stop") end)
    button("Sync & reload", 282, -110, 125, function() if OlympusVerifyAPI then OlympusVerifyAPI.Sync() end end)
    button("Close", 414, -110, 125, function() frame:Hide() end)
    for i = 1, 8 do local index = i
      Q.rowButtons[i] = button("", 18, -145-(i-1)*28, 400, function()
        local rows = Q.shownRows or {}; local row = rows[(Q.listPage-1)*8+index]
        if row then Q.HardwarePromote(row.guid); Q.Show() end
      end)
      Q.rowRecheckButtons[i] = button("Recheck + reload", 426, -145-(i-1)*28, 112, function()
        local row = (Q.shownRows or {})[(Q.listPage-1)*8+index]
        local current, why = Q.Current()
        local source = row and current and current.freshness[row.guid]
        if source then Q.Control("recheck", source.offset) else Say(why or "This recommendation is unavailable; refresh the projection.") end
      end)
    end
    button("Previous", 18, -378, 100, function() Q.listPage = math.max(1, Q.listPage-1); Q.Show() end)
    button("Next", 125, -378, 100, function() Q.listPage = math.min(math.max(1, math.ceil(#(Q.shownRows or {})/8)), Q.listPage+1); Q.Show() end)
    button("Recheck MOTD + reload", 232, -378, 195, function() Q.Control("recheck", 0) end)
    button("Risk review", 18, -415, 140, function() Q.RiskBuffer() end)
    button("Show MOTD", 165, -415, 140, function() Q.Motd("show") end)
    button("Set MOTD once", 312, -415, 140, function() Q.Motd("set") end)
  end
  local current, why = Q.Current()
  Q.shownRows = current and current.promotions or {}
  Q.listPage = math.min(Q.listPage, math.max(1, math.ceil(#Q.shownRows/8)))
  local used = OlympusLaunchQueue and OlympusLaunchQueue.refreshedPages
  used = Number(used, 0, 50) and used or 0
  Q.windowInfo:SetText(current and ((current.scanComplete and "Discovery complete" or "Discovery incomplete") .. "; " .. #current.pages .. "/50 pages; " .. used .. "/50 explicit recheck attempts used.\n" .. (used >= 50 and "Refresh budget exhausted: start a new Scan. " or "Recheck the chosen row, then load results. ") .. "Each action needs its fresh 60-second page and native roster. Knight invites held: unguilded proof unavailable.") or why)
  for i, b in ipairs(Q.rowButtons) do
    local row = Q.shownRows[(Q.listPage-1)*8+i]
    if row then local fresh = current.freshness[row.guid]
      b:SetText(row.name .. " -> slot " .. row.targetSlot .. (not current.actionHeld and time() < fresh.expiresAt and time() < fresh.scanExpiresAt and " (click: one native request)" or " (STALE/held; recheck)")); b:Show()
      Q.rowRecheckButtons[i]:SetText("Recheck p" .. fresh.offset); Q.rowRecheckButtons[i]:Show()
    else b:Hide(); Q.rowRecheckButtons[i]:Hide() end
  end
  Q.window:Show()
end
local events = CreateFrame("Frame")
events:RegisterEvent("GUILD_ROSTER_UPDATE")
events:RegisterEvent("PLAYER_GUILD_UPDATE")
events:RegisterEvent("PLAYER_LEAVING_WORLD")
events:RegisterEvent("ADDON_ACTION_FORBIDDEN")
events:RegisterEvent("ADDON_ACTION_BLOCKED")
events:SetScript("OnEvent", function(_, event, addon)
  if event == "GUILD_ROSTER_UPDATE" then Q.generation = Q.generation + 1; Q.rosterAt = time()
  elseif event == "PLAYER_GUILD_UPDATE" and addon == "player" then Q.rosterAt = nil; Q.scopeChanged = true
  elseif event == "PLAYER_LEAVING_WORLD" then Q.rosterAt = nil
  elseif addon == ADDON and Q.inAction == "direct" then
    Q.directBlocked = true; Q.directBlockedGeneration = Q.generation
    if Q.activeAttempt then Q.activeAttempt.blocked = true end
  end
end)
Q.Events = events -- deterministic local tests; contains no action dispatcher.
