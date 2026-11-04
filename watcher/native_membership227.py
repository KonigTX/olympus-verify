"""Code/GUID/current-own-membership binding from the trusted officer addon."""
from __future__ import annotations

import hashlib
import hmac
import re
from typing import Any

import codes

NOTE = re.compile(r"^Olympus: member (?P<character>[^()|\[\]\r\n]{2,96}?) (?P<guid>Player-[0-9]{1,6}-[0-9A-Fa-f]{4,16}) (?P<code>[A-Z0-9]{6,7}) (?P<member>[01]) (?P<observedAt>[0-9]{9,11}) (?P<scopeHash>[0-9a-f]{16}) \(ref OLVm-(?P<mac>[0-9a-f]{32})\)$")


def membership_mac(secret: str, character: str, guid: str, code: str, proof: dict[str, Any]) -> str:
    payload = '|'.join(['membership', '1', codes.normalize_character(character), guid, code, '1' if proof['member'] else '0', str(proof['observedAt']), proof['scopeHash']])
    return hmac.new(secret.encode('utf-8'), payload.encode('utf-8'), hashlib.sha256).hexdigest()[:32]


def validate_membership(secret: str, character: str, guid: Any, code: str, proof: Any, at: int) -> dict[str, Any] | None:
    if not isinstance(proof, dict) or set(proof) != {'version', 'member', 'observedAt', 'scopeHash', 'mac'}:
        return None
    if type(proof['version']) is not int or proof['version'] != 1 or type(proof['member']) is not bool or type(proof['observedAt']) is not int:
        return None
    if not isinstance(guid, str) or not re.fullmatch(r'Player-[0-9]{1,6}-[0-9A-Fa-f]{4,16}', guid) or codes.strict_code(code) != code:
        return None
    if not at - 600 < proof['observedAt'] <= at + 5:
        return None
    if not isinstance(proof['scopeHash'], str) or not re.fullmatch(r'[0-9a-f]{16}', proof['scopeHash']) or not isinstance(proof['mac'], str) or not re.fullmatch(r'[0-9a-f]{32}', proof['mac']):
        return None
    if not hmac.compare_digest(proof['mac'], membership_mac(secret, character, guid, code, proof)):
        return None
    return dict(proof)


def parse_membership_note(text: str) -> dict[str, Any] | None:
    match = NOTE.fullmatch(text)
    if not match:
        return None
    row = match.groupdict()
    return {'character': row['character'], 'guid': row['guid'], 'code': row['code'], 'nativeMembership': {'version': 1, 'member': row['member'] == '1', 'observedAt': int(row['observedAt']), 'scopeHash': row['scopeHash'], 'mac': row['mac']}}
