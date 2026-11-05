/** Current guild affiliation names: the owner's 5 November 2026 launch instruction.
 * These labels resolve affiliation, not native authority. Keep the original native
 * guild/realm spelling in signed payloads, scope hashes and roster provenance.
 * Historical relay-v1 rows keep their original eleven-label wire contract.
 */
export const FLAGSHIP_GUILD_NAME = 'OLYMPUS PRIME' as const;
export const OLYMPUS_GUILD_NAMES = Object.freeze([
  FLAGSHIP_GUILD_NAME, 'Olympus II', 'Olympus III', 'Olympus IV', 'Olympus V',
  'Olympus VI', 'Olympus VII', 'Olympus VIII', 'Olympus IX', 'Olympus X',
] as const);
export type OlympusGuildName = typeof OLYMPUS_GUILD_NAMES[number];

const affiliations = new Map<string, OlympusGuildName>(
  OLYMPUS_GUILD_NAMES.map(name => [name.toLowerCase(), name]),
);
affiliations.set('olympus', FLAGSHIP_GUILD_NAME);
affiliations.set('olympus i', FLAGSHIP_GUILD_NAME);

/** Resolve a human-entered name without coercing arbitrary objects or guessing branches. */
export function canonicalOlympusGuildName(value: unknown): OlympusGuildName | null {
  if (typeof value !== 'string' || value.length > 96 || /[\x00-\x1f\x7f]/.test(value)) return null;
  return affiliations.get(value.trim().toLowerCase()) ?? null;
}

/** A native capture must keep its exact spelling; leading/trailing whitespace is invalid. */
export function isApprovedNativeGuildName(value: unknown): value is string {
  return typeof value === 'string' && value === value.trim() && canonicalOlympusGuildName(value) !== null;
}

export function isFlagshipGuildName(value: unknown): boolean {
  return canonicalOlympusGuildName(value) === FLAGSHIP_GUILD_NAME;
}

/** The flagship retains branch number I even though its current native name is PRIME. */
export function olympusGuildNumber(value: unknown): number | null {
  const canonical = canonicalOlympusGuildName(value);
  return canonical === null ? null : OLYMPUS_GUILD_NAMES.indexOf(canonical) + 1;
}
