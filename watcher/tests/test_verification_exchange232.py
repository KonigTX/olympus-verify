"""Actual collector paths over synthetic native files and HTTP; no client/config/network."""
from pathlib import Path
from datetime import datetime, timezone
import copy
import hashlib
import json
import os
import sys
import tempfile
import time
import unittest
from unittest.mock import patch

sys.path.insert(0, os.environ.get('WATCHER_TEST_SOURCE', str(Path(__file__).resolve().parents[1])))
import watcher
import codes
from custody_recovery import StateLease
from native_membership227 import membership_mac

SECRET = 'synthetic-exchange-only'
NAME = 'Fresh Member'
GUID = 'Player-1-ABCDEF12'
GUILD = 'OLYMPUS PRIME'
REALM = 'Synthetic Native Realm'


def lua(value):
    if isinstance(value, dict):
        return '{' + ','.join('[' + json.dumps(k) + ']=' + lua(v) for k, v in value.items()) + '}'
    if isinstance(value, list):
        return '{' + ','.join(lua(v) for v in value) + '}'
    return json.dumps(value)


class VerificationExchangeTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.at = int(time.time())
        self.clock = patch.object(watcher.time, 'time', return_value=self.at)
        self.now = self.clock.start()
        self.cfg = dict(wow_dir=str(self.root), account='SYNTHETIC', worker_url='https://test.invalid',
                        watcher_token='synthetic-token', verify_secret=SECRET, officer_character='Fern Melder',
                        membership_only=True, state_file=str(self.root / 'state.json'))
        self.w = watcher.Watcher(self.cfg)
        self.code = codes.code_for(SECRET, NAME, codes.day_bucket(datetime.now(timezone.utc)))
        self.calls = []
        self.accepted = False
        self.w.worker.call = self.transport

    def tearDown(self):
        self.clock.stop()
        self.tmp.cleanup()

    def transport(self, method, path, body=None, retries=3):
        self.calls.append((method, path, copy.deepcopy(body), retries))
        if path == '/health':
            return True, {'ok': True, 'verification': {'mode': 'members-only', 'nativeScopePinned': True, 'nativeMembershipProofVersion': 1}}
        if path == '/ingest/roster':
            self.accepted = True
            return True, {'snapshot': 7, 'trusted': True, 'members': len(body['members'])}
        if path == '/ingest/verify':
            return True, {'result': 'member' if self.accepted else 'membership_not_confirmed',
                          'roleOutcome': 'granted' if self.accepted else 'held', 'roleGranted': self.accepted,
                          'pendingConsumed': True}
        return True, {'result': 'ok'}

    def roster(self, at=None):
        return dict(exportedAt=self.at if at is None else at, total=2, nativeGuild=GUILD, nativeRealm=REALM,
                    members=[dict(name='Fern Melder', guid='Player-1-00000001', rank='Guild Master', rankIndex=0, level=60),
                             dict(name=NAME, guid=GUID, rank='Member', rankIndex=7, level=60)])

    def proof(self):
        p = dict(version=1, member=True, observedAt=self.at,
                 scopeHash=hashlib.sha256(('native-scope|1|' + GUILD + '|' + REALM).encode()).hexdigest()[:16])
        p['mac'] = membership_mac(SECRET, NAME, GUID, self.code, p)
        return p

    def body(self):
        return dict(character=NAME, guid=GUID, code=self.code, source='whisper', ts=self.at,
                    officer='Fern Melder', nativeMembership=self.proof())

    def line(self):
        p = self.proof()
        return f"11/6 01:00:00.000  To Fern Melder: Olympus: member {NAME} {GUID} {self.code} 1 {p['observedAt']} {p['scopeHash']} (ref OLVm-{p['mac']})"

    def save_native(self, roster=None):
        db = dict(roster=roster or self.roster(), lastCharacterGuid='Player-1-00000001',
                  events=[dict(type='whisper', name=NAME, guid=GUID, code=self.code, ok=True, ts=self.at, nativeMembership=self.proof())])
        self.w.sv_file.parent.mkdir(parents=True, exist_ok=True)
        self.w.sv_file.write_text('OlympusVerifyDB = ' + lua(db), encoding='utf-8')

    def admit(self):
        self.w.forward_roster(self.roster())
        self.assertTrue(self.w.verification_roster_ready(self.body()))
        self.calls.clear()

    def test_savedvariables_admits_roster_before_verification(self):
        # The shipped collector actually sends verify first. This is the fail-before oracle.
        self.w.state.d['roster_sent'] = self.at - 1012
        self.save_native()
        with patch.object(watcher.time, 'sleep'):
            self.w.check_savedvars()
        paths = [c[1] for c in self.calls if c[1] in ('/ingest/roster', '/ingest/verify')]
        self.assertEqual(paths, ['/ingest/roster', '/ingest/verify'])
        self.assertEqual(len([c for c in self.calls if c[1] == '/ingest/verify']), 1)

    def test_legacy_source_order_is_unchanged(self):
        self.w.membership_only = self.w.worker.membership_only = False
        self.save_native()
        with patch.object(watcher.time, 'sleep'):
            self.w.check_savedvars()
        self.assertEqual([c[1] for c in self.calls if c[0] == 'POST'], ['/ingest/verify', '/ingest/roster'])

    def test_missing_ack_defers_without_seen_claim_or_reserved_body(self):
        with self.assertRaises(watcher.VerificationDeferred):
            self.w.handle_chat_line(self.line())
        self.assertFalse(self.w.state.was_seen(self.w.code_key('w', NAME, self.code)))
        self.assertEqual((self.calls, self.w.state.d['outbox']), ([], []))

    def test_actual_ack_allows_exact_proof_once_across_chat_and_saved_events(self):
        self.admit()
        self.w.handle_chat_line(self.line())
        self.w.handle_chat_line(self.line())
        self.w.forward_events([dict(type='whisper', name=NAME, guid=GUID, code=self.code, ok=True, ts=self.at, nativeMembership=self.proof())])
        self.assertEqual(len(self.calls), 1)
        self.assertEqual(self.calls[0][2]['nativeMembership'], self.proof())
        self.assertEqual(self.calls[0][3], 1)

    def test_chat_cursor_retained_until_roster_then_actual_line_dispatches(self):
        self.w.chat_log.parent.mkdir(parents=True, exist_ok=True)
        self.w.chat_log.write_text(self.line() + '\n', encoding='utf-8')
        self.w.state.d['chat_init'] = True
        self.w.tail_chat_log()
        self.assertEqual(self.w.state.d['chat_offset'], 0)
        self.assertEqual(self.calls, [])
        self.admit()
        self.w.tail_chat_log()
        self.assertEqual(len(self.calls), 1)
        self.assertGreater(self.w.state.d['chat_offset'], 0)

    def test_actual_run_stages_native_before_old_outbox_and_chat(self):
        self.save_native()
        self.w.chat_log.parent.mkdir(parents=True, exist_ok=True)
        self.w.chat_log.write_text(self.line() + '\n', encoding='utf-8')
        self.w.state.d['chat_init'] = True
        with patch.object(watcher.time, 'sleep'), patch.object(self.w, 'pull_queue', side_effect=KeyboardInterrupt):
            with self.assertRaises(KeyboardInterrupt):
                self.w.run()
        self.assertEqual([c[1] for c in self.calls if c[0] == 'POST'], ['/ingest/roster', '/ingest/verify'])

    def test_unknown_roster_ack_keeps_source_and_late_original_ack_unblocks(self):
        self.save_native()
        original = self.transport
        self.w.worker.call = lambda method, path, body=None, retries=3: (self.calls.append((method, path, body, retries)) or (False, 'unknown'))
        with patch.object(watcher.time, 'sleep'):
            self.w.check_savedvars()
        self.assertEqual([c[1] for c in self.calls], ['/ingest/roster'])
        self.assertEqual(self.w.state.d['sv_mtime'], 0)
        self.assertFalse(self.w.state.was_seen(self.w.code_key('w', NAME, self.code)))
        self.w.worker.call = original
        self.w.flush_outbox()
        with patch.object(watcher.time, 'sleep'):
            self.w.check_savedvars()
        self.assertEqual(len([c for c in self.calls if c[1] == '/ingest/verify']), 1)

    def test_refused_or_untrusted_roster_never_admits_verification(self):
        for receipt in ({'trusted': False, 'snapshot': 7, 'members': 2},
                        {'trusted': True, 'snapshot': 7, 'members': 2, 'skipped': True},
                        {'trusted': True, 'snapshot': 7, 'members': 1},
                        {'trusted': True, 'snapshot': True, 'members': 2}):
            with self.subTest(receipt=receipt):
                self.w.state.d['roster_sent'] = 0
                self.w.worker.call = lambda *a, **k: (True, receipt)
                self.w.forward_roster(self.roster())
                self.assertFalse(self.w.verification_roster_ready(self.body()))

    def test_attempted_unknown_verify_never_automatically_resends(self):
        self.admit()
        self.w.worker.call = lambda *a, **k: (self.calls.append((a, k)) or (False, 'unknown'))
        self.w.handle_chat_line(self.line())
        original = copy.deepcopy(self.w.state.d['outbox'])
        self.w.flush_outbox()
        self.w.flush_outbox()
        self.assertEqual(len(self.calls), 1)
        self.assertEqual(self.w.state.d['outbox'], original)

    def test_rehydrated_legacy_verify_row_cannot_gain_dispatch_authority(self):
        self.admit()
        item = self.w._freeze_original('/ingest/verify', self.body(), 'synthetic')
        retained = json.loads(json.dumps(item))
        self.w.state.d['outbox'].append(retained)
        self.w.flush_outbox()
        self.assertEqual(self.calls, [])
        self.assertEqual(self.w.state.d['outbox'], [retained])

    def test_new_source_same_second_change_immediately_holds_without_timestamp_invention(self):
        self.admit()
        changed = self.roster()
        changed['members'][1]['rankIndex'] = 8
        self.w.forward_roster(changed)
        self.assertEqual(self.calls, [])
        self.assertFalse(self.w.verification_roster_ready(self.body()))
        with self.assertRaises(watcher.VerificationDeferred):
            self.w.handle_chat_line(self.line())

    def test_stale_ack_or_expired_proof_cannot_be_renewed_by_unchanged_export(self):
        self.admit()
        old_roster, old_body = self.roster(), self.body()
        self.at += 600
        self.now.return_value = self.at
        self.w.forward_roster(old_roster)
        self.assertFalse(self.w.verification_roster_ready(self.body()))
        self.assertEqual(self.calls, [])
        self.admit()
        self.assertFalse(self.w.verification_roster_ready(old_body))

    def test_identical_scan_coalescing_keeps_original_ack_deadline(self):
        self.save_native()
        with patch.object(watcher.time, 'sleep'):
            self.w.check_savedvars()
        self.calls.clear()
        self.w.launch_scan.pages[0] = dict(snapshotId=7, snapshotAt=self.at, guild=GUILD, realm=REALM, scan=dict(expiresAt=self.at + 600))
        self.w.launch_scan.stopped = None
        self.save_native(self.roster(self.at + 1))
        with patch.object(watcher.time, 'sleep'):
            self.w.check_savedvars()
        self.assertEqual(self.calls, [])
        self.assertTrue(self.w.verification_roster_ready(self.body()))
        self.assertEqual(self.w._verification_roster['exportedAt'], self.at)

    def test_original_roster_ack_local_save_failure_recovers_without_http(self):
        real_save = self.w.state.save
        failed = False
        def save():
            nonlocal failed
            if not self.w.state.d['outbox'] and not failed:
                failed = True
                raise OSError('synthetic local settlement failure')
            real_save()
        with patch.object(self.w.state, 'save', side_effect=save):
            self.w.forward_roster(self.roster())
        self.assertFalse(self.w.verification_roster_ready(self.body()))
        self.assertTrue(self.w.recover_local_settlement())
        self.assertEqual(len(self.calls), 1)
        self.assertTrue(self.w.verification_roster_ready(self.body()))

    def test_source_changed_during_parse_never_borrows_old_ack(self):
        self.save_native()
        original = watcher.savedvars.parse_file
        def parse(path):
            data = original(path)
            self.w.sv_file.write_text('-- concurrent incomplete export', encoding='utf-8')
            return data
        with patch.object(watcher.savedvars, 'parse_file', side_effect=parse), patch.object(watcher.time, 'sleep'):
            self.w.check_savedvars()
        self.assertEqual(self.calls, [])
        self.assertEqual(self.w.state.d['sv_mtime'], 0)

    def test_partial_source_invalidates_previous_positive(self):
        self.admit()
        partial = self.roster(self.at + 1)
        partial['total'] = 3
        self.w.forward_roster(partial)
        self.assertFalse(self.w.verification_roster_ready(self.body()))

    def test_file_changed_after_ack_holds_even_before_next_source_poll(self):
        self.save_native()
        with patch.object(watcher.time, 'sleep'):
            self.w.check_savedvars()
        self.calls.clear()
        self.w.sv_file.write_text('-- a new unfinished native export', encoding='utf-8')
        self.assertFalse(self.w.verification_roster_ready(self.body()))
        self.assertEqual(self.calls, [])

    def test_role_result_log_is_allowlisted_and_does_not_equate_member_with_role(self):
        self.assertIn('role=held', watcher.Worker.summarize(dict(result='member', roleOutcome='held', roleGranted=False, pendingConsumed=True, code=SECRET, guid=GUID)))
        self.assertNotIn(SECRET, watcher.Worker.summarize(dict(result='member', roleOutcome=SECRET)))
        self.assertNotIn(GUID, watcher.Worker.summarize(dict(result='member', roleOutcome='granted', guid=GUID)))
        self.assertEqual(watcher.Worker.summarize(dict(result='member', roleOutcome=[])), ' (member)')

    def test_existing_exclusive_pid_lease_remains_enforced(self):
        with StateLease(self.root / 'lease-state.json'):
            with self.assertRaises(FileExistsError):
                with StateLease(self.root / 'lease-state.json'):
                    self.fail('Second collector acquired the same state')

    def test_unrelated_offline_unknown_fields_do_not_block_known_unique_target(self):
        roster = self.roster()
        roster['members'].append(dict(name='Unknown Offline', guid=None, rank=None, rankIndex=None, level=None))
        roster['total'] = 3
        self.assertIsNone(watcher.launch_operations229.complete_roster_digest(roster))
        self.w.forward_roster(roster)
        self.assertTrue(self.w.verification_roster_ready(self.body()))
        self.calls.clear()
        self.w.handle_chat_line(self.line())
        self.assertEqual([c[1] for c in self.calls], ['/ingest/verify'])

    def test_current_target_missing_guid_is_held_despite_trusted_complete_ack(self):
        roster = self.roster()
        roster['members'][1]['guid'] = None
        self.w.forward_roster(roster)
        self.assertFalse(self.w.verification_roster_ready(self.body()))

    def test_current_target_duplicate_guid_is_held_despite_trusted_complete_ack(self):
        roster = self.roster()
        roster['members'][0]['guid'] = GUID
        self.w.forward_roster(roster)
        self.assertFalse(self.w.verification_roster_ready(self.body()))

    def test_normalized_duplicate_name_never_qualifies_complete_source(self):
        roster = self.roster()
        roster['members'][0]['name'] = NAME + '-Realm'
        self.w.forward_roster(roster)
        self.assertFalse(self.w.verification_roster_ready(self.body()))

    def reserve_unattempted(self, preseen=False):
        self.admit()
        key = self.w.code_key('w', NAME, self.code)
        if preseen:
            self.w.state.seen(key)
        self.w.worker.call = lambda method, path, body=None, retries=3: (self.calls.append((method, path, copy.deepcopy(body), retries)) or (False, 'synthetic older outcome'))
        self.w.post('/ingest/events', {'events': []}, 'older synthetic event')
        self.w._post_claimed('/ingest/verify', self.body(), 'unattempted synthetic whisper', [key])
        item = self.w.state.d['outbox'][1]
        self.assertFalse(self.w._verification_originals[id(item)]['attempted'])
        self.calls.clear()
        self.w.worker.call = self.transport
        return item, key

    def expire_time(self):
        self.at += 601
        self.now.return_value = self.at

    def test_busy_before_first_flush_accepts_new_original_whisper_not_old_proof(self):
        old = dict(type='whisper', name=NAME, guid=GUID, code=self.code, ok=True,
                   ts=self.at, nativeMembership=self.proof())
        self.expire_time()
        fresh = dict(type='whisper', name=NAME, guid=GUID, code=self.code, ok=True,
                     ts=self.at, nativeMembership=self.proof())
        self.w.sv_file.parent.mkdir(parents=True, exist_ok=True)
        self.w.sv_file.write_text('OlympusVerifyDB = ' + lua(dict(roster=self.roster(), events=[old, fresh])), encoding='utf-8')
        with patch.object(watcher.time, 'sleep'):
            self.w.check_savedvars()
        self.assertEqual([c[1] for c in self.calls], ['/ingest/roster', '/ingest/verify'])
        self.assertEqual(self.calls[1][2]['nativeMembership'], fresh['nativeMembership'])
        self.assertNotEqual(self.calls[1][2]['nativeMembership'], old['nativeMembership'])

    def test_expired_unattempted_head_releases_only_its_claim_then_fresh_proof_recovers(self):
        item, key = self.reserve_unattempted()
        old = copy.deepcopy(item)
        self.w.state.seen('unrelated-custody')
        self.expire_time()
        with patch.object(watcher, 'log') as messages:
            self.w.flush_outbox()
        self.assertEqual(item, old)
        self.assertFalse(self.w.state.was_seen(key))
        self.assertTrue(self.w.state.was_seen('unrelated-custody'))
        self.assertEqual(self.w.state.d['outbox'], [])
        self.assertIn('without server ACK', ' '.join(c.args[0] for c in messages.call_args_list))
        self.assertFalse(any(c[1] == '/ingest/verify' for c in self.calls))
        self.w.forward_roster(self.roster())
        self.w.forward_events([dict(type='whisper', name=NAME, guid=GUID, code=self.code, ok=True,
                                   ts=self.at, nativeMembership=self.proof())])
        posts = [c for c in self.calls if c[1] == '/ingest/verify']
        self.assertEqual(len(posts), 1)
        self.assertEqual(posts[0][2]['nativeMembership'], self.proof())
        self.assertNotEqual(posts[0][2]['nativeMembership'], old['body']['nativeMembership'])

    def test_expiry_never_overtakes_older_unknown_original(self):
        item, key = self.reserve_unattempted()
        prior = copy.deepcopy(self.w.state.d['outbox'][0])
        self.expire_time()
        self.w.worker.call = lambda *a, **k: (False, 'synthetic unknown')
        self.w.flush_outbox()
        self.assertEqual(self.w.state.d['outbox'][0], prior)
        self.assertIs(self.w.state.d['outbox'][1], item)
        self.assertTrue(self.w.state.was_seen(key))

    def test_unexpired_original_is_sent_once_without_replacing_its_proof(self):
        item, _ = self.reserve_unattempted()
        old = copy.deepcopy(item['body'])
        self.at += 599
        self.now.return_value = self.at
        self.w.flush_outbox()
        posts = [c for c in self.calls if c[1] == '/ingest/verify']
        self.assertEqual(len(posts), 1)
        self.assertEqual(posts[0][2], old)

    def test_expired_attempted_unknown_is_never_retired_or_retried(self):
        self.admit()
        self.w.worker.call = lambda *a, **k: (self.calls.append((a, k)) or (False, 'synthetic unknown'))
        self.w.handle_chat_line(self.line())
        item = self.w.state.d['outbox'][0]
        self.expire_time()
        self.w.flush_outbox()
        self.assertIs(self.w.state.d['outbox'][0], item)
        self.assertEqual(len(self.calls), 1)
        self.assertTrue(self.w.state.was_seen(self.w.code_key('w', NAME, self.code)))

    def test_expired_refused_original_is_never_retired(self):
        item, key = self.reserve_unattempted()
        item['refusal_status'] = 403
        self.expire_time()
        self.w.flush_outbox()
        self.assertIs(self.w.state.d['outbox'][0], item)
        self.assertTrue(self.w.state.was_seen(key))
        self.assertFalse(any(c[1] == '/ingest/verify' for c in self.calls))

    def test_expired_rehydrated_original_cannot_acquire_local_retirement_right(self):
        item, key = self.reserve_unattempted()
        restored = json.loads(json.dumps(item))
        self.w.state.d['outbox'][1] = restored
        self.expire_time()
        self.w.flush_outbox()
        self.assertIs(self.w.state.d['outbox'][0], restored)
        self.assertTrue(self.w.state.was_seen(key))

    def test_mutated_and_rehashed_body_is_not_the_private_original(self):
        item, key = self.reserve_unattempted()
        item['body']['ts'] += 1
        item['digest'] = self.w._original_digest(item)
        self.expire_time()
        self.w.flush_outbox()
        self.assertIs(self.w.state.d['outbox'][0], item)
        self.assertTrue(self.w.state.was_seen(key))

    def test_mutated_label_cannot_acquire_local_retirement_right(self):
        item, key = self.reserve_unattempted()
        item['label'] = 'changed diagnostic label'
        self.expire_time()
        self.w.flush_outbox()
        self.assertIs(self.w.state.d['outbox'][0], item)
        self.assertTrue(self.w.state.was_seen(key))

    def test_a_preexisting_seen_claim_is_never_owned_or_released_by_new_reservation(self):
        item, key = self.reserve_unattempted(preseen=True)
        self.expire_time()
        self.w.flush_outbox()
        self.assertIs(self.w.state.d['outbox'][0], item)
        self.assertTrue(self.w.state.was_seen(key))

    def test_different_claim_owner_blocks_expiry_even_for_identical_digest(self):
        item, key = self.reserve_unattempted()
        other = self.w._freeze_original('/ingest/verify', self.body(), 'different private original')
        self.w._verification_seen_claims[self.w.state._k(key)] = self.w._verification_originals[id(other)]
        self.expire_time()
        self.w.flush_outbox()
        self.assertIs(self.w.state.d['outbox'][0], item)
        self.assertTrue(self.w.state.was_seen(key))

    def test_duplicate_seen_claim_custody_is_held_instead_of_blanket_forgotten(self):
        item, key = self.reserve_unattempted()
        self.w.state.d['seen'].append(self.w.state._k(key))
        self.expire_time()
        self.w.flush_outbox()
        self.assertIs(self.w.state.d['outbox'][0], item)
        self.assertEqual(self.w.state.d['seen'].count(self.w.state._k(key)), 2)

    def test_unknown_local_expiry_save_restores_original_claim_and_halts_dispatch(self):
        item, key = self.reserve_unattempted()
        self.expire_time()
        save = self.w.state.save
        def uncertain_save():
            if not self.w.state.d['outbox']:
                raise OSError('synthetic expiry write outcome unknown')
            save()
        with patch.object(self.w.state, 'save', side_effect=uncertain_save):
            self.w.flush_outbox()
        self.assertIs(self.w.state.d['outbox'][0], item)
        self.assertTrue(self.w.state.was_seen(key))
        self.assertTrue(self.w._custody_halted)
        before = len(self.calls)
        self.w.flush_outbox()
        self.assertEqual(len(self.calls), before)
        with self.assertRaises(watcher.CustodyStopped):
            self.w._require_custody_continuation()

    def test_local_expiry_result_is_falsey_and_not_delivered(self):
        self.assertFalse(bool(watcher.Delivery.EXPIRED_LOCAL))
        self.assertIsNot(watcher.Delivery.EXPIRED_LOCAL, watcher.Delivery.DELIVERED)


if __name__ == '__main__':
    unittest.main()
