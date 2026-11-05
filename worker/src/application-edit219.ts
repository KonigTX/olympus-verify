import type { AppRow } from './site-core';
import { sha256 } from './account-generation-contracts';

export const ORDINARY_DECLINE_ANSWER_KEY = '_olympusOrdinaryDeclineV1';
export const APPLICATION_OPENING_ANSWER_KEY = '_olympusApplicationOpeningV1';

export function storedApplicationOpening(answers: string): string | null {
  try {
    const value: unknown = JSON.parse(answers)?.[APPLICATION_OPENING_ANSWER_KEY];
    return typeof value === 'string' && /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(value) ? value : null;
  } catch {
    return null;
  }
}

/** Keep the applicant's exact content and edit clock. Staff labels for the
 * open application are equivalent here. RT16 compares its own full row.
 * Exact raw answers make same-second edits distinct without another D1 column. */
export const APPLICATION_EDIT_FIELDS_219 = ['position','class_lead','backup1','backup2','fallback','character','char_key','class','role','region','avail','avail_tz','fit_na','fit_eu','board_at','answers','status','created_at','updated_at'] as const;
export const openApplication219 = (a: Pick<AppRow, 'status'> | null | undefined): boolean => !!a && (a.status === 'submitted' || a.status === 'reviewing');
export const applicationEditValues219 = (a: AppRow, status = a.status === 'reviewing' ? 'submitted' : a.status) =>
  APPLICATION_EDIT_FIELDS_219.map(key => key === 'status' ? status : a[key]);
const editDigest = (values: ReturnType<typeof applicationEditValues219>): Promise<string> =>
  sha256('application-own-edit/v1\0' + JSON.stringify(values));
export const applicationEditToken219 = (a: AppRow): Promise<string> => editDigest(applicationEditValues219(a));

export async function matchesApplicationEditToken219(a: AppRow, token: unknown): Promise<boolean> {
  if (typeof token !== 'string' || token.length !== 64) return false;
  if (token === await applicationEditToken219(a)) return true;
  // A pre-release editor may still hold the original exact 'reviewing' digest.
  return openApplication219(a) && token === await editDigest(applicationEditValues219(a, 'reviewing'));
}
