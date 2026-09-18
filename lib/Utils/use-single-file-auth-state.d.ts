import type { AuthenticationState } from '../Types/index.js';
/**
 * stores the full authentication state (creds + all signal keys) in a single JSON file.
 *
 * Simpler than useMultiFileAuthState (one file instead of hundreds), but every single
 * key mutation rewrites the *entire* file — fine for a small/low-traffic bot, gets
 * expensive fast once the session has a lot of signal keys (groups, app-state, etc).
 * Would recommend useMultiFileAuthState or one of the SQLite-backed variants for
 * anything beyond light use.
 * */
export declare const useSingleFileAuthState: (filePath: string) => Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
}>;
