'use strict';
const crypto = require('node:crypto');

// Reverse the three exact current copy and liaison changes before the earlier graph seals.
const readerNodeEdits228 = [
  {"id":"council","field":"limits","currentSHA256":"29d180e1c9604eca81017a8e3cbaef8ffbeb169fa1a8b17b2aff44c90f746421","before":"Guild Master, Co-Guild Master and Treasurer form the core Council offices. An accepted warrant and eligible vote remain separate from native ranks and actual permissions."},
  {"id":"emissary-heraldry","field":"coordinates","currentSHA256":"1bfb8a2a8a3e2c919ae3938ed12d594269222d45ed03d066bc6f448bf82d4ca6","before":["heraldry"]},
  {"id":"propaganda","field":"limits","currentSHA256":"28e978ad48bca3d2b6da8be436729e34588f078b9d7481b1e3aca4f1775eae87","before":"The Minister approves campaign direction within the accepted warrant. Heraldry owns official records and publication standards; editors and platform operators retain separately granted access. No harassment, deceptive impersonation or private-information disclosure."},
];
function originalReaderNodes228(nodes) {
  for (const {id,currentSHA256} of readerNodeEdits228) {
    const matching = nodes.filter(node => node.id === id);
    if (matching.length !== 1 || crypto.createHash("sha256").update(JSON.stringify(matching[0])).digest("hex") !== currentSHA256) return null;
  }
  return nodes.map(node => {
    const edit = readerNodeEdits228.find(row => row.id === node.id);
    return edit ? {...node,[edit.field]:edit.before} : node;
  });
}
module.exports = { readerNodeEdits228, originalReaderNodes228 };
