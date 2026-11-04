-- .227 verification-only client mode does not turn a valid code into an invite or a membership claim.
dofile("wow_mock.lua")
local passed, failed = 0, 0
local function check(label, got, expected)
  if got == expected then passed = passed + 1; print("PASS " .. label)
  else failed = failed + 1; print("FAIL " .. label .. " got " .. tostring(got) .. " expected " .. tostring(expected)) end
end
local key = "synthetic-membership-only-not-live"
OlympusVerifyConfig = { secret = key, membershipOnly = true, uiAutoShow = false, checkBeforeInvite = false }
OlympusQueue = { version = 1, entries = {}, generatedAt = NOW }
OlympusVerifyDB = nil
assert(loadfile("../OlympusVerify/Libs/OlympusHmac.lua"))("OlympusVerify")
assert(loadfile("../OlympusVerify/OlympusVerify.lua"))("OlympusVerify")
local frame = OlympusVerifyFrame
local handler = frame:GetScript("OnEvent")
handler(frame, "ADDON_LOADED", "OlympusVerify")
handler(frame, "PLAYER_LOGIN")
local before = #WHISPERS
local code = OlympusHmac.codeFor(key, "Outside Player", OlympusHmac.utcDay(NOW))
handler(frame, "CHAT_MSG_WHISPER", "!verify " .. code, "Outside Player", nil, nil, nil, nil, nil, nil, nil, nil, nil, "Player-1-ABCD1234")
check("membership-only valid whisper queues no invite", #OlympusVerifyDB.queue, 0)
check("mode is visible in status", OlympusVerifyAPI.Status().membershipOnly, true)
local forwarded = false
for _, row in ipairs(OlympusVerifyDB.events) do if row.name == "Outside Player" and row.ok and row.guid == "Player-1-ABCD1234" then forwarded = true end end
check("valid code/control observation remains available to Watcher", forwarded, true)
local reply
for i = before + 1, #WHISPERS do if WHISPERS[i].to == "Outside Player" then reply = WHISPERS[i].text end end
check("whisper says membership is required, not granted", type(reply) == "string" and reply:find("current approved Olympus roster", 1, true) ~= nil, true)
check("no immediate queued-role promise", type(reply) == "string" and reply:find("invite is queued", 1, true) == nil, true)
check("reply fits client chat byte limit", type(reply) == "string" and #reply <= 255, true)
local count = #OlympusVerifyDB.events
handler(frame, "CHAT_MSG_WHISPER", "!verify AAAAAA", "Invalid Player")
check("invalid code still queues no invite", #OlympusVerifyDB.queue, 0)
check("invalid event stays invalid", OlympusVerifyDB.events[#OlympusVerifyDB.events].ok, false)
check("there is a new invalid event", #OlympusVerifyDB.events > count, true)

-- The full Treasury recipient comes from the original native roster, not MyName's basename.
UnitGUID = function() return "Player-1-ABCDEF12" end
GetNumGuildMembers = function() return 1 end
GetGuildRosterInfo = function() return "Fern Melder-ActualRealm", nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, "Player-1-ABCDEF12" end
check("Treasury identity preserves native realm suffix", OlympusVerifyAPI.TreasuryTransport.Name(), "Fern Melder-ActualRealm")
local noted = #WHISPERS
check("Treasury note sends through safe self transport", OlympusVerifyAPI.TreasuryTransport.Note("synthetic receipt"), true)
check("Treasury self target preserves full native suffix", WHISPERS[noted + 1].to, "Fern Melder-ActualRealm")

-- Legacy invitation behaviour remains available only with the separately configured legacy mode.
OlympusVerifyConfig.membershipOnly = false
local legacy = OlympusHmac.codeFor(key, "Legacy Joiner", OlympusHmac.utcDay(NOW))
handler(frame, "CHAT_MSG_WHISPER", "!verify " .. legacy, "Legacy Joiner")
check("legacy opt-in code still queues its original invitation", #OlympusVerifyDB.queue, 1)
print(string.format("%d passed, %d failed", passed, failed))
if failed > 0 then os.exit(1) end
