-- POST-DEPLOY .242 checks. Authored before deployment; do not treat syntax
-- compilation as execution or native mailbox/trade/Discord acceptance.
local passed, failed = 0, 0
local function check(label, value)
  if value then passed=passed+1;print("PASS "..label) else failed=failed+1;print("FAIL "..label) end
end
local function fixture()
  local e=setmetatable({},{__index=_G});e._G=e
  setfenv(assert(loadfile("wow_mock.lua")),e)()
  local x={e=e,inbox={},wallet=10000,bags={},takes=0,deletes=0,frames={},requests=0}
  local original=e.CreateFrame
  e.CreateFrame=function(...) local f=original(...);x.frames[#x.frames+1]=f;return f end
  e.NOW=1794312000;e.time=function() return e.NOW end
  e.OlympusVerifyConfig={secret="synthetic-live242-officer-key-not-production"}
  e.OlympusVerifyDB={boots=1};e.OlympusDB={pendingRoleUpdates={}}
  e.GetGuildInfo=function() return "OLYMPUS PRIME","Officer",1 end
  e.GetRealmName=function() return "Native Realm" end;e.IsInGuild=function() return true end
  e.UnitGUID=function(unit) return unit=="player" and "Player-1-1234ABCD" or "Player-1-9999ABCD" end
  e.GetUnitName=function(unit) return unit=="player" and "Fern Melder" or "Trade Donor" end
  e.GetMoney=function() return x.wallet end;e.GetItemCount=function(id) return x.bags[id] or 0 end
  e.C_Timer={After=function() end,NewTicker=function(_,fn) x.pump=fn;return {} end}
  e.C_ChatInfo={RegisterAddonMessagePrefix=function() end,SendAddonMessage=function(...) x.lastAddon={...} end}
  e.hooksecurefunc=function() end;e.CHAT_FRAMES={};e.ChatFrame_AddMessageEventFilter=function() end
  e.GetInboxNumItems=function() return #x.inbox,#x.inbox end
  e.GetInboxHeaderInfo=function(i)
    local m=x.inbox[i];if m then return nil,nil,m.sender,m.subject,m.money or 0,m.cod or 0,30,#(m.items or {}),false,false end
  end
  e.GetInboxText=function(i) return x.inbox[i] and x.inbox[i].body end
  e.GetInboxItem=function(i,s) local m=x.inbox[i] and x.inbox[i].items and x.inbox[i].items[s];if m then return m.name,m.id,nil,m.count end end
  e.GetInboxItemLink=function(i,s) local m=x.inbox[i] and x.inbox[i].items and x.inbox[i].items[s];return m and "item:"..m.id end
  e.TakeInboxMoney=function() x.takes=x.takes+1 end;e.AutoLootMailItem=e.TakeInboxMoney
  e.DeleteInboxItem=function(i) x.deletes=x.deletes+1;table.remove(x.inbox,i) end
  e.GetTargetTradeMoney=function() return x.incoming or 0 end;e.GetPlayerTradeMoney=function() return 0 end
  e.GetTradeTargetItemInfo=function() end;e.GetTradeTargetItemLink=function() end
  e.OlympusVerifyAutoSync={Request=function() x.requests=x.requests+1 end}
  e.OlympusLaunch229={Current=function() end}
  e.OlympusVerifyAPI={TreasuryTransport={Name=function() return "Fern Melder" end},CaptureMailCode242=function(sender,code)
    e.OlympusVerifyLive242.CaptureVerification("mail",sender,code,nil,nil,true)
  end}
  setfenv(assert(loadfile("../OlympusVerify/Libs/OlympusHmac.lua")),e)("OlympusVerify")
  setfenv(assert(loadfile("../OlympusVerify/OlympusVerifyLive242.lua")),e)("OlympusVerify")
  x.v=e.OlympusVerifyLive242;x.frame=x.frames[1]
  x.event=function(event,...) x.frame:GetScript("OnEvent")(x.frame,event,...) end
  x.rows=function() return e.OlympusVerifyDB.intake242.entries end
  x.ack=function(row,status)
    local r={id=row.id,character=row.character,guid=row.guid or "",status=status or "done",observedAt=e.NOW,expiresAt=e.NOW+300}
    local h=e.OlympusHmac
    r.mac=h.hmacSha256hex(e.OlympusVerifyConfig.secret,table.concat({"intake242",r.id,r.status,r.guid or "",h.normalizeCharacter(r.character),"",r.observedAt,r.expiresAt},"|")):sub(1,32)
    e.OlympusQueue={intakeReceipts242={r}};return r
  end
  x.event("PLAYER_LOGIN");return x
end
do
  local x=fixture();check("login does not loot or delete mail",x.takes==0 and x.deletes==0)
  local observation=x.v.NewVerificationObservation("whisper","First Member","Player-1-12345678",100)
  local first=x.v.CaptureVerification("whisper","First Member","ABC123","Player-1-12345678",nil,false,observation)
  check("native capture gets a stable persistent ID",#first.id==32 and first.status=="pending")
  check("repeated original observation is idempotent",x.v.CaptureVerification("whisper","First Member","ABC123","Player-1-12345678",nil,false,observation)==first)
  for i=1,1200 do x.v.Queue({type="verify",character="Member "..i,code="ABC123"},"bulk|"..i) end
  x.e.NOW=x.e.NOW+100*86400;x.v.Flush("logout")
  local count=0;for _ in pairs(x.rows()) do count=count+1 end
  check("1200 pending requests survive age and local batch limits",count==1201 and first.status=="pending")
  check("bulk intake coalesces expensive sync alerts",x.requests<=3)
  local r=x.ack(first);r.mac="wrong";x.v.Flush("sync")
  check("unsigned ACK cannot mark pending done",first.status=="pending")
  x.ack(first);x.v.Flush("sync");check("valid original server ACK marks delivery done",first.status=="done")
  check("delivery ACK alone never claims verified Discord role",not x.v.VerificationReply(first.character,first.guid):find("already verified",1,true))
end
do
  local x=fixture()
  local observed=x.v.NewVerificationObservation("whisper","Fresh Member","Player-1-12345678",200)
  local first=x.v.CaptureVerification("whisper","Fresh Member","ABC123","Player-1-12345678",nil,false,observed)
  first.status="rejected";x.e.NOW=x.e.NOW+601
  local duplicate=x.v.NewVerificationObservation("whisper","Fresh Member","Player-1-12345678",200)
  check("same native line keeps original ID and observation time",duplicate.id==observed.id and duplicate.observedAt==observed.observedAt)
  check("duplicate spent observation never resets its rejected row",x.v.CaptureVerification("whisper","Fresh Member","ABC123","Player-1-12345678",nil,false,duplicate)==first and first.status=="rejected")
  local fresh=x.v.NewVerificationObservation("whisper","Fresh Member","Player-1-12345678",201)
  local proof={version=1,member=true,observedAt=x.e.NOW,scopeHash="synthetic",mac="original-native-proof"}
  local next=x.v.CaptureVerification("whisper","Fresh Member","ABC123","Player-1-12345678",proof,true,fresh)
  check("fresh real observation has its own pending row and original proof",next.id~=first.id and next.observationId==fresh.id and next.observedAt==x.e.NOW and next.nativeMembership==proof and first.status=="rejected")
  local a=x.v.NewVerificationObservation("whisper","Fresh Member","Player-1-12345678")
  local b=x.v.NewVerificationObservation("whisper","Fresh Member","Player-1-12345678")
  check("missing native line ID uses distinct durable observation sequences",a.id~=b.id)
end
do
  local x=fixture();local row=x.v.Queue({type="donation",character="No Guid Donor",source="mail",donation={copper=500}},"guidless")
  local receipt=x.ack(row);check("Watcher-compatible donation receipt represents absent GUID as empty",receipt.guid=="")
  receipt.mac="wrong";x.v.Flush("sync");check("GUID-less receipt still requires the original MAC",row.status=="pending")
  x.ack(row);x.v.Flush("sync");check("signed empty-GUID donation ACK closes only its original row",row.status=="done" and row.serverReceipt.guid=="")
  local bound=x.v.Queue({type="verify",character="Bound Member",guid="Player-1-11112222",code="ABC123"},"bound")
  local r=x.ack(bound);r.guid="";local h=x.e.OlympusHmac
  r.mac=h.hmacSha256hex(x.e.OlympusVerifyConfig.secret,table.concat({"intake242",r.id,r.status,"",h.normalizeCharacter(r.character),"",r.observedAt,r.expiresAt},"|")):sub(1,32)
  x.v.Flush("sync");check("GUID-less ACK cannot discharge a GUID-bound original",bound.status=="pending")
end
do
  local x=fixture();local id=string.rep("a",32)
  local original={id=id,type="donation",character="Record Donor",source="original-record-source",requestedAt=x.e.NOW,donation={copper=123}}
  x.e.OlympusRecordDB={pendingRoleUpdates={[id]=original}}
  x.v.Flush("sync");local mirrored=x.rows()[id]
  check("record mirror preserves canonical source and original body fields",mirrored and mirrored.source==original.source and mirrored.clientVersion==nil and mirrored.requestedBy==nil and mirrored.bridgeUntrusted==nil and mirrored.donation.copper==123)
  local metadata=x.e.OlympusVerifyDB.intake242.bridgeMetadata[id]
  check("record mirror keeps explicit UNTRUSTED taint outside canonical body",metadata and metadata.untrusted==true and metadata.automaticAuthority==false)
end
do
  local x=fixture();local h=x.e.OlympusHmac
  local r={guid="Player-1-1111AAAA",character="Known Member",status="verified",discordRole="Veteran",observedAt=x.e.NOW,expiresAt=x.e.NOW+300}
  r.mac=h.hmacSha256hex(x.e.OlympusVerifyConfig.secret,table.concat({"verification242",r.guid,h.normalizeCharacter(r.character),r.status,r.discordRole,r.observedAt,r.expiresAt},"|")):sub(1,32)
  x.e.OlympusQueue={verificationResults242={r}}
  check("fresh signed current status replies already verified with role",x.v.VerificationReply(r.character,r.guid):find("already verified. Discord role: Veteran",1,true)~=nil)
  x.e.NOW=x.e.NOW+301
  check("expired server status does not renew from a reply",not x.v.VerificationReply(r.character,r.guid):find("already verified",1,true))
end
do
  local x=fixture();local h=x.e.OlympusHmac
  local code=h.codeFor(x.e.OlympusVerifyConfig.secret,"Mail Sender",h.utcDay(x.e.NOW))
  x.inbox={{sender="Mail Sender",subject="Greetings",body="A longer message before !verify "..code.." and after.",money=0,items={}}}
  x.event("MAIL_SHOW")
  local row;for _,r in pairs(x.rows()) do if r.type=="verify" then row=r end end
  check("mail extracts a code embedded in a longer message",row and row.code==code)
  check("mail never invents a sender GUID",row and row.guid==nil and row.guidSource=="unavailable")
  check("native mail observation preserves signed sender proof",row and row.mailProof242 and #row.mailProof242.mac==32)
  check("empty code mail waits for durable server receipt",x.deletes==0)
  x.ack(row);x.event("MAIL_INBOX_UPDATE")
  check("empty code mail deletes only after server durable acknowledgement",x.deletes==1)
end
do
  local x=fixture();local h=x.e.OlympusHmac
  local code=h.codeFor(x.e.OlympusVerifyConfig.secret,"Value Sender",h.utcDay(x.e.NOW))
  x.inbox={{sender="Value Sender",subject="!verify "..code,body="Donation",money=500,items={}}}
  x.event("MAIL_SHOW");check("valid value mail requests native collection",x.takes==1)
  local verify;for _,r in pairs(x.rows()) do if r.type=="verify" then verify=r end end
  x.ack(verify);x.inbox[1].money=0;x.event("MAIL_INBOX_UPDATE")
  check("empty header without wallet delta cannot become a donation or deletion",x.deletes==0)
  x.wallet=x.wallet+500;x.event("PLAYER_MONEY")
  local donation;for _,r in pairs(x.rows()) do if r.type=="donation" then donation=r end end
  check("confirmed inbox depletion plus wallet delta records exact value",donation and donation.donation.copper==500)
  x.event("MAIL_INBOX_UPDATE");check("value mail still waits for donation ACK",x.deletes==0)
  x.ack(donation);x.event("MAIL_INBOX_UPDATE");check("confirmed durable value and verification permit deletion",x.deletes==1)
end
do
  local x=fixture();x.incoming=900
  x.event("TRADE_SHOW");x.event("TRADE_ACCEPT_UPDATE",1,1)
  local n=0;for _,r in pairs(x.rows()) do if r.type=="donation" then n=n+1 end end
  check("mutual trade acceptance alone is not a donation",n==0)
  x.event("TRADE_REQUEST_CANCEL");x.event("UI_INFO_MESSAGE",1,"Trade complete.")
  n=0;for _,r in pairs(x.rows()) do if r.type=="donation" then n=n+1 end end
  check("canceled trade is never a completed receipt",n==0)
  x.event("TRADE_SHOW");x.event("TRADE_ACCEPT_UPDATE",1,1);x.wallet=x.wallet+900
  x.event("UI_INFO_MESSAGE",1,"Trade complete.")
  local row;for _,r in pairs(x.rows()) do if r.type=="donation" then row=r end end
  check("native completed trade plus exact wallet delta records a receipt",row and row.donation.copper==900 and row.evidence.confirmedLocal==true)
end
do
  local x=fixture();x.v.Queue({type="role",character="Other Person",requestedBy="Other Person"},"other")
  x.v.Queue({type="verify",character="Fern Melder",requestedBy="Fern Melder"},"self")
  x.e.OlympusVerifyConfig.secret=nil
  check("member-facing status filters other people's requests",#x.v.VisibleEntries()==1)
  x.event("CHAT_MSG_WHISPER","I donated 10g mats","Resource Sender",nil,nil,nil,nil,nil,nil,nil,nil,nil,"Player-1-11223344")
  local row;for _,r in pairs(x.rows()) do if r.source=="whisper-declaration" then row=r end end
  check("resource whisper is an unconfirmed declaration, never credit",row and row.evidence.confirmedLocal==false and row.donation.copper==0)
end
print(string.format("live242: %d passed, %d failed",passed,failed))
if failed>0 then error("live242 post-deploy checks failed") end
