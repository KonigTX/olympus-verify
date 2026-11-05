""".229 sidecar admission/pagination/custody, synthetic transport only."""
import copy
import hashlib
import io
import json
from pathlib import Path
import sys
import tempfile
import time
import unittest
from unittest.mock import patch
import urllib.error

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import launch_operations229 as launch
import watcher


def page(at, offset=0, total=20, started=None):
    started = at if started is None else started
    guild, realm, short = 'OLYMPUS PRIME', 'Native Realm', 'Guild rules and Discord: use Get my code, then follow the bot instructions.'
    last = offset + 20 >= total
    return dict(protocol=launch.PROTOCOL, fetchedAt=at, expiresAt=at + 60, status='ready' if last else 'partial',
                snapshotId=12, snapshotAt=started - 10, memberCount=total, guild=guild, canonicalGuild=guild, realm=realm,
                scan=dict(id='a'*32, startedAt=started, expiresAt=started+590), pageCursor='page-'+str(offset),
                scopeHash=hashlib.sha256(f'native-scope|1|{guild}|{realm}'.encode()).hexdigest()[:16],
                entitlements=dict(offset=offset, pageSize=20, scanned=20, total=total, unscanned=max(0, total-offset-20), retryAfterSeconds=None),
                nextCursor=None if last else 'opaque-cursor-' + str(offset + 20), invites=[],
                promotions=[dict(guid=f'Player-1-{offset+1:08X}', name='Test Member', currentSlot=9, targetSlot=7, reason='verified-initiate')],
                riskBuffer=[], held=[], heldReasons=['native-unguilded-proof-required'],
                motd=dict(short=short, bulletin='Long bulletin\nSecond line', characters=len(short), bytes=len(short.encode()), maxBytes=128),
                actions=dict(automatic=False, roleGrants=False, removals=False, requiresNativeRecheck=True))


class LaunchOperations(unittest.TestCase):
    def setUp(self):
        self.at = int(time.time())

    def test_canonical_aliases_preserve_raw_scope(self):
        for name in ('OLYMPUS PRIME', 'Olympus', 'Olympus I'):
            self.assertEqual(launch.canonical_guild(name), 'OLYMPUS PRIME')
        for name in ('Olympus II', 'Olympus X'):
            self.assertEqual(launch.canonical_guild(name), name)
        for name in ('OLYMPUSPRIME', 'Olympus Prime Impostors', 'Anti Olympus', None, 2):
            self.assertIsNone(launch.canonical_guild(name))
        value = page(self.at)
        self.assertTrue(launch.validate_page(value, self.at))
        value['guild'] = 'Olympus I'  # Affiliation alias does not rewrite the raw scope hash.
        self.assertFalse(launch.validate_page(value, self.at))
        value['scopeHash'] = hashlib.sha256(f"native-scope|1|{value['guild']}|{value['realm']}".encode()).hexdigest()[:16]
        self.assertTrue(launch.validate_page(value, self.at))

    def test_expiry_scope_and_authority_negatives(self):
        changes = [lambda p: p.update(expiresAt=self.at), lambda p: p.update(fetchedAt=self.at+6, expiresAt=self.at+66),
                   lambda p: p.update(snapshotAt=self.at-3601), lambda p: p.update(scopeHash='0'*16),
                   lambda p: p['actions'].update(automatic=True), lambda p: p['actions'].update(roleGrants=True),
                   lambda p: p.update(invites=[{'name': 'Unknown Guild'}]), lambda p: p.update(status=[]),
                   lambda p: p['promotions'][0].update(targetSlot=0), lambda p: p['promotions'][0].update(targetSlot=5),
                   lambda p: p['promotions'][0].update(currentSlot=True), lambda p: p['motd'].update(short='x'*129),
                   lambda p: p['motd'].update(bytes=999), lambda p: p.update(nextCursor='a\nsecret')]
        for change in changes:
            with self.subTest(change=change):
                value = page(self.at); change(value)
                self.assertFalse(launch.validate_page(value, self.at))

    def scan(self, total=20):
        self.clock = float(self.at)
        scan = launch.Scan(lambda: self.clock)
        self.assertTrue(scan.request(dict(action='scan', id=str(self.at)+':1', scopeHash=page(self.at)['scopeHash']), self.clock))
        calls = []
        def call(method, path, retries):
            self.assertEqual(method, 'GET'); self.assertEqual(retries, 1)
            calls.append(path)
            offset = int(path.rsplit('-', 1)[1]) if '&cursor=' in path else 0
            return True, page(int(self.clock), offset, total, self.at)
        return scan, call, calls

    def test_full_1000_scan_50_pages_plus_three_refreshes(self):
        scan, call, calls = self.scan(1000)
        self.assertTrue(scan.step(call, self.clock))
        self.assertFalse(scan.step(call, self.clock+1))
        for _ in range(52):
            self.clock += 5
            self.assertTrue(scan.step(call, self.clock))
        self.assertEqual((len(calls), len(scan.pages), scan.refreshed, scan.complete, scan.phase), (53, 50, 3, True, 'idle'))
        self.assertLess(self.clock-self.at, 600)
        self.assertLess(scan.pages[0]['fetchedAt'], scan.pages[40]['fetchedAt'])
        self.assertLess(scan.pages[980]['fetchedAt'], scan.pages[0]['fetchedAt'])
        self.assertLess(scan.pages[60]['expiresAt'], self.clock)  # retained advisory, never renewed by other pages
        body = launch.render_pages(scan.result(), int(self.clock))
        self.assertIn('OlympusLaunchQueue=', body)
        self.assertNotIn('OlympusQueue=', body)
        self.assertNotIn('pageCursor', body)
        self.assertNotIn('nextCursor', body)
        self.assertIn('bulletin="Long bulletin\\nSecond line"', body)
        self.assertFalse(scan.step(call, self.clock+601))

    def test_one_second_page_difference_and_recheck_within_original_scan(self):
        first, second = page(self.at, 0, 40), page(self.at+1, 20, 40, self.at)
        self.assertTrue(launch.validate_page(second, self.at+1))
        result = dict(version=2, controlId='x', scanComplete=True, running=False, stoppedReason=None, discoveredPages=2, refreshedPages=0, pages=[first, second])
        self.assertIsNotNone(launch.render_pages(result, self.at+61))
        scan, call, calls = self.scan(40)
        for _ in range(4):
            scan.step(call, self.clock); self.clock += 5
        self.clock = self.at+100
        self.assertTrue(scan.request(dict(action='recheck', offset=20, id='next', scopeHash=second['scopeHash']), self.clock))
        scan.step(call, self.clock)
        self.assertEqual(scan.pages[20]['fetchedAt'], self.at+100)
        self.assertEqual(scan.pages[20]['scan'], first['scan'])
        self.assertFalse(scan.request(dict(action='recheck', offset=20, id='late', scopeHash=second['scopeHash']), self.at+590))

    def test_mixed_or_duplicate_pages_hold(self):
        for alter in (lambda p: p.update(snapshotId=13), lambda p: p['scan'].update(id='b'*32),
                      lambda p: p.update(guild='Olympus I'), lambda p: p['promotions'][0].update(guid='Player-1-00000001'),
                      lambda p: p['entitlements'].update(offset=0)):
            scan, call, calls = self.scan(40)
            scan.step(call, self.clock); self.clock += 5
            value = page(int(self.clock), 20, 40, self.at); alter(value)
            scan.step(lambda *a, **k: (True, value), self.clock)
            self.assertEqual(scan.phase, 'idle'); self.assertIsNotNone(scan.stopped)
            self.assertFalse(scan.complete)

    def test_transport_refusal_is_not_an_empty_current_queue(self):
        scan, call, calls = self.scan()
        scan.step(lambda *a, **k: (False, {'httpStatus': 429, 'retryAfterSeconds': 60}), self.clock)
        self.assertEqual(scan.stopped, 'source-refused')
        self.assertFalse(scan.step(call, self.clock+60))
        self.assertIsNone(launch.render_pages(None, self.at))
        self.assertIsNone(launch.render_pages([page(self.at)], self.at+60))

    def test_watcher_writes_only_separate_projection_and_keeps_legacy_custody(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            instance = watcher.Watcher(dict(wow_dir=str(root), account='synthetic', worker_url='https://test.invalid', watcher_token='synthetic-token',
                                           verify_secret='synthetic-secret', officer_character='Fern Melder', membership_only=True, state_file=str(root/'state.json')))
            instance.queue_file.parent.mkdir(parents=True)
            instance.queue_file.write_text('LEGACY UNCHANGED')
            calls = []
            instance.worker.call = lambda method, path, body=None, retries=3: (calls.append((method, path, body)) or (True, page(self.at)))
            instance.pull_launch_operations()
            self.assertEqual(calls, [])  # no explicit request, no role fetch
            control = dict(version=1, action='scan', id=str(self.at)+':1', observedAt=self.at, scopeHash=page(self.at)['scopeHash'], guid='Player-1-0000AAAA', offset=0)
            control['mac'] = launch.control_mac('synthetic-secret', control)
            db = dict(lastCharacterGuid=control['guid'], launchControl=control,
                      roster=dict(exportedAt=self.at, nativeGuild='OLYMPUS PRIME', nativeRealm='Native Realm', members=[dict(guid=control['guid'], name='Fern Melder')]))
            instance.read_launch_control(db)
            instance.pull_launch_operations()
            before = instance.launch_operations_file.read_bytes()
            self.assertIn(b'OlympusLaunchQueue=', before)
            self.assertEqual(instance.queue_file.read_text(), 'LEGACY UNCHANGED')
            self.assertTrue(all(method == 'GET' and path == launch.PATH and body is None for method, path, body in calls))
            count = len(calls)
            instance.pull_launch_operations()
            self.assertEqual(len(calls), count)  # No role request on the normal fast loop.
            instance.worker.call = lambda *a, **k: (False, {'httpStatus': 429})
            instance.launch_scan.next_at = 0
            instance.pull_launch_operations()
            self.assertIn(b'stoppedReason="source-refused"', instance.launch_operations_file.read_bytes())
            self.assertFalse(instance.state.d.get('queue_written_pending'))
            self.assertEqual(instance.queue_file.read_text(), 'LEGACY UNCHANGED')
            self.assertEqual(instance.launch_scan.calls, 2)
            instance.read_launch_control(db)  # saved replay does not restart
            self.assertEqual(instance.launch_scan.calls, 2)

    def test_local_control_scope_mac_expiry_stop_and_scan_expiry(self):
        value = dict(version=1, action='scan', id=str(self.at)+':1', observedAt=self.at, scopeHash=page(self.at)['scopeHash'], guid='Player-1-0000AAAA', offset=0)
        value['mac'] = launch.control_mac('synthetic-secret', value)
        args = ('synthetic-secret', value, self.at, value['guid'], 'OLYMPUS PRIME', 'Native Realm')
        self.assertTrue(launch.validate_control(*args))
        for key, bad in [('action','recheck'), ('guid','Player-1-0000BBBB'), ('offset',20), ('mac','0'*32), ('observedAt',self.at-61)]:
            changed = dict(value); changed[key] = bad
            self.assertFalse(launch.validate_control(args[0], changed, *args[2:]))
        scan, call, calls = self.scan(1000)
        scan.step(call, self.clock)
        self.assertTrue(scan.request(dict(action='stop', id='stop'), self.clock))
        self.assertFalse(scan.step(call, self.clock+5)); self.assertFalse(scan.complete)
        self.assertEqual(scan.stopped, 'operator-stopped')
        scan, call, calls = self.scan(1000); scan.step(call, self.clock)
        self.clock = self.at+590; scan.step(call, self.clock)
        self.assertEqual(scan.stopped, 'scan-expired'); self.assertEqual(len(calls), 1)

    def test_actual_savedvars_ingestion_order_reload_recheck_and_changed_rows(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            instance = watcher.Watcher(dict(wow_dir=str(root), account='synthetic', worker_url='https://test.invalid', watcher_token='synthetic-token',
                                           verify_secret='synthetic-secret', officer_character='Fern Melder', membership_only=True, state_file=str(root/'state.json')))
            instance.queue_file.parent.mkdir(parents=True)
            instance.sv_file.parent.mkdir(parents=True, exist_ok=True); instance.sv_file.write_text('synthetic')
            self.clock = float(self.at)
            roster = dict(exportedAt=self.at-10, total=20, online=1, nativeGuild='OLYMPUS PRIME', nativeRealm='Native Realm',
                          members=[dict(name='Fern Melder' if i == 0 else 'Member '+str(i), full='Full '+str(i), guid='Player-1-0000AAAA' if i == 0 else f'Player-1-{i:08X}',
                                        rank='High Council' if i == 0 else 'Initiate', rankIndex=1 if i == 0 else 9, level=60, lastOnline=0, note='', onote='', **{'class':'MAGE'}) for i in range(20)])
            db = dict(lastCharacterGuid='Player-1-0000AAAA', roster=roster)
            def control(action, sequence):
                c = dict(version=1, action=action, id=str(int(self.clock))+':'+str(sequence), observedAt=int(self.clock), scopeHash=page(self.at)['scopeHash'], guid=db['lastCharacterGuid'], offset=0)
                c['mac'] = launch.control_mac('synthetic-secret', c); db['launchControl'] = c
            calls = []
            def call(method, path, body=None, retries=3):
                calls.append((method,path,body))
                if method == 'POST': return True, dict(snapshot=12, members=len(body['members']), trusted=True)
                return True, page(int(self.clock), started=self.at)
            instance.worker.call = call
            control('scan',1)
            with patch.object(watcher.time,'time',lambda:self.clock), patch.object(watcher.time,'sleep'), patch.object(watcher.savedvars,'parse_file',lambda p:{'OlympusVerifyDB':db}):
                instance.check_savedvars(); instance.pull_launch_operations()
                self.clock += 5; instance.pull_launch_operations()
                self.assertEqual(instance.launch_scan.phase,'idle')
                original_at = instance.state.d['roster_sent']
                original_scan = copy.deepcopy(instance.launch_scan.pages[0]['scan'])
                self.clock += 1; roster['exportedAt'] = int(self.clock); control('recheck',2)
                instance.state.d['sv_mtime'] = 0
                instance.check_savedvars(); instance.pull_launch_operations()
                self.assertEqual(sum(m=='POST' for m,p,b in calls),1)
                self.assertEqual(instance.state.d['roster_sent'],original_at)
                self.assertEqual(instance.launch_scan.pages[0]['scan'],original_scan)
                self.assertEqual(instance.launch_scan.pages[0]['fetchedAt'],int(self.clock))
                self.assertEqual(instance.launch_scan.control_id,db['launchControl']['id'])
                roster['members'][1]['level'] = 59; roster['exportedAt'] = original_at
                instance.state.d['sv_mtime'] = 0; instance.check_savedvars()
                self.assertEqual(sum(m=='POST' for m,p,b in calls),1)  # unchanged timestamp is held, never manufactured
                self.assertEqual(instance.launch_scan.stopped,'native-roster-changed-or-expired')
                self.assertIn(b'stoppedReason="native-roster-changed-or-expired"',instance.launch_operations_file.read_bytes())
                roster['exportedAt'] = int(self.clock)+1; self.clock += 1
                instance.state.d['sv_mtime'] = 0; instance.check_savedvars()
                self.assertEqual(sum(m=='POST' for m,p,b in calls),2)
                self.assertEqual(instance.launch_scan.stopped,'native-roster-changed-or-expired')

    def test_only_same_process_positive_complete_receipt_can_coalesce(self):
        roster = dict(exportedAt=self.at,total=1,nativeGuild='OLYMPUS PRIME',nativeRealm='Native Realm',members=[dict(name='Fern Melder',guid='Player-1-0000AAAA',rank='High Council',rankIndex=1,level=60)])
        digest = launch.complete_roster_digest(roster)
        self.assertIsNotNone(digest)
        newer = copy.deepcopy(roster); newer['exportedAt'] += 1
        self.assertEqual(launch.complete_roster_digest(newer),digest)
        for alter in (lambda r:r.update(total=2), lambda r:r['members'][0].update(rankIndex=None), lambda r:r.update(nativeGuild='OLYMPUSPRIME')):
            changed = copy.deepcopy(roster); alter(changed); self.assertIsNone(launch.complete_roster_digest(changed))
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            instance = watcher.Watcher(dict(wow_dir=str(root),account='synthetic',worker_url='https://test.invalid',watcher_token='synthetic-token',verify_secret='synthetic-secret',officer_character='Fern Melder',membership_only=True,state_file=str(root/'state.json')))
            for response in (dict(trusted=False,snapshot=12,members=1),dict(skipped=True,trusted=True,snapshot=12,members=1),dict(refused='x',trusted=True,snapshot=12,members=1),dict(trusted=True,snapshot=12,members=2)):
                instance._launch_roster_candidate = dict(body={'members':[{}]},digest=digest,exportedAt=self.at)
                instance.note_launch_roster_receipt(dict(path='/ingest/roster',body={'members':[{}]}),response)
                self.assertIsNone(instance._launch_accepted_roster)
            self.assertNotIn('launch_accepted_roster',instance.state.d)

    def test_transport_body_bound_and_cursor_logging_redaction(self):
        class Reply(io.BytesIO):
            status = 200
        client = watcher.Worker('https://test.invalid', 'synthetic-token')
        client.opener.open = lambda *a, **k: Reply(b'x'*(launch.MAX_BYTES+1))
        self.assertEqual(client.call('GET', launch.PATH, retries=1), (False, 'invalid_response'))
        refusal = urllib.error.HTTPError('https://test.invalid', 429, 'limited', {}, io.BytesIO())
        def refuse(*a, **k):
            raise refusal
        client.opener.open = refuse
        with patch.object(watcher, 'log') as log:
            okay, result = client.call('GET', launch.PATH+'&cursor=private-opaque-value', retries=1)
        self.assertFalse(okay)
        self.assertEqual(result['httpStatus'], 429)
        text = '\n'.join(str(call) for call in log.call_args_list)
        self.assertNotIn('private-opaque-value', text)
        self.assertNotIn('keyVersion=', text)
        refusal.close()


if __name__ == '__main__':
    unittest.main()
