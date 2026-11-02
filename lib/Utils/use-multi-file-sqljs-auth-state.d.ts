import type { AuthenticationState } from '../Types/index.js';
/**
 * stores the full authentication state in a folder, like useMultiFileAuthState,
 * but each key is its own WASM SQLite (sql.js) database file instead of a plain
 * JSON file. Useful when you want the on-disk format to be SQLite (e.g. easier
 * to inspect/back up with SQLite tooling) without a native build dependency —
 * sql.js is pure WASM, so it works anywhere Node runs, no native compilation.
 *
 * Requires the optional `sql.js` package (`npm install sql.js`).
 * */
export declare const useMultiFileSQLJsAuthState: (folder: string) => Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
}>;
