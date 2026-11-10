-- Attended WHO/unit evidence. No timer/event sends WHO, invites, ranks, removals or MOTD.
local ADDON=...
local H,API,cfg=OlympusHmac,OlympusVerifyAPI,OlympusVerifyConfig or {}
if not H or not API then return end
local O={}
OlympusOfficerInvites233=O
local frame=CreateFrame("Frame")
local state={whispers={},proofs={},active=false,revision=0,reason="waiting for a genuine nonmember whisper"}
local function Say(s) if DEFAULT_CHAT_FRAME then DEFAULT_CHAT_FRAME:AddMessage("|cffc9a227Olympus|r: "..s) end end
local function Read(fn,...)
  if type(fn)~="function" then return nil end
  local ok,v=pcall(fn,...);if not ok then return nil end
  if type(issecretvalue)=="function" then local known,secret=pcall(issecretvalue,v);if not known or secret then return nil end end
  return v
end
local function Text(v,max)
  if type(issecretvalue)=="function" then local ok,secret=pcall(issecretvalue,v);if not ok or secret then return nil end end
  return type(v)=="string" and #v<=(max or 100) and v~="" and v==v:match("^%s*(.-)%s*$") and not v:find("[%c|]") and v or nil
end
local function Int(v,min,max) return type(v)=="number" and v==v and v==math.floor(v) and v>=min and v<=max end
local function Guid(v) return Text(v,40) and v:match("^Player%-%d+%-%x+$") and v end
local function Store()
  if type(OlympusVerifyDB)~="table" then return nil end
  local db=OlympusVerifyDB
  if type(db.officerInvites233)~="table" then db.officerInvites233={proofs={},attempts={},sequence=0} end
  local s=db.officerInvites233
  if type(s.proofs)=="table" then
    for id,row in pairs(s.proofs) do
      local p=type(row)=="table" and type(row.body)=="table" and row.body.nativeInvite
      if type(p)=="table" and Int(p.observedAt,1,time()) and time()>=p.observedAt+60 then s.proofs[id]=nil;state.proofs[id]=nil end
    end
  end
  if type(s.proofs)~="table" or type(s.attempts)~="table" then return nil end
  return s
end
local function Identity()
  if cfg.membershipOnly~=true or not Text(cfg.secret,1024) or #cfg.secret<16 or cfg.secret:find("REPLACE",1,true) or Read(IsInGuild)~=true then return nil end
  local guild,realm,guid=Text(Read(GetGuildInfo,"player")),Text(Read(GetRealmName)),Guid(Read(UnitGUID,"player"))
  if not guild or not realm or not guid or not OlympusLaunch229 or OlympusLaunch229.CanonicalGuild(guild)~="OLYMPUS PRIME" then return nil end
  return {guild=guild,realm=realm,guid=guid,scopeHash=H.sha256hex("native-scope|1|"..guild.."|"..realm):sub(1,16)}
end
local function Preview() return OlympusVerifyUI and OlympusVerifyUI.preview or OlympusVerifyPreview and OlympusVerifyPreview.State and OlympusVerifyPreview.State() end
local function UnitIdentity(fullName,guid)
  -- .242: the server whisper supplies the exact sender GUID even remotely.
  -- This is IDENTITY only: the separately correlated WHO must explicitly say
  -- fullGuildName=="". Absence from our guild roster is never unguilded proof.
  local w=state.whispers[guid]
  if w and w.fullName==fullName and time()>=w.whisperAt and time()-w.whisperAt<600 then return "whisper" end
  local s=OlympusVerifyDB and OlympusVerifyDB.officerInvites233
  for _,row in pairs(s and s.proofs or {}) do
    local b=row.body;local p=b and b.nativeInvite
    if b and p and b.guid==guid and p.fullName==fullName and p.version==242 and p.source=="native-who-whisper-v242"
      and time()>=p.whisperAt and time()-p.whisperAt<600 then return "whisper" end
  end
end
local function ScopeCurrent(record)
  local identity=Identity()
  return identity and identity.scopeHash==record.scopeHash and identity.guild==record.guild and identity.realm==record.realm and identity.guid==record.officerGuid
end
local function WhoAPI()
  local c=type(C_FriendList)=="table" and C_FriendList or {}
  if type(c.GetNumWhoResults)~="function" or type(c.GetWhoInfo)~="function" or type(c.SendWho)~="function" or type(c.SetWhoToUi)~="function" then return nil end
  return c
end
local function Snapshot()
  local c=WhoAPI();if not c then return nil end
  local n=Read(c.GetNumWhoResults)
  if not Int(n,0,50) then return nil end
  local rows,parts={},{}
  for i=1,n do
    local row=Read(c.GetWhoInfo,i)
    if type(row)~="table" then return nil end
    -- Raw fields only: nil fullGuildName is unknown, not an empty guild string.
    local name,guild=Text(rawget(row,"fullName")),rawget(row,"fullGuildName")
    if type(issecretvalue)=="function" then local ok,secret=pcall(issecretvalue,guild);if not ok or secret then return nil end end
    if not name or type(guild)~="string" or #guild>128 or guild:find("[%c|]") then return nil end
    if rows[name] then return nil end
    rows[name]={fullName=name,fullGuildName=guild}
    parts[#parts+1]=#name..":"..name.."|"..#guild..":"..guild
  end
  table.sort(parts) -- Sorting a cached result cannot create a changed fingerprint.
  return {rows=rows,digest=H.sha256hex(tostring(n).."|"..table.concat(parts,"|"))}
end
local function MAC(body)
  local p=body.nativeInvite
  return H.hmacSha256hex(cfg.secret,table.concat({"invite","233",H.normalizeCharacter(body.character),body.guid,body.code,p.fullName,
    tostring(p.whisperAt),tostring(p.requestedAt),tostring(p.observedAt),p.scopeHash,p.proofId,p.guildState,p.source,p.before,p.after,p.unitGuid,p.unitFullName},"|")):sub(1,32)
end
local function ValidStored(row)
  if type(row)~="table" or type(row.body)~="table" or type(row.body.nativeInvite)~="table" then return nil end
  local b,p=row.body,row.body.nativeInvite
  local identity,now=Identity(),time()
  if not identity or row.guild~=identity.guild or row.realm~=identity.realm or row.officerGuid~=identity.guid
    or b.source~="whisper" or not Text(b.character) or not Guid(b.guid) or not Text(b.code,7) or H.strictCode(b.code)~=b.code or not H.checkCode(cfg.secret,b.character,b.code)
    or p.version~=242 or not Text(p.proofId,32) or #p.proofId~=32 or not p.proofId:match("^%x+$")
    or not Text(p.fullName) or p.fullName~=p.unitFullName or p.unitGuid~=b.guid or H.normalizeCharacter(p.fullName)~=H.normalizeCharacter(b.character)
    or p.guildState~="unguilded" or p.source~="native-who-whisper-v242" or p.scopeHash~=identity.scopeHash
    or not Int(p.whisperAt,1,now+5) or not Int(p.requestedAt,p.whisperAt,now+5) or not Int(p.observedAt,p.requestedAt,p.requestedAt+15)
    or now>=p.observedAt+60 or p.observedAt>now+5 or p.observedAt-p.whisperAt>=600
    or not Text(p.before,64) or #p.before~=64 or not p.before:match("^%x+$") or not Text(p.after,64) or #p.after~=64 or not p.after:match("^%x+$") or p.before==p.after
    or not Text(p.mac,32) or p.mac~=MAC(b) then return nil end
  return b
end
function O.ObserveWhisper(fullName,guid,code,native)
  local identity=Identity();local now=time()
  if not identity or not Text(fullName) or not Guid(guid) or not Text(code,7) or H.strictCode(code)~=code or not H.checkCode(cfg.secret,fullName,code)
    or type(native)~="table" or native.member~=false or native.scopeHash~=identity.scopeHash or not Int(native.observedAt,now-599,now+5) then return false end
  if native.version~=1 or type(native.mac)~="string" or native.mac~=H.hmacSha256hex(cfg.secret,table.concat({"membership","1",H.normalizeCharacter(fullName),guid,code,"0",tostring(native.observedAt),native.scopeHash},"|")):sub(1,32) then return false end
  for old,rec in pairs(state.whispers) do if now-rec.whisperAt>=600 then state.whispers[old]=nil end end
  -- Main's original native whisper hook is the producer. No WHO cache is consulted here.
  local count=0;for _ in pairs(state.whispers) do count=count+1 end
  if count>=100 and not state.whispers[guid] then state.reason="local whisper capacity held";return false end
  state.whispers[guid]={fullName=fullName,guid=guid,code=code,whisperAt=native.observedAt,scopeHash=identity.scopeHash,guild=identity.guild,realm=identity.realm,officerGuid=identity.guid}
  state.reason="click Next officer action to check the remote whisperer's explicit guild state with WHO"
  return true
end
local function Invalidate(reason,foreign)
  state.revision=state.revision+1
  if foreign then state.unknownOutstanding=true end
  state.pending=nil;state.reason=reason
  local s=Store();if s then s.whoRevision=(s.whoRevision or 0)+1;if foreign then s.unknownWhoOutstanding=true end end
end
local hooks={}
local function InstallHooks()
  if type(hooksecurefunc)~="function" then return false end
  local c=WhoAPI();if not c then return false end
  local function hook(container,key,kind)
    if type(container[key])~="function" then hooks[#hooks+1]={table=container,key=key,value=container[key]};return true end
    local ok=pcall(hooksecurefunc,container,key,function()
      if state.sending and kind=="send" then state.ownHook=true
      elseif kind=="send" then Invalidate("another WHO request is outstanding; positive capture held",true)
      else Invalidate("WHO sorting/interference invalidated the observation",false) end
    end)
    if ok then hooks[#hooks+1]={table=container,key=key,value=container[key]} end
    return ok
  end
  for _,key in ipairs({"GetNumWhoResults","GetWhoInfo","SetWhoToUi"}) do hooks[#hooks+1]={table=c,key=key,value=c[key]} end
  return hook(c,"SendWho","send") and hook(c,"SortWho","sort") and hook(_G,"SendWho","send") and hook(_G,"SortWho","sort")
end
local function HooksCurrent()
  if not state.hooksReady then return false end
  for _,h in ipairs(hooks) do if h.table[h.key]~=h.value then return false end end
  return true
end
function O.LocalRows()
  local out={};for guid,w in pairs(state.whispers) do if time()-w.whisperAt<600 and ScopeCurrent(w) then out[#out+1]={guid=guid,name=w.fullName,fullName=w.fullName,localCheck=true} end end
  table.sort(out,function(a,b) return a.name<b.name end);return out
end
function O.HardwareCheck(guid)
  local rows=O.LocalRows();local w=guid and state.whispers[guid]
  if not guid then for _,row in ipairs(rows) do if UnitIdentity(row.fullName,row.guid) then w=state.whispers[row.guid];break end end end
  local s,c=Store(),WhoAPI()
  if not w or not ScopeCurrent(w) or Preview() or not state.active or Read(InCombatLockdown)~=false or not s or not c or not HooksCurrent() or state.disabled or type(API.RecordOfficerInvite233)~="function" then Say("WHO/unit capability unavailable. Use the normal native UI; no invite offered.");return false end
  if state.unknownOutstanding or s.unknownWhoOutstanding or API.OfficerWhoBusy233 and API.OfficerWhoBusy233() then Say("A prior WHO request is unknown/outstanding. Positive officer proof stays held; use native UI.");return false end
  if state.pending then
    if time()-state.pending.requestedAt>15 then Invalidate("WHO outcome unknown; no automatic retry",true) end
    Say("A WHO control is already pending/unknown; no second request.");return false
  end
  if state.lastWho and time()-state.lastWho<6 then Say("WHO is rate limited: wait at least six seconds before another hardware request.");return false end
  if not UnitIdentity(w.fullName,w.guid) then Say("The original remote whisper GUID/full name is unavailable or stale. Unknown stays held.");return false end
  if w.fullName:find('["\\]') then Say("Unsupported native name for an exact WHO query; held.");return false end
  local before=Snapshot();if not before then Say("WHO fields are unreadable; no request or invite.");return false end
  if before.rows[w.fullName] and before.rows[w.fullName].fullGuildName=="" then Say("An identical positive WHO row is already cached. It cannot prove a new server response; held.");return false end
  local seq=Int(s.sequence,0,999999999) and s.sequence+1 or 1;s.sequence=seq
  local request={whisper=w,before=before.digest,requestedAt=time(),revision=state.revision,storedRevision=s.whoRevision or 0,
    proofId=H.hmacSha256hex(cfg.secret,"officer-who-control|233|"..w.guid.."|"..w.code.."|"..time().."|"..seq):sub(1,32)}
  state.pending=request;state.sending=true;state.ownHook=false;state.lastWho=time()
  local uiOK=pcall(c.SetWhoToUi,true)
  local okay=uiOK and pcall(c.SendWho,'n-"'..w.fullName..'"',Enum and Enum.SocialWhoOrigin and Enum.SocialWhoOrigin.Chat)
  state.sending=false
  if not okay or state.pending~=request or not state.ownHook or request.blocked then
    state.pending=nil
    if request.blocked then state.disabled=true;state.reason="WHO API blocked; use normal native UI, no bypass"
    else Invalidate("WHO send outcome unknown; no positive proof or automatic retry",true) end
    Say(state.reason);return false
  end
  request.sent=true;Say("One WHO requested for the original remote whisperer. Only a changed exact guild-empty response can become proof.");return true
end
local function OnWho()
  local request=state.pending
  if not request then return end
  state.pending=nil -- the first event spends this control, including malformed, duplicate or ambiguous results
  local w,s=request.whisper,Store()
  if state.sending or not request.sent or request.blocked or time()<request.requestedAt or time()-request.requestedAt>15
    or state.revision~=request.revision or not s or (s.whoRevision or 0)~=request.storedRevision
    or state.unknownOutstanding or s.unknownWhoOutstanding or not HooksCurrent() or not ScopeCurrent(w) or not UnitIdentity(w.fullName,w.guid) then state.reason="WHO correlation/unit changed; proof held";return end
  local after=Snapshot();local hit=after and after.rows[w.fullName]
  if not after or after.digest==request.before or not hit or hit.fullGuildName~="" or not UnitIdentity(w.fullName,w.guid) or not ScopeCurrent(w) then state.reason="WHO has no new explicit unguilded fact for this original remote whisperer; held";return end
  local p={version=242,proofId=request.proofId,fullName=w.fullName,unitGuid=w.guid,unitFullName=w.fullName,whisperAt=w.whisperAt,
    requestedAt=request.requestedAt,observedAt=time(),scopeHash=w.scopeHash,guildState="unguilded",source="native-who-whisper-v242",before=request.before,after=after.digest}
  local body={character=w.fullName,code=w.code,guid=w.guid,source="whisper",nativeInvite=p};p.mac=MAC(body)
  local row={body=body,revision=s.whoRevision or 0,guild=w.guild,realm=w.realm,officerGuid=w.officerGuid};s.proofs[p.proofId]=row;state.proofs[p.proofId]=row
  if type(API.RecordOfficerInvite233)=="function" then API.RecordOfficerInvite233(body) end
  if OlympusVerifyAutoSync then OlympusVerifyAutoSync.Request("whisper") end
  state.reason="positive WHO/unit proof captured; Scan + reload exports, then wait for Watcher and Sync again to load the dated queue within 60 seconds"
  Say(state.reason..". Discord Knight standing is still checked by the Worker; no invite or role sent.")
end
function O.IsOriginalProof(body)
  for _,row in pairs(state.proofs) do if row.body==body and ValidStored(row) then return true end end
  return false
end
function O.HardwareInvite(row)
  if type(row)~="table" or type(row.proofId)~="string" or not Int(row.queueId,1,2147483647) or not Int(row.observedAt,1,2147483647) or not Int(row.expiresAt,row.observedAt+1,row.observedAt+60) then Say("Malformed officer approval; no invite.");return false end
  local s=Store();local original=s and row and s.proofs[row.proofId];local b=original and ValidStored(original);local identity=Identity()
  if not s or not row or not b or Preview() or not state.active or Read(InCombatLockdown)~=false or Read(CanGuildInvite)~=true or not HooksCurrent()
    or state.unknownOutstanding or s.unknownWhoOutstanding or original.revision~=(s.whoRevision or 0) then Say("Current officer/WHO proof is unknown or held. No invite offered.");return false end
  local p=b.nativeInvite;local q=OlympusLaunch229 and OlympusLaunch229.Current()
  local selected=false
  if q and type(q.invites)=="table" then for _,approved in ipairs(q.invites) do if approved==row then selected=true;break end end end
  if not q or not selected or q.actionHeld or not q.freshness[row.guid] or time()>=q.freshness[row.guid].expiresAt or time()>=q.freshness[row.guid].scanExpiresAt
    or row.guid~=b.guid or row.fullName~=p.fullName or row.scopeHash~=p.scopeHash or row.observedAt~=p.observedAt or row.expiresAt>p.observedAt+60 or time()>=row.expiresAt
    or row.reason~="knight-unguilded" or row.source~="native-who-whisper-v242" or not Int(row.queueId,1,2147483647) then Say("Dated Worker approval is stale or mismatched; no invite.");return false end
  if s.attempts[tostring(row.queueId)] then Say("This queue ID already has a native attempt/unknown outcome. No retry or refresh reset.");return false end
  local snapshot=Snapshot();local hit=snapshot and snapshot.rows[p.fullName]
  local unit=UnitIdentity(p.fullName,b.guid);local final=Identity()
  if not snapshot or snapshot.digest~=p.after or not hit or hit.fullGuildName~="" or not unit
    or not identity or not final or final.scopeHash~=p.scopeHash or final.guild~=identity.guild or final.realm~=identity.realm or final.guid~=identity.guid then Say("Explicit current WHO/unit identity is unavailable. Unknown stays held.");return false end
  local c=type(C_GuildInfo)=="table" and C_GuildInfo or {};local fn=type(c.Invite)=="function" and c.Invite or GuildInvite
  if type(fn)~="function" then Say("This eligible target needs the normal native guild Invite action; addon API unsupported.");return false end
  local count=0;for _ in pairs(s.attempts) do count=count+1 end;if count>=1000 then Say("Native attempt custody is full. Review old outcomes; none were evicted.");return false end
  -- SavedVariables MEMORY assignment before the call. Normal reload persists it.
  -- WoW offers no pre-dispatch disk flush here: crash-before-save is a stated residual, not a durable ACK.
  local attempt={queueId=row.queueId,proofId=row.proofId,guid=row.guid,fullName=row.fullName,scopeHash=row.scopeHash,at=time(),state="requested"}
  s.attempts[tostring(row.queueId)]=attempt;state.inviting=attempt
  local okay=pcall(fn,row.fullName);state.inviting=nil
  if not okay or attempt.blocked then attempt.state="unknown" end
  Say(okay and not attempt.blocked and "One native invite requested. Wait for native confirmation; no role or automatic retry." or "Native invite outcome blocked/unknown. Use normal guild UI to inspect; no retry or bypass.")
  return okay and not attempt.blocked
end
function O.Next(rows)
  if type(rows)=="table" and #rows>0 then
    local s=Store();if not s then return false end
    for _,row in ipairs(rows) do if not s.attempts[tostring(row.queueId)] then return O.HardwareInvite(row) end end
    Say("Every loaded invite already has a native attempt/unknown outcome. Inspect native guild UI; no retries.");return false
  end
  return O.HardwareCheck()
end
function O.Status() return {reason=state.reason,pendingWho=state.pending~=nil,unknown=state.unknownOutstanding==true} end
frame:SetScript("OnEvent",function(_,event,addon)
  if event=="PLAYER_LOGIN" then if state.hooksReady==nil then state.hooksReady=InstallHooks() end;Store()
  elseif event=="PLAYER_ENTERING_WORLD" then state.active=true
  elseif event=="PLAYER_LEAVING_WORLD" then
    state.active=false
    -- A normal UI reload is the transport. Completed observations retain their
    -- original revision/identity/expiry and are rechecked before hardware use.
    -- An unfinished query has no result custody and must remain unknown instead.
    if state.pending then Invalidate("WHO outstanding while leaving the world; outcome unknown",true)
    else state.reason="world left; completed proof needs current identity/unit recheck" end
  elseif event=="WHO_LIST_UPDATE" then OnWho()
  elseif event=="ADDON_ACTION_BLOCKED" or event=="ADDON_ACTION_FORBIDDEN" then
    if addon==ADDON then if state.pending then state.pending.blocked=true end;if state.inviting then state.inviting.blocked=true;state.inviting.state="unknown" end end
  elseif event=="PLAYER_GUILD_UPDATE" and addon=="player" then Invalidate("own guild changed; proof held",false)
  end
end)
for _,event in ipairs({"PLAYER_LOGIN","PLAYER_ENTERING_WORLD","PLAYER_LEAVING_WORLD","WHO_LIST_UPDATE","PLAYER_GUILD_UPDATE","ADDON_ACTION_BLOCKED","ADDON_ACTION_FORBIDDEN"}) do pcall(frame.RegisterEvent,frame,event) end
O.frame=frame
