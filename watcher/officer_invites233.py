"""Bounded authenticated WHO/unit evidence. No network, native calls or persisted-code output."""
from __future__ import annotations
import copy
import hashlib
import hmac
import re
from typing import Any
import codes

PROTOCOL = "officer-operations-v233"
PATH = "/ingest/officer-invite?keyVersion=" + PROTOCOL
SOURCE = "native-who-unit-v233"
TTL = 60
_GUID = re.compile(r"Player-[0-9]{1,6}-[0-9A-Fa-f]{4,16}")
_HEX32 = re.compile(r"[0-9a-f]{32}")
_HEX64 = re.compile(r"[0-9a-f]{64}")
_FIELDS = {"version", "proofId", "fullName", "unitGuid", "unitFullName", "whisperAt", "requestedAt", "observedAt", "scopeHash", "guildState", "source", "before", "after", "mac"}
HELD_REASONS = {"native-scope-unavailable", "native-proof-invalid", "native-scope-mismatch", "verification-code-invalid", "original-request-unavailable", "blocking-policy-unavailable", "discord-standing-unknown", "knight-standing-required", "blocking-role-held", "native-source-expired", "queue-or-current-policy-held", "source-or-policy-held", "native-roster-required"}

def _text(value: Any) -> bool:
    return (isinstance(value, str) and bool(value) and value == value.strip() and len(value.encode("utf-8", errors="surrogatepass")) <= 100
            and re.search(r"[\x00-\x1f\x7f|\ud800-\udfff]", value) is None)

def proof_mac(secret: str, body: dict[str, Any]) -> str:
    p = body["nativeInvite"]
    fields = ["invite", "233", codes.normalize_character(body["character"]), body["guid"], body["code"], p["fullName"],
              p["whisperAt"], p["requestedAt"], p["observedAt"], p["scopeHash"], p["proofId"], p["guildState"], p["source"],
              p["before"], p["after"], p["unitGuid"], p["unitFullName"]]
    return hmac.new(secret.encode(), "|".join(str(x) for x in fields).encode(), hashlib.sha256).hexdigest()[:32]

def validate(secret: str, body: Any, at: int) -> dict[str, Any] | None:
    if not isinstance(body, dict) or set(body) != {"character", "code", "guid", "source", "nativeInvite"}:
        return None
    name, code, guid, p = body["character"], body["code"], body["guid"], body["nativeInvite"]
    if (not _text(name) or not isinstance(code, str) or codes.strict_code(code) != code or not codes.code_kind(secret, name, code)
            or not isinstance(guid, str) or _GUID.fullmatch(guid) is None or body["source"] != "whisper"
            or not isinstance(p, dict) or set(p) != _FIELDS):
        return None
    if (type(p["version"]) is not int or p["version"] != 233 or not isinstance(p["proofId"], str) or _HEX32.fullmatch(p["proofId"]) is None
            or not _text(p["fullName"]) or p["fullName"] != p["unitFullName"] or p["unitGuid"] != guid
            or codes.normalize_character(p["fullName"]) != codes.normalize_character(name)
            or p["guildState"] != "unguilded" or p["source"] != SOURCE
            or any(type(p[k]) is not int or p[k] < 1 for k in ("whisperAt", "requestedAt", "observedAt"))
            or not p["whisperAt"] <= p["requestedAt"] <= p["observedAt"] <= p["requestedAt"] + 15
            or p["observedAt"] - p["whisperAt"] >= 600 or not at - TTL < p["observedAt"] <= at + 5
            or not isinstance(p["scopeHash"], str) or re.fullmatch(r"[0-9a-f]{16}", p["scopeHash"]) is None
            or any(not isinstance(p[k], str) or _HEX64.fullmatch(p[k]) is None for k in ("before", "after")) or p["before"] == p["after"]
            or not isinstance(p["mac"], str) or _HEX32.fullmatch(p["mac"]) is None):
        return None
    return copy.deepcopy(body) if hmac.compare_digest(proof_mac(secret, body), p["mac"]) else None

def receipt(body: dict[str, Any], result: Any) -> bool:
    if (not isinstance(result, dict) or result.get("protocol") != PROTOCOL or result.get("proofId") != body["nativeInvite"]["proofId"]
            or result.get("roleGranted") is not False or result.get("pendingConsumed") is not False):
        return False
    if result.get("result") == "held":
        return result.get("inviteQueued") is False and result.get("reason") in HELD_REASONS
    p = body["nativeInvite"]
    return (result.get("result") == "queued" and result.get("reason") == "knight-unguilded" and result.get("inviteQueued") is True
            and type(result.get("queueId")) is int and result["queueId"] > 0
            and type(result.get("expiresAt")) is int and p["observedAt"] < result["expiresAt"] <= p["observedAt"] + TTL)
