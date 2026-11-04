-- .227 retained beta queues are read-only in membership-only mode, including direct hardware callbacks.
local passed, failed = 0, 0
local function check(label, value)
  if value then passed = passed + 1; print("PASS " .. label) else failed = failed + 1; print("FAIL " .. label) end
end
local function plain(text) return tostring(text or ""):gsub("|c%x%x%x%x%x%x%x%x", ""):gsub("|r", "") end
local function fixture(legacy)
  local e = setmetatable({}, { __index = _G }); e._G = e
  setfenv(assert(loadfile("wow_mock.lua")), e)()
  e.OlympusVerifyConfig = { secret = "held-queue-test-only", membershipOnly = not legacy, checkBeforeInvite = false, uiAutoShow = false, setNotes = true }
  local queue = {
    { id = 8101, name = "Beta Queued", target = "Beta Queued", source = "whisper", status = "queued", ts = e.NOW - 30 * 86400, attempts = 2, note = "old private note" },
    { id = 8102, name = "Beta Failed", source = "worker", status = "failed", ts = e.NOW - 30 * 86400, failedAt = e.NOW - 29 * 86400, reply = "old refusal", removedReason = "in_another_guild", attempts = 3 },
    { id = 8103, name = "Beta Invited", source = "worker", status = "invited", ts = e.NOW - 30 * 86400, invitedAt = e.NOW - 29 * 86400, attempts = 1 },
    { id = 8104, name = "Beta Joined", source = "worker", status = "joined", ts = e.NOW - 30 * 86400, joinedAt = e.NOW - 29 * 86400 },
  }
  local notePending = { { name = "Beta Queued", note = "retained pending note", ts = e.NOW - 10 } }
  e.OlympusVerifyDB = { queue = queue, notePending = notePending }
  e.OlympusQueue = { version = 1, generatedAt = e.NOW, setGuildNote = true, entries = {
    { id = 8201, character = "Old Worker Row", note = "retained worker note", position = 1 },
  } }
  e.ROSTER = { { name = "Fern Melder", rank = "High Council", rankIndex = 1, level = 1, online = true, guid = e.PLAYER_GUID } }
  e.GetGuildInfo = function() return "Olympus" end
  e.GetRealmName = function() return "Native Live Realm" end
  e.GetGuildRosterShowOffline = function() return true end
  local f = { e = e, queue = queue, notePending = notePending, invites = 0, notes = 0, who = 0, ticks = {}, timers = {} }
  e.C_GuildInfo.Invite = function() f.invites = f.invites + 1 end
  e.C_GuildInfo.SetNote = function() f.notes = f.notes + 1 end
  e.C_FriendList = { SendWho = function() f.who = f.who + 1 end }
  e.C_Timer = {
    After = function(_, fn) f.timers[#f.timers + 1] = fn end,
    NewTicker = function(_, fn) local t = { Cancel = function() end }; f.ticks[#f.ticks + 1] = fn; return t end,
  }
  setfenv(assert(loadfile("../OlympusVerify/Libs/OlympusHmac.lua")), e)("OlympusVerify")
  setfenv(assert(loadfile("../OlympusVerify/OlympusVerify.lua")), e)("OlympusVerify")
  setfenv(assert(loadfile("../OlympusVerify/OlympusVerifyUI.lua")), e)("OlympusVerify")
  setfenv(assert(loadfile("../OlympusVerify/OlympusVerifyPreview.lua")), e)("OlympusVerify")
  local handler, frame = e.OlympusVerifyFrame:GetScript("OnEvent"), e.OlympusVerifyFrame
  handler(frame, "ADDON_LOADED", "OlympusVerify"); handler(frame, "PLAYER_LOGIN")
  f.handler, f.frame, f.API, f.UI = handler, frame, e.OlympusVerifyAPI, e.OlympusVerifyUI
  return f
end
do
  local f = fixture()
  check("membership mode retains the original saved queue object", f.e.OlympusVerifyDB.queue == f.queue)
  check("old invited failed and joined rows are retained without housekeeping deletion", #f.queue == 4 and f.queue[2].status == "failed" and f.queue[3].status == "invited" and f.queue[4].status == "joined")
  check("loaded beta Worker queue is not imported", #f.queue == 4 and f.queue[1].name == "Beta Queued")
  check("pending legacy notes remain untouched", f.e.OlympusVerifyDB.notePending == f.notePending and #f.notePending == 1)
  f.e.OlympusVerify_Flush()
  f.API.Flush(f.queue[2], { force = true })
  f.API.Flush(f.queue[1], { force = true })
  f.API.Check()
  f.e.SlashCmdList.OLYMPUSVERIFY("flush")
  f.e.SlashCmdList.OLYMPUSVERIFY("invite")
  check("all direct and forced flush paths send zero invites", f.invites == 0)
  check("all direct and forced flush paths send zero notes and Who calls", f.notes == 0 and f.who == 0)
  check("failed legacy rows cannot be revived by a forced retry", f.queue[2].status == "failed" and f.queue[2].reply == "old refusal" and f.queue[2].attempts == 3)
  check("queued legacy rows preserve original status and attempts", f.queue[1].status == "queued" and f.queue[1].attempts == 2)
  f.API.Remove(f.queue[1]); f.API.ClearQueue(); f.e.SlashCmdList.OLYMPUSVERIFY("clear")
  check("remove clear and slash clear preserve the held queue", f.e.OlympusVerifyDB.queue == f.queue and #f.queue == 4)
  check("held clear preserves pending notes", f.e.OlympusVerifyDB.notePending == f.notePending)
  f.e.OlympusQueue.entries[#f.e.OlympusQueue.entries + 1] = { id = 8202, character = "New Worker Row" }
  f.e.SlashCmdList.OLYMPUSVERIFY("merge")
  for _, fn in ipairs(f.ticks) do fn() end
  local timers = f.timers; f.timers = {}; for _, fn in ipairs(timers) do fn() end
  check("loaded queue refreshes and timers cannot resurrect any invite", #f.queue == 4 and f.invites == 0)
  check("the loaded queue itself is not erased or rewritten", #f.e.OlympusQueue.entries == 2 and f.e.OlympusQueue.entries[1].id == 8201)
  check("old joined/invited state remains held after timers", f.queue[3].status == "invited" and f.queue[4].status == "joined")
  f.UI.Show()
  check("toolbar send is disabled with explicit verification-only label", f.UI.sendButton:IsEnabled() == false and f.UI.sendButton:GetText() == "Verification only")
  check("legacy queue header explains its hold", plain(f.UI.queueHeader:GetText()):find("Legacy invite queue", 1, true) ~= nil)
  check("queue clear is disabled", f.UI.clearButton:IsEnabled() == false)
  local visibleRows = 0
  for _, row in ipairs(f.UI.rows) do
    if row.entry then
      visibleRows = visibleRows + 1
      check("retained row Invite is disabled", row.invite:IsEnabled() == false)
      check("retained row Remove is disabled", row.remove:IsEnabled() == false)
      local click = row.invite:GetScript("OnClick"); if click then click(row.invite) end
    end
  end
  check("all retained rows remain reviewable", visibleRows == 4)
  local send = f.UI.sendButton:GetScript("OnClick"); if send then send(f.UI.sendButton) end
  check("forced UI callbacks still send zero invites", f.invites == 0 and f.notes == 0 and f.who == 0)
  f.UI.Hide()
  f.e.OlympusVerifyButton:Click("LeftButton")
  check("membership-mode launcher opens the status panel instead of inviting", f.e.OlympusVerifyPanel:IsShown() and f.invites == 0)
  check("launcher names verification-only mode", plain(f.e.OlympusVerifyButton:GetText()):find("Verification only", 1, true) ~= nil)
  f.e.SlashCmdList.OLYMPUSVERIFY("preview queue")
  local before = #f.API.Status().queue
  f.API.Flush(); f.API.Check(); f.API.ClearQueue()
  check("preview mirrors the held invite mode without changing sample queue", #f.API.Status().queue == before and f.UI.sendButton:IsEnabled() == false)
  f.e.SlashCmdList.OLYMPUSVERIFY("preview off")
  check("ending preview restores the exact retained real queue", f.e.OlympusVerifyDB.queue == f.queue and #f.queue == 4 and f.invites == 0)
end
do
  local f = fixture(true)
  local found
  for _, row in ipairs(f.e.OlympusVerifyDB.queue) do if row.name == "Old Worker Row" then found = row end end
  check("legacy mode still imports its Worker queue", found ~= nil)
  f.API.Flush(found, { force = true })
  check("legacy explicit invite still performs its one synthetic invite", f.invites == 1 and found.status == "invited")
end
print(string.format("%d passed, %d failed", passed, failed))
if failed > 0 then os.exit(1) end
