import { Mutex } from 'async-mutex';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { proto } from '../../WAProto/index.js';
import { initAuthCreds } from './auth-utils.js';
import { BufferJSON } from './generics.js';
/**
 * stores the full authentication state (creds + all signal keys) in a single JSON file.
 *
 * Simpler than useMultiFileAuthState (one file instead of hundreds), but every single
 * key mutation rewrites the *entire* file — fine for a small/low-traffic bot, gets
 * expensive fast once the session has a lot of signal keys (groups, app-state, etc).
 * Would recommend useMultiFileAuthState or one of the SQLite-backed variants for
 * anything beyond light use.
 * */
export const useSingleFileAuthState = async (filePath) => {
    const mutex = new Mutex();
    const readState = async () => {
        try {
            const raw = await readFile(filePath, { encoding: 'utf-8' });
            return JSON.parse(raw, BufferJSON.reviver);
        }
        catch {
            return null;
        }
    };
    const writeState = async (state) => {
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, JSON.stringify(state, BufferJSON.replacer));
    };
    const persist = async () => {
        return mutex.acquire().then(async (release) => {
            try {
                await writeState(data);
            }
            finally {
                release();
            }
        });
    };
    const existing = await readState();
    const data = existing?.creds
        ? existing
        : { creds: initAuthCreds(), keys: {} };
    if (!existing?.creds) {
        await persist();
    }
    return {
        state: {
            creds: data.creds,
            keys: {
                get: async (type, ids) => {
                    const bucket = data.keys[type] || {};
                    const result = {};
                    for (const id of ids) {
                        let value = bucket[id];
                        if (type === 'app-state-sync-key' && value) {
                            value = proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        result[id] = value;
                    }
                    return result;
                },
                set: async (newData) => {
                    for (const category in newData) {
                        data.keys[category] = data.keys[category] || {};
                        for (const id in newData[category]) {
                            const value = newData[category][id];
                            if (value) {
                                data.keys[category][id] = value;
                            }
                            else {
                                delete data.keys[category][id];
                            }
                        }
                    }
                    await persist();
                }
            }
        },
        saveCreds: async () => {
            await persist();
        }
    };
};
