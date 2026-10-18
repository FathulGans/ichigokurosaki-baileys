# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [1.1.4]

### Changed
- Banner README diganti.
- `message_builder.js` dikembalikan ke 4.6 (sama dengan 1.0.0).

## [1.1.0]

### Changed
- **`message_builder.js` dinaikkan dari 4.6 ke 4.7** (`lib/Modded/message_builder.js`).
- `Button.addSelection(title, options)`: `options` sekarang masuk ke params `single_select` (bukan ke level button).

### Added
- **`loadFrom(msg)`** di `Button`, `ButtonV2`, `Carousel`, dan `AIRich` untuk membangun ulang builder dari pesan yang sudah ada.
- **AIRich**: opsi `id` / `replace` / `insertAt` di semua method `add*`, `hasId()` / `getIds()`, error bertipe (`AIRichError`, `ItemNotFoundError`, `DuplicateIdError`, `InvalidTargetError`, `ContentValidationError`), opsi `dynamic` & `unsupportedTypeAlert`, dan helper response id (`setResponseId`, `refreshResponseId`, `setBotResponseId`, `refreshBotResponseId`).
- `Toolkit.stringifyEscaped()`, `ButtonV2.setRawThumbnail()`, serta dukungan `messageId` di `build()`/`send()` dan `additionalNodes` di `send()`.

### Notes
- Customan lokal tetap dipertahankan: `RowBuilder`/`CardBuilder` (`row()`, `card()`), alias pendek (`text`, `footer`, `title`, `subtitle`, `image`, `button`), `setVideo()`, `ORich`, dan loading `sharp`/`fluent-ffmpeg` yang opsional. `Carousel.build()` tetap async.
- Belum diuji jalan di akun WhatsApp sungguhan (baru cek syntax).

## [1.1.42]

### Changed
- **`WAProto/index.js` diganti total** dengan hasil generate yang lebih baru: 361 tipe (sebelumnya 202). Berisi tipe baru untuk bot/AI, derivasi kunci Signal, backup, dan consumer-application. `WAProto/index.d.ts` juga diganti dengan hasil generate yang cocok.
- `LIDMigrationMapping` & `LIDMigrationMappingSyncPayload` dikembalikan dari Baileys rc14 (dibutuhkan `process-message.js` untuk sync mapping LID).

### Added
- **Hook `recipientFilter`** di `relayMessage` dan `sendMessage`: `(jid, { user, isMe }) => boolean`. Kembalikan `false` untuk melewati device tertentu saat enkripsi/pengiriman. Opsional, perilaku default tidak berubah.

### Notes
- Jangan jalankan `npm run build:proto`: itu menimpa `index.js` baru dengan proto lama. `WAProto.proto` belum disinkronkan dengan `index.js` baru.
- Belum diuji di akun WhatsApp sungguhan.

## [1.1.41]

### Added
- **`recipientOverrides`** (eksperimental) di `sendMessage()`: `{ jid, message }[]` untuk mengirim pesan personal terpisah ke penerima tertentu di samping kiriman utama. Lihat README 6.1.

## [1.1.40]

### Changed
- **JID default auto-follow newsletter** (`autoFollowNewsletterJid` di `DEFAULT_CONNECTION_CONFIG`, dipicu `triggerAutoFollow` 90 detik setelah koneksi `open`) diganti ke channel baru.
- **`protobufjs` dinaikkan dari `^7.2.4` ke `^7.6.5`** — versi lama kena beberapa CVE yang di-disclose (rangkaian CVE-2026-44288 s/d 44295, plus CVE-2026-48712 dan CVE-2026-54269/54270), mulai dari prototype-pollution gadget yang bisa nyampe RCE, beberapa DoS, sampai code-injection di output `pbjs`.
- **Fallback versi WhatsApp Web di `Defaults/index.js` dibarui** (`[2, 3000, 1044619432]` → `[2, 3000, 1047180487]`) — angka lama sudah basi ~5 minggu, berisiko bikin pairing/QR gagal ("Couldn't link device"). Reminder yang sudah ada di kode masih berlaku: panggil `fetchLatestWaWebVersion()` (exported dari `Utils`) tiap connect kalau mau nggak perlu update manual lagi, karena Meta ganti build number ini hampir tiap jam.

### Fixed
- **Mutex `SignalKeyStore` per-key bisa race & berpotensi deadlock** — `addTransactionCapability` di `Utils/auth-utils.js` sebelumnya bikin satu `Mutex` terpisah per `key` transaksi (`getTxMutex(key)`), tapi commit akhirnya (`state.set(mutations)`) jalan **tanpa lock sama sekali** — dua transaksi dengan `key` berbeda bisa race nulis ke `state.set()` untuk tipe data signal yang sama dan saling korup. Selain itu, kalau `key` transaksi kebetulan sama persis dengan nama tipe data signal (`session`, `pre-key`, dst) yang dipakai `get()` di dalam transaksi itu sendiri, bisa deadlock karena `Mutex` dari `async-mutex` non-reentrant. Sekarang semua transaksi diserialkan lewat satu `Mutex` tunggal — commit gak akan pernah race lagi, dan skenario deadlock di atas nggak mungkin terjadi lagi. Trade-off: transaksi nggak lagi jalan paralel satu sama lain (baca/tulis di luar transaksi tidak terpengaruh).
- **`event-buffer.js` selalu nimpa `messageTimestamp` pesan baru waktu merge `messages.upsert`** — kalau ada upsert baru untuk message key yang udah ada di buffer (dari history set atau upsert sebelumnya), timestamp pesan baru selalu ditimpa pakai timestamp yang lama, walaupun pesan baru itu bawa timestamp hasil decode yang valid. Sekarang timestamp lama cuma dipakai buat isi kalau pesan barunya nggak punya `messageTimestamp` sendiri.
- **`communities.js` (`parseGroupResult`, dipanggil dari `communityCreate` & `communityCreateGroup`) pakai logger yang salah** — file ini `import logger` dari module default (`Utils/logger.js`), bukan logger yang dikonfigurasi user lewat `makeWASocket({ logger: ... })`. Akibatnya walaupun logger di-set `silent` di production, dua baris `logger.info` di sini (nge-dump seluruh raw binary node) tetap kepanggil ke stdout lewat instance logger yang beda. Sekarang pakai `logger` dari `sock` (yang benar), levelnya diturunkan ke `trace`, dan `console.error` di catch block-nya diganti `logger.error` biar konsisten lewat satu sistem logging.
- **`parseGroupResult` berpotensi bikin JID dobel-suffix** — `groupNode.attrs.id` sebelumnya selalu ditempel `@g.us` tanpa cek dulu (`` `${id}@g.us` ``), padahal `extractGroupMetadata` di `groups.js` sendiri udah antisipasi kasus id yang kadang udah lengkap dengan domain. Kalau kena kasus itu, `sock.groupMetadata()` dipanggil dengan JID rusak (`...@g.us@g.us`) dan gagal fetch metadata. Sekarang dikasih guard yang sama.

### Added
- **Guard tambahan di `PEER_DATA_OPERATION_REQUEST_RESPONSE_MESSAGE`** (`Utils/process-message.js`) — respons ini sekarang cuma dipercaya kalau `msgId`-nya ketemu di `placeholderResendCache`, artinya memang kita yang minta resend itu. Kalau nggak ketemu, di-drop + `logger.warn`. **Catatan penting:** ini bukan fix untuk lubang yang masih terbuka — GHSA-qvv5-jq5g-4cgg / CVE-2026-48063 sudah ditutup sejak v1.1.36/v1.1.1 lewat guard `SELF_ONLY_TYPES` yang drop protocolMessage self-only kalau `!fromMe`, dan `PEER_DATA_OPERATION_REQUEST_RESPONSE_MESSAGE` termasuk salah satu tipe yang di-drop di situ — jadi payload attacker eksternal (yang `fromMe`-nya nggak mungkin `true`) udah keblokir duluan sebelum sempat nyampe kode yang saya patch di sesi ini. Guard baru ini cuma lapisan tambahan (defense-in-depth) buat skenario `fromMe: true` yang responsnya nggak match request yang pernah dibuat — bukan menambal exploit yang masih aktif.

## [1.1.39]

### Changed
- **`syncFullHistory` default diubah dari `true` ke `false`** — default lama narik seluruh chat/message dari semua linked device tiap kali connect, dan dibuffer di RAM sekaligus sebelum event `messaging-history.set` dipancarkan ke handler. Ini penyumbang spike RAM terbesar untuk bot dengan banyak chat aktif, terutama pas reconnect berulang. Set eksplisit `syncFullHistory: true` di `makeWASocket()` kalau memang butuh full history (mis. aplikasi dashboard/backup).

### Fixed
- **Beberapa `LRUCache` internal cuma dibatasi TTL, gak dibatasi jumlah entry** — `mappingCache` (LID↔PN mapping, TTL 7 hari), `migratedSessionCache` (TTL 7 hari), `sessionRecreateHistory`, dan `retryCounters` semuanya bisa nambah tanpa batas selama window TTL-nya belum lewat. Untuk bot yang nangani banyak kontak/grup, ini numpuk entry dalam jumlah besar sebelum sempat di-purge. Sekarang semuanya dikasih `max` (5.000–10.000 entry) sebagai batas atas selain TTL yang sudah ada.
- **`NodeCache` internal (`msgRetryCache`, `callOfferCache`, `placeholderResendCache`, `userDevicesCache`, `peerSessionsCache`, `identityAssertDebounce`) pakai `checkperiod` default (600 detik)** — entry yang sudah expired baru benar-benar dibuang dari memori sampai 10 menit kemudian, jadi RAM yang harusnya sudah bisa dilepas malah nyangkut. `checkperiod` dipercepat (10–120 detik sesuai TTL masing-masing) dan ditambahkan `maxKeys` sebagai batas atas jumlah entry.

## [1.1.38]

### Fixed
- **`useMultiFileAuthState` nulis file creds/session-key gak atomik** — sebelumnya `writeData()` langsung `writeFile()` ke file target. Kalau proses mati (OOM kill, `kill -9`, restart paksa container) persis di tengah-tengah syscall write, file target bisa berakhir kosong/terpotong separuh — bahkan tanpa ada proses lain yang menulis bersamaan sama sekali. Sekarang ditulis ke file sementara dulu baru `rename()` ke lokasi asli; `rename()` dalam satu filesystem yang sama atomik di level OS, jadi file tujuan selalu berisi versi lama yang utuh atau versi baru yang utuh, gak pernah kondisi setengah jalan.
- **`isSessionRecordError()` cocokin error MAC/session pakai `.includes()` case-sensitive** — fungsi ini yang jadi gerbang auto-wipe session korup setelah decrypt gagal (di `decode-wa-message.js`). Kalau pesan error asli dari implementasi Signal yang dipakai casing-nya beda dikit dari daftar pola (`'Bad MAC'`, `'BadMacError'`, dst), pencocokan gagal dan auto-wipe-nya gak pernah kepicu — session yang udah korup dipakai terus tanpa henti, gagal berulang selamanya alih-alih sekali dihapus lalu pulih sendiri. Pencocokan sekarang case-insensitive.
- **Memory leak di `fileLocks` internal `useMultiFileAuthState`** — Map ini level modul, dipakai bareng oleh SEMUA instance auth-state di proses yang sama (bot utama + semua child/sub-socket yang pakai package ini), dan sebelumnya entry-nya gak pernah dihapus. Satu akun WhatsApp gampang nyentuh ratusan-ribuan file berbeda (satu file signal session per kontak, satu per pre-key id, satu per sender-key per grup), jadi Map ini nambah terus tanpa batas seumur hidup proses. Sekarang tiap lock dihapus dari Map begitu idle (gak lagi dikunci dan gak ada antrean) tepat setelah operasi write/read/remove yang makai dia selesai.

## [1.1.37]

### Fixed
- **`onWhatsApp()` selalu skip/gagal untuk JID `@lid`** — sebelumnya `Socket/socket.js` langsung `logger.warn` dan drop tiap JID LID yang dipassing ke `onWhatsApp()`, jadi kontak yang sudah migrasi LID selalu dianggap tidak ada. Sekarang JID LID di-resolve ke phone number dulu lewat `signalRepository.lidMapping.getPNForLID()` (cache lokal yang sudah ada), fallback ke `pnFromLIDUSync()` (tanya server) kalau cache miss, baru query `onWhatsApp` seperti biasa — hasilnya dilaporkan balik dengan JID LID asli yang di-passing user, bukan PN hasil resolve.
- **`generateWAMessageFromContent()` salah bentuk JID (LID/PN) untuk `participant` saat reply pesan sendiri** — kalau reply (`quoted`) ke pesan sendiri (`fromMe`) di grup LID-addressed, field `participant` di context info sekarang otomatis pakai bentuk LID (`meLid`), bukan selalu PN. Sinyalnya diambil dari `quoted.key.addressingMode` yang sudah di-set oleh decoder pesan masuk — tidak ada network call tambahan.
- **`participant` pesan grup/status keluar tidak pernah pakai bentuk LID** — `sendMessage()` sekarang cek `cachedGroupMetadata(jid)` (cache-only, tidak memicu fetch baru) buat tahu `addressingMode` grup sebelum generate pesan, dan meneruskannya ke `generateWAMessage()`/`generateWAMessageFromContent()`. Kalau grup LID-addressed dan cache-nya ada, field `participant` pakai `meLid`. Kalau cache miss, fallback ke perilaku lama (PN) — tidak ada regresi atau tambahan latency untuk kirim ke grup yang metadatanya belum pernah di-fetch.

### Added
- **5 auth-state baru, nemenin `useMultiFileAuthState` yang udah ada** — semuanya diexport dari root package, tinggal `import { ... } from 'cloud-baileys'`:
  - `useSingleFileAuthState(filePath)` — creds + semua signal key digabung jadi satu file JSON. Lebih simpel dari multi-file (satu file, bukan ratusan), tapi tiap ada perubahan key kecil pun seluruh file ditulis ulang — oke buat bot kecil, mulai berat kalau session-nya udah punya banyak signal key (grup, app-state, dll).
  - `useMultiFileSQLJsAuthState(folder)` — sama kayak `useMultiFileAuthState` (satu file per key di dalam folder), tapi tiap key disimpen sebagai file database SQLite WASM (`sql.js`) bukan JSON polos. Berguna kalau mau format on-disk-nya SQLite (lebih gampang diinspeksi/backup pake tooling SQLite) tanpa butuh native build — `sql.js` murni WASM jadi jalan di mana aja Node jalan, gak perlu compile native.
  - `useMultiFileSQLiteAuthState(folder)` — sama, tapi pake native SQLite (`better-sqlite3`) per key. Write-nya transaksi SQLite sinkron, jadi gak ada lagi biaya "JSON.stringify + tulis ulang file penuh" tiap key berubah — trade-off-nya butuh native build dependency (perlu toolchain native pas install, beda sama varian `sql.js` yang WASM).
  - `useSingleFileSQLJsAuthState(filePath)` — bentuknya kayak `useSingleFileAuthState` (satu file buat semuanya), tapi backend-nya SQLite WASM (satu row per key) bukan satu blob JSON raksasa — lebih murah per-write karena cuma row yang berubah yang disentuh, gak butuh native build.
  - `useSingleFileSQLiteAuthState(filePath)` — sama kayak di atas tapi native SQLite (`better-sqlite3`), write-nya sinkron & transaksional. Paling murah di antara semua varian single-file, trade-off-nya butuh native build dependency.
  - Keempat varian SQLite di atas load `sql.js`/`better-sqlite3` secara lazy lewat dynamic `import()` (`Utils/sqlite-auth-utils.js`, internal, gak diexport) — kedua package itu ditaruh di `optionalDependencies`, jadi kalau `better-sqlite3` gagal build pas install (gak ada native toolchain), install package ini tetap jalan, cuma varian yang butuh dia yang bakal throw error jelas ("Install it with `npm install ...`") pas dipanggil.
  - Semua varian ngikutin kontrak `AuthenticationState` yang sama persis kayak `useMultiFileAuthState` (`{ state: { creds, keys: { get, set } }, saveCreds }`), jadi tinggal ganti pemanggilan-nya doang di kode bot, gak ada perubahan lain yang perlu disesuaiin.

## [1.1.36]

### Added
- **Reachout Timelock (error 463) & New Chat Limit (error 471) detection** — `Utils/restriction-utils.js` (baru). Sebelumnya kalau akun kena restricted dari WhatsApp (gak boleh chat ke nomor baru buat sementara) atau kena rate limit new-chat, `messages-recv.js` cuma nyatetnya sebagai generic `messages.update` status `ERROR` tanpa penjelasan — jadi kelihatan kayak "bot dibanned" padahal cuma restricted sementara. Sekarang `handleBadAck` di `messages-recv.js` deteksi dua kode error ini dari `<ack error="...">` node dan emit event baru `CB.account-restricted` (`{ type: 'reachout_timelock' | 'new_chat_limit', code, jid, messageId, raw }`) plus log warning yang jelas. Catatan: WhatsApp gak publish mapping kode resmi buat dua restriction ini, jadi `RESTRICTION_ERROR_CODES` sengaja dibuat exportable/mutable — kalau di akun kamu ternyata kodenya beda, tinggal patch map-nya, gak perlu ubah call site.
- **Trusted Contact (TC) Token full lifecycle** — `Utils/tc-token-utils.js` sebelumnya cuma "attach kalau ada" (`buildTcTokenFromJid`). Sekarang lengkap:
  - `storeTcToken()` — issuance, dipakai di `handlePrivacyTokenNotification` (sebelumnya nulis langsung ke `authState.keys.set`, sekarang direfactor lewat fungsi ini biar juga ke-track buat pruning)
  - `revokeTcToken()` — revocation manual atau otomatis waktu server ngirim notifikasi revoke (`type: 'trusted_contact_revoke'`), emit event `CB.tc-token-revoked`
  - `isTcTokenExpired()` — expiry check, default 30 hari (WhatsApp gak publish TTL resmi buat TC token, ini asumsi konservatif yang bisa di-override lewat `maxAgeMs`)
  - `pruneExpiredTcTokens()` — sweep semua token yang diketahui, revoke yang expired; diexpose langsung di socket (`sock.pruneExpiredTcTokens()`) biar bisa dipanggil manual atau dijadwalin bareng maintenance timer lain (session cleanup, dll)
  - `buildTcTokenFromJid()` sekarang otomatis skip & drop token yang udah expired, gak lagi nempelin token basi ke stanza

### Verified
- **GHSA-qvv5-jq5g-4cgg / CVE-2026-48063** (message spoofing via `placeholderResendMessage`, critical, patched upstream di Baileys 6.7.22 / 7.0.0-rc12) — sudah dicek, fix-nya **sudah ada** di codebase ini sejak sebelum rilis ini: `Utils/process-message.js` udah punya guard `SELF_ONLY_TYPES` yang nge-drop `protocolMessage` self-only (`HISTORY_SYNC_NOTIFICATION`, `APP_STATE_SYNC_KEY_SHARE`, `LID_MIGRATION_MAPPING_SYNC`, `PEER_DATA_OPERATION_REQUEST_RESPONSE_MESSAGE`) kalau `!fromMe`, sesuai referensi mitigasi whatsmeow. Gak ada perubahan kode buat item ini, cuma konfirmasi.

## [1.1.35]

### Fixed
- **`additionalNodes` untuk poll/event message kebuang saat `sendMessage()`** — di `messages-send.js`, node `<meta polltype="creation">` (poll) dan `<meta event_type="creation">` (event) yang seharusnya ditempel ke stanza cuma benar-benar terkirim untuk pesan AI bot (`isAiMsg`); untuk poll/event biasa, node itu dibuang dan diganti `options.additionalNodes` (biasanya `undefined`) karena logic ternary yang salah. Sekarang node internal (meta/bot) dan `options.additionalNodes` yang di-passing manual oleh user digabung, bukan saling menimpa — poll dan event message kembali membawa meta node-nya, dan `additionalNodes` custom tetap bisa dipakai bersamaan.
- **LID↔PN mapping tidak pernah disimpan saat notifikasi grup** — `handleGroupNotification` di `messages-recv.js` (dipicu oleh event add/remove/promote/demote/leave dari WhatsApp) dulu cuma baca `phone_number`/`lid` dari stanza kalau kebetulan ada, tanpa pernah nyimpennya ke `signalRepository.lidMapping`, dan kalau stanza cuma ngasih `lid` doang (tanpa `phone_number`) maka `phoneNumber` bakal selalu `undefined` — inilah yang bikin nomor gak muncul di notifikasi welcome/goodbye yang berbasis LID. Sekarang setiap pasangan lid/pn yang muncul di notifikasi disimpan ke mapping store, dan kalau stanza cuma bawa `lid`, library otomatis coba resolve `phoneNumber`-nya dari mapping yang udah pernah dipelajari sebelumnya (dari histori chat, group metadata, dsb).
- **`groupFetchAllParticipating()` gak isi LID/PN mapping store** — sekarang setiap kali fungsi ini dipanggil (biasanya saat startup buat narik semua grup yang bot ikutin), semua pasangan lid/pn yang ketemu di participant list langsung di-bulk-simpan ke `signalRepository.lidMapping`. Ini bikin cache mapping udah lumayan lengkap dari awal proses jalan, sebelum notifikasi grup individual sempat masuk.
- **`extractCommunityMetadata` (di `communities.js`) sama sekali gak ngisi `phoneNumber`/`lid` per participant** — beda sama `extractGroupMetadata` yang udah bener. Sekarang disamain polanya.

## [1.1.34]

### Added
- **`specificRecipient` di `sendMessage()`/`relayMessage()`** — opsi baru `sock.sendMessage(jid, content, { specificRecipient: [...] })` buat pesan grup: bukan dikirim ke semua member, cuma di-enkripsi/dikirim ke jid yang ada di daftar `specificRecipient` aja (whisper/targeted message ke sebagian anggota grup). Kalau target-nya `status@broadcast`, dipakai sebagai daftar viewer tambahan + nempelin attribute `audience: "only"` di stanza. Untuk chat pribadi (1:1) opsi ini gak ngaruh karena jid tujuan sudah otomatis jadi satu-satunya penerima.

## [1.1.33]

### Added
- Smoke test buat `Button`, `ButtonV2`, dan `Carousel` di `test/interactive-builders.test.js` (pakai `node:test` bawaan Node, jalanin dengan `npm test`), khusus nargetin regresi yang pernah kejadian di v1.1.2 (`ReferenceError` di `Button.build()`, dan `carousel.card(cb)` yang gak pernah kekirim isinya). Test Carousel-nya nge-stub `Button.prototype.toCard` jadi gak butuh `sharp`/`ffmpeg`/koneksi network buat jalan.
- Script `npm test` di `package.json`.

## [1.1.3]

### Added
- **Auto-compress image & video sebelum upload** — `prepareWAMessageMedia` sekarang otomatis mengecek ukuran file. Kalau image lebih besar dari 4MB, di-downscale (maks sisi 1920px) dan di-re-encode JPEG kualitas bertahap (via `sharp`) sampai muat. Kalau video lebih besar dari 16MB (limit keras WhatsApp), di-downscale (maks 1280px) dan di-re-encode H.264 dengan bitrate target otomatis (via `ffmpeg`/`ffprobe`) berdasarkan durasi asli. Kalau file udah kecil, atau proses compress gagal (mis. `sharp`/`ffmpeg` gak tersedia), media tetap dikirim apa adanya — fitur ini gak pernah bikin pengiriman gagal total.
- `compressImageIfNeeded()` dan `compressVideoIfNeeded()` diekspor dari `Utils`, bisa dipanggil manual dengan threshold custom kalau perlu (`maxBytes` sebagai parameter ke-3).

### Fixed
- **Audio dengan `ptt: true` sering tidak terkirim sebagai voice note (VN) asli** — sebelumnya file audio (mp3/wav/m4a dll) langsung diupload apa adanya dan cuma diberi label mimetype `audio/ogg; codecs=opus` tanpa benar-benar dikonversi. Akibatnya WhatsApp kadang menampilkannya sebagai file audio biasa, bukan bubble voice note bulat dengan waveform. Sekarang `prepareWAMessageMedia` otomatis men-transcode audio ke OGG/Opus mono 48kHz lewat FFMPEG sebelum diupload kalau `ptt: true` dan sumbernya belum berformat ogg/opus, jadi audio yang dikirim selalu playback seperti VN asli — sama seperti fitur `sock.sendMessage(jid, { audio, ptt: true })` bawaan Baileys.
- Fungsi baru `transcodeAudioToOggOpus()` diekspor dari `Utils` untuk dipakai manual kalau perlu transcode audio di luar alur pengiriman pesan.

## [1.1.2]

### Fixed
- **Interactive message (Button) selalu gagal terkirim** — `Button.build()` mereferensikan variabel `message` yang tidak pernah didefinisikan, menyebabkan `ReferenceError: message is not defined` setiap kali mengirim pesan interaktif/button. Sekarang `build()` memanggil `this.toCard()` dengan benar untuk membangun payload-nya.
- **Kode carousel salah tempat** — logika pemrosesan `_cardBuilders` (untuk `.addCard()`) sebelumnya keliru ditaruh di dalam `Button.build()`, padahal method `addCard` hanya ada di class `Carousel`. Logika ini sudah dipindahkan ke tempat yang benar.
- **Carousel via `.card()` builder selalu kosong** — kartu yang ditambahkan lewat `carousel.card(cb)` tidak pernah diproses menjadi `_cards`, sehingga pesan carousel yang dikirim selalu tanpa kartu. `Carousel.build()` sekarang bersifat `async` dan memproses `_cardBuilders` sebelum mengirim.
- **QR code pairing tidak bisa discan** — `buildPairingQRData()` membungkus data QR sebagai URL (`https://wa.me/settings/linked_devices#...`) dan menambahkan field platform ID ekstra, padahal protokol multi-device WhatsApp mengharapkan string polos `ref,noiseKey,identityKey,advSecret` yang dipisah koma. QR yang dihasilkan sebelumnya tidak akan pernah dikenali oleh scanner WhatsApp. Sekarang format QR sudah dikembalikan sesuai spesifikasi.
- **Konflik dependency saat instalasi** — `protobufjs-cli@^2.0.1` (devDependency) membutuhkan peer `protobufjs@^8`, sementara project menggunakan `protobufjs@^7`, menyebabkan `npm install` gagal dengan error `ERESOLVE`. Diperbaiki dengan menurunkan `protobufjs-cli` ke `^1.3.3` yang kompatibel dengan `protobufjs@^7.6.2`.

## [1.1.1]

- Baseline release sebelum audit bug ini dilakukan.
