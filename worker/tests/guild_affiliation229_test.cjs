// Current affiliation labels never rewrite the bytes used by native or historical proofs.
const fs = require('node:fs');
const path = require('node:path');
const { Module } = require('node:module');
const ts = require('typescript');
const file = path.join(__dirname, '../src/guild-affiliation229.ts');
const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = new Module(file, module);
loaded.filename = file;
loaded.paths = module.paths;
loaded._compile(compiled, file);
const g = loaded.exports;
let passed = 0, failed = 0;
function check(label, truth) {
  console.log((truth ? 'PASS ' : 'FAIL ') + label);
  if (truth) passed++; else failed++;
}
for (const name of ['OLYMPUS PRIME', 'Olympus Prime', 'olympus prime', 'OLYMPUS', 'Olympus', 'Olympus I', 'OLYMPUS I']) {
  check('flagship alias resolves without creating another branch: ' + name,
    g.canonicalOlympusGuildName(name) === 'OLYMPUS PRIME' && g.olympusGuildNumber(name) === 1 && g.isFlagshipGuildName(name) && g.isApprovedNativeGuildName(name));
}
for (let n = 1; n < g.OLYMPUS_GUILD_NAMES.length; n++) {
  const name = g.OLYMPUS_GUILD_NAMES[n];
  check('each sister branch has a distinct current identity: ' + name,
    g.canonicalOlympusGuildName(name.toUpperCase()) === name && g.olympusGuildNumber(name) === n + 1 && !g.isFlagshipGuildName(name));
}
check('the current catalogue has exactly ten frozen branches',
  Object.isFrozen(g.OLYMPUS_GUILD_NAMES) && g.OLYMPUS_GUILD_NAMES.length === 10 && new Set(g.OLYMPUS_GUILD_NAMES).size === 10);
check('human input may be trimmed while native scope cannot',
  g.canonicalOlympusGuildName(' OLYMPUS PRIME ') === 'OLYMPUS PRIME' && !g.isApprovedNativeGuildName(' OLYMPUS PRIME '));
for (const value of ['', 'Olympus XI', 'Olympus Prime II', 'Olympus I–X', 'Olympus 1', 'Olympus  Prime', 'Olympus\nI', 'Olympus\0', '<OLYMPUS PRIME>', 'O'.repeat(97), null, undefined, 1, [], {}]) {
  check('invalid or ambiguous affiliation stays held: ' + JSON.stringify(value),
    g.canonicalOlympusGuildName(value) === null && !g.isApprovedNativeGuildName(value) && g.olympusGuildNumber(value) === null);
}
let coerced = false;
check('untrusted objects are never coerced', g.canonicalOlympusGuildName({ toString() { coerced = true; return 'Olympus'; } }) === null && !coerced);
console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
