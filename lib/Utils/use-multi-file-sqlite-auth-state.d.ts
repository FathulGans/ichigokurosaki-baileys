import type { AuthenticationState } from '../Types/index.js';
/**
 * stores the full authentication state in a folder, like useMultiFileAuthState,
 * but each key is its own native SQLite (better-sqlite3) database file instead
 * of a plain JSON file. Writes are synchronous SQLite transactions, which avoids
 * the "JSON.stringify + full file rewrite" cost per key on frequent updates —
 * at the cost of a native build dependency (needs a working native toolchain
 * on install, unlike the WASM-based sql.js variant).
 *
 * Requires the optional `better-sqlite3` package (`npm install better-sqlite3`).
 * */
export declare const useMultiFileSQLiteAuthState: (folder: string) => Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
}>;
