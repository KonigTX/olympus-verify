-- .242 remote server-whisper GUID + explicit fresh WHO, one hardware invite.
-- v233 transport MAC serialization is retained; nearby unit APIs confer no authority.
local passed,failed=0,0
local function check(n,v) if v then passed=passed+1;print("PASS "..n) else failed=failed+1;print("FAIL "..n) end end
local function fixture(saved,clock)
  local e=setmetatable({},{__index=_G});e._G=e;setfenv(assert(loadfile("wow_mock.lua")),e)()
  local f={e=e,who=0,invites=0,records=0,name="Fresh Member",guid="Player-1-ABCDEF12",rows={},unit=true}
  e.NOW=clock or 1793935000;e.GetGuildInfo=function(unit) return unit=="player" and "OLYMPUS PRIME" or nil end
  e.GetRealmName=function() return "Native Realm" end;e.IsInGuild=function() return true end;e.InCombatLockdown=function() return false end
  e.CanGuildInvite=function() return true end;e.UnitExists=function(token) return token=="target" and f.unit end;e.UnitIsPlayer=function() return true end
  e.UnitGUID=function(token) return token=="player" and "Player-1-00000001" or f.unit and f.guid or nil end
  e.GetUnitName=function() return f.name end;e.UnitIsInMyGuild=function() return false end
  e.OlympusVerifyConfig={membershipOnly=true,secret=table.concat({"synthetic","officer","fixture","233"},"-")}
  e.OlympusVerifyDB=saved or {}
  e.C_FriendList={GetNumWhoResults=function() return #f.rows end,GetWhoInfo=function(i) local row=f.rows[i];if f.onWhoRead then f.onWhoRead(i,row) end;return row end,
    SetWhoToUi=function(value) f.toUI=value end,SortWho=function() end,
    SendWho=function(query) f.who=f.who+1;f.query=query;if f.synchronous then f.emit("WHO_LIST_UPDATE") end;if f.failSend then error("synthetic uncertain send") end;if f.blockWho then f.emit("ADDON_ACTION_BLOCKED","OlympusVerify") end end}
  e.hooksecurefunc=function(object,key,after) local old=object[key];object[key]=function(...) local r={old(...)};after(...);return unpack(r) end end
  e.C_GuildInfo.Invite=function(name) f.invites=f.invites+1;f.lastInvite=name;if f.failInvite then error("synthetic unknown") end;if f.blockInvite then f.emit("ADDON_ACTION_BLOCKED","OlympusVerify") end end
  e.OlympusVerifyAPI={OfficerWhoBusy233=function() return false end,
    RecordOfficerInvite233=function(body) assert(e.OlympusOfficerInvites233.IsOriginalProof(body));f.records=f.records+1;f.body=body;return true end}
  e.OlympusVerifyAutoSync={Request=function() f.alerted=true end}
  setfenv(assert(loadfile("../OlympusVerify/Libs/OlympusHmac.lua")),e)("OlympusVerify")
  local h=e.OlympusHmac
  e.OlympusLaunch229={CanonicalGuild=function(value) return value=="OLYMPUS PRIME" and value end,
    Current=function() return f.current end}
  setfenv(assert(loadfile("../OlympusVerify/OlympusVerifyOfficerInvites233.lua")),e)("OlympusVerify")
  f.o=e.OlympusOfficerInvites233;f.emit=function(event,...) f.o.frame:GetScript("OnEvent")(f.o.frame,event,...) end
  f.emit("PLAYER_LOGIN");f.emit("PLAYER_ENTERING_WORLD")
  f.code=h.codeFor(e.OlympusVerifyConfig.secret,f.name,h.utcDay(e.NOW))
  f.scope=h.sha256hex("native-scope|1|OLYMPUS PRIME|Native Realm"):sub(1,16)
  f.proof={version=1,member=false,observedAt=e.NOW,scopeHash=f.scope}
  f.proof.mac=h.hmacSha256hex(e.OlympusVerifyConfig.secret,table.concat({"membership","1",h.normalizeCharacter(f.name),f.guid,f.code,"0",e.NOW,f.scope},"|")):sub(1,32)
  f.observe=function() return f.o.ObserveWhisper(f.name,f.guid,f.code,f.proof) end
  f.answer=function(guild)
    f.rows={{fullName=f.name,fullGuildName=guild}};e.NOW=e.NOW+1;f.emit("WHO_LIST_UPDATE")
  end
  f.approve=function()
    local p=f.body.nativeInvite
    f.row={queueId=7,proofId=p.proofId,name=f.name,guid=f.guid,fullName=f.name,scopeHash=f.scope,observedAt=p.observedAt,expiresAt=p.observedAt+60,reason="knight-unguilded",source="native-who-whisper-v242"}
    f.current={invites={f.row},freshness={[f.guid]={expiresAt=e.NOW+60,scanExpiresAt=e.NOW+500}}}
  end
  return f
end
do
  local f=fixture();check("genuine signed nonmember whisper becomes only a local candidate",f.observe() and #f.o.LocalRows()==1 and f.who==0 and f.invites==0)
  check("one hardware check sends one exact WHO and requests full table",f.o.HardwareCheck(f.guid) and f.who==1 and f.query=='n-"Fresh Member"' and f.toUI==true)
  check("second check cannot overtake pending WHO",not f.o.HardwareCheck(f.guid) and f.who==1)
  f.answer("")
  check("first changed explicit empty guild plus original whisper GUID produces a v242 signed proof",f.records==1 and f.body.nativeInvite.version==242 and f.body.nativeInvite.source=="native-who-whisper-v242" and f.body.nativeInvite.guildState=="unguilded" and f.alerted and f.invites==0)
  local p=f.body.nativeInvite;local h=f.e.OlympusHmac
  local message=table.concat({"invite","233",h.normalizeCharacter(f.body.character),f.body.guid,f.body.code,p.fullName,p.whisperAt,p.requestedAt,p.observedAt,p.scopeHash,p.proofId,p.guildState,p.source,p.before,p.after,p.unitGuid,p.unitFullName},"|")
  check("retained MAC binds original remote code/GUID/fullname/scope/WHO and control times",p.mac==h.hmacSha256hex(f.e.OlympusVerifyConfig.secret,message):sub(1,32) and p.before~=p.after and p.unitGuid==f.guid and p.unitFullName==f.name)
  f.approve();check("fresh Knight Worker row and explicit empty WHO permit exactly one remote hardware invite",f.o.HardwareInvite(f.row) and f.invites==1 and f.lastInvite==f.name)
  local attempt=f.e.OlympusVerifyDB.officerInvites233.attempts['7']
  check("attempt record is assigned before native request and has no automatic retry",attempt and attempt.state=="requested" and not f.o.HardwareInvite(f.row) and f.invites==1)
  local g=fixture(f.e.OlympusVerifyDB);g.rows=f.rows;g.current=f.current
  check("normal reload and stale/fresh queue files do not reset an attempted queue ID",not g.o.HardwareInvite(f.row) and g.invites==0)
end
for _,case in ipairs({"nilGuild","unknownGuildType","guilded","wrongWhoName","duplicateWhoName","sameCachedPositive","whisperNameMismatch","scope","futureWhisper","nativeMAC","expiredWhisper","missingWhisperGUID","invalidWhisperGUID","whisperGUIDMismatch","sort","foreignWho","unknownPrior","synchronous","blockedWHO","sendUnknown","late","firstWrongThenRight","gettersMissing"}) do
  local f=fixture();local ok=f.observe()
  if case=="sameCachedPositive" then f.rows={{fullName=f.name,fullGuildName=""}}
  elseif case=="whisperNameMismatch" then f.name="Other Member"
  elseif case=="scope" then f.e.GetRealmName=function() return "Wrong Realm" end
  elseif case=="futureWhisper" or case=="nativeMAC" or case=="expiredWhisper" or case=="missingWhisperGUID" or case=="invalidWhisperGUID" or case=="whisperGUIDMismatch" then
    f=fixture()
    if case=="futureWhisper" then f.proof.observedAt=f.e.NOW+6
    elseif case=="nativeMAC" then f.proof.mac=string.rep("0",32)
    elseif case=="missingWhisperGUID" then f.guid=nil
    elseif case=="invalidWhisperGUID" then f.guid="not-a-native-guid"
    elseif case=="whisperGUIDMismatch" then f.guid="Player-1-0000ABCD"
    else f.proof.observedAt=f.e.NOW-600 end
    check(case.." cannot capture original whisper",not f.observe() and f.who==0 and f.invites==0);f=nil
  elseif case=="unknownPrior" then f.e.OlympusVerifyAPI.OfficerWhoBusy233=function() return true end
  elseif case=="synchronous" then f.synchronous=true
  elseif case=="blockedWHO" then f.blockWho=true
  elseif case=="sendUnknown" then f.failSend=true
  elseif case=="gettersMissing" then f.e.C_FriendList.GetWhoInfo=nil end
  if f then
    f.o.HardwareCheck()
    if case=="sort" then f.e.C_FriendList.SortWho("name")
    elseif case=="foreignWho" then f.e.C_FriendList.SendWho('n-"Other"')
    elseif case=="late" then f.e.NOW=f.e.NOW+16 end
    if case=="wrongWhoName" or case=="firstWrongThenRight" then f.rows={{fullName="Other",fullGuildName=""}};f.emit("WHO_LIST_UPDATE");f.answer("")
    elseif case=="duplicateWhoName" then f.rows={{fullName=f.name,fullGuildName=""},{fullName=f.name,fullGuildName=""}};f.e.NOW=f.e.NOW+1;f.emit("WHO_LIST_UPDATE")
    elseif case=="nilGuild" then f.answer(nil)
    elseif case=="unknownGuildType" then f.answer(0)
    elseif case=="guilded" then f.answer("Another Guild")
    else f.answer("") end
    check(case.." yields no positive proof or invite",f.records==0 and f.invites==0)
  end
end
for _,case in ipairs({"expiry","cachedGuildChanged","sortAfter","permission","combat","workerMismatch","workerFullName","workerScope","insufficientKnight","legacySource","proofGUIDDrift","proofNameDrift","legacyProofVersion","pageStale","unknownInvite","blockedInvite","missingInviteAPI"}) do
  local f=fixture();f.observe();f.o.HardwareCheck();f.answer("");f.approve()
  if case=="expiry" then f.e.NOW=f.e.NOW+60
  elseif case=="cachedGuildChanged" then f.rows[1].fullGuildName="Other Guild"
  elseif case=="sortAfter" then f.e.C_FriendList.SortWho("level")
  elseif case=="permission" then f.e.CanGuildInvite=function() return false end
  elseif case=="combat" then f.e.InCombatLockdown=function() return true end
  elseif case=="workerMismatch" then f.row.guid="Player-1-0000ABCD"
  elseif case=="workerFullName" then f.row.fullName="Another Member"
  elseif case=="workerScope" then f.row.scopeHash=string.rep("0",16)
  elseif case=="insufficientKnight" then f.row.reason="member-unguilded"
  elseif case=="legacySource" then f.row.source="native-who-unit-v233"
  elseif case=="proofGUIDDrift" then f.body.guid="Player-1-0000ABCD"
  elseif case=="proofNameDrift" then f.body.nativeInvite.fullName="Another Member"
  elseif case=="legacyProofVersion" then f.body.nativeInvite.version=233
  elseif case=="pageStale" then f.current.freshness[f.guid].expiresAt=f.e.NOW
  elseif case=="unknownInvite" then f.failInvite=true
  elseif case=="blockedInvite" then f.blockInvite=true
  else f.e.C_GuildInfo.Invite=nil;f.e.GuildInvite=nil end
  local success=f.o.HardwareInvite(f.row)
  if case=="unknownInvite" or case=="blockedInvite" then
    check(case.." remains spent, no fallback or retry",not success and f.invites==1 and not f.o.HardwareInvite(f.row) and f.invites==1)
  else check(case.." refuses native dispatch",not success and f.invites==0) end
end
for _,case in ipairs({"noNearbyUnit","nearbyGUIDChanged","nearbyNameChanged"}) do
  local f=fixture();f.unit=false;f.observe()
  check(case.." still permits an exact original remote WHO request",f.o.HardwareCheck() and f.who==1)
  f.answer("");f.approve()
  if case=="nearbyGUIDChanged" then f.e.UnitGUID=function(token) return token=="player" and "Player-1-00000001" or "Player-1-0000ABCD" end
  elseif case=="nearbyNameChanged" then f.e.GetUnitName=function() return "Unrelated Nearby Player" end end
  check(case.." cannot replace the remote whisper identity or block its fresh explicit WHO invite",f.o.HardwareInvite(f.row) and f.invites==1 and f.lastInvite=="Fresh Member")
end
do
  local f=fixture();f.observe();f.o.HardwareCheck();f.answer("");local old=f.body.nativeInvite.observedAt
  f.e.NOW=f.e.NOW+30;f.emit("WHO_LIST_UPDATE")
  check("sorting/reemission never refreshes an old positive observation or produces a second proof",f.records==1 and f.body.nativeInvite.observedAt==old)
  check("timer/event surfaces contain no invite or automatic WHO",f.invites==0 and f.who==1)
end
do
  local f=fixture();f.observe();f.o.HardwareCheck();f.answer("");f.approve()
  check("malformed external row is held without a Lua error or native request",not f.o.HardwareInvite({}) and f.invites==0)
  local forged={};for k,v in pairs(f.row) do forged[k]=v end;forged.queueId=999
  check("caller cannot substitute a new queue ID for the actual loaded source row",not f.o.HardwareInvite(forged) and f.invites==0)
end
do
  local f=fixture();f.observe();f.o.HardwareCheck();f.answer("");f.approve()
  f.e.OlympusVerifyDB.officerInvites233.attempts['6']={state="unknown"}
  local prior={queueId=6};check("Next can choose a different approved target without retrying a spent queue ID",f.o.Next({prior,f.row}) and f.invites==1 and f.e.OlympusVerifyDB.officerInvites233.attempts['6'].state=="unknown")
  check("all spent loaded invites never trigger another WHO or retry",not f.o.Next({prior,f.row}) and f.invites==1 and f.who==1)
end
do
  local f=fixture();f.observe()
  local oldName,oldGuid,oldCode,oldProof=f.name,f.guid,f.code,f.proof
  f.name,f.guid="Zed Candidate","Player-1-12345678";f.code=f.e.OlympusHmac.codeFor(f.e.OlympusVerifyConfig.secret,f.name,f.e.OlympusHmac.utcDay(f.e.NOW))
  f.proof={version=1,member=false,observedAt=f.e.NOW,scopeHash=f.scope}
  f.proof.mac=f.e.OlympusHmac.hmacSha256hex(f.e.OlympusVerifyConfig.secret,table.concat({"membership","1",f.e.OlympusHmac.normalizeCharacter(f.name),f.guid,f.code,"0",f.e.NOW,f.scope},"|")):sub(1,32)
  f.observe();check("hardware WHO chooses the first original whisper without a nearby-target preference",f.o.HardwareCheck() and f.query=='n-"Fresh Member"' and f.who==1)
end
do
  local f=fixture();f.observe();f.o.HardwareCheck()
  f.onWhoRead=function() f.guid="Player-1-00000001" end
  local originalGuid=f.guid
  f.answer("");check("unrelated unit GUID change during WHO capture cannot replace the original remote GUID",f.records==1 and f.body.guid==originalGuid and f.invites==0)
end
do
  -- Real main HandleCode -> native MAC -> Officer module -> real SavedVariables event bridge.
  local e=setmetatable({},{__index=_G});e._G=e;setfenv(assert(loadfile("wow_mock.lua")),e)()
  e.GetGuildInfo=function(unit) return unit=="player" and "OLYMPUS PRIME" or nil end;e.GetRealmName=function() return "Native Realm" end
  e.GetGuildRosterShowOffline=function() return true end;e.IsInGuild=function() return true end;e.InCombatLockdown=function() return false end
  e.UnitExists=function(token) return token=="target" end;e.UnitIsPlayer=function() return true end;e.UnitIsInMyGuild=function() return false end
  e.UnitGUID=function(token) return token=="player" and e.PLAYER_GUID or "Player-1-ABCDEF12" end;e.GetUnitName=function() return "Fresh Member" end
  e.OlympusVerifyConfig={secret="synthetic-main-officer-composition",membershipOnly=true,uiAutoShow=false}
  e.ROSTER={{name="Fern Melder",guid=e.PLAYER_GUID,rank="Guild Master",rankIndex=0,level=60}}
  local rows,who={},0
  e.C_FriendList={GetNumWhoResults=function() return #rows end,GetWhoInfo=function(i) return rows[i] end,SetWhoToUi=function() end,SortWho=function() end,SendWho=function() who=who+1 end}
  e.hooksecurefunc=function(object,key,after) local old=object[key];object[key]=function(...) local r={old(...)};after(...);return unpack(r) end end
  setfenv(assert(loadfile("../OlympusVerify/Libs/OlympusHmac.lua")),e)("OlympusVerify")
  setfenv(assert(loadfile("../OlympusVerify/OlympusVerify.lua")),e)("OlympusVerify")
  local main=e.OlympusVerifyFrame:GetScript("OnEvent");main(e.OlympusVerifyFrame,"ADDON_LOADED","OlympusVerify")
  setfenv(assert(loadfile("../OlympusVerify/OlympusVerifyLaunch229.lua")),e)("OlympusVerify")
  setfenv(assert(loadfile("../OlympusVerify/OlympusVerifyOfficerInvites233.lua")),e)("OlympusVerify")
  local o=e.OlympusOfficerInvites233;local emit=o.frame:GetScript("OnEvent");emit(o.frame,"PLAYER_LOGIN");emit(o.frame,"PLAYER_ENTERING_WORLD")
  local code=e.OlympusHmac.codeFor(e.OlympusVerifyConfig.secret,"Fresh Member",e.OlympusHmac.utcDay(e.NOW))
  main(e.OlympusVerifyFrame,"CHAT_MSG_WHISPER","!verify "..code,"Fresh Member",nil,nil,nil,nil,nil,nil,nil,nil,nil,"Player-1-ABCDEF12")
  check("actual main original nonmember whisper reaches local officer candidate without an invite",#o.LocalRows()==1 and who==0)
  o.HardwareCheck();rows={{fullName="Fresh Member",fullGuildName=""}};e.NOW=e.NOW+1;emit(o.frame,"WHO_LIST_UPDATE")
  local count=0;for _,event in ipairs(e.OlympusVerifyDB.events or {}) do if event.type=="officer_invite_proof" and event.body and o.IsOriginalProof(event.body) then count=count+1 end end
  check("actual main bridge exports exactly the original signed officer event after hardware WHO",who==1 and count==1)
end
do
  local f=fixture();f.observe();f.o.HardwareCheck();f.answer("");f.approve()
  f.onWhoRead=function() f.e.GetRealmName=function() return "Changed Realm" end end
  check("scope change during final exact WHO read holds the remote hardware invite",not f.o.HardwareInvite(f.row) and f.invites==0)
end
do
  local f=fixture();f.observe();f.o.HardwareCheck()
  f.onWhoRead=function() f.e.GetRealmName=function() return "Changed Realm" end end
  f.answer("")
  check("scope change during exact WHO response capture cannot publish a remote officer proof",f.records==0 and f.invites==0)
end
local function savedCopy(v)
  if type(v)~="table" then return v end
  local out={};for k,value in pairs(v) do out[savedCopy(k)]=savedCopy(value) end;return out
end
local function reloadFixture(f,at)
  f.emit("PLAYER_LEAVING_WORLD")
  local g=fixture(savedCopy(f.e.OlympusVerifyDB),at)
  g.rows=savedCopy(f.rows)
  if f.body then local row=g.e.OlympusVerifyDB.officerInvites233.proofs[f.body.nativeInvite.proofId];g.body=row and row.body or savedCopy(f.body) end
  return g
end
do
  local f=fixture();f.observe();f.o.HardwareCheck();f.answer("")
  local proof=savedCopy(f.body.nativeInvite);local start=f.e.NOW
  local g=reloadFixture(f,start+5) -- first hardware Scan/reload: source leaves WoW's memory for Watcher
  check("first ordinary reload preserves completed proof revision without producing another WHO/event",g.e.OlympusVerifyDB.officerInvites233.proofs[proof.proofId].revision==(g.e.OlympusVerifyDB.officerInvites233.whoRevision or 0) and g.who==0 and g.records==0)
  local h=reloadFixture(g,start+10) -- second hardware Sync/reload loads the later Worker projection
  h.approve()
  check("two ordinary reloads preserve the exact original proof MAC and observation time",h.body.nativeInvite.mac==proof.mac and h.body.nativeInvite.observedAt==proof.observedAt and h.body.nativeInvite.proofId==proof.proofId)
  check("original completed proof remains usable for one attended invite after the two-reload transport",h.o.HardwareInvite(h.row) and h.invites==1 and h.who==0 and h.records==0)
  local i=reloadFixture(h,start+12);i.approve()
  check("another reload never clears the original spent native queue ID",not i.o.HardwareInvite(i.row) and i.invites==0)
end
for _,kind in ipairs({"sort","foreign","ownGuild","officerGuid","realm","expiry"}) do
  local f=fixture();f.observe();f.o.HardwareCheck();f.answer("");local at=f.e.NOW+5
  if kind=="sort" then f.e.C_FriendList.SortWho("name")
  elseif kind=="foreign" then f.e.C_FriendList.SendWho('n-"Someone Else"')
  elseif kind=="ownGuild" then f.emit("PLAYER_GUILD_UPDATE","player")
  elseif kind=="expiry" then at=f.body.nativeInvite.observedAt+60 end
  local g=reloadFixture(f,at)
  if kind=="officerGuid" then g.e.UnitGUID=function(token) return token=="player" and "Player-1-99999999" or g.guid end
  elseif kind=="realm" then g.e.GetRealmName=function() return "Other Realm" end end
  -- Expired proofs may already be pruned by Store; use the original row only for the held oracle.
  g.body=f.body;g.approve()
  check(kind.." still holds across ordinary reload and cannot revive old proof custody",not g.o.HardwareInvite(g.row) and g.invites==0 and g.who==0)
end
do
  local f=fixture();f.observe();f.o.HardwareCheck();local g=reloadFixture(f,f.e.NOW+1)
  g.observe()
  check("WHO still outstanding at reload stays unknown and cannot be automatically reissued",g.e.OlympusVerifyDB.officerInvites233.unknownWhoOutstanding==true and not g.o.HardwareCheck() and g.who==0 and g.records==0)
end
print(string.format("%d passed, %d failed",passed,failed));if failed>0 then error("officer invites failed") end
