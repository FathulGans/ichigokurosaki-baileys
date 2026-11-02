import type { AuthenticationState } from '../Types/index.js';
/**
 * stores the full authentication state (creds + all signal keys) in a single
 * WASM SQLite (sql.js) database file. Same one-file-for-everything shape as
 * useSingleFileAuthState, but backed by SQLite (one row per key) instead of a
 * single giant JSON blob — cheaper per-write since only the changed row(s) are
 * touched, no native build dependency required.
 *
 * Requires the optional `sql.js` package (`npm install sql.js`).
 * */
export declare const useSingleFileSQLJsAuthState: (filePath: string) => Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
}>;
