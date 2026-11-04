import type { AppRow } from './site-core';
import { sha256 } from './account-generation-contracts';

export const ORDINARY_DECLINE_ANSWER_KEY = '_olympusOrdinaryDeclineV1';

/** Applicant-owned content only. Staff notes and decisions never enter a token
 * exposed to the applicant. The consuming SQL separately preserves those fields.
 * Exact raw answers make same-second edits distinct without another D1 column. */
export const APPLICATION_EDIT_FIELDS_219 = ['position','class_lead','backup1','backup2','fallback','character','char_key','class','role','region','avail','avail_tz','fit_na','fit_eu','board_at','answers','status','created_at','updated_at'] as const;
export const openApplication219 = (a: Pick<AppRow, 'status'> | null | undefined): boolean => !!a && (a.status === 'submitted' || a.status === 'reviewing');
export function applicationEditSnapshot219(a: AppRow): string {
  return JSON.stringify(APPLICATION_EDIT_FIELDS_219.map(key => a[key]));
}
export const applicationEditToken219 = (a: AppRow): Promise<string> => sha256('application-own-edit/v1\0' + applicationEditSnapshot219(a));
