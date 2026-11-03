"""Native whisper membership proof parsing and actual Watcher custody boundaries."""
from __future__ import annotations

from datetime import datetime, timezone
import copy
import io
import json
import sys
import tempfile
import time
import unittest
from unittest.mock import patch
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import codes
import watcher
from native_membership227 import membership_mac, parse_membership_note, validate_membership

SECRET = 'local-native-membership-test-key'
NAME = 'Aelin Stormwarden'
GUID = 'Player-1234-00ABCDEF'


class NativeMembershipTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.at = int(time.time())
        self.code = codes.code_for(SECRET, NAME, codes.day_bucket(datetime.now(timezone.utc)))
        self.w = watcher.Watcher(dict(wow_dir=str(self.root), account='LOCAL_TEST', worker_url='https://test.invalid', watcher_token='test-token', verify_secret=SECRET, officer_character='Fern Melder', membership_only=True, state_file=str(self.root / 'state.json')))
        self.calls = []
        self.w.worker.call = lambda method, path, body=None, retries=3: (self.calls.append((path, body)) or (True, {'result': 'ok'}))

    def tearDown(self):
        self.tmp.cleanup()

    def proof(self, **changes):
        value = dict(version=1, member=True, observedAt=self.at, scopeHash='a' * 16)
        value.update(changes)
        value['mac'] = membership_mac(SECRET, NAME, GUID, self.code, value)
        return value

    def line(self, proof=None, recipient='Fern Melder'):
        proof = self.proof() if proof is None else proof
        return f"11/3 12:00:00.000  To {recipient}: Olympus: member {NAME} {GUID} {self.code} {1 if proof['member'] else 0} {proof['observedAt']} {proof['scopeHash']} (ref OLVm-{proof['mac']})"

    def test_actual_signed_packet_dispatches_once_and_carries_exact_proof(self):
        self.w.handle_chat_line(self.line())
        self.w.handle_chat_line(self.line())
        self.assertEqual(len(self.calls), 1)
        path, body = self.calls[0]
        self.assertEqual(path, '/ingest/verify')
        self.assertEqual(body['guid'], GUID)
        self.assertEqual(body['nativeMembership'], self.proof())
        self.assertTrue(self.w.state.was_seen(self.w.code_key('w', NAME, self.code)))

    def test_bare_whisper_or_legacy_identity_never_fabricates_current_membership(self):
        self.w.handle_chat_line(f'11/3 12:00:00.000  {NAME} whispers: !verify {self.code}')
        self.assertEqual(self.calls, [])
        self.assertFalse(self.w.state.was_seen(self.w.code_key('w', NAME, self.code)))
        self.w.handle_chat_line(self.line())
        self.assertEqual(len(self.calls), 1)

    def test_signed_native_false_is_forwarded_for_explicit_worker_refusal(self):
        self.w.handle_chat_line(self.line(self.proof(member=False)))
        self.assertEqual(len(self.calls), 1)
        self.assertIs(self.calls[0][1]['nativeMembership']['member'], False)

    def test_incoming_spoof_wrong_self_target_and_tampered_mac_do_not_dispatch(self):
        self.w.handle_chat_line(self.line().replace('To Fern Melder:', 'Stranger whispers:'))
        self.w.handle_chat_line(self.line(recipient='Another Collector'))
        proof = self.proof()
        proof['mac'] = '0' * 32
        self.w.handle_chat_line(self.line(proof))
        self.assertEqual(self.calls, [])

    def test_expiry_future_and_strict_boolean_version_shape(self):
        for changes in ({'observedAt': self.at - 600}, {'observedAt': self.at + 6}, {'member': 1}, {'version': True}, {'extra': True}):
            self.assertIsNone(validate_membership(SECRET, NAME, GUID, self.code, self.proof(**changes), self.at), changes)

    def test_each_identity_component_is_mac_bound(self):
        proof = self.proof()
        self.assertIsNone(validate_membership(SECRET, NAME + ' Other', GUID, self.code, proof, self.at))
        self.assertIsNone(validate_membership(SECRET, NAME, 'Player-1234-00ABCDED', self.code, proof, self.at))
        altered = dict(proof, scopeHash='b' * 16)
        self.assertIsNone(validate_membership(SECRET, NAME, GUID, self.code, altered, self.at))

    def test_actual_lua_golden_vector_matches_without_a_game_or_real_key(self):
        proof = dict(version=1, member=True, observedAt=1793720000, scopeHash='a32080270acf8d2f')
        self.assertEqual(membership_mac('synthetic-per-whisper-only', 'Fresh Member-Realm', 'Player-1-ABCDEF12', '8ALCWJ', proof), 'a386604f5049ee4c67b2518c302c1b48')

    def test_savedvariables_fallback_requires_and_preserves_real_proof(self):
        base = dict(type='whisper', name=NAME, ts=self.at, code=self.code, ok=True, guid=GUID)
        self.w.forward_events([base])
        self.assertEqual(self.calls, [])
        self.w.forward_events([{**base, 'nativeMembership': self.proof()}])
        self.assertEqual(len(self.calls), 1)
        self.w.handle_chat_line(self.line())
        self.assertEqual(len(self.calls), 1)

    def test_invalid_mode_cannot_silently_select_legacy(self):
        with self.assertRaisesRegex(ValueError, 'membership_only'):
            watcher.Watcher({**self.w.cfg, 'membership_only': 'true'})

    def test_startup_never_ingests_into_old_or_unqualified_worker(self):
        for response in ({'ok': True, 'build': 'old'}, {'ok': True, 'verification': {'mode': 'legacy', 'nativeScopePinned': True, 'nativeMembershipProofVersion': 1}}, {'ok': True, 'verification': {'mode': 'members-only', 'nativeScopePinned': False, 'nativeMembershipProofVersion': 1}}, {'ok': True, 'verification': {'mode': 'members-only', 'nativeScopePinned': True, 'nativeMembershipProofVersion': True}}):
            calls = []
            self.w.worker.call = lambda method, path, **kwargs: (calls.append((method, path)) or (True, response))
            with self.assertRaises(watcher.LaunchNotReady):
                self.w.require_launch_worker()
            self.assertEqual(calls, [('GET', '/health')])

    def test_current_configured_worker_is_admitted_without_a_game_or_ingest_request(self):
        calls = []
        self.w.worker.call = lambda method, path, **kwargs: (calls.append((method, path)) or (True, {'ok': True, 'verification': {'mode': 'members-only', 'nativeScopePinned': True, 'nativeMembershipProofVersion': 1}}))
        self.w.require_launch_worker()
        self.assertEqual(calls, [('GET', '/health')])

    def test_legacy_startup_has_no_new_network_dependency(self):
        self.w.membership_only = False
        self.w.worker.call = lambda *args, **kwargs: self.fail('Legacy startup changed')
        self.w.require_launch_worker()

    def test_presence_poll_preserves_legacy_queue_and_unknown_acknowledgement(self):
        self.w.queue_file.parent.mkdir(parents=True, exist_ok=True)
        original_file = b'-- retained invitation queue; do not rewrite\r\nOlympusQueue = { entries = {} }\r\n'
        self.w.queue_file.write_bytes(original_file)
        self.w.state.d['queue_written_pending'] = ['retained-id']
        self.w.state.d['queue_written_original'] = {'retained': 'unknown-original'}
        original_state = copy.deepcopy(self.w.state.d)
        self.w.pull_unverified = lambda: self.fail('Membership mode fetched legacy invitation state')
        self.w.render_queue = lambda *args: self.fail('Membership mode rendered an invitation queue')
        self.w.retry_queue_written = lambda: self.fail('Membership mode replayed an old acknowledgement')
        for response in ({'presenceOnly': True, 'entries': []}, {'entries': [{'id': 'must-not-write'}]}, None):
            calls = []
            self.w._last_queue_pull = 0
            self.w.worker.call = lambda method, path, body=None, retries=3: (calls.append((method, path, body, retries)) or (True, response))
            self.w.pull_queue()
            self.assertEqual(len(calls), 1)
            method, path, body, retries = calls[0]
            self.assertEqual(method, 'GET')
            self.assertIn('presenceOnly=1', path)
            self.assertIsNone(body)
            self.assertEqual(retries, 1)
            self.assertEqual(self.w.queue_file.read_bytes(), original_file)
            self.assertEqual(self.w.state.d, original_state)

    def test_strict_transport_binds_backward_refused_protocol_without_changing_original_body(self):
        worker = watcher.Worker('https://test.invalid', 'synthetic-only')
        worker.membership_only = True
        original = {'test': 'unchanged-original'}
        for method, path in [('POST', '/ingest/verify'), ('POST', '/ingest/roster'), ('POST', '/ingest/events'), ('GET', '/queue?presenceOnly=1')]:
            with patch.object(worker.opener, 'open', return_value=io.BytesIO(b'{"result":"ok"}')) as transport:
                okay, _ = worker.call(method, path, original if method == 'POST' else None, retries=1)
            self.assertTrue(okay)
            request = transport.call_args.args[0]
            self.assertEqual(request.full_url, 'https://test.invalid' + path + ('&' if '?' in path else '?') + 'keyVersion=launch-membership-v1')
            self.assertEqual(json.loads(request.data) if request.data else None, original if method == 'POST' else None)
        for membership_only, path in [(False, '/ingest/verify'), (True, '/health')]:
            worker.membership_only = membership_only
            with patch.object(worker.opener, 'open', return_value=io.BytesIO(b'{"result":"ok"}')) as transport:
                worker.call('POST' if path.startswith('/ingest/') else 'GET', path, retries=1)
            self.assertEqual(transport.call_args.args[0].full_url, 'https://test.invalid' + path)


if __name__ == '__main__':
    unittest.main(verbosity=2)
