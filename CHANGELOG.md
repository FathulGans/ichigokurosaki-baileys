# Changelog

## [1.1.8]
- `message_builder.js` → 4.8-alpha: `AIRich` rebuilt on a node system (`id` / `replace` / `insertAt`, typed errors, `loadFrom`, `buildEdit` / `sendEdit`); new `add*` helpers; `Button`, `ButtonV2`, `Carousel` get `loadFrom` and `messageId` support.
- WhatsApp Web version fetched live at import, with fallback.
- Fixed `getUrlInfo` redirect limit; `downloadHistory` now streams.
- Added `close()` / `destroy()` cleanup when a socket ends.
- `music-metadata` → `^11.12.3`; removed unused `javascript-obfuscator`.

## [1.1.7]
- Removed auto-follow newsletter on connect.

## [1.1.42]
- New `WAProto/index.js` (361 types); added `recipientFilter` hook.

## [1.1.4]
- README banner changed; `message_builder.js` back to 4.6.

## [1.1.0]
- `message_builder.js` → 4.7; `loadFrom(msg)` and `AIRich` ids/editing added.

## [1.1.1] – [1.1.41]
- Bug fixes (Button/Carousel build, QR pairing, auth-state atomic writes, LID mapping, cache limits), extra auth-state variants, restriction and TC-token handling, auto-compress media. Full detail is in git history.
