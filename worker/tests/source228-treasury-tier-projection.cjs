'use strict';
// Only existing historical static readers see the reconstructed Treasury source.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const source227 = require('./source227-role-historical-projection.cjs');

const treasuryFile = 'treasury-cosmetic.ts';
const sha = value => createHash('sha256').update(value).digest('hex');
const manifestBytes = fs.readFileSync(path.join(__dirname, 'fixtures/reviewed228-treasury-tier-contexts.json'));
if (sha(manifestBytes) !== '3c3d98771ae86ca29eca5e72f0d080879c55b4f28ba9f6f65796c2d404f9f25b')
  throw Error('Treasury228 static tier contexts differ');
const manifest = JSON.parse(manifestBytes.toString('utf8'));

function matches(raw, expected) {
  return typeof raw === 'string' && Buffer.byteLength(raw) === expected.bytes && sha(raw) === expected.sha256;
}

function inverse(raw) {
  if (!matches(raw, manifest.current)) return null;
  let historical = raw;
  for (const { from, to } of manifest.contexts) {
    if (historical.split(from).length !== 2) return null;
    historical = historical.replace(from, to);
  }
  return matches(historical, manifest.historical224) ? historical : null;
}

function checks(sourceRoot) {
  const raw = fs.readFileSync(path.join(sourceRoot, treasuryFile), 'utf8');
  const negatives = [
    '// unreviewed prefix\n' + raw,
    raw + '\n// unreviewed suffix',
    raw.replace(/\n/g, '\r\n'),
    raw.replace('} reserved.check(); };', '} };'),
    raw.replace('Olympus Branch GM', 'Olympus Branch Other'),
    raw.replace("tierInfo?.ceremonial ? 'benefactor'", "tierInfo?.ceremonial ? 'patron'"),
  ];
  for (const { from } of manifest.contexts)
    negatives.push(raw.replace(from, from + from), raw.replace(from, from + '\n'));
  return {
    exactCurrentAnd224: inverse(raw) !== null,
    unexpectedSourceRefused: negatives.every(candidate => candidate !== raw && inverse(candidate) === null),
  };
}

function withStaticView(sourceRoot, inspect) {
  return source227.withStaticView(sourceRoot, view => {
    const file = path.join(view, treasuryFile);
    const historical = inverse(fs.readFileSync(file, 'utf8'));
    if (historical === null) throw Error('Current228 Treasury support differs');
    fs.writeFileSync(file, historical);
    return inspect(view);
  });
}

module.exports = Object.freeze({ checks, withStaticView });
