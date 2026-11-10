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
SOURCE_VERSION = "0.6.25"

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
                    # Source taint is custody metadata, not a change to the
                    # original body or authority to mint/upgrade a native MAC.
                    # The Worker still validates every original proof itself.
                    metadata = intake.get("bridgeMetadata") if isinstance(intake, dict) else None
                    mirrored = metadata.get(eid) if isinstance(metadata, dict) else None
                    if dbname in ("OlympusDB", "OlympusRecordDB") or isinstance(mirrored, dict) and mirrored.get("untrusted") is True:
                        record = state[eid]
                        record["bridgeUntrusted"] = True
                        origins = record.setdefault("untrustedSources", [])
                        origin = str(mirrored.get("origin") or dbname) if isinstance(mirrored, dict) else dbname
                        if origin not in origins:
                            origins.append(origin)
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
        if receipt.get("guid") is None:
            receipt["guid"] = ""
        observed = int(original.get("acknowledgedAt") or 0)
        if observed <= 0 or observed > at + 5:
            continue
        # Renew delivery validity only. A stored terminal ACK is not a new
        # verification, POST or claim, and its original timestamp never moves.
        window = max(0, (at - observed) // 86340)
        expires = observed + window * 86340 + 86400
        receipt.update(observedAt=observed, expiresAt=expires)
        message = "|".join(str(x) for x in ("intake242",receipt["id"],receipt["status"],receipt.get("guid") or "",codes.normalize_character(receipt["character"]),receipt.get("discordRole") or "",observed,expires))
        receipt["mac"] = hmac.new(watcher.secret.encode(),message.encode(),hashlib.sha256).hexdigest()[:32]
        result.append(receipt)
    return result

def handles_verify(watcher, name, code, event=None):
    """Suppress only the same serialized observation, never all uses of a code.

    An old rejected/spent/unknown row remains immutable. A fresh native whisper
    has its own observation ID and original proof; this does not reset a claim.
    Older addon rows may match only their exact GUID/proof/time observation.
    """
    if not isinstance(event, dict):
        return False
    observed_name = event.get("target") or name
    for original in watcher.state.d.get("intake242", {}).values():
        body = original.get("body", {})
        if (body.get("type") != "verify" or body.get("source") != event.get("type")
                or codes.normalize_character(str(body.get("character") or body.get("name") or "")) != codes.normalize_character(observed_name)
                or body.get("code") != code):
            continue
        observation = event.get("observationId")
        if observation is not None:
            if isinstance(observation, str) and re.fullmatch(r"[0-9a-f]{32}", observation) and body.get("observationId") == observation:
                return True
            continue
        # Equality can identify the same old missing-proof observation too; it
        # never turns an absent/invalid proof into membership authority.
        if (not body.get("observationId") and type(event.get("ts")) is int and event["ts"] > 0
                and body.get("guid") == event.get("guid")
                and body.get("nativeMembership") == event.get("nativeMembership") and body.get("observedAt") == event["ts"]):
            return True
    return False

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
