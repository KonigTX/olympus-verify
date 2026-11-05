-- .229 launch queue safety: real module, synthetic native APIs only.
local passed, failed = 0, 0
local function check(label, yes)
  if yes then passed = passed + 1; print("PASS " .. label) else failed = failed + 1; print("FAIL " .. label) end
end
local function fixture(fallback)
  local e = setmetatable({}, { __index = _G }); e._G = e
  setfenv(assert(loadfile("wow_mock.lua")), e)()
  local f = { env = e, guild = "OLYMPUS PRIME", realm = "Native Realm", direct = 0, fallback = 0, motd = 0, invites = 0, removals = 0 }
  e.OlympusVerifyConfig = { membershipOnly = true, holdNote = "hold", secret = "synthetic-never-print-secret" }
  e.GetGuildInfo = function() return f.guild, "High Council", 1 end
  e.GetRealmName = function() return f.realm end
  e.UnitGUID = function() return "Player-1-0000AAAA" end
  e.GetGuildRosterShowOffline = function() return true end
  e.InCombatLockdown = function() return false end
  e.CanGuildPromote, e.CanEditMOTD = function() return true end, function() return true end
  e.issecretvalue = function() return false end
  e.ROSTER = {
    { name = "Officer", rank = "High Council", rankIndex = 1, level = 60, online = true, guid = "Player-1-0000AAAA" },
    { name = "Candidate", rank = "Initiate", rankIndex = 9, level = 1, online = false, away = 2, guid = "Player-1-0000BBBB" },
  }
  e.C_GuildInfo.IsGuildRankAssignmentAllowed = function() return true end
  e.C_GuildInfo.SetGuildRankOrder = function(guid, order)
    f.direct = f.direct + 1; f.lastGuid, f.lastOrder = guid, order
    if f.blockDirect then f.emit("ADDON_ACTION_FORBIDDEN", "OlympusVerify"); return end
    if f.unknownDirect then error("synthetic outcome unknown") end
    e.ROSTER[2].rankIndex = order - 1
  end
  if fallback then e.C_GuildInfo.SetGuildRankOrder = nil end
  e.C_GuildInfo.Promote = function(name) f.fallback = f.fallback + 1; f.lastName = name; e.ROSTER[2].rankIndex = e.ROSTER[2].rankIndex - 1 end
  e.C_GuildInfo.SetMOTD = function(text) f.motd = f.motd + 1; f.lastMotd = text; if f.failMotd then error("unknown") end end
  e.C_GuildInfo.Invite = function() f.invites = f.invites + 1 end
  e.C_GuildInfo.Uninvite = function() f.removals = f.removals + 1 end
  setfenv(assert(loadfile("../OlympusVerify/Libs/OlympusHmac.lua")), e)("OlympusVerify")
  local h = e.OlympusHmac
  f.page = { protocol = "launch-operations-v1", fetchedAt = e.NOW, expiresAt = e.NOW + 60, status = "ready",
    snapshotId = 12, snapshotAt = e.NOW - 10, guild = f.guild, canonicalGuild = "OLYMPUS PRIME", realm = f.realm,
    scan = { id = string.rep("a",32), startedAt = e.NOW, expiresAt = e.NOW + 590 },
    entitlements = { offset = 0, total = 20 },
    scopeHash = h.sha256hex("native-scope|1|" .. f.guild .. "|" .. f.realm):sub(1, 16), invites = {},
    promotions = {{ name = "Candidate", guid = "Player-1-0000BBBB", currentSlot = 9, targetSlot = 7, reason = "verified-initiate" }},
    riskBuffer = {}, held = {}, motd = { short = "Guild rules and Discord: use Get my code.", bytes = 40, maxBytes = 128 },
    actions = { automatic = false, roleGrants = false, removals = false, requiresNativeRecheck = true } }
  f.page.motd.bytes = #f.page.motd.short
  e.OlympusLaunchQueue = { version = 2, controlId = "loaded", scanComplete = true, pages = { f.page } }
  e.OlympusVerifyDB = {}
  e.OlympusVerifyAPI = { Sync = function() f.syncs = (f.syncs or 0) + 1 end }
  setfenv(assert(loadfile("../OlympusVerify/OlympusVerifyLaunch229.lua")), e)("OlympusVerify")
  f.q = e.OlympusLaunch229
  f.emit = function(event, ...) f.q.Events:GetScript("OnEvent")(f.q.Events, event, ...) end
  f.emit("GUILD_ROSTER_UPDATE")
  return f
end
do
  local f = fixture(); local p2 = {}
  for key, value in pairs(f.page) do p2[key] = value end
  p2.fetchedAt, p2.expiresAt, p2.entitlements, p2.promotions = f.env.NOW + 1, f.env.NOW + 61, { offset = 20, total = 20 }, {}
  f.env.OlympusLaunchQueue.pages[2] = p2
  check("page2 one second later does not require shared action expiry", f.q.Current() ~= nil)
  f.env.NOW = f.env.NOW + 60; f.emit("GUILD_ROSTER_UPDATE")
  check("expired candidate stays visible advisory without protected action", #f.q.Current().promotions == 1 and not f.q.HardwarePromote("1") and f.direct == 0)
  f.page.fetchedAt, f.page.expiresAt = f.env.NOW, f.env.NOW + 60
  check("fresh candidate page admits hardware action while other page is stale", f.q.HardwarePromote("1") and f.direct == 1)
end
do
  local f = fixture(); local original, start = f.page, f.env.NOW
  original.promotions = {}
  local pages = {}
  for index = 1, 50 do local p = {}
    for key, value in pairs(original) do p[key] = value end
    p.fetchedAt, p.expiresAt = start+(index-1)*5, start+(index-1)*5+60
    p.status = index < 50 and "partial" or "ready"
    p.entitlements, p.promotions = {offset=(index-1)*20,total=1000}, {}
    pages[index] = p
  end
  pages[3].promotions = {{name="Candidate",guid="Player-1-0000BBBB",currentSlot=9,targetSlot=7,reason="verified-initiate"}}
  f.env.OlympusLaunchQueue.pages = pages; f.env.NOW = start+260; f.emit("GUILD_ROSTER_UPDATE")
  check("full 50-page discovery retains expired pages as advisory", f.q.Current() and #f.q.Current().pages == 50 and not f.q.HardwarePromote("1") and f.direct == 0)
  check("naturally partial early pages do not contradict completed discovery", f.q.Current().scanComplete and not f.q.Current().partial and f.q.Current().stalePages > 0)
  pages[3].fetchedAt, pages[3].expiresAt = start+260, start+320
  check("50-page scan recheck renews only selected page eligibility", f.q.HardwarePromote("1") and f.direct == 1 and pages[1].expiresAt == start+60)
end
do
  local f = fixture(); f.q.Show()
  check("opening actual native queue frame is read only", f.q.window:IsShown() and f.direct == 0 and f.invites == 0)
  f.q.rowButtons[1]:GetScript("OnClick")()
  check("native queue button makes exactly one hardware request", f.direct == 1 and f.fallback == 0)
  f = fixture()
  check("explicit scan writes domain separated local control and reloads once", f.q.Control("scan") and f.syncs == 1 and f.direct == 0 and f.invites == 0)
  local c, h = f.env.OlympusVerifyDB.launchControl, f.env.OlympusHmac
  local message = table.concat({"launch-control","1",c.action,c.id,tostring(c.observedAt),c.scopeHash,c.guid,tostring(c.offset)},"|")
  check("control MAC binds exact current native GUID scope action and offset", c.mac == h.hmacSha256hex(f.env.OlympusVerifyConfig.secret,message):sub(1,32))
  check("pending scan invalidates old loaded action data", not f.q.HardwarePromote("1") and f.direct == 0)
  check("stop is explicit and immediately holds old actions", f.q.Control("stop") and f.env.OlympusVerifyDB.launchControl.action == "stop" and not f.q.HardwarePromote("1"))
end
do
  local f = fixture()
  check("dated raw-scope Prime projection is admitted without any action", f.q.Current() ~= nil and f.direct == 0 and f.fallback == 0 and f.invites == 0 and f.removals == 0)
  check("direct hardware promotion uses exact GUID and one-based target order", f.q.HardwarePromote("Player-1-0000BBBB") and f.direct == 1 and f.lastGuid == "Player-1-0000BBBB" and f.lastOrder == 8)
  f.emit("GUILD_ROSTER_UPDATE")
  check("confirmed target rank cannot promote again", not f.q.HardwarePromote("Player-1-0000BBBB") and f.direct == 1)
end
do
  local f = fixture(); f.page.promotions[1].targetSlot, f.page.promotions[1].reason = 5, "knight-veteran"
  check("Knight Veteran projection requests native slot5 as rankOrder6", f.q.HardwarePromote("1") and f.direct == 1 and f.lastOrder == 6)
end
do
  local f = fixture(true)
  check("missing direct capability falls back to exactly one rank per click", f.q.HardwarePromote("1") and f.fallback == 1 and f.env.ROSTER[2].rankIndex == 8)
  check("fallback waits for a newer native roster before another click", not f.q.HardwarePromote("1") and f.fallback == 1)
  f.emit("GUILD_ROSTER_UPDATE")
  check("fresh native progress admits one further bounded fallback click", f.q.HardwarePromote("1") and f.fallback == 2 and f.env.ROSTER[2].rankIndex == 7)
  f.emit("GUILD_ROSTER_UPDATE")
  check("bounded fallback stops at Member and never skips further", not f.q.HardwarePromote("1") and f.fallback == 2)
end
for _, case in ipairs({ "expiry", "future", "scope", "rank", "permission", "assignment", "guid", "duplicate", "preview", "combat", "invite" }) do
  local f = fixture()
  if case == "expiry" then f.env.NOW = f.env.NOW + 60
  elseif case == "future" then f.page.fetchedAt, f.page.expiresAt = f.env.NOW + 6, f.env.NOW + 66
  elseif case == "scope" then f.guild = "Olympus I"
  elseif case == "rank" then f.env.ROSTER[2].rankIndex = 8
  elseif case == "permission" then f.env.CanGuildPromote = function() return false end
  elseif case == "assignment" then f.env.C_GuildInfo.IsGuildRankAssignmentAllowed = function() return false end
  elseif case == "guid" then f.env.ROSTER[2].guid = nil
  elseif case == "duplicate" then f.env.ROSTER[2].guid = f.env.ROSTER[1].guid
  elseif case == "preview" then f.env.OlympusVerifyUI = { preview = {} }
  elseif case == "combat" then f.env.InCombatLockdown = function() return true end
  elseif case == "invite" then f.page.invites = {{name="Unknown Guild"}} end
  check(case .. " holds all protected actions", not f.q.HardwarePromote("1") and f.direct == 0 and f.fallback == 0 and f.invites == 0 and f.removals == 0)
end
do
  local f = fixture(); f.blockDirect = true
  check("known blocked direct API never calls fallback in the same hardware event", not f.q.HardwarePromote("1") and f.direct == 1 and f.fallback == 0)
  check("blocked API fallback waits for fresh native roster", not f.q.HardwarePromote("1") and f.fallback == 0)
  f.emit("GUILD_ROSTER_UPDATE")
  check("a later hardware click may use one-rank fallback after known block", f.q.HardwarePromote("1") and f.direct == 1 and f.fallback == 1)
end
do
  local f = fixture(); f.unknownDirect = true
  check("unknown native action outcome is held", not f.q.HardwarePromote("1") and f.direct == 1)
  f.emit("GUILD_ROSTER_UPDATE")
  check("a fresh roster does not silently retry an unknown action", not f.q.HardwarePromote("1") and f.direct == 1 and f.fallback == 0)
end
do
  local f = fixture()
  check("MOTD display is read only", f.q.Motd("show") and f.motd == 0)
  check("MOTD hardware path requests the exact short text once", f.q.Motd("set") and f.motd == 1 and f.lastMotd == f.page.motd.short)
  check("MOTD is not automatically repeated", not f.q.Motd("set") and f.motd == 1)
  f = fixture(); f.failMotd = true
  check("unknown MOTD outcome remains spent", not f.q.Motd("set") and not f.q.Motd("set") and f.motd == 1)
end
do
  local f = fixture(); f.q.Current(); f.emit("PLAYER_GUILD_UPDATE", "player")
  check("a native identity lifecycle change holds the old projection", f.q.Current() == nil and not f.q.HardwarePromote("1") and f.direct == 0)
  f = fixture(); f.env.NOW = f.env.NOW + 16
  check("stale native roster refreshes without promoting", not f.q.HardwarePromote("1") and f.env.ROSTER_ASKS == 1 and f.direct == 0)
end
do
  local f = fixture(); f.page.promotions = {}; f.page.riskBuffer = {}
  local function risk(name, suffix, level, days, note)
    local guid = "Player-1-" .. suffix
    f.env.ROSTER[#f.env.ROSTER+1] = { name=name, guid=guid, rank="Initiate", rankIndex=9, level=level, away=days, note=note, online=false }
    f.page.riskBuffer[#f.page.riskBuffer+1] = { name=name, guid=guid, currentSlot=9, level=level, lastOnlineDays=days, reason="unverified-initiate", reviewOnly=true }
  end
  risk("Small", "0000CCC1", 1, 2)
  risk("Small Long", "0000CCC2", 1, 5)
  risk("High Long", "0000CCC3", 9, 30)
  risk("Protected", "0000CCC4", 1, 40, "HOLD")
  local rows = f.q.RiskBuffer()
  check("risk buffer uses lowest native level then longest measured offline", #rows == 3 and rows[1].name:find("Small Long",1,true) and rows[2].name:find("Small%-Forever") and rows[3].name:find("High Long",1,true))
  check("risk buffer preserves hold notes and never removes anyone", f.removals == 0 and f.direct == 0 and f.invites == 0)
end
print(string.format("%d passed, %d failed", passed, failed))
if failed > 0 then error("launch operations failed") end
