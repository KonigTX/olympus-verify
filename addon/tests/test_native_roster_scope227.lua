-- .227 native own-roster scope binding: synthetic client APIs only, no game or provider actions.
local passed, failed = 0, 0
local function check(label, value)
  if value then passed = passed + 1; print("PASS " .. label)
  else failed = failed + 1; print("FAIL " .. label) end
end
local function fixture(legacy)
  local e = setmetatable({}, { __index = _G }); e._G = e
  setfenv(assert(loadfile("wow_mock.lua")), e)()
  e.OlympusVerifyDB = nil
  e.OlympusVerifyConfig = { secret = "native-scope-test-only", membershipOnly = not legacy, uiAutoShow = false,
    nativeGuild = "Typed configuration is not native evidence", nativeRealm = "A guessed realm" }
  e.OlympusQueue = { version = 1, generatedAt = e.NOW, entries = {} }
  e.ROSTER = {
    { name = "Fern Melder", rank = "High Council", rankIndex = 1, level = 1, online = true, guid = "Player-1-0000AAAA" },
    { name = "Launch Member", rank = "Member", rankIndex = 7, level = 1, online = true, guid = "Player-1-0000BBBB" },
  }
  local f = { env = e, guild = "Olympus I", realm = "Native Realm - NA", inGuild = true, effects = 0, playerReads = 0 }
  e.IsInGuild = function() return f.inGuild end
  e.GetGuildInfo = function(unit) assert(unit == "player"); f.playerReads = f.playerReads + 1; return f.guild, "High Council", 1 end
  e.GetRealmName = function() return f.realm end
  e.GetGuildRosterShowOffline = function() return true end
  local effect = function() f.effects = f.effects + 1 end
  e.C_GuildInfo.Invite, e.C_GuildInfo.Uninvite, e.C_GuildInfo.SetNote, e.SendChatMessage = effect, effect, effect, effect
  e.issecretvalue = function() return false end
  setfenv(assert(loadfile("../OlympusVerify/Libs/OlympusHmac.lua")), e)("OlympusVerify")
  setfenv(assert(loadfile("../OlympusVerify/OlympusVerify.lua")), e)("OlympusVerify")
  local onEvent = e.OlympusVerifyFrame:GetScript("OnEvent")
  onEvent(e.OlympusVerifyFrame, "ADDON_LOADED", "OlympusVerify")
  f.export = function() return e.OlympusVerifyAPI.ExportRoster() end
  f.snapshot = function() return e.OlympusVerifyDB.roster end
  return f
end

do
  local f = fixture()
  check("complete scoped roster exports its original member count", f.export() == 2)
  local r = f.snapshot()
  check("guild comes from exact GetGuildInfo player value", r.nativeGuild == "Olympus I")
  check("realm comes from exact GetRealmName value", r.nativeRealm == "Native Realm - NA")
  check("typed configuration cannot replace native scope", r.nativeGuild ~= f.env.OlympusVerifyConfig.nativeGuild and r.nativeRealm ~= f.env.OlympusVerifyConfig.nativeRealm)
  check("native guild is sampled again after the full roster", f.playerReads >= 2)
  check("scope capture performs no whisper invite removal or note action", f.effects == 0)
  local initial = r
  f.guild, f.realm = "Olympus II", "Native Second Realm"
  f.env.NOW = f.env.NOW + 1
  check("same-sized roster in a different native scope can export fresh evidence", f.export() == 2)
  check("new successful export retains changed exact guild and realm", f.snapshot().nativeGuild == "Olympus II" and f.snapshot().nativeRealm == "Native Second Realm")
  check("new scoped export does not rewrite the previous source object", initial.nativeGuild == "Olympus I" and initial.nativeRealm == "Native Realm - NA")
end

for _, missing in ipairs({ "GetGuildInfo", "GetRealmName" }) do
  local f = fixture()
  f.env[missing] = false
  check("membership-only missing " .. missing .. " holds the export", f.export() == nil and f.snapshot().members == nil)
  check("missing " .. missing .. " does not create typed fallback evidence", f.snapshot().nativeGuild == nil and f.snapshot().nativeRealm == nil)
end

for _, bad in ipairs({ "", " Native Realm", "Native Realm ", "Native\nRealm", string.rep("x", 129) }) do
  local f = fixture()
  f.realm = bad
  check("invalid native realm is held without trimming or invention", f.export() == nil and f.snapshot().members == nil)
end

do
  local f = fixture()
  f.env.GetGuildInfo = function() error("synthetic native API refusal") end
  check("throwing native guild getter holds the export", f.export() == nil and f.snapshot().members == nil)
end
do
  local f, marker = fixture(), {}
  f.env.issecretvalue = function(v) return v == marker end
  f.env.GetRealmName = function() return marker end
  check("secret native realm is not read or guessed", f.export() == nil and f.snapshot().members == nil)
end

for _, field in ipairs({ "guild", "realm", "inGuild" }) do
  local f = fixture()
  check(field .. " switch fixture first exports", f.export() == 2)
  local prior, info = f.snapshot(), f.env.GetGuildRosterInfo
  f.env.NOW = f.env.NOW + 1
  f.env.GetGuildRosterInfo = function(i)
    local values = { info(i) }
    if i == 1 then f[field] = field == "guild" and "Olympus III" or (field == "realm" and "Different Native Realm" or false) end
    return unpack(values)
  end
  check(field .. " switching during a roster scan refuses whole export", f.export() == nil)
  check(field .. " switch preserves the previous snapshot and timestamp", f.snapshot() == prior and f.snapshot().exportedAt == prior.exportedAt)
end

do
  local f = fixture()
  check("missing scope after a valid prior export fixture works", f.export() == 2)
  local prior = f.snapshot()
  f.env.GetRealmName = false
  f.env.NOW = f.env.NOW + 1
  check("missing scope never refreshes prior membership proof", f.export() == nil and f.snapshot() == prior and f.snapshot().exportedAt ~= f.env.NOW)
end
do
  local f = fixture(true)
  f.env.GetGuildInfo, f.env.GetRealmName = false, false
  check("explicit legacy mode preserves historical unscoped export", f.export() == 2)
  check("legacy mode manufactures no native scope fields", f.snapshot().nativeGuild == nil and f.snapshot().nativeRealm == nil)
  check("legacy export still performs no membership action", f.effects == 0)
end
print(string.format("%d passed, %d failed", passed, failed))
if failed > 0 then os.exit(1) end
