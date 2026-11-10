"""Durable addon observations; unknown verification effects are never automatically retried."""
from __future__ import annotations
import hashlib
import hmac
import json
import time
import re
import codes
import savedvars
PATH = "/ingest/intake242"

def collect(watcher):
    state = watcher.state.d.get("intake242", {})
    for name in ("OlympusVerify.lua", "Olympus.lua", "OlympusRecord.lua", "OlympusRecordDB.lua"):
        path = watcher.sv_file.with_name(name)
        if not path.is_file():
            continue
        try:
            before = path.stat()
            data = savedvars.parse_file(str(path))
            after = path.stat()
            if (before.st_size, before.st_mtime_ns) != (after.st_size, after.st_mtime_ns):
                continue
        except (OSError, ValueError, TypeError):
            continue
        for dbname in ("OlympusVerifyDB", "OlympusDB", "OlympusRecordDB"):
            db = data.get(dbname)
            if not isinstance(db, dict):
                continue
            intake = db.get("intake242")
            for rows in (intake.get("entries") if isinstance(intake, dict) else None, db.get("pendingRoleUpdates")):
                values = list(rows.values()) if isinstance(rows, dict) else rows if isinstance(rows, list) else []
                for entry in values:
                    if not isinstance(entry, dict):
                        continue
                    eid = entry.get("id")
                    if not isinstance(eid, str) or re.fullmatch(r"[A-Za-z0-9:._-]{1,128}", eid) is None:
                        continue
                    body = {k:v for k,v in entry.items() if k not in ("status", "acknowledgedAt", "outcome", "attempts", "serverReceipt")}
                    digest = hashlib.sha256(json.dumps(body, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()
                    original = state.get(eid)
                    if original is None:
                        watcher.state.d["intake242"] = state
                        state[eid] = {"body":body,"sha256":digest,"state":"pending","attempted":False}
                    elif original.get("sha256") != digest:
                        original["sourceConflict"] = True
    if "intake242" in watcher.state.d:
        watcher.state.save()
    return state

def drain(watcher, collect_inputs=True):
    state = collect(watcher) if collect_inputs else watcher.state.d.get("intake242", {})
    if watcher.worker.paused() or watcher._custody_halted:
        return
    batch = []
    for original in state.values():
        if original.get("sourceConflict") or original.get("state") != "pending":
            continue
        if original["body"].get("type") == "verify" and original.get("attempted"):
            original["state"] = "outcome_unknown"
            continue
        batch.append(original)
        if len(batch) == 25:
            break
    if not batch:
        return
    for original in batch:
        original["attempted"] = True
    watcher.state.save()
    okay, response = watcher.worker.call("POST", PATH, {"entries":[r["body"] for r in batch]}, retries=1)
    if not okay or not isinstance(response, dict) or response.get("version") != 242:
        return
    deferred = response.get("deferred")
    selected = {r["body"]["id"]:r for r in batch}
    for receipt in deferred if isinstance(deferred, list) else []:
        if isinstance(receipt, dict) and receipt.get("originalNoEffect") is True and receipt.get("outcome") in ("membership_source_pending", "approved_branch_authority_pending"):
            original = selected.get(receipt.get("id"))
            if original and original["body"].get("type") == "verify":
                original["attempted"] = False  # explicit original server pre-effect refusal, never an unknown result
                original["lastOutcome"] = receipt["outcome"]
    receipts = response.get("acknowledgements")
    if not isinstance(receipts, list):
        return
    selected = {r["body"]["id"]:r for r in batch}
    for receipt in receipts:
        if not isinstance(receipt, dict) or receipt.get("status") not in ("done", "rejected"):
            continue
        original = selected.get(receipt.get("id"))
        if original is None or receipt.get("character") != original["body"].get("character", original["body"].get("name")):
            continue
        original["state"] = receipt["status"]
        original["receipt"] = {k:receipt.get(k, "") for k in ("id","status","character","guid","discordRole","outcome")}
        original["acknowledgedAt"] = int(time.time())
    watcher.state.save()

def receipts(watcher):
    at = int(time.time())
    result = []
    for original in watcher.state.d.get("intake242", {}).values():
        if original.get("state") not in ("done", "rejected") or not isinstance(original.get("receipt"), dict):
            continue
        receipt = dict(original["receipt"])
        observed = int(original.get("acknowledgedAt") or 0)
        if observed + 86400 <= at:
            continue
        receipt.update(observedAt=observed, expiresAt=observed+86400)
        message = "|".join(str(x) for x in ("intake242",receipt["id"],receipt["status"],receipt.get("guid") or "",codes.normalize_character(receipt["character"]),receipt.get("discordRole") or "",observed,observed+86400))
        receipt["mac"] = hmac.new(watcher.secret.encode(),message.encode(),hashlib.sha256).hexdigest()[:32]
        result.append(receipt)
    return result

def handles_verify(watcher, name, code):
    return any(r.get("body", {}).get("type") == "verify" and codes.normalize_character(str(r["body"].get("character") or r["body"].get("name") or "")) == codes.normalize_character(name) and r["body"].get("code") == code for r in watcher.state.d.get("intake242", {}).values())

def verification_results(watcher, response):
    rows = response.get("verificationResults") if isinstance(response, dict) else None
    result = []
    at = int(time.time())
    for r in rows if isinstance(rows, list) else []:
        if not isinstance(r, dict) or not codes.is_guid(r.get("guid")) or not isinstance(r.get("character"), str) or r.get("status") not in ("verified", "pending-role"):
            continue
        observed, expires = r.get("observedAt"), r.get("expiresAt")
        if type(observed) is not int or type(expires) is not int or not observed <= at+5 or not at < expires <= observed+300:
            continue
        row = {k:r.get(k) or "" for k in ("guid","character","status","discordRole","observedAt","expiresAt")}
        message = "|".join(str(x) for x in ("verification242",row["guid"],codes.normalize_character(row["character"]),row["status"],row["discordRole"],observed,expires))
        row["mac"] = hmac.new(watcher.secret.encode(),message.encode(),hashlib.sha256).hexdigest()[:32]
        result.append(row)
    return result
