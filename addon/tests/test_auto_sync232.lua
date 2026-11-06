-- Synthetic idle/context/time controls over the actual opt-in scheduler. No native permission claim.
local passed, failed = 0, 0
local function check(label, value)
  if value then passed = passed + 1; print("PASS " .. label) else failed = failed + 1; print("FAIL " .. label) end
end
local function fixture(saved, wall, timerFailure)
  local e = setmetatable({}, { __index = _G }); e._G = e
  setfenv(assert(loadfile("wow_mock.lua")), e)()
  local f = { e = e, wall = wall or 1793935000, clock = 0, reloads = 0, exports = 0, digest = "initial", valid = true }
  e.time = function() return f.wall end
  e.GetTime = function() return f.clock end
  e.GetUnitSpeed = function() return 0 end
  e.GetPlayerFacing = function() return 0 end
  e.IsMouseButtonDown = function() return false end
  e.GetCurrentKeyBoardFocus = function() return nil end
  e.UnitAffectingCombat = function() return false end
  e.UnitIsDeadOrGhost = function() return false end
  e.UnitOnTaxi = function() return false end
  e.IsFalling = function() return false end
  e.IsFlying = function() return false end
  e.CursorHasItem = function() return false end
  e.SpellIsTargeting = function() return false end
  e.UnitCastingInfo = function() return nil end
  e.UnitChannelInfo = function() return nil end
  e.ReloadUI = function() end
  if timerFailure then e.C_Timer.NewTicker = function() error("synthetic unavailable timer") end end
  e.OlympusVerifyDB = saved or {}
  e.OlympusVerifyAPI = {
    AutoSyncFacts = function() return f.valid and { strict = true, exportedAt = f.wall, digest = f.digest } or nil end,
    ExportRoster = function() f.exports = f.exports + 1 end,
    Sync = function()
      f.reloads = f.reloads + 1
      e.OlympusVerifyAutoSync.RecordSync()
      if f.refuse then error("synthetic client refusal") end
      if f.blocked then f.event("ADDON_ACTION_BLOCKED") end
    end,
  }
  setfenv(assert(loadfile("../OlympusVerify/OlympusVerifyAutoSync.lua")), e)()
  f.a = e.OlympusVerifyAutoSync
  f.event = function(event) f.a.frame:GetScript("OnEvent")(f.a.frame, event) end
  f.event("PLAYER_LOGIN"); f.event("PLAYER_ENTERING_WORLD")
  f.advance = function(seconds) f.wall = f.wall + seconds; f.clock = f.clock + seconds end
  f.ready = function()
    f.a.SetEnabled(true); f.advance(120); f.a.Request("whisper"); f.advance(16)
  end
  return f
end

do
  local f = fixture()
  check("automatic exchange defaults OFF", not f.a.Status().enabled)
  f.advance(1000); f.a.Tick()
  check("default installation never reloads or reads native data automatically", f.reloads == 0 and f.exports == 0)
  f.a.SetEnabled(true); f.a.Request("whisper"); f.a.Tick()
  check("explicit enable does not immediately reload", f.reloads == 0)
end
do
  local f = fixture(); f.a.SetEnabled(true); f.a.Request("whisper"); f.advance(29); f.a.Tick()
  check("login settles for at least 30 seconds", f.reloads == 0 and f.a.Status().held == "settling after login")
  f.advance(90); f.a.Tick()
  check("first reload still observes hard 120-second interval", f.reloads == 0)
  f.advance(2); f.a.Tick()
  check("one accepted coalesced request makes one normal Sync request", f.reloads == 1)
  f.advance(1000); f.a.Tick(); f.a.Request("whisper"); f.a.Tick()
  check("old session never retries an unconfirmed reload", f.reloads == 1)
end
do
  local f = fixture(); f.a.SetEnabled(true); f.advance(120); f.a.Request("whisper"); f.advance(8); f.a.Request("whisper"); f.a.Tick()
  check("burst is held during ten-second coalescing", f.reloads == 0)
  f.advance(3); f.a.Tick()
  check("duplicate request does not reset or multiply the original coalesced request", f.reloads == 1)
end
do
  local f = fixture(); f.a.SetEnabled(true); f.advance(180); f.a.Tick()
  check("unchanged native data schedules bounded freshness after 180 seconds", f.reloads == 0 and f.a.Status().pending)
  f.advance(11); f.a.Tick()
  check("idle periodic freshness uses the same one-request mechanism", f.reloads == 1)
end
do
  local f = fixture(); f.a.SetEnabled(true); f.a.NativeChanged(); f.advance(120); f.digest = "changed-rank-or-membership"; f.a.NativeChanged(); f.advance(11); f.a.Tick()
  check("actual complete native content change coalesces a reload", f.reloads == 1)
end
for _, event in ipairs({ "TRADE_SHOW", "MAIL_SHOW", "BANKFRAME_OPENED", "GUILDBANKFRAME_OPENED", "AUCTION_HOUSE_SHOW", "MERCHANT_SHOW", "CINEMATIC_START", "LOADING_SCREEN_ENABLED" }) do
  local f = fixture(); f.ready(); f.event(event); f.advance(16); f.a.Tick()
  check(event .. " holds automatic reload", f.reloads == 0)
end
do
  local f = fixture(); f.ready(); f.event("TRADE_SHOW"); f.a.Tick(); f.event("TRADE_CLOSED"); f.a.Tick()
  check("closing an interaction starts a fresh idle wait", f.reloads == 0)
  f.advance(16); f.a.Tick()
  check("safe idle continuation consumes only the original pending request", f.reloads == 1)
end
for _, name in ipairs({ "InCombatLockdown", "UnitAffectingCombat", "UnitIsDeadOrGhost", "UnitOnTaxi", "IsFalling", "IsFlying", "CursorHasItem", "SpellIsTargeting", "IsMouseButtonDown" }) do
  local f = fixture(); f.ready(); f.e[name] = function() return true end; f.a.Tick()
  check(name .. " holds automatic reload", f.reloads == 0)
end
do
  local f = fixture(); f.ready(); f.e.GetUnitSpeed = function() return 1 end; f.a.Tick()
  check("movement holds automatic reload", f.reloads == 0)
  f.e.GetUnitSpeed = function() return 0 end; f.a.Tick()
  check("movement also refreshes idle delay", f.reloads == 0)
  f.advance(16); f.a.Tick(); check("stationary idle resumes once", f.reloads == 1)
end
do
  local f = fixture(); f.ready(); f.e.GetCurrentKeyBoardFocus = function() return {} end; f.a.Tick()
  check("typing/focused edit holds", f.reloads == 0)
end
do
  local f = fixture(); f.ready(); f.e.GetPlayerFacing = function() return 1 end; f.a.Tick()
  check("stationary keyboard turning holds automatic reload", f.reloads == 0 and f.a.Status().held == "turning")
  f.a.Tick(); check("turning refreshes idle delay even after speed becomes zero", f.reloads == 0)
  f.advance(16); f.a.Tick(); check("stable facing resumes only after idle delay", f.reloads == 1)
end
for _, name in ipairs({ "TradeFrame", "MailFrame", "BankFrame", "GuildBankFrame", "AuctionHouseFrame", "MerchantFrame", "LootFrame", "QuestFrame", "StaticPopup1", "GameMenuFrame" }) do
  local f = fixture(); f.ready(); f.e[name] = { IsShown = function() return true end }; f.a.Tick()
  check(name .. " visible holds", f.reloads == 0)
end
do
  local f = fixture(); f.ready(); f.e.InCombatLockdown = nil; f.a.Tick()
  check("missing required combat capability holds", f.reloads == 0)
end
do
  local f = fixture(); f.ready(); f.e.GetCurrentKeyBoardFocus = false; f.a.Tick()
  check("missing focus capability holds", f.reloads == 0)
end
do
  local f = fixture(nil, nil, true); f.ready(); f.a.Tick()
  check("unavailable native scheduler holds rather than throwing or retrying", f.reloads == 0 and f.a.Status().held == "timer API unavailable")
end
do
  local f = fixture(); f.ready(); f.e.OlympusLaunch229Window = { IsShown = function() return true end }; f.a.Tick()
  check("operator review/action window holds reload to protect unfinished work", f.reloads == 0)
end
do
  local f = fixture(); f.ready(); f.e.MailFrame = {}; f.a.Tick()
  check("unknown interaction visibility is a hold", f.reloads == 0)
end
do
  local f = fixture(); f.ready(); f.valid = false; f.a.Tick()
  check("unknown/native scope unavailable holds", f.reloads == 0)
end
do
  local f = fixture(); f.ready(); f.refuse = true; f.a.Tick(); f.advance(1000); f.a.Tick()
  check("client error is held without an automatic second attempt", f.reloads == 1 and f.a.Status().held == "reload refused; use manual Sync")
end
do
  local f = fixture(); f.ready(); f.blocked = true; f.a.Tick(); f.advance(1000); f.a.Tick()
  check("blocked normal reload never triggers protected bypass/retry", f.reloads == 1 and f.a.Status().held == "reload blocked; use manual Sync")
end
do
  local f = fixture(); f.ready(); f.a.Tick()
  local saved, now = f.e.OlympusVerifyDB, f.wall
  check("last auto timestamp is assigned before the reload request", saved.autoSync232.lastAutoAt == now)
  local next = fixture(saved, now + 1); next.a.Request("whisper"); next.advance(31); next.a.Tick()
  check("persisted timestamp prevents a new-session reload loop", next.reloads == 0)
  next.advance(90); next.a.Tick(); check("new session may sync after original minimum interval", next.reloads == 1)
end
do
  local f = fixture(); f.ready(); f.e.OlympusVerifyDB.autoSync232.lastAutoAt = f.wall + 1000; f.a.Tick()
  check("backward wall clock/persisted future time holds", f.reloads == 0)
end
do
  local f = fixture(); f.ready(); f.event("MAIL_SHOW"); f.e.OlympusVerifyAPI.Sync()
  check("manual Sync remains an explicit separate override", f.reloads == 1)
end
do
  -- Actual main addon + scheduler composition: no fake Sync facade.
  local e = setmetatable({}, { __index = _G }); e._G = e
  setfenv(assert(loadfile("wow_mock.lua")), e)()
  e.NOW, e.CLOCK = 1793935000, 0
  e.GetTime = function() return e.CLOCK end
  e.date = function(format, at) return os.date(format, at) end
  e.GetGuildInfo = function() return "OLYMPUS PRIME" end
  e.GetRealmName = function() return "Native Realm" end
  e.GetGuildRosterShowOffline = function() return true end
  e.GetUnitSpeed = function() return 0 end
  e.GetPlayerFacing = function() return 0 end
  e.IsMouseButtonDown = function() return false end
  e.GetCurrentKeyBoardFocus = function() return nil end
  e.UnitAffectingCombat = function() return false end
  for _, key in ipairs({ "UnitIsDeadOrGhost", "UnitOnTaxi", "IsFalling", "IsFlying", "CursorHasItem", "SpellIsTargeting" }) do e[key] = function() return false end end
  e.UnitCastingInfo = function() return nil end
  e.UnitChannelInfo = function() return nil end
  e.OlympusVerifyConfig = { secret = "synthetic-auto-composition", membershipOnly = true, uiAutoShow = false }
  e.OlympusVerifyDB = nil
  e.ROSTER = { { name = "Fern Melder", guid = e.PLAYER_GUID, rank = "Guild Master", rankIndex = 0, level = 60 },
    { name = "Fresh Member", guid = "Player-1-ABCDEF12", rank = "Member", rankIndex = 7, level = 60 } }
  local reloads, forbidden = 0, 0
  e.ReloadUI = function() reloads = reloads + 1 end
  for _, key in ipairs({ "Invite", "Promote", "Uninvite", "SetGuildRankOrder", "SetMOTD" }) do
    e.C_GuildInfo[key] = function() forbidden = forbidden + 1; error("unrelated guild action") end
  end
  setfenv(assert(loadfile("../OlympusVerify/Libs/OlympusHmac.lua")), e)("OlympusVerify")
  setfenv(assert(loadfile("../OlympusVerify/OlympusVerify.lua")), e)("OlympusVerify")
  local event = e.OlympusVerifyFrame:GetScript("OnEvent")
  event(e.OlympusVerifyFrame, "ADDON_LOADED", "OlympusVerify")
  setfenv(assert(loadfile("../OlympusVerify/OlympusVerifyAutoSync.lua")), e)()
  local a = e.OlympusVerifyAutoSync
  a.frame:GetScript("OnEvent")(a.frame, "PLAYER_LOGIN")
  a.frame:GetScript("OnEvent")(a.frame, "PLAYER_ENTERING_WORLD")
  e.OlympusVerifyAPI.ExportRoster(true)
  check("actual main API qualifies its named complete native snapshot", e.OlympusVerifyAPI.AutoSyncFacts() ~= nil)
  e.SlashCmdList.OLYMPUSVERIFY("autosync on")
  event(e.OlympusVerifyFrame, "CHAT_MSG_WHISPER", "!verify AAAAAA", "Fresh Member", nil, nil, nil, nil, nil, nil, nil, nil, nil, "Player-1-ABCDEF12")
  check("invalid native code does not arm automatic reload", not a.Status().pending and reloads == 0)
  local code = e.OlympusHmac.codeFor(e.OlympusVerifyConfig.secret, "Fresh Member", e.OlympusHmac.utcDay(e.NOW))
  event(e.OlympusVerifyFrame, "CHAT_MSG_WHISPER", "!verify " .. code, "Fresh Member", nil, nil, nil, nil, nil, nil, nil, nil, nil, "Player-1-ABCDEF12")
  check("real validated native proof arms one coalesced request", a.Status().pending and reloads == 0)
  e.NOW, e.CLOCK = e.NOW + 120, e.CLOCK + 120
  a.Tick()
  check("actual scheduler/main composition invokes only the normal reload API once", reloads == 1)
  check("actual Sync retains its request-only phase and exact original proof", e.OlympusVerifyDB.verificationExchange.phase == "sync-requested" and #e.OlympusVerifyDB.events >= 2)
  check("automatic exchange performs zero invite/promotion/removal/MOTD actions", forbidden == 0)
end
print(string.format("%d passed, %d failed", passed, failed))
if failed > 0 then os.exit(1) end
