-- Opt-in, bounded native file exchange. A reload request is never a Worker ACK.
local API = OlympusVerifyAPI
if type(API) ~= "table" then return end
local A = { MIN_INTERVAL = 120, REFRESH_INTERVAL = 180, BOOT_DELAY = 30, IDLE_DELAY = 15, COALESCE = 10 }
OlympusVerifyAutoSync = A
local f, state = CreateFrame("Frame"), { active = false, contexts = {}, held = "off", attempted = false, timerReady = false }
local function pref(create)
  if type(OlympusVerifyDB) ~= "table" then return nil end
  if type(OlympusVerifyDB.autoSync232) ~= "table" then
    if create == false then return nil end
    OlympusVerifyDB.autoSync232 = { enabled = false }
  end
  return OlympusVerifyDB.autoSync232
end
local function mono() return type(GetTime) == "function" and GetTime() or nil end
local function readable(value)
  if type(issecretvalue) == "function" then local ok, secret = pcall(issecretvalue, value); if not ok or secret then return false end end
  return true
end
local function facts()
  local ok, value = pcall(API.AutoSyncFacts)
  return ok and type(value) == "table" and value.strict == true and type(value.digest) == "string" and value or nil
end
local function activity()
  state.lastInput = mono()
end
local function facingHeld()
  if type(GetPlayerFacing) ~= "function" then return "facing status unavailable" end
  local ok, facing = pcall(GetPlayerFacing)
  if not ok or not readable(facing) or type(facing) ~= "number" or facing ~= facing then return "facing status unavailable" end
  local changed = state.facing ~= nil and math.abs(facing - state.facing) > 0.00001
  state.facing = facing
  if changed then activity(); return "turning" end
end
local function boolean(name, required, ...)
  local fn = rawget(_G, name)
  if type(fn) ~= "function" then if required then return nil end; return false end
  local ok, value = pcall(fn, ...)
  if not ok or not readable(value) or type(value) ~= "boolean" then return nil end
  return value
end
local function contextHeld()
  if not state.active then return "loading" end
  if state.attempted then return "reload requested; use manual Sync if needed" end
  local combat = boolean("InCombatLockdown", true)
  if combat == nil then return "combat status unavailable" elseif combat then return "combat" end
  for _, spec in ipairs({ { "UnitAffectingCombat", "combat", "player" }, { "UnitIsDeadOrGhost", "dead", "player" },
    { "UnitOnTaxi", "taxi", "player" }, { "IsFalling", "falling" }, { "IsFlying", "flying" },
    { "CursorHasItem", "item on cursor" }, { "SpellIsTargeting", "spell targeting" }, { "IsMouseButtonDown", "mouse button held" } }) do
    local value = boolean(spec[1], true, spec[3])
    if value == nil then return "activity status unavailable" elseif value then return spec[2] end
  end
  if type(GetUnitSpeed) ~= "function" then return "movement status unavailable" end
  local ok, speed = pcall(GetUnitSpeed, "player")
  if not ok or not readable(speed) or type(speed) ~= "number" or speed ~= speed then return "movement status unavailable" end
  if speed ~= 0 then activity(); return "moving" end
  for _, name in ipairs({ "UnitCastingInfo", "UnitChannelInfo" }) do
    local fn = rawget(_G, name)
    if type(fn) == "function" then
      local success, value = pcall(fn, "player")
      if not success or not readable(value) then return "cast status unavailable" end
      if value ~= nil then activity(); return "casting" end
    else return "cast status unavailable" end
  end
  if type(GetCurrentKeyBoardFocus) ~= "function" then return "keyboard focus unavailable" end
  local focusOK, focus = pcall(GetCurrentKeyBoardFocus)
  if not focusOK or not readable(focus) then return "keyboard focus unavailable" end
  if focus ~= nil then activity(); return "typing" end
  for _, held in pairs(state.contexts) do if held then return held end end
  for _, name in ipairs({ "TradeFrame", "MailFrame", "OpenMailFrame", "BankFrame", "GuildBankFrame", "AuctionHouseFrame", "AuctionFrame",
    "MerchantFrame", "LootFrame", "QuestFrame", "GossipFrame", "ItemTextFrame", "TradeSkillFrame", "CraftFrame", "ProfessionsFrame",
    "CinematicFrame", "MovieFrame", "GameMenuFrame", "SettingsPanel", "InterfaceOptionsFrame", "StaticPopup1", "StaticPopup2", "StaticPopup3", "StaticPopup4",
    "ReadyCheckFrame", "LFGDungeonReadyDialog", "LFDRoleCheckPopup", "PVPReadyDialog" }) do
    local frame = rawget(_G, name)
    if frame then
      if type(frame.IsShown) ~= "function" then return "UI status unavailable" end
      local success, shown = pcall(frame.IsShown, frame)
      if not success or not readable(shown) or type(shown) ~= "boolean" then return "UI status unavailable" end
      if shown then return "interaction window open" end
    end
  end
  for _, name in ipairs({ "CharacterFrame", "SpellBookFrame", "TalentFrame", "PlayerSpellsFrame", "CollectionsJournal", "EncounterJournal", "CommunitiesFrame", "GuildFrame", "FriendsFrame", "WorldMapFrame", "PVEFrame", "PVPQueueFrame", "CalendarFrame", "AchievementFrame", "HelpFrame", "VideoOptionsFrame", "AudioOptionsFrame", "ChatConfigFrame", "EditModeManagerFrame", "OlympusLaunch229Window" }) do
    local frame = rawget(_G, name)
    if frame then
      if type(frame.IsShown) ~= "function" then return "UI status unavailable" end
      local success, shown = pcall(frame.IsShown, frame)
      if not success or not readable(shown) or type(shown) ~= "boolean" then return "UI status unavailable" end
      if shown then return "review window open" end
    end
  end
end
function A.Status()
  local p = pref(false)
  return { enabled = p and p.enabled == true or false, held = state.held, pending = state.pendingAt ~= nil }
end
function A.Request(reason)
  local p, clock = pref(), mono()
  if not p or p.enabled ~= true or not clock then return false end
  if reason ~= "whisper" and reason ~= "native-change" and reason ~= "periodic" then return false end
  if reason == "whisper" then pcall(API.ExportRoster) end
  if not facts() then return false end
  state.pendingAt = state.pendingAt or clock
  state.reason = state.reason == "whisper" and state.reason or reason
  return true
end
function A.NativeChanged()
  local source = facts()
  if not source then return end
  if state.digest and source.digest ~= state.digest then A.Request("native-change") end
  state.digest = source.digest
end
function A.RecordSync()
  local p, source = pref(), facts()
  if not p then return end
  p.lastSyncAt = time()
  if source then p.lastRequestedDigest = source.digest end
  state.pendingAt = nil
end
function A.SetEnabled(value)
  local p = pref()
  if not p or type(value) ~= "boolean" then return false end
  p.enabled = value
  state.pendingAt, state.reason = nil, nil
  state.held = value and (state.timerReady and "waiting for idle native data" or "timer API unavailable") or "off"
  activity() -- enabling never reloads immediately and never resets the persisted interval
  facingHeld()
  return true
end
function A.Command(argument)
  local a = string.lower(argument or "")
  if a == "on" or a == "off" then A.SetEnabled(a == "on") end
  local s = A.Status()
  if DEFAULT_CHAT_FRAME then DEFAULT_CHAT_FRAME:AddMessage("Olympus: auto sync " .. (s.enabled and "ON" or "OFF") .. "; " .. s.held .. ". /olv autosync on|off. Manual /olv sync remains available.") end
  if OlympusVerifyUI and OlympusVerifyUI.Refresh then OlympusVerifyUI.Refresh() end
end
function A.Tick()
  local p, clock, wall = pref(), mono(), time()
  if not p or p.enabled ~= true then state.held = "off"; return end
  if not state.timerReady then state.held = "timer API unavailable"; return end
  if state.attempted then return end
  if type(clock) ~= "number" or clock ~= clock or not state.boot or clock < state.boot or type(wall) ~= "number" or wall < 1 or wall ~= math.floor(wall) then state.held = "clock unavailable"; return end
  if clock - state.boot < A.BOOT_DELAY then state.held = "settling after login"; return end
  local turning = facingHeld()
  if turning then state.held = turning; return end
  -- Export only cached native facts through the existing throttled reader.
  local ok = pcall(API.ExportRoster)
  if not ok then state.held = "native roster unavailable"; return end
  local source = facts()
  if not source then state.held = "native roster unavailable"; return end
  local last = p.lastSyncAt or state.wallBoot
  for _, value in ipairs({ p.lastAutoAt or 0, last }) do
    if type(value) ~= "number" or value ~= math.floor(value) or value > wall then state.held = "clock/persisted interval held"; return end
  end
  if wall - last >= A.REFRESH_INTERVAL then A.Request("periodic") end
  if not state.pendingAt then state.held = "waiting for new native data"; return end
  if wall - math.max(p.lastAutoAt or 0, last, state.wallBoot) < A.MIN_INTERVAL then state.held = "minimum 120-second interval"; return end
  if clock - state.pendingAt < A.COALESCE then state.held = "coalescing"; return end
  local held = contextHeld()
  if held then state.held = held; return end
  if not state.lastInput or clock - state.lastInput < A.IDLE_DELAY then state.held = "waiting for 15 seconds idle"; return end
  if type(API.Sync) ~= "function" or not ((C_UI and type(C_UI.Reload) == "function") or type(ReloadUI) == "function") then state.held = "reload API unavailable"; return end
  -- Final recheck before the single normal reload request; no protected-call bypass.
  held = contextHeld()
  local current = facts()
  if held or not current or current.digest ~= source.digest then state.held = held or "native source changed"; return end
  state.attempted = true
  p.lastAutoAt, p.lastSyncAt, p.lastRequestedDigest = wall, wall, source.digest
  state.held = "reload requested; waiting for client"
  local success = pcall(API.Sync)
  if not success then state.held = "reload refused; use manual Sync" end
end
local open = { TRADE_SHOW = "trade", MAIL_SHOW = "mail", BANKFRAME_OPENED = "bank", GUILDBANKFRAME_OPENED = "guild bank",
  AUCTION_HOUSE_SHOW = "auction", MERCHANT_SHOW = "merchant", CINEMATIC_START = "cinematic", LOADING_SCREEN_ENABLED = "loading" }
local close = { TRADE_CLOSED = "TRADE_SHOW", MAIL_CLOSED = "MAIL_SHOW", BANKFRAME_CLOSED = "BANKFRAME_OPENED", GUILDBANKFRAME_CLOSED = "GUILDBANKFRAME_OPENED",
  AUCTION_HOUSE_CLOSED = "AUCTION_HOUSE_SHOW", MERCHANT_CLOSED = "MERCHANT_SHOW", CINEMATIC_STOP = "CINEMATIC_START", LOADING_SCREEN_DISABLED = "LOADING_SCREEN_ENABLED" }
f:SetScript("OnEvent", function(_, event)
  if event == "PLAYER_LOGIN" then
    if state.started then return end
    state.started = true
    state.boot, state.wallBoot, state.lastInput = mono(), time(), mono()
    pref()
    if C_Timer and type(C_Timer.NewTicker) == "function" then
      local ok, ticker = pcall(C_Timer.NewTicker, 5, function()
        local success = pcall(A.Tick)
        if not success then state.attempted, state.held = true, "automatic sync held; use manual Sync" end
      end)
      state.timerReady = ok and ticker ~= nil
    end
  elseif event == "PLAYER_ENTERING_WORLD" then state.active = true; activity()
  elseif event == "PLAYER_LEAVING_WORLD" then state.active = false; activity()
  elseif event == "ADDON_ACTION_FORBIDDEN" or event == "ADDON_ACTION_BLOCKED" then
    if state.attempted then state.held = "reload blocked; use manual Sync" end
  elseif open[event] then state.contexts[event] = open[event]; activity()
  elseif close[event] then state.contexts[close[event]] = nil; activity()
  else activity() end
end)
for _, event in ipairs({ "PLAYER_LOGIN", "PLAYER_ENTERING_WORLD", "PLAYER_LEAVING_WORLD", "GLOBAL_MOUSE_DOWN", "GLOBAL_MOUSE_UP", "MODIFIER_STATE_CHANGED", "PLAYER_STARTED_MOVING", "PLAYER_STOPPED_MOVING", "PLAYER_REGEN_DISABLED", "PLAYER_REGEN_ENABLED", "ADDON_ACTION_FORBIDDEN", "ADDON_ACTION_BLOCKED" }) do pcall(f.RegisterEvent, f, event) end
for event in pairs(open) do pcall(f.RegisterEvent, f, event) end
for event in pairs(close) do pcall(f.RegisterEvent, f, event) end
A.frame = f -- exposed read-only event surface for the ordinary offline client mock
