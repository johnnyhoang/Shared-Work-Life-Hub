/**
 * Stable, non-technical error codes exchanged between API routes and the UI.
 *
 * API routes return one of these codes instead of a raw exception message, so a
 * PostgREST/Supabase string ("new row violates row-level security policy for
 * table sw_tasks") can never reach a user's screen. The client maps the code to
 * a localized sentence via `t.errors`.
 *
 * Pure module: no server-only imports, safe to include in the client bundle.
 */
export const API_ERROR_CODES = [
  'unauthorized',
  'forbidden',
  'not_found',
  'invalid_request',
  'file_too_large',
  'storage_unavailable',
  'upload_failed',
  'delete_failed',
  'fetch_failed',
  'save_failed',
  'invite_failed',
  'member_update_failed',
  'workspace_create_failed',
  'github_user_not_found',
  'github_failed',
  'notify_failed',
  'notify_missing_config',
  'notify_unsupported',
  'network',
  'unknown',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

const CODE_SET: ReadonlySet<string> = new Set(API_ERROR_CODES);

export function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === 'string' && CODE_SET.has(value);
}
