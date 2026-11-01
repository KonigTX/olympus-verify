/** Review-only compatibility boundary for Daniel's 29 October 2026 draft.
 * Unmounted: no route, cron, database write, credential or activation is added.
 * This consumer cannot attest the relay's private deduplication/quorum evidence.
 */
export const RELAY_GUILDS_V1 = Object.freeze(['Olympus', 'Olympus I', 'Olympus II', 'Olympus III', 'Olympus IV', 'Olympus V', 'Olympus VI', 'Olympus VII', 'Olympus VIII', 'Olympus IX', 'Olympus X'] as const);
export const RELAY_POLICY_V1 = Object.freeze({ scope: 'forever-pve-alliance', charactersSeconds: 1800, onlineSeconds: 900, clockSkewSeconds: 5, maximumBytes: 16384, maximumCount: 1000, pollSeconds: 300, requestLifetimeSeconds: 60, finalized: false } as const);
const REASONS = ['not-observed', 'no-quorum', 'no-fresh-quorum', 'conflict', 'expired', 'revoked', 'deleted', 'withdrawn', 'complementary-small-group'] as const;
export interface SourceTime { notBefore: number; notAfter: number }
export type RelayMetric = { status: 'available'; value: number; precision: 'exact' | 'approximate'; sourceTime: SourceTime; validUntil: number }
  | { status: 'masked'; band: 'few'; precision: 'exact' | 'approximate'; sourceTime: SourceTime; validUntil: number }
  | { status: 'unavailable'; reason: typeof REASONS[number]; sourceTime: SourceTime | null };
export interface RelayRow { guild: typeof RELAY_GUILDS_V1[number]; source: 'companion-relay'; basis: 'own-roster'; characters: RelayMetric; online: RelayMetric }
export interface RelaySnapshot { schema: 'olympus-site-relay-feed'; version: 1; producer: 'olympus-relay/site.1'; sequence: number; generatedAt: number; complete: true; scope: { id: 'forever-pve-alliance'; mappingVersion: number; faction: 'Alliance' }; guilds: RelayRow[] }
export class RelayFeedRefusal extends Error { constructor(readonly code: string) { super(code); } }
function need(value: unknown, code: string): asserts value { if (!value) throw new RelayFeedRefusal(code); }
const integer = (v: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= min && v <= max;
function record(v: unknown): asserts v is Record<string, unknown> {
  need(v !== null && typeof v === 'object' && !Array.isArray(v) && [Object.prototype, null].includes(Object.getPrototypeOf(v)), 'invalid_object');
  need(Reflect.ownKeys(v).every(k => typeof k === 'string' && Object.hasOwn(Object.getOwnPropertyDescriptor(v, k) ?? {}, 'value')), 'non_data_object');
}
function keys(v: unknown, names: readonly string[]): asserts v is Record<string, unknown> {
  record(v); need(JSON.stringify(Object.keys(v).sort()) === JSON.stringify([...names].sort()), 'unknown_or_missing_keys');
  need(Reflect.ownKeys(v).length === names.length && names.every(n => Object.hasOwn(Object.getOwnPropertyDescriptor(v, n) ?? {}, 'value')), 'non_data_object');
}
function time(v: unknown, generatedAt: number): SourceTime {
  keys(v, ['notBefore', 'notAfter']);
  need(integer(v.notBefore, 1) && integer(v.notAfter, v.notBefore) && v.notAfter - v.notBefore <= 299 && v.notBefore <= generatedAt + RELAY_POLICY_V1.clockSkewSeconds, 'invalid_source_time');
  return { notBefore: v.notBefore, notAfter: v.notAfter };
}
function metric(v: unknown, kind: 'characters' | 'online', generatedAt: number, now: number): RelayMetric {
  record(v);
  if (v.status === 'unavailable') {
    keys(v, ['status', 'reason', 'sourceTime']);
    need(typeof v.reason === 'string' && (REASONS as readonly string[]).includes(v.reason), 'invalid_state');
    need(v.reason !== 'not-observed' || v.sourceTime === null, 'not_observed_time');
    const sourceTime = v.sourceTime === null && v.reason === 'not-observed' ? null : time(v.sourceTime, generatedAt);
    return { status: 'unavailable', reason: v.reason as typeof REASONS[number], sourceTime };
  }
  need(v.status === 'available' || v.status === 'masked', 'invalid_state');
  keys(v, v.status === 'available' ? ['status', 'value', 'precision', 'sourceTime', 'validUntil'] : ['status', 'band', 'precision', 'sourceTime', 'validUntil']);
  need(v.precision === 'exact' || v.precision === 'approximate', 'invalid_precision');
  const sourceTime = time(v.sourceTime, generatedAt), window = kind === 'characters' ? RELAY_POLICY_V1.charactersSeconds : RELAY_POLICY_V1.onlineSeconds;
  need(integer(v.validUntil, 1) && v.validUntil === sourceTime.notBefore + window && v.validUntil > now, 'expired_or_invalid_validity');
  if (v.status === 'masked') { need(v.band === 'few', 'invalid_mask'); return { status: 'masked', band: 'few', precision: v.precision, sourceTime, validUntil: v.validUntil }; }
  need(integer(v.value, 0, RELAY_POLICY_V1.maximumCount) && (v.value === 0 || v.value >= 5), 'unmasked_or_invalid_count');
  need(v.value !== 0 || v.precision === 'exact', 'zero_must_be_exact');
  return { status: 'available', value: v.value, precision: v.precision, sourceTime, validUntil: v.validUntil };
}
/** Parse data only, and return fresh owned objects. The caller never retains untrusted input references. */
export function validateRelaySnapshotV1(value: unknown, now: number, mappingVersion: number): RelaySnapshot {
  need(integer(now, 1) && integer(mappingVersion, 1), 'invalid_configuration');
  keys(value, ['schema', 'version', 'producer', 'sequence', 'generatedAt', 'complete', 'scope', 'guilds']);
  need(value.schema === 'olympus-site-relay-feed' && value.version === 1 && value.producer === 'olympus-relay/site.1' && value.complete === true, 'wrong_schema');
  need(integer(value.sequence, 1) && integer(value.generatedAt, 1, now + RELAY_POLICY_V1.clockSkewSeconds), 'invalid_snapshot_time_or_sequence');
  keys(value.scope, ['id', 'mappingVersion', 'faction']);
  need(value.scope.id === RELAY_POLICY_V1.scope && value.scope.faction === 'Alliance' && value.scope.mappingVersion === mappingVersion, 'unsupported_scope');
  need(Array.isArray(value.guilds) && value.guilds.length === RELAY_GUILDS_V1.length, 'incomplete_snapshot');
  const generatedAt = value.generatedAt;
  const guilds = value.guilds.map((row: unknown, i: number): RelayRow => {
    keys(row, ['guild', 'source', 'basis', 'characters', 'online']);
    need(row.guild === RELAY_GUILDS_V1[i] && row.source === 'companion-relay' && row.basis === 'own-roster', 'noncanonical_guild');
    const characters = metric(row.characters, 'characters', generatedAt, now), online = metric(row.online, 'online', generatedAt, now);
    need(characters.status === 'available' || online.status === 'unavailable', 'online_without_visible_characters');
    need(characters.status !== 'available' || characters.value !== 0 || online.status !== 'masked', 'online_above_total');
    if (characters.status === 'available' && online.status === 'available') {
      need(online.value <= characters.value, 'online_above_total');
      const remainder = characters.value - online.value;
      need(remainder === 0 || remainder >= 5, 'complementary_small_group');
    }
    return { guild: RELAY_GUILDS_V1[i]!, source: 'companion-relay', basis: 'own-roster', characters, online };
  });
  return { schema: 'olympus-site-relay-feed', version: 1, producer: 'olympus-relay/site.1', sequence: value.sequence, generatedAt, complete: true, scope: { id: RELAY_POLICY_V1.scope, mappingVersion, faction: 'Alliance' }, guilds };
}
/** JSON text must also reject duplicate keys: JSON.parse alone silently keeps the last value. */
function uniqueJson(text: string): unknown {
  let at = 0;
  const white = () => { while (/\s/.test(text[at] ?? '') && at < text.length) at++; };
  function string(): string {
    const start = at; need(text[at++] === '"', 'invalid_json');
    while (at < text.length) { const c = text[at++]; if (c === '"') return JSON.parse(text.slice(start, at)); if (c === '\\') at++; }
    throw new RelayFeedRefusal('invalid_json');
  }
  function value(depth: number): void {
    need(depth <= 12, 'excessive_json_depth'); white(); const c = text[at];
    if (c === '{') { at++; white(); const seen = new Set<string>(); if (text[at] === '}') { at++; return; } for (;;) { white(); const key = string(); need(!seen.has(key), 'duplicate_key'); seen.add(key); white(); need(text[at++] === ':', 'invalid_json'); value(depth + 1); white(); const end = text[at++]; if (end === '}') return; need(end === ',', 'invalid_json'); } }
    if (c === '[') { at++; white(); if (text[at] === ']') { at++; return; } for (;;) { value(depth + 1); white(); const end = text[at++]; if (end === ']') return; need(end === ',', 'invalid_json'); } }
    if (c === '"') { string(); return; }
    const token = /^(?:true|false|null|-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)/.exec(text.slice(at)); need(token, 'invalid_json'); at += token[0].length;
  }
  value(0); white(); need(at === text.length, 'invalid_json'); return JSON.parse(text);
}
export function decodeRelaySnapshotV1(body: Uint8Array, now: number, mappingVersion: number): RelaySnapshot {
  need(body.byteLength > 0 && body.byteLength <= RELAY_POLICY_V1.maximumBytes, 'body_limit');
  let value: unknown; try { value = uniqueJson(new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(body)); } catch (e) { if (e instanceof RelayFeedRefusal) throw e; throw new RelayFeedRefusal('invalid_json'); }
  return validateRelaySnapshotV1(value, now, mappingVersion);
}
export function relayMetricAtV1(metric: RelayMetric, now: number): RelayMetric {
  need(integer(now, 1), 'invalid_clock');
  return metric.status !== 'unavailable' && metric.validUntil <= now ? { status: 'unavailable', reason: 'expired', sourceTime: { ...metric.sourceTime } } : structuredClone(metric);
}
/** Expiry is evaluated at display time as well as receipt. Fresh online must not
 * outlive a hidden/expired character total and reveal a complementary group.
 */
export function relayRowAtV1(row: RelayRow, now: number): RelayRow {
  const characters = relayMetricAtV1(row.characters, now); let online = relayMetricAtV1(row.online, now);
  if (characters.status !== 'available' && online.status !== 'unavailable') online = { status: 'unavailable', reason: characters.status === 'unavailable' && characters.reason === 'expired' ? 'expired' : 'complementary-small-group', sourceTime: { ...online.sourceTime } };
  return { guild: row.guild, source: 'companion-relay', basis: 'own-roster', characters, online };
}
export interface RelayCacheV1 { etag: string; canonical: string; snapshot: RelaySnapshot; acquiredAt: number }
const strongEtag = (v: unknown): v is string => typeof v === 'string' && /^"[\x21\x23-\x7e]{1,180}"$/.test(v);
/** Complete 200s replace the candidate; a 304 neither refreshes nor resurrects it. Persistence is a future admitted caller's job. */
export function acceptRelayReplyV1(status: number, body: Uint8Array, etag: string | null, prior: RelayCacheV1 | null, now: number, mappingVersion: number): RelayCacheV1 {
  need(integer(now, 1) && strongEtag(etag), 'invalid_reply');
  if (prior) need(integer(prior.acquiredAt, 1, now) && strongEtag(prior.etag) && prior.canonical === JSON.stringify(validateRelaySnapshotV1(prior.snapshot, prior.acquiredAt, mappingVersion)), 'invalid_prior');
  if (status === 304) {
    need(prior && body.byteLength === 0 && etag === prior.etag && prior.snapshot.scope.mappingVersion === mappingVersion && now >= prior.acquiredAt, 'unexpected_304');
    need(prior.snapshot.guilds.every(row => [row.characters, row.online].every(m => m.status === 'unavailable' || m.validUntil > now)), 'expiry_requires_new_snapshot');
    return structuredClone(prior);
  }
  need(status === 200, 'upstream_unavailable');
  const snapshot = decodeRelaySnapshotV1(body, now, mappingVersion), canonical = JSON.stringify(snapshot);
  if (prior) {
    need(now >= prior.acquiredAt && snapshot.scope.mappingVersion === prior.snapshot.scope.mappingVersion && snapshot.sequence >= prior.snapshot.sequence && snapshot.generatedAt >= prior.snapshot.generatedAt, 'rollback');
    if (snapshot.sequence === prior.snapshot.sequence) need(canonical === prior.canonical && etag === prior.etag, 'same_sequence_changed');
    else need(etag !== prior.etag, 'changed_sequence_same_etag');
  }
  return { etag, canonical, snapshot, acquiredAt: prior?.snapshot.sequence === snapshot.sequence ? prior.acquiredAt : now };
}
/** Consume a response obtained by a future server-only, redirect-refusing caller.
 * The response is bounded before JSON decoding. No fetch or persistence occurs here.
 */
export async function consumeRelayResponseV1(response: Response, prior: RelayCacheV1 | null, now: number, mappingVersion: number, signal: AbortSignal = AbortSignal.timeout(8000)): Promise<RelayCacheV1> {
  try {
  need(!response.redirected && !response.headers.has('location') && !response.headers.has('set-cookie'), 'unexpected_transport');
  need(response.status === 200 || response.status === 304, 'upstream_unavailable');
  if (response.status === 200) need(/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(response.headers.get('content-type') ?? ''), 'wrong_content_type');
  const length = response.headers.get('content-length');
  if (length !== null) need(/^(0|[1-9][0-9]*)$/.test(length) && Number(length) <= RELAY_POLICY_V1.maximumBytes, 'body_limit');
  } catch (error) { if (response.body) void response.body.cancel().catch(() => {}); throw error; }
  const chunks: Uint8Array[] = [], reader = response.body?.getReader(); let size = 0, completed = false;
  let rejectAbort: ((reason: Error) => void) | undefined;
  const aborted = new Promise<never>((_, reject) => { rejectAbort = reject; });
  const abort = () => rejectAbort?.(new RelayFeedRefusal('response_timeout'));
  signal.addEventListener('abort', abort, { once: true });
  try {
    need(!signal.aborted, 'response_timeout');
    if (reader) for (;;) {
      const part = await Promise.race([reader.read(), aborted]);
      if (part.done) break; size += part.value.byteLength;
      need(size <= RELAY_POLICY_V1.maximumBytes, 'body_limit'); chunks.push(part.value);
    }
    completed = true;
    const body = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    return acceptRelayReplyV1(response.status, body, response.headers.get('etag'), prior, now, mappingVersion);
  } finally { signal.removeEventListener('abort', abort); if (reader) { if (!completed) void reader.cancel().catch(() => {}); reader.releaseLock(); } }
}
export interface DisplayCandidateV1 { source: 'manual' | 'companion-relay'; sourceTime: SourceTime; validUntil: number; available: boolean }
/** Select a whole source candidate, never merge totals/online from different sources. */
export function selectArmySourceV1(manual: DisplayCandidateV1 | null, relay: DisplayCandidateV1 | null, now: number): 'manual' | 'companion-relay' | null {
  need(integer(now, 1), 'invalid_clock');
  function candidate(v: DisplayCandidateV1 | null, expected: DisplayCandidateV1['source']): DisplayCandidateV1 | null {
    if (v === null) return null;
    keys(v, ['source', 'sourceTime', 'validUntil', 'available']);
    need(v.source === expected && typeof v.available === 'boolean' && integer(v.validUntil, 1), 'invalid_display_candidate');
    const sourceTime = time(v.sourceTime, now);
    need(v.validUntil > sourceTime.notBefore, 'invalid_display_candidate');
    return v.available && v.validUntil > now ? { source: expected, sourceTime, validUntil: v.validUntil, available: true } : null;
  }
  const m = candidate(manual, 'manual'), r = candidate(relay, 'companion-relay');
  if (!r) return m ? 'manual' : null; if (!m) return 'companion-relay';
  return r.sourceTime.notBefore > m.sourceTime.notAfter ? 'companion-relay' : 'manual';
}
export interface FeedRequestConfigV1 { enabled: boolean; contractFinalized: boolean; nativeMappingConfirmed: boolean; endpoint: string; kid: string; privateKey: CryptoKey }
const encode = (v: unknown) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(v)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
/** Request signer only, not a relay-side verifier or replay-store implementation. No ambient network or credential lookup. */
export async function createRelayRequestV1(config: FeedRequestConfigV1, now: number): Promise<{ authorization: string; target: string }> {
  need(config.enabled === true && config.contractFinalized === true && config.nativeMappingConfirmed === true, 'feed_disabled_or_unfinalized');
  need(integer(now, 1) && /^[A-Za-z0-9_-]{1,64}$/.test(config.kid), 'invalid_configuration');
  let url: URL; try { url = new URL(config.endpoint); } catch { throw new RelayFeedRefusal('invalid_endpoint'); }
  need(url.protocol === 'https:' && !url.username && !url.password && !url.hash && !url.port && url.pathname === '/companion/v1/site/aggregates' && url.search === '?v=1&scope=forever-pve-alliance' && url.href === config.endpoint, 'invalid_endpoint');
  need(config.privateKey?.type === 'private' && config.privateKey.algorithm.name === 'Ed25519' && config.privateKey.usages.includes('sign'), 'invalid_feed_key');
  const random = crypto.getRandomValues(new Uint8Array(16)), jti = Array.from(random, b => b.toString(16).padStart(2, '0')).join('');
  const header = encode({ alg: 'EdDSA', kid: config.kid, typ: 'olympus-feed-request+jwt' });
  const claims = encode({ v: 1, iss: 'olympus-site', aud: 'olympus-site-aggregates', iat: now, exp: now + RELAY_POLICY_V1.requestLifetimeSeconds, jti, htm: 'GET', htu: url.href, scope: RELAY_POLICY_V1.scope });
  const input = header + '.' + claims, signature = new Uint8Array(await crypto.subtle.sign('Ed25519', config.privateKey, new TextEncoder().encode(input)));
  const sig = btoa(String.fromCharCode(...signature)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return { authorization: 'Bearer ' + input + '.' + sig, target: url.href };
}
