import type { AuthenticationState } from '../Types/index.js';
/**
 * stores the full authentication state (creds + all signal keys) in a single
 * native SQLite (better-sqlite3) database file. Same one-file-for-everything
 * shape as useSingleFileAuthState, but backed by SQLite (one row per key,
 * synchronous transactional writes) instead of a single giant JSON blob —
 * the cheapest single-file option of the bunch, at the cost of a native
 * build dependency.
 *
 * Requires the optional `better-sqlite3` package (`npm install better-sqlite3`).
 * */
export declare const useSingleFileSQLiteAuthState: (filePath: string) => Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
}>;
