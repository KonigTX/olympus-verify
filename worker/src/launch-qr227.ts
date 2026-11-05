/** Current upstream QR compatibility only; never a replacement for historical
 * QR_PHASE1 or an authority to issue codes, store identities or grant roles.
 * Producer: dnl-gentile/olympus-addon main 71bc357c, read 3 November 2026.
 * Wire grammar: its web/public/core.js, MIT licensed. Existing upstream notice
 * is retained at worker/vendor/olympus-link/LICENSE. The old gated core is not
 * imported: this independent data-only boundary cannot mount its runtime. */
import { canonicalOlympusGuildName, type OlympusGuildName } from './guild-affiliation229';

export const LAUNCH_QR_PRODUCER227 = '71bc357c251b49a167821cc0b7f922eb69fa35b6';
export const LAUNCH_QR_PAGE227 = 'https://dnl-gentile.github.io/olympus-addon/';
export class LaunchQrRefusal227 extends Error { constructor(readonly code: string) { super(code); } }
type UnverifiedProof227 = Readonly<{ issued: number; keyId: string; confirmer: string; gv: 'r' | 'w' | 'c'; sig: string; pub: string; tier: 'c' | 'p'; certExp: number; certSig: string }>;
export type UnverifiedLaunchQr227 = Readonly<{
  protocol: 'OLB5'; producerCommit: typeof LAUNCH_QR_PRODUCER227;
  wire: string; requester: string; signedGuild: string; canonicalGuild: OlympusGuildName; faction: 'Alliance';
  nonce: string; requestCode: string; tag: string; proofs: readonly UnverifiedProof227[];
  trust: 'unverified_signed_claims'; canGrantRoles: false; requesterGuid: null; nativeRank: null; realmGroup: null;
}>;
const refuse = (code: string): never => { throw new LaunchQrRefusal227(code); };
const bytes = (value: string) => new TextEncoder().encode(value).byteLength;
const field = (value: string, max: number) => value.length > 0 && bytes(value) <= max && !/[|~;,\x00-\x1f\x7f]/.test(value);
const character = (value: string) => field(value, 64) && /^[^-].*-[^- ]+$/s.test(value);
function canonicalBase64(value: string, length: number): boolean {
  if (!/^[A-Za-z0-9_-]+$/.test(value) || value.length !== Math.ceil(length * 4 / 3)) return false;
  try {
    const decoded = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
    return decoded.length === length && btoa(decoded).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') === value;
  } catch { return false; }
}
function parseWire(wire: string) {
  if (!wire.startsWith('OLB5~') || bytes(wire) > 2400) return refuse('invalid_membership_bundle');
  const fields = wire.split('~');
  if (fields.length !== 8) return refuse('invalid_membership_bundle');
  const [, requester, guild, faction, nonce, requestCode, tag, proofText] = fields as [string,string,string,string,string,string,string,string];
  if (!character(requester) || !field(guild, 40) || faction !== 'Alliance' && faction !== 'Horde' || !/^[0-9a-f]{16}$/.test(nonce) || !/^[0-9A-HJKMNP-TV-Z]{10}$/.test(requestCode) || !/^[0-9a-f]{16}$/.test(tag)) return refuse('invalid_membership_bundle');
  const parts = proofText.split(';');
  if (!proofText || parts.length > 4) return refuse('invalid_membership_bundle');
  const proofs = parts.map(part => {
    const values = part.split(',');
    if (values.length !== 9) return refuse('invalid_membership_bundle');
    const [issued, keyId, confirmer, gv, sig, pub, tier, certExp, certSig] = values as [string,string,string,string,string,string,string,string,string];
    if (!/^[1-9][0-9]{0,11}$/.test(issued) || !/^[a-z0-9]{6,16}$/.test(keyId) || !character(confirmer) || gv !== 'r' && gv !== 'w' && gv !== 'c' || tier !== 'c' && tier !== 'p' || !/^[1-9][0-9]{0,11}$/.test(certExp) || !canonicalBase64(sig,64) || !canonicalBase64(pub,32) || !canonicalBase64(certSig,64)) return refuse('invalid_membership_bundle');
    return Object.freeze({ issued:Number(issued), keyId, confirmer, gv, sig, pub, tier, certExp:Number(certExp), certSig });
  });
  return { requester, guild, faction, nonce, requestCode, tag, proofs };
}

/** Parse the actual OLB5 producer wire or its exact public-page QR URL/fragment.
 * No key, certificate, request ownership, replay, age or guild claim is verified
 * here. Even a structurally valid all-zero signature remains untrusted. */
export function parseLaunchQrCandidate227(input: unknown): UnverifiedLaunchQr227 {
  if (typeof input !== 'string' || new TextEncoder().encode(input).length > 8192) return refuse('invalid_qr_input');
  const text = input.trim();
  if (text.startsWith('OLCS2|') || text.startsWith('{')) return refuse('census_is_not_membership');
  if (/^(?:\/(?:oly|olympus)\s+discord\s+)?OLC2\./i.test(text)) return refuse('private_code_is_not_proof');
  let encoded: string | null = null;
  if (/^https?:\/\//i.test(text)) {
    let url: URL; try { url = new URL(text); } catch { return refuse('invalid_qr_url'); }
    if (url.origin + url.pathname !== LAUNCH_QR_PAGE227 || url.username || url.password || url.search || !url.hash.startsWith('#b=') || url.hash.includes('&')) return refuse('unsupported_qr_origin');
    encoded = url.hash.slice(3);
  } else if (!text.startsWith('OLB5~') && !text.startsWith('#b=') && !text.startsWith('b=')) return refuse('invalid_membership_bundle');
  if ((text.startsWith('#b=') || text.startsWith('b=')) && text.includes('&')) return refuse('invalid_membership_bundle');
  if (text.startsWith('#b=')) encoded = text.slice(3);
  else if (text.startsWith('b=')) encoded = text.slice(2);
  let wire = text;
  if (encoded !== null) {
    try { wire = decodeURIComponent(encoded.replace(/\+/g,' ')).trim(); } catch { return refuse('invalid_membership_bundle'); }
  }
  const bundle = parseWire(wire);
  const canonicalGuild = bundle.guild === bundle.guild.trim() ? canonicalOlympusGuildName(bundle.guild) : null;
  if (!canonicalGuild || bundle.faction !== 'Alliance') return refuse('unaffiliated_guild_or_faction');
  // Claimed-only evidence cannot satisfy the owner's launch membership rule,
  // even if a future verifier establishes that its signatures are genuine.
  if (!bundle.proofs.some(proof => proof.gv === 'r' || proof.gv === 'w')) return refuse('claimed_only_guild');
  const proofs = Object.freeze(bundle.proofs);
  return Object.freeze({ protocol: 'OLB5', producerCommit: LAUNCH_QR_PRODUCER227, wire, requester: bundle.requester,
    signedGuild: bundle.guild, canonicalGuild, faction: 'Alliance', nonce: bundle.nonce, requestCode: bundle.requestCode, tag: bundle.tag, proofs,
    trust: 'unverified_signed_claims', canGrantRoles: false, requesterGuid: null, nativeRank: null, realmGroup: null });
}
