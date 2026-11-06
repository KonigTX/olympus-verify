-- .233 own WHO/unit producer + one hardware invite. Synthetic native APIs only.
local passed,failed=0,0
local function check(n,v) if v then passed=passed+1;print("PASS "..n) else failed=failed+1;print("FAIL "..n) end end
local function fixture(saved)
  local e=setmetatable({},{__index=_G});e._G=e;setfenv(assert(loadfile("wow_mock.lua")),e)()
  local f={e=e,who=0,invites=0,records=0,name="Fresh Member",guid="Player-1-ABCDEF12",rows={},unit=true}
  e.NOW=1793935000;e.GetGuildInfo=function(unit) return unit=="player" and "OLYMPUS PRIME" or nil end
  e.GetRealmName=function() return "Native Realm" end;e.IsInGuild=function() return true end;e.InCombatLockdown=function() return false end
  e.CanGuildInvite=function() return true end;e.UnitExists=function(token) return token=="target" and f.unit end;e.UnitIsPlayer=function() return true end
  e.UnitGUID=function(token) return token=="player" and "Player-1-00000001" or f.unit and f.guid or nil end
  e.GetUnitName=function() return f.name end;e.UnitIsInMyGuild=function() return false end
  e.OlympusVerifyConfig={membershipOnly=true,secret=table.concat({"synthetic","officer","fixture","233"},"-")}
  e.OlympusVerifyDB=saved or {}
  e.C_FriendList={GetNumWhoResults=function() return #f.rows end,GetWhoInfo=function(i) return f.rows[i] end,
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
    f.row={queueId=7,proofId=p.proofId,name=f.name,guid=f.guid,fullName=f.name,scopeHash=f.scope,observedAt=p.observedAt,expiresAt=p.observedAt+60,reason="knight-unguilded",source="native-who-unit-v233"}
    f.current={invites={f.row},freshness={[f.guid]={expiresAt=e.NOW+60,scanExpiresAt=e.NOW+500}}}
  end
  return f
end
do
  local f=fixture();check("genuine signed nonmember whisper becomes only a local candidate",f.observe() and #f.o.LocalRows()==1 and f.who==0 and f.invites==0)
  check("one hardware check sends one exact WHO and requests full table",f.o.HardwareCheck(f.guid) and f.who==1 and f.query=='n-"Fresh Member"' and f.toUI==true)
  check("second check cannot overtake pending WHO",not f.o.HardwareCheck(f.guid) and f.who==1)
  f.answer("")
  check("first changed raw explicit empty guild plus matching native unit produces one signed proof",f.records==1 and f.body.nativeInvite.guildState=="unguilded" and f.alerted and f.invites==0)
  local p=f.body.nativeInvite;local h=f.e.OlympusHmac
  local message=table.concat({"invite","233",h.normalizeCharacter(f.body.character),f.body.guid,f.body.code,p.fullName,p.whisperAt,p.requestedAt,p.observedAt,p.scopeHash,p.proofId,p.guildState,p.source,p.before,p.after,p.unitGuid,p.unitFullName},"|")
  check("invite MAC binds original code/GUID/fullname/unit/scope/before-after and control times",p.mac==h.hmacSha256hex(f.e.OlympusVerifyConfig.secret,message):sub(1,32) and p.before~=p.after)
  f.approve();check("fresh Worker row and current explicit WHO/unit permit exactly one hardware native invite",f.o.HardwareInvite(f.row) and f.invites==1 and f.lastInvite==f.name)
  local attempt=f.e.OlympusVerifyDB.officerInvites233.attempts['7']
  check("attempt record is assigned before native request and has no automatic retry",attempt and attempt.state=="requested" and not f.o.HardwareInvite(f.row) and f.invites==1)
  local g=fixture(f.e.OlympusVerifyDB);g.rows=f.rows;g.current=f.current
  check("normal reload and stale/fresh queue files do not reset an attempted queue ID",not g.o.HardwareInvite(f.row) and g.invites==0)
end
for _,case in ipairs({"nilGuild","guilded","wrongWhoName","sameCachedPositive","missingUnit","unitGuid","unitName","scope","futureWhisper","nativeMAC","expiredWhisper","sort","foreignWho","unknownPrior","synchronous","blockedWHO","sendUnknown","late","firstWrongThenRight","gettersMissing"}) do
  local f=fixture();local ok=f.observe()
  if case=="sameCachedPositive" then f.rows={{fullName=f.name,fullGuildName=""}}
  elseif case=="missingUnit" then f.unit=false
  elseif case=="unitGuid" then f.guid="Player-1-0000ABCD"
  elseif case=="unitName" then f.name="Other Member"
  elseif case=="scope" then f.e.GetRealmName=function() return "Wrong Realm" end
  elseif case=="futureWhisper" or case=="nativeMAC" or case=="expiredWhisper" then
    f=fixture();if case=="futureWhisper" then f.proof.observedAt=f.e.NOW+6 elseif case=="nativeMAC" then f.proof.mac=string.rep("0",32) else f.proof.observedAt=f.e.NOW-600 end
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
    elseif case=="nilGuild" then f.answer(nil)
    elseif case=="guilded" then f.answer("Another Guild")
    else f.answer("") end
    check(case.." yields no positive proof or invite",f.records==0 and f.invites==0)
  end
end
for _,case in ipairs({"expiry","unitLost","unitChanged","cachedGuildChanged","sortAfter","permission","combat","workerMismatch","pageStale","unknownInvite","blockedInvite","missingInviteAPI"}) do
  local f=fixture();f.observe();f.o.HardwareCheck();f.answer("");f.approve()
  if case=="expiry" then f.e.NOW=f.e.NOW+60
  elseif case=="unitLost" then f.unit=false
  elseif case=="unitChanged" then f.guid="Player-1-0000ABCD"
  elseif case=="cachedGuildChanged" then f.rows[1].fullGuildName="Other Guild"
  elseif case=="sortAfter" then f.e.C_FriendList.SortWho("level")
  elseif case=="permission" then f.e.CanGuildInvite=function() return false end
  elseif case=="combat" then f.e.InCombatLockdown=function() return true end
  elseif case=="workerMismatch" then f.row.guid="Player-1-0000ABCD"
  elseif case=="pageStale" then f.current.freshness[f.guid].expiresAt=f.e.NOW
  elseif case=="unknownInvite" then f.failInvite=true
  elseif case=="blockedInvite" then f.blockInvite=true
  else f.e.C_GuildInfo.Invite=nil;f.e.GuildInvite=nil end
  local success=f.o.HardwareInvite(f.row)
  if case=="unknownInvite" or case=="blockedInvite" then
    check(case.." remains spent, no fallback or retry",not success and f.invites==1 and not f.o.HardwareInvite(f.row) and f.invites==1)
  else check(case.." refuses native dispatch",not success and f.invites==0) end
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
  f.observe();check("hardware WHO chooses the currently visible original GUID rather than the alphabetically first whisper",f.o.HardwareCheck() and f.query=='n-"Zed Candidate"' and f.who==1)
end
do
  local f=fixture();f.observe();f.o.HardwareCheck();local original=f.e.C_FriendList.GetWhoInfo
  f.e.C_FriendList.GetWhoInfo=function(i) local row=original(i);f.guid="Player-1-00000001";return row end
  f.answer("");check("unit change during WHO table capture cannot publish a proof",f.records==0 and f.invites==0)
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
  f.e.GetUnitName=function() f.e.GetRealmName=function() return "Changed Realm" end;return f.name end
  check("scope change during final native unit read holds the hardware invite",not f.o.HardwareInvite(f.row) and f.invites==0)
end
do
  local f=fixture();f.observe();f.o.HardwareCheck()
  f.e.GetUnitName=function() f.e.GetRealmName=function() return "Changed Realm" end;return f.name end
  f.answer("")
  check("scope change during final capture unit read cannot publish an officer proof",f.records==0 and f.invites==0)
end
print(string.format("%d passed, %d failed",passed,failed));if failed>0 then error("officer invites failed") end
