// Pure, finite appointment ID contract. No ordinal-derived authority and no side effects.
'use strict';
function assertOfficeKeys(terms, keys) {
  if (!Array.isArray(terms) || terms.length !== 103 || !Array.isArray(keys) || keys.length !== 103 ||
      keys.some(row => !row || typeof row !== 'object' || !/^office_[0-9]{2,3}$/.test(row.key) || typeof row.label !== 'string' || !row.label) ||
      new Set(keys.map(row => row.key)).size !== 103 || new Set(keys.map(row => row.label)).size !== 103) throw Error('governance_office_key_contract');
  const labels = new Map(keys.map(row => [row.key, row.label]));
  if (terms.some(term => !term || labels.get(term.officeKey) !== term.label) || new Set(terms.map(term => term.officeKey)).size !== 103 ||
      labels.get('office_12') !== 'Broadcaster' || labels.get('office_50') !== 'Lead Correspondent') throw Error('governance_office_key_label_drift');
}
module.exports = Object.freeze({ assertOfficeKeys });
