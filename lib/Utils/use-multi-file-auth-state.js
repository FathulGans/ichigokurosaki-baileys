import { Mutex } from 'async-mutex';
import { mkdir, readFile, rename, stat, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { proto } from '../../WAProto/index.js';
import { initAuthCreds } from './auth-utils.js';
import { BufferJSON } from './generics.js';
// We need to lock files due to the fact that we are using async functions to read and write files
// https://github.com/WhiskeySockets/Baileys/issues/794
// https://github.com/nodejs/node/issues/26338
// Use a Map to store mutexes for each file path
const fileLocks = new Map();
// Get or create a mutex for a specific file path
const getFileLock = (path) => {
    let mutex = fileLocks.get(path);
    if (!mutex) {
        mutex = new Mutex();
        fileLocks.set(path, mutex);
    }
    return mutex;
};
// `fileLocks` di atas ini level MODUL — dipakai bersama oleh SETIAP
// panggilan useMultiFileAuthState() di proses ini (bot utama + semua
// jadibot), dan sebelumnya entry-nya tidak pernah dihapus. Satu akun
// WhatsApp bisa gampang menyentuh ratusan-ribuan file berbeda (satu file
// signal session per kontak, satu per pre-key id, satu per sender-key per
// grup), jadi Map ini tumbuh terus tanpa batas seumur hidup proses — leak
// murni memori, terpisah dari isu Bad MAC. Dipanggil setelah setiap operasi
// lock selesai (di dalam finally masing-masing writeData/readData/
// removeData): kalau mutex sudah tidak dikunci lagi (berarti tidak ada
// antrean lain yang baru saja mengambil alih), entry-nya aman dihapus —
// panggilan berikutnya untuk path yang sama otomatis bikin Mutex baru lagi
// lewat getFileLock().
const releaseFileLockIfIdle = (path) => {
    const mutex = fileLocks.get(path);
    if (mutex && !mutex.isLocked()) {
        fileLocks.delete(path);
    }
};
/**
 * stores the full authentication state in a single folder.
 * Far more efficient than singlefileauthstate
 *
 * Again, I wouldn't endorse this for any production level use other than perhaps a bot.
 * Would recommend writing an auth state for use with a proper SQL or No-SQL DB
 * */
export const useMultiFileAuthState = async (folder) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writeData = async (data, file) => {
        const filePath = join(folder, fixFileName(file));
        const mutex = getFileLock(filePath);
        return mutex.acquire().then(async (release) => {
            try {
                // Sebelumnya nulis LANGSUNG ke filePath lewat writeFile().
                // writeFile bukan operasi atomik: kalau proses mati (OOM
                // kill, kill -9, restart paksa container) persis di
                // tengah-tengah syscall write, file target bisa berakhir
                // dalam kondisi kosong/terpotong separuh — bahkan tanpa ada
                // proses lain yang menulis bersamaan sama sekali. Mutex di
                // atas cuma mencegah tabrakan ANTAR write dalam proses yang
                // sama; tidak melindungi dari crash di tengah satu write
                // tunggal. File creds/session key yang rusak begini adalah
                // salah satu penyebab Bad MAC yang paling sering muncul
                // justru SETELAH restart, bukan saat ada dua proses aktif.
                // Pola tulis-ke-file-sementara-lalu-rename dipakai di sini
                // karena rename() dalam satu filesystem yang sama adalah
                // operasi atomik di level OS: begitu rename selesai, file
                // tujuan pasti berisi versi lama yang utuh atau versi baru
                // yang utuh — tidak pernah kondisi setengah jalan.
                const tmpPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
                await writeFile(tmpPath, JSON.stringify(data, BufferJSON.replacer));
                await rename(tmpPath, filePath);
            }
            finally {
                release();
                releaseFileLockIfIdle(filePath);
            }
        });
    };
    const readData = async (file) => {
        try {
            const filePath = join(folder, fixFileName(file));
            const mutex = getFileLock(filePath);
            return await mutex.acquire().then(async (release) => {
                try {
                    const data = await readFile(filePath, { encoding: 'utf-8' });
                    return JSON.parse(data, BufferJSON.reviver);
                }
                finally {
                    release();
                    releaseFileLockIfIdle(filePath);
                }
            });
        }
        catch (error) {
            return null;
        }
    };
    const removeData = async (file) => {
        try {
            const filePath = join(folder, fixFileName(file));
            const mutex = getFileLock(filePath);
            return mutex.acquire().then(async (release) => {
                try {
                    await unlink(filePath);
                }
                catch {
                }
                finally {
                    release();
                    releaseFileLockIfIdle(filePath);
                }
            });
        }
        catch { }
    };
    const folderInfo = await stat(folder).catch(() => { });
    if (folderInfo) {
        if (!folderInfo.isDirectory()) {
            throw new Error(`found something that is not a directory at ${folder}, either delete it or specify a different location`);
        }
    }
    else {
        await mkdir(folder, { recursive: true });
    }
    const fixFileName = (file) => file?.replace(/\//g, '__')?.replace(/:/g, '-');
    const creds = (await readData('creds.json')) || initAuthCreds();
    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(ids.map(async (id) => {
                        let value = await readData(`${type}-${id}.json`);
                        if (type === 'app-state-sync-key' && value) {
                            value = proto.Message.AppStateSyncKeyData.fromObject(value);
                        }
                        data[id] = value;
                    }));
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const file = `${category}-${id}.json`;
                            tasks.push(value ? writeData(value, file) : removeData(file));
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: async () => {
            return writeData(creds, 'creds.json');
        }
    };
};
//# sourceMappingURL=use-multi-file-auth-state.js.map