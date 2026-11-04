/** The separately pinned Native fixture remains byte-exact. Extensions borrow only its setup. */
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const Module = require('node:module');

function runNativeErasureFixture(run) {
  const filename = path.join(__dirname, '..', 'privacy_native_erasure_mode_test.cjs');
  const source = fs.readFileSync(filename, 'utf8');
  const cuts = [...source.matchAll(/^\(async\(\)=>\{\r?\n \/\/ \.174:/gm)];
  if (cuts.length !== 1) throw Error('native erasure setup boundary changed');
  const setup = source.slice(0, cuts[0].index);
  const hash = createHash('sha256').update(setup).digest('hex');
  if (hash !== '572066b31422497e89314f47c972536517104de10521a45434b4f041f6ad02a3') {
    throw Error('native erasure setup bytes changed');
  }
  const fixture = new Module(filename, module);
  fixture.filename = filename;
  fixture.paths = Module._nodeModulePaths(path.dirname(filename));
  fixture._compile(setup + '\nmodule.exports=(' + run.toString() + ');\n', filename);
  return fixture.exports();
}

module.exports = { runNativeErasureFixture };
