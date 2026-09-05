import { isApiErrorCode, type ApiErrorCode } from './apiErrors';

type ErrorDictionary = Record<ApiErrorCode, string>;

/**
 * Turns anything thrown or returned by the API into a sentence safe to render.
 *
 * Only recognised codes produce a specific message; every other input — a raw
 * exception, a PostgreSQL string, a third-party response body — collapses to a
 * generic message. Raw text is never returned, by construction.
 */
export function errorText(errors: ErrorDictionary, raw: unknown): string {
  const candidate = raw instanceof Error ? raw.message : raw;

  if (isApiErrorCode(candidate)) {
    return errors[candidate];
  }

  // fetch() rejects with a TypeError when the server is unreachable.
  if (raw instanceof TypeError) {
    return errors.network;
  }

  return errors.unknown;
}
