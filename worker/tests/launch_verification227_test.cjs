// Actual roster source + actual canonical schema in Native SQLite. No provider or game calls.
const assert = require('node:assert/strict');
const { fixture } = require('./helpers/privacy129_fixture.cjs');
let passed = 0;
const check = (label, run) => { run(); passed++; console.log('PASS ' + label); };
(async () => {
  const f = fixture(false), roster = f.load('roster');
  const env = { DB: f.port, LINKS_NOT_BEFORE: String(f.now - 3600) };
  const addSnapshot = ({ complete = 1, trusted = 1, count = 1, exportedAt = f.now } = {}) => Number(f.db.prepare(
    'INSERT INTO roster_snapshots(exported_at,received_at,source,member_count,trusted,complete) VALUES(?,?,?,?,?,?)'
  ).run(exportedAt, f.now, 'addon', count, trusted, complete).lastInsertRowid);
  const addMember = (id, key = 'fern melder', name = 'Fern Melder', guid = 'Player-4613-12345678') => f.db.prepare(
    'INSERT INTO roster_members(snapshot_id,name_key,name,guid) VALUES(?,?,?,?)'
  ).run(id, key, name, guid);
  check('empty roster has no membership evidence', () => assert.equal(f.db.prepare('SELECT COUNT(*) n FROM roster_snapshots').get().n, 0));
  assert.equal(await roster.latestRosterEntry(env, 'fern melder'), null); passed++; console.log('PASS no snapshot yields no verified membership');
  const good = addSnapshot(); addMember(good);
  let row = await roster.latestRosterEntry(env, 'fern melder');
  check('complete trusted exact-count roster returns native character identity', () => assert.deepEqual(JSON.parse(JSON.stringify(row)), { snapshotId: good,source:'addon', name: 'Fern Melder', guid: 'Player-4613-12345678', exportedAt: f.now }));
  check('fresh qualified roster can support membership', () => assert.equal(roster.isCurrentRoster(env, row), true));
  assert.equal(await roster.latestRosterEntry(env, 'not a member'), null); passed++; console.log('PASS absent character has no membership evidence');
  for (const [label, values] of [
    ['unfinished', { complete: 0 }], ['unchecked completion', { complete: null }],
    ['distrusted', { trusted: 0 }], ['unchecked trust', { trusted: null }],
    ['truncated but stamped complete', { count: 2 }], ['count smaller than stored rows', { count: 0 }],
  ]) {
    const id = addSnapshot(values); addMember(id);
    assert.equal(await roster.latestRosterEntry(env, 'fern melder'), null); passed++; console.log('PASS ' + label + ' latest snapshot holds, with no fallback to older good roster');
  }
  const newest = addSnapshot(); addMember(newest, 'other member', 'Other Member', 'Player-4613-87654321');
  assert.equal(await roster.latestRosterEntry(env, 'fern melder'), null); passed++; console.log('PASS newest roster absence cannot borrow earlier membership');
  const stale = addSnapshot({ exportedAt: f.now - roster.ROSTER_CURRENT_FOR - 1 }); addMember(stale);
  row = await roster.latestRosterEntry(env, 'fern melder');
  check('old native identity remains an observation, not current membership', () => assert.equal(roster.isCurrentRoster(env, row), false));
  const launch = { ...env, LINKS_NOT_BEFORE: String(f.now + 1) };
  check('a pre-launch snapshot cannot establish launch membership', () => assert.equal(roster.isCurrentRoster(launch, { name: 'Fern Melder', guid: null, exportedAt: f.now }), false));
  f.db.close();
  console.log(`${passed}/${passed} launch verification roster checks passed`);
})().catch(error => { console.error(error); process.exitCode = 1; });
