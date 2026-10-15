<div align="center">

<img src="https://cdn-ichigo.web.id/i/qo6FVYxPqL.jpg" alt="ichigokurosaki-baileys banner" width="100%" />

### Modded Baileys — Interactive Messages, AI Rich Responses, Albums & More

[![npm version](https://img.shields.io/npm/v/ichigokurosaki-baileys?color=CB3837&logo=npm&logoColor=white&style=for-the-badge)](https://www.npmjs.com/package/ichigokurosaki-baileys)
[![npm downloads](https://img.shields.io/npm/dm/ichigokurosaki-baileys?color=CB3837&logo=npm&logoColor=white&style=for-the-badge)](https://www.npmjs.com/package/ichigokurosaki-baileys)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-339933?logo=node.js&logoColor=white&style=for-the-badge)](https://nodejs.org)
[![ESM](https://img.shields.io/badge/ESM-only-F7DF1E?logo=javascript&logoColor=black&style=for-the-badge)](#)

---

**A modded build of [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys)**
with native support for interactive messages, album messages, unified rich responses, newsletter helpers, status mentions, and additional business/community utilities.

This repository is a **distribution/build repo** for `ichigokurosaki-baileys`.
It ships compiled runtime files in `lib/` and protobuf artifacts in `WAProto/`, and is intended to be consumed directly from npm or as a vendored dependency inside the **Cloud-MD** ecosystem.

</div>

---

## 🆕 Changelog / Updates

**v1.1.3**

- **Changed:** `message_builder.js` reverted to `4.6` (same as 1.0.0).
- **Changed:** `autoFollowNewsletterOnConnect` is now `false` by default (opt-in).

**v1.1.2**

- **Changed:** `message_builder.js` updated to `4.8-alpha`.
- **Removed:** `AIRich.generateVerificationMetadata()` (dummy signature / certificate chain) and its use in `botMetadata`.

**v1.1.1**

- **Changed:** `autoFollowNewsletterOnConnect` is now `false` by default (opt-in). Set it to `true` in the socket config to enable auto-follow.

**v1.1.0**

- **Changed:** `message_builder.js` upgraded from `4.6` to `4.7` (`lib/Modded/message_builder.js`).
- **Added:** `loadFrom(msg)` on `Button`, `ButtonV2`, `Carousel` and `AIRich` — rebuild a builder from an existing message so you can edit and resend it.
- **Added:** `AIRich` item ids and editing — `id` / `replace` / `insertAt` options on every `add*` method, plus `hasId()` / `getIds()` and typed errors (`AIRichError`, `ItemNotFoundError`, `DuplicateIdError`, `InvalidTargetError`, `ContentValidationError`).
- **Added:** `AIRich` options `dynamic` and `unsupportedTypeAlert`, response id helpers (`setResponseId`, `refreshResponseId`, `setBotResponseId`, `refreshBotResponseId`), and `Toolkit.stringifyEscaped()`.
- **Added:** `ButtonV2.setRawThumbnail()`; `build()` / `send()` now accept `messageId`, and `send()` accepts `additionalNodes`.
- **Changed:** `Button.addSelection(title, options)` now puts `options` inside the select params instead of the button object.
- **Kept:** `RowBuilder` / `CardBuilder` (`row()`, `card()`), the short aliases (`text`, `footer`, `title`, `subtitle`, `image`, `button`), `setVideo()`, `ORich`, and optional `sharp` / `fluent-ffmpeg` loading. `Carousel.build()` stays async.

**v1.1.42**

- **Changed:** `WAProto/index.js` (and `index.d.ts`) replaced with a newer generated build: 361 types (previously 202), including new types for bot/AI, Signal key derivation, backup and consumer-application. `LIDMigrationMapping` & `LIDMigrationMappingSyncPayload` were restored from Baileys rc14 because `process-message.js` needs them.
- **Added:** `recipientFilter` option in `sendMessage()`/`relayMessage()` — `(jid, { user, isMe }) => boolean`; return `false` to skip a device when encrypting/sending. Optional; default behavior is unchanged. See [7. Filtering Recipient Devices](#7-filtering-recipient-devices).
- **Note:** don't run `npm run build:proto` — it would overwrite the new `index.js` with the old proto. `WAProto.proto` is not yet synced with the new `index.js`.

**v1.1.41**

- **Added:** `recipientOverrides` option on `sendMessage()` (experimental) — `sock.sendMessage(jid, content, { recipientOverrides: [{ jid, message }, ...] })`, where `message` is a raw `WAMessageContent` object (e.g. `{ conversation: "..." }`). The main `content` still goes to `jid` exactly as before; each `{ jid, message }` pair additionally gets its own separate, personal message, since group broadcasts share one ciphertext for everyone and can't vary content per member natively. Same caution as `specificRecipient` below — experimental, avoid continuous/frequent use. See [6.1 Per-Recipient Content Overrides](#61-per-recipient-content-overrides).

**v1.1.40**

- **Changed:** default auto-follow newsletter JID (`autoFollowNewsletterJid`, triggered 90s after connection opens) updated.
- **Changed:** `protobufjs` bumped `^7.2.4` → `^7.6.5`, closing several disclosed CVEs (the CVE-2026-44288 through 44295 series, plus CVE-2026-48712 and CVE-2026-54269/54270) ranging from a prototype-pollution gadget that could reach RCE to multiple DoS and code-injection issues in `pbjs` output.
- **Changed:** bundled WhatsApp Web version fallback in `Defaults/index.js` refreshed (`[2, 3000, 1044619432]` → `[2, 3000, 1047180487]`) — the old build number had gone ~5 weeks stale, risking "Couldn't link device" pairing failures. As always, call `fetchLatestWaWebVersion()` (exported from `Utils`) at connect time instead of relying on this hardcoded fallback, since WhatsApp rotates it frequently.
- **Fixed:** `SignalKeyStore`'s per-key transaction mutex (`addTransactionCapability` in `Utils/auth-utils.js`) could let two transactions with different keys race on the final unlocked `state.set()` commit, and could deadlock if a transaction's `key` happened to collide with a signal data type name used by a `get()` inside that same transaction (`async-mutex` mutexes aren't reentrant). All transactions are now serialized through a single mutex, eliminating both issues at the cost of transactions no longer running concurrently with each other.
- **Fixed:** `event-buffer.js` unconditionally overwrote a new `messages.upsert`'s `messageTimestamp` with a stale buffered value when merging against an existing buffered/history-set entry, even when the new message already carried a valid decoded timestamp. It now only backfills from the buffered value when the new message has no timestamp of its own.
- **Fixed:** `communities.js`'s `parseGroupResult` (used by `communityCreate` / `communityCreateGroup`) imported the module-level default logger instead of the user-configured one from `makeWASocket({ logger: ... })`, so its `logger.info` calls (dumping full raw binary nodes) bypassed any logger configuration, including `silent`. It also used bare `console.error` in its catch block instead of the logger. Now uses the socket's own logger, logs the node dumps at `trace` instead of `info`, and routes errors through `logger.error`.
- **Fixed:** `parseGroupResult` always appended `@g.us` to `groupNode.attrs.id` without checking whether it was already a full JID (as `extractGroupMetadata` in `groups.js` already accounts for), which could produce a malformed double-suffixed JID (`...@g.us@g.us`) and fail the follow-up `groupMetadata()` fetch. Now guarded the same way.
- **Added:** extra correlation check in `Utils/process-message.js` — a `PEER_DATA_OPERATION_REQUEST_RESPONSE_MESSAGE` is now only trusted if its `msgId` matches an entry in `placeholderResendCache` (i.e. we actually requested that resend); otherwise it's dropped with a warning. **Note:** this is not a fix for an open vulnerability — GHSA-qvv5-jq5g-4cgg / CVE-2026-48063 was already closed as of v1.1.36/v1.1.1 by the `SELF_ONLY_TYPES` guard that drops self-only protocolMessage types (including this one) when `!fromMe`, so an external attacker's forged payload was already rejected before reaching the code touched here. This addition is defense-in-depth for the `fromMe: true` case where the response doesn't correlate to any request we made — not a patch for an active exploit.

**v1.1.38**

- **Fixed:** `useMultiFileAuthState` wrote creds/session-key files directly via `writeFile()`, which isn't atomic — if the process died (OOM kill, `kill -9`, forced container restart) mid-write, the target file could be left empty or truncated even with no concurrent writer at all. Writes now go to a temp file first, then `rename()` into place; a same-filesystem rename is atomic at the OS level, so the target file is always either the old, intact version or the new, intact version — never a half-written one.
- **Fixed:** `isSessionRecordError()` (used to auto-wipe a corrupted 1:1 session after a decrypt failure) matched known MAC/session-error strings with case-sensitive `.includes()`. Any casing variance in the underlying error message would silently skip the auto-recovery path entirely, leaving a corrupted session to fail decryption indefinitely instead of self-healing once. Matching is now case-insensitive.
- **Fixed:** memory leak in `useMultiFileAuthState`'s internal `fileLocks` map. It's module-scoped, so it's shared across every auth-state instance in the process (main bot + every child/sub-socket using the same package) and previously never removed an entry once created — one `Mutex` per unique file path (one per contact session, per pre-key id, per sender-key per group) accumulated for the lifetime of the process. Each lock is now dropped from the map once it's idle (not held and nothing queued), right after the write/read/remove that used it completes.

**v1.1.37**

- **Fixed:** `onWhatsApp()` always skipped/failed for `@lid` JIDs. It now resolves the LID to a phone number first via the local `lidMapping` cache, falling back to a server lookup (`pnFromLIDUSync`) on a cache miss, then reports the result back under the original LID the caller passed in.
- **Fixed:** replying to your own message (`fromMe`) in a LID-addressed group could tag the `participant` field with the wrong JID form. It now uses the addressing mode recorded on the quoted message to pick LID or PN correctly, with no extra network calls.
- **Fixed:** outgoing group/status messages didn't use the LID form for their `participant` field even when the group is LID-addressed. `sendMessage()` now checks cached group metadata (cache-only, no extra fetch) to pick the right form.
- **Fixed:** `npm test` script no longer worked on newer Node.js versions (`node --test test/` started throwing `MODULE_NOT_FOUND`) — changed to `node --test` so it auto-discovers test files.
- **Added:** 5 new auth-state helpers alongside the existing `useMultiFileAuthState`, all exported from the root package:
  - `useSingleFileAuthState(filePath)` — creds + all signal keys in a single JSON file.
  - `useMultiFileSQLJsAuthState(folder)` / `useSingleFileSQLJsAuthState(filePath)` — SQLite storage via WASM (`sql.js`), no native build required.
  - `useMultiFileSQLiteAuthState(folder)` / `useSingleFileSQLiteAuthState(filePath)` — native SQLite (`better-sqlite3`) with synchronous transactional writes.
  - All five follow the same `AuthenticationState` contract as `useMultiFileAuthState`, so swapping between them requires no other code changes. The SQLite variants are optional dependencies — if `better-sqlite3` fails to build, the rest of the package still installs fine.

**v1.1.36**

- **Added:** Reachout Timelock (error 463) and New Chat Limit (error 471) detection. Previously these showed up as an opaque `messages.update` `ERROR` status; now they're detected from the `<ack error="...">` node and emitted as a dedicated `CB.account-restricted` event with a clear warning log.
- **Added:** Full lifecycle for Trusted Contact (TC) tokens — issuance, manual/automatic revocation (`CB.tc-token-revoked` event), expiry checking (30-day default, overridable), and `sock.pruneExpiredTcTokens()` to sweep expired tokens.
- **Verified:** GHSA-qvv5-jq5g-4cgg / CVE-2026-48063 (message spoofing via `placeholderResendMessage`) — confirmed the guard against spoofed self-only `protocolMessage` types was already present in this codebase before this release. No code change needed for this item.

**v1.1.35**

- **Fixed:** `additionalNodes` for poll/event messages was silently dropped in `sendMessage()`. The `<meta polltype="creation">` (poll) and `<meta event_type="creation">` (event) nodes built internally were only actually sent for AI-bot messages (`isAiMsg`) — for regular polls/events they were discarded and replaced with `options.additionalNodes` (usually `undefined`) due to a faulty ternary. Internal nodes (meta/bot) and any user-supplied `options.additionalNodes` are now merged instead of overwriting each other, so polls and events carry their meta node again and custom `additionalNodes` can still be used alongside them.
- **Fixed:** LID↔PN mapping was never persisted on group notifications. `handleGroupNotification` in `messages-recv.js` (triggered by add/remove/promote/demote/leave events) only read `phone_number`/`lid` off the stanza when present, without ever saving the pair to `signalRepository.lidMapping` — so if a stanza only carried `lid` (no `phone_number`), `phoneNumber` was always `undefined`, which is why numbers never showed up in LID-based welcome/goodbye notifications. Every lid/pn pair seen in a notification is now saved to the mapping store, and if a stanza only carries `lid`, the library now automatically tries to resolve `phoneNumber` from previously-learned mappings (chat history, group metadata, etc.).
- **Fixed:** `groupFetchAllParticipating()` didn't populate the LID/PN mapping store. Every call now bulk-saves all lid/pn pairs found in the participant list to `signalRepository.lidMapping`, so the mapping cache is populated early (e.g. at startup) before individual group notifications arrive.
- **Fixed:** `extractCommunityMetadata` (in `communities.js`) didn't fill in `phoneNumber`/`lid` per participant at all, unlike `extractGroupMetadata` which already did this correctly. Behavior is now consistent between the two.

**v1.1.34**

- **Added:** `specificRecipient` option in `sendMessage()`/`relayMessage()` — `sock.sendMessage(jid, content, { specificRecipient: [...] })` for group messages: instead of sending to all members, the message is only encrypted/sent to the jids listed in `specificRecipient` (a targeted "whisper" message to a subset of the group). If the target is `status@broadcast`, it's used as an additional viewer list plus an `audience: "only"` attribute on the stanza. Has no effect for 1:1 chats since the destination jid is already the sole recipient.

**v1.1.33**

- **Added:** Smoke tests for the interactive message builders (`Button`, `ButtonV2`, `Carousel`) at `test/interactive-builders.test.js`, run via `npm test` (uses Node's built-in `node:test`, no extra dependency needed). These specifically guard against the v1.1.2 regressions — `Button.build()` throwing `ReferenceError: message is not defined`, and `carousel.card(cb)` never draining its builders into `_cards` — so a similar bug failing silently before release is less likely going forward. The `Carousel` test stubs `Button.prototype.toCard` so it runs without `sharp`/`ffmpeg` or network access.
- **Added:** `"test": "node --test test/"` script in `package.json`.

**v1.1.3**

- **Added:** Auto-compress image & video before upload. `prepareWAMessageMedia` now checks file size automatically — images over 4MB are downscaled (max 1920px) and re-encoded as JPEG at progressively lower quality (via `sharp`) until they fit; videos over 16MB (WhatsApp's hard limit) are downscaled (max 1280px) and re-encoded to H.264 with an auto-calculated target bitrate (via `ffmpeg`/`ffprobe`) based on the source duration. If a file is already small, or compression fails (e.g. `sharp`/`ffmpeg` unavailable), the original media is sent as-is — this step never causes a send to fail outright. New exports: `compressImageIfNeeded()`, `compressVideoIfNeeded()` (both accept an optional `maxBytes` override).
- **Fixed:** Audio sent with `ptt: true` often didn't render as a native voice note (VN) bubble. Previously the file was uploaded as-is with only the `audio/ogg; codecs=opus` mimetype label attached, without actually being encoded that way — so non-opus sources (mp3/wav/m4a) could show up as a regular audio file instead of a playable VN bubble with waveform. `prepareWAMessageMedia` now automatically transcodes to mono 48kHz OGG/Opus via `ffmpeg` before upload whenever `ptt: true` and the source isn't already ogg/opus, so PTT audio always plays back like a real voice note. New export: `transcodeAudioToOggOpus()`.

**v1.1.2**

- Fixed interactive message (Button) always failing to send: `Button.build()` referenced an undefined `message` variable, throwing `ReferenceError: message is not defined` on every send. `build()` now correctly calls `this.toCard()` to construct the payload.
- Fixed carousel card-processing logic being misplaced inside `Button.build()` instead of the `Carousel` class, where `.addCard()` actually lives. Moved to the correct location.
- Fixed carousels built via `carousel.card(cb)` always sending empty: cards added through the builder were never processed into `_cards`. `Carousel.build()` is now `async` and processes `_cardBuilders` before sending.
- Fixed QR pairing codes that could never be scanned: `buildPairingQRData()` was wrapping the QR payload as a URL (`https://wa.me/settings/linked_devices#...`) with an extra platform ID field, but WhatsApp's multi-device protocol expects a plain `ref,noiseKey,identityKey,advSecret` comma-separated string. QR generation now matches spec.
- Fixed an install-time dependency conflict: `protobufjs-cli@^2.0.1` (devDependency) required a peer of `protobufjs@^8`, while the project uses `protobufjs@^7`, causing `npm install` to fail with `ERESOLVE`. Downgraded `protobufjs-cli` to `^1.3.3`, compatible with `protobufjs@^7.6.2`.

**v1.1.1**

- Security fix: added guard against spoofed `protocolMessage` types (history sync notification, app state key share, LID migration mapping, PDO response) — these are now dropped unless they originate from your own device (`fromMe`), closing the message-spoofing/state-corruption exposure also patched upstream as GHSA-qvv5-jq5g-4cgg.
- Updated QR pairing to the newer format (`https://wa.me/settings/linked_devices#...` with companion platform ID) for improved pairing reliability, matching upstream Baileys.
- Fixed `companion_platform_id` sent during pairing-code login — it was using the wrong enum (`DeviceProps.PlatformType` instead of `CompanionWebClientType`), which mismatched the platform ID sent to WhatsApp's servers for any browser other than Chrome and could cause pairing to fail or behave inconsistently.

**v1.0.4**

- Fixed pairing code login failing with "Couldn't link device — An error occurred. Try again." The bundled default WhatsApp Web version number (used when you don't pass `version` explicitly) had gone stale, which WhatsApp now rejects during device linking. Bumped the fallback version in `Defaults` and `Utils/generics`.
- Reminder: WhatsApp rotates this build number often. For the most reliable pairing/QR login, call `fetchLatestWaWebVersion()` (exported by the package) before connecting and pass its result as `version` in `makeWASocket()`, instead of relying on the bundled default.
- Updated dependencies to their latest compatible versions: `@hapi/boom` ^10.0.1, `pino` ^10.3.1, `ws` ^8.21.3, `lru-cache` ^11.2.6, `p-queue` ^9.3.3, `whatsapp-rust-bridge` ^0.5.5.
- Fixed "Bad MAC" / session errors getting stuck in a permanent decryption-failure loop. Previously, a desynced or corrupted 1:1 session was detected (logged) but never actually cleared, so every retry kept failing the same way until the auth folder was deleted manually. Now, on a `Bad MAC`, `Invalid MAC`, or missing-session error, the corrupted session is automatically deleted so the next incoming message can re-establish a clean session from a fresh prekey message.
- Fixed a crash on every media upload (image/video/document/audio/sticker send): `Utils/messages-media.js` dynamically imported `axios` to upload files, but `axios` was never declared as a dependency, so `getWAUploadToServer()` would throw `Cannot find module 'axios'` on any environment that didn't happen to have it installed transitively. Replaced with the native `fetch()` already used elsewhere in the same file — no new dependency needed.
- Declared `long` (used directly by `Socket/messages-recv.js`) as an explicit dependency instead of relying on it being pulled in transitively through `protobufjs`.

**v1.0.1**

- Minor fixes and cleanup.

**v1.0.0**

- Initial release of `ichigokurosaki-baileys`, a rebranded and maintained build based on a modded Baileys v7 core.
- Built-in support for interactive messages, album messages, unified rich responses, newsletter helpers, and status mentions.
- Built-in VoIP (Voice Call) engine — full integration of WebRTC and WASM to enable native WhatsApp voice calling, no separate package needed.
- Robust handling for View Once messages (`viewOnceMessageV3` & `ptvMessage`) to avoid socket crashes when media content isn't available.
- Decryption retry handling in `messages-recv.js` for "Bad MAC" errors, combined with a proper `getMessage` hook for seamless retries.
- Browser parameter spoofing set to MacOS to help avoid Error 405 (Method Not Allowed) during pairing.

**AI Rich Implementation (`ORich`)**

- Added the `ORich` class (an extension of `AIRich` from `message_builder.js`) to generate stunning AI response layouts easily.
- **Example Usage:**

  ```javascript
  import { ORich } from 'ichigokurosaki-baileys';

  const cloud = new ORich(sock)
    .addText('Hello from ORich AI!')
    .addSuggest(['Tell me more', 'Next']);
  
  await cloud.send(jid);
  ```

---

## Table of Contents

- [ichigokurosaki-baileys](#ichigokurosaki-baileys)
  - [Modded Baileys v7 — Interactive Messages, AI Rich Responses, Albums & More](#modded-baileys-v7--interactive-messages-ai-rich-responses-albums--more)
  - [Table of Contents](#table-of-contents)
  - [✨ Features](#-features)
  - [✅ Requirements](#-requirements)
  - [🗂️ What’s Inside This Repo](#-whats-inside-this-repo)
  - [📦 Installation](#-installation)
    - [From NPM](#from-npm)
    - [Using Alias (Recommended for Cloud-MD Bots)](#using-alias-recommended-for-cloud-md-bots)
  - [🛠️ Quick Start](#️-quick-start)
    - [1. Project Setup](#1-project-setup)
    - [2. Install Dependencies](#2-install-dependencies)
    - [3. Create `index.js`](#3-create-indexjs)
    - [4. Run](#4-run)
    - [5. Pairing Code Example](#5-pairing-code-example)
  - [🏗️ Architecture](#️-architecture)
    - [Socket Layer Chain](#socket-layer-chain)
    - [Key Modules](#key-modules)
    - [Build Repo Layout](#build-repo-layout)
    - [Connection Flow](#connection-flow)
  - [📡 Socket API Reference](#-socket-api-reference)
    - [Connection \& Authentication](#connection--authentication)
    - [VoIP (Voice Calls)](#voip-voice-calls)
    - [Message Sending](#message-sending)
    - [Interactive Messages](#interactive-messages)
    - [Album Messages](#album-messages)
    - [AI Rich Response Messages](#ai-rich-response-messages)
    - [Code Block V2 (Unified Response)](#code-block-v2-unified-response)
    - [Other Message Types](#other-message-types)
    - [Newsletter Methods](#newsletter-methods)
    - [Group Methods](#group-methods)
    - [Community Methods](#community-methods)
    - [Business Methods](#business-methods)
    - [Chat \& Profile Methods](#chat--profile-methods)
    - [Privacy Settings](#privacy-settings)
  - [📡 Event Reference](#-event-reference)
  - [🔧 Utility Exports](#-utility-exports)
  - [🏗️ Building This Package](#️-building-this-package)
    - [Running Tests](#running-tests)
  - [🔀 Differences from Official Baileys](#-differences-from-official-baileys)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)

---

## ✨ Features

| Feature                     | Description                                                                            | Status |
| --------------------------- | -------------------------------------------------------------------------------------- | ------ |
| **VoIP Voice Calls**        | Native VoIP engine (WASM/WebRTC) via `VoipClient`, single shared socket                | ✅     |
| **Interactive Messages**    | Native flow buttons, list/select menus, button wrappers, carousel support via `Dugong` | ✅     |
| **Album Messages**          | Multi-image/video album relay with count metadata and grouped delivery                 | ✅     |
| **Rich Response Helpers**   | `sendTable`, `sendList`, `sendCodeBlock`, `sendRichMessage`, `sendUnifiedResponse`     | ✅     |
| **Unified Response V2**     | `sendTableV2`, `sendCodeBlockV2`, `sendLinkV2` with Meta-AI-style unified sections     | ✅     |
| **Link Messages**           | Rich inline links with citations, proofs, and forwarded bot context                    | ✅     |
| **Latex Rendering Hooks**   | `sendLatex`, `sendLatexImage`, `sendLatexInlineImage` helper APIs                      | ✅     |
| **Payment Messages**        | Request payment messages with note/sticker support                                     | ✅     |
| **Product / Catalog**       | Business product messages, catalog fetch/create/update/delete, cover photo helpers     | ✅     |
| **Event / Poll Result**     | Event message builders and poll result snapshots                                       | ✅     |
| **Newsletter Extras**       | URL resolve, metadata fetch, create/update, bulk follow, admin utilities, live updates | ✅     |
| **Communities & Groups**    | Community CRUD, linked groups, invite workflows, join approval, labels                 | ✅     |
| **Status Mention**          | `sendStatusMention()` helper to mention users/groups in status flows                   | ✅     |
| **LID & Session Handling**  | LID↔PN mapping, session migration, retry/session recreation helpers                    | ✅     |
| **Build Output Ready**      | Published runtime in `lib/` and protobuf artifacts in `WAProto/`                       | ✅     |
| **TypeScript Declarations** | Included `.d.ts` files for exported APIs and socket methods                            | ✅     |

---

## ✅ Requirements

- **Node.js** `>= 20.0.0`
- **ESM project** (`"type": "module"` in your `package.json`)
- A persistent auth store implementation for production use
- Optional helpers depending on your use case:
  - `pino` for logging
  - `qrcode-terminal` if you want to render QR codes in the terminal yourself
  - `sharp`, `jimp`, `audio-decode`, `link-preview-js` for optional media/rich utilities

> [!IMPORTANT]
> `ichigokurosaki-baileys` is **ESM-only**. CommonJS projects will need migration or dynamic import wrappers.

---

## 📁 What’s Inside This Repo

This package is not the TypeScript source workspace. It contains the compiled distributable files you actually publish/use.

| Path                  | Purpose                                                |
| --------------------- | ------------------------------------------------------ |
| `lib/`                | Main compiled runtime, types, socket layers, utilities |
| `WAProto/`            | Generated protobuf runtime and typings                 |
| `package.json`        | Published package metadata, dependencies, build script |
| `tsconfig.json`       | TypeScript config used for authoring/build pipeline    |
| `tsconfig.build.json` | Build-specific TS emit config targeting `lib/`         |
| `proto-extract/`      | Protobuf-related extraction/build assets               |

If you are documenting or integrating this project, treat `lib/index.js` and `lib/index.d.ts` as the primary public surface.

---

## 📦 Installation

### From NPM

```bash
npm install ichigokurosaki-baileys
```

Recommended companion packages for examples in this README:

```bash
npm install pino qrcode-terminal
```

### Using Alias (Recommended for Cloud-MD Bots)

Add to `package.json`:

```json
{
  "dependencies": {
    "cloud": "npm:ichigokurosaki-baileys@latest"
  }
}
```

Then run:

```bash
npm install
```

> [!TIP]
> Using the alias `cloud` allows you to `import cloud from 'cloud'` without changing existing code.

> [!NOTE]
> Peer dependencies such as `sharp`, `jimp`, `audio-decode`, and `link-preview-js` are optional. Install only what your bot features need.

---

## 🛠️ Quick Start

### 1. Project Setup

```bash
mkdir my-bot && cd my-bot
npm init -y
```

Ensure `package.json` has `"type": "module"`:

```json
{
  "name": "my-bot",
  "type": "module",
  "dependencies": {
    "cloud": "npm:ichigokurosaki-baileys@latest"
  }
}
```

> [!IMPORTANT]
> **Required**: `"type": "module"` — ichigokurosaki-baileys is ESM-only. Without this, imports will fail.

### 2. Install Dependencies

```bash
npm install ichigokurosaki-baileys pino qrcode-terminal
```

### 3. Create `index.js`

```js
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
} from "ichigokurosaki-baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";

const logger = pino({ level: "silent" });

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger,
    browser: Browsers.ubuntu("Chrome"),
    syncFullHistory: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    }
    if (connection === "open") console.log("Connected!");
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation || msg.message.extendedTextMessage?.text || "";

    if (text === ".ping") {
      await sock.sendMessage(msg.key.remoteJid, { text: "Pong!" });
    }
  });
}

startBot();
```

### 4. Run

```bash
node index.js
```

Scan the QR code, wait until the socket reaches `connection: "open"`, then send `.ping` to test.

### 5. Pairing Code Example

If you prefer pairing code over QR:

```js
import { fetchLatestWaWebVersion } from "ichigokurosaki-baileys";

// WhatsApp rotates its web build number frequently. Fetching it live avoids
// "Couldn't link device — An error occurred" caused by a stale bundled default.
const { version } = await fetchLatestWaWebVersion({});

const sock = makeWASocket({
  auth: state,
  logger,
  version,
  browser: Browsers.windows("Chrome"),
});

sock.ev.on("connection.update", async ({ connection }) => {
  if (connection === "connecting") {
    const code = await sock.requestPairingCode("6281234567890");
    console.log("Pairing code:", code);
  }
});
```

You can also provide your own custom pairing code:

```js
const code = await sock.requestPairingCode("6281234567890", "A1B2C3D4");
console.log("Custom pairing code:", code);
```

Custom pairing codes must be exactly `8` characters.

> [!WARNING]
> `printQRInTerminal` still exists in the type surface for compatibility, but it is **deprecated** in the current build. Prefer handling the `qr` value from `connection.update` yourself.

### 6. Sending a Targeted ("Whisper") Group Message

New in `v1.1.34`: send a group message that's only encrypted/delivered to a subset of members, instead of the whole group.

```js
await sock.sendMessage(groupJid, { text: "Hey, just you two" }, {
  specificRecipient: ["628123456789@s.whatsapp.net", "628987654321@s.whatsapp.net"],
});
```

- Has no effect on 1:1 chats — the destination jid is already the sole recipient.
- If the target is `status@broadcast`, it's treated as an extra viewer list and the stanza gets an `audience: "only"` attribute.

### 6.1 Per-Recipient Content Overrides

`sendMessage()` also accepts `recipientOverrides`: an array of `{ jid, message }` pairs for sending different content to specific people, alongside a normal (group or 1:1) send. Note `message` here is a raw `WAMessageContent` object (e.g. `{ conversation: "..." }`), not the friendly `sendMessage()` shorthand (e.g. `{ text: "..." }`) — it's passed straight through to `relayMessage()`.

```js
await sock.sendMessage(groupJid, { text: "Hi everyone!" }, {
  recipientOverrides: [
    {
      jid: userJid,
      message: { conversation: "🔒 This text only shown on specific user" },
    },
  ],
});
```

- The main `content` still goes out to `jid` exactly as normal — this option never changes that send.
- Each `jid` in `recipientOverrides` instead receives its own separate, personal message built from its own `message`.
- WhatsApp group messages are encrypted once for the whole group (sender-key), so there's no protocol-level way to give individual members different content *inside* one group broadcast — that's why overrides are delivered as separate personal messages rather than folded into the group send.

> [!CAUTION]
> **Experimental Features:** `recipientOverrides` and `specificRecipient` are still experimental and strongly discouraged for continuous or frequent use. These features may cause session instability or potentially break/corrupt the Baileys session, especially when used excessively.
>
> Please use these features only when necessary and at your own risk. If these features are found to cause widespread or significant issues, they may be removed or withdrawn in a future release.

> [!NOTE]
> Currently only available on `sendMessage()`. The other helpers in [📨 Sending Messages](#sending-messages) (`sendTable`, `sendList`, `sendCodeBlock`, `sendLink`, `sendRichMessage`, etc.) don't accept `recipientOverrides` yet.

---

### 7. Filtering Recipient Devices

Added in `v1.1.42`: decide per device whether it should receive the message.

```js
await sock.sendMessage(jid, { text: "Hello" }, {
  // return false to skip that device
  recipientFilter: (deviceJid, { user, isMe }) => !isMe,
});
```

- `deviceJid` is the individual device JID; `isMe` is `true` for your own other devices.
- Works for 1:1, group and status sends. If omitted, nothing changes.

---

## 🏗️ Architecture

### Socket Layer Chain

Each socket layer extends the previous via composition, adding functionality from bottom to top:

```
makeSocket          → WebSocket + Noise protocol + pre-key management
  makeChatsSocket   → App state sync + chat modifications + profile
    makeGroupsSocket → Group CRUD + participant management
      makeMessagesSendSocket → Message sending + rich messages + relay
        makeMessagesRecvSocket → Message receiving + decryption + notifications
          makeBusinessSocket   → Product catalog + business profile
            makeCommunitiesSocket → Community CRUD + sub-groups
              makeNewsletterSocket → Newsletter follow/unfollow/metadata
                makeWASocket      ← TOP LEVEL EXPORT
```

### Key Modules

| Module       | Path            | Description                                                      |
| ------------ | --------------- | ---------------------------------------------------------------- |
| **Socket**   | `lib/Socket/`   | Connection, messaging, groups, newsletter, business, communities |
| **Signal**   | `lib/Signal/`   | Signal protocol: 1:1 encryption, group SenderKey, LID mapping    |
| **WABinary** | `lib/WABinary/` | Binary node encoding/decoding, JID utilities                     |
| **Utils**    | `lib/Utils/`    | Crypto, auth state, noise handler, rich messages, media          |
| **WAProto**  | `WAProto/`      | Compiled protobuf encode/decode                                  |
| **WAUSync**  | `lib/WAUSync/`  | User sync protocol (contact, device, LID)                        |
| **WAM**      | `lib/WAM/`      | WhatsApp analytics binary encoding                               |
| **Types**    | `lib/Types/`    | Full TypeScript type definitions                                 |

### Build Repo Layout

This repository does **not** currently expose a `src/` directory in the checked-in package tree.

That means:

- Documentation should reference **`lib/` as the public implementation**
- API discovery is best done through:
  - `lib/index.js`
  - `lib/index.d.ts`
  - `lib/Socket/*.d.ts`
  - `lib/Utils/*.d.ts`
- Consumers should treat this repo as a **ready-to-install runtime artifact**, not the authoring source tree

### Connection Flow

1. WebSocket connect → Noise XX handshake (Curve25519 + AES-256-GCM)
2. QR code or Pairing Code authentication
3. `CB:success` → upload pre-keys → send passive IQ → emit `connection: 'open'`
4. Store own LID↔PN mapping, migrate own session
5. Buffer events → process offline notifications → flush → `receivedPendingNotifications: true`

---

## 📡 Socket API Reference

### Connection & Authentication

```js
const sock = makeWASocket({
  auth: state, // AuthenticationState from useMultiFileAuthState
  logger, // pino logger instance
  browser: Browsers.ubuntu("Chrome"), // Browser identity
  version: [2, 3000, 1035194821], // WA version
  connectTimeoutMs: 20_000, // Connection timeout
  defaultQueryTimeoutMs: 60_000, // Query timeout
  retryRequestDelayMs: 250, // Retry delay
  maxMsgRetryCount: 5, // Max message retry count
  enableRecentMessageCache: true, // Enable message retry manager
  enableAutoSessionRecreation: true,
  syncFullHistory: false, // Sync full chat history
  shouldIgnoreJid: (jid) => false, // Filter specific JIDs
  qrTimeout: 60_000,
  generateHighQualityLinkPreview: false,
});
```

**Pairing Code Authentication:**

```js
const sock = makeWASocket({
  auth: state,
  logger,
  browser: Browsers.windows("Chrome"),
});

sock.ev.on("connection.update", async ({ connection, qr, isNewLogin }) => {
  if (qr) {
    // QR code available (fallback)
  }
});

// Request pairing code
const code = await sock.requestPairingCode("6281234567890");
console.log("Pairing code:", code); // e.g. "A1B2-C3D4"
```

**Authentication State:**

```js
import { useMultiFileAuthState } from "ichigokurosaki-baileys";

const { state, saveCreds } = await useMultiFileAuthState("./session");
// state.creds → credentials (me, platform, noise keys, etc.)
// state.keys → SignalKeyStore (pre-keys, sessions, identity keys, etc.)
// saveCreds() → persist credentials to disk
```

**Custom Data Store / Memory Store Pattern:**

```js
import {
  BufferJSON,
  initAuthCreds,
  makeCacheableSignalKeyStore,
} from "ichigokurosaki-baileys";

const credsStore = new Map();
const keyStoreData = new Map();

const creds = credsStore.get("creds") || initAuthCreds();

const keys = makeCacheableSignalKeyStore({
  get: async (type, ids) => {
    const data = {};
    for (const id of ids) {
      data[id] = keyStoreData.get(`${type}:${id}`);
    }
    return data;
  },
  set: async (data) => {
    for (const category in data) {
      for (const id in data[category]) {
        const value = data[category][id];
        const key = `${category}:${id}`;
        if (value == null) keyStoreData.delete(key);
        else keyStoreData.set(key, value);
      }
    }
  },
});

const state = { creds, keys };

const saveCreds = async () => {
  credsStore.set(
    "creds",
    JSON.parse(
      JSON.stringify(state.creds, BufferJSON.replacer),
      BufferJSON.reviver,
    ),
  );
};
```

This package does **not** currently ship a built-in `makeInMemoryStore()` helper.

Use these patterns instead:

- `useMultiFileAuthState()` for bot/local usage
- `initAuthCreds()` + custom `SignalKeyStore` for DB/Redis/in-memory persistence
- `makeCacheableSignalKeyStore()` when you want faster repeated key access with caching

> [!WARNING]
> `useMultiFileAuthState()` is convenient for bots and local testing, but the package itself warns against using it as your long-term production persistence layer. For production, write your own SQL/NoSQL-backed auth store.

**Useful companion helpers:**

```js
import {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from "ichigokurosaki-baileys";

const { version, isLatest } = await fetchLatestBaileysVersion();
console.log(version, isLatest);
```

---

### VoIP (Voice Calls)

Modul VoIP kini terintegrasi langsung di `ichigokurosaki-baileys` menggunakan `VoipClient` dan memanfaatkan *shared socket* (tanpa double pairing). Aset WebAssembly sudah built-in.

**Inisiasi VoIP Client:**

```js
import { VoipClient, CallState } from "ichigokurosaki-baileys";

// Lakukan ini SETELAH connection === "open"
if (!global.voipClient) {
  global.voipClient = new VoipClient();
  await global.voipClient.connectWithSocket(sock);
  console.log("VoIP engine aktif!");
}
```

**Melakukan Panggilan:**

```js
try {
  // Panggil nomor target (PN) - harus terhubung
  const call = await global.voipClient.call("6281234567890", {
    durationMs: 60000, // Timeout dalam ms
    audioSource: "silence", // Atau "mic" / "file" (butuh audio-feeder & ffmpeg)
  });

  call.on("ringing", () => console.log("Berdering..."));
  call.on("connected", () => console.log("Terhubung!"));
  call.on("ended", (reason) => console.log("Panggilan berakhir:", reason));

  // Menunggu hingga panggilan selesai
  await call.waitForEnd();
} catch (e) {
  console.error("Gagal menelpon:", e);
}
```

---

### Message Sending

```js
// Text
await sock.sendMessage(jid, { text: "Hello!" });

// Text with mention
await sock.sendMessage(jid, {
  text: "Hello @628xxx!",
  mentions: ["628xxx@s.whatsapp.net"],
});

// Image
await sock.sendMessage(jid, {
  image: { url: "./photo.jpg" },
  caption: "A photo",
});

// Video
await sock.sendMessage(jid, {
  video: { url: "./video.mp4" },
  caption: "A video",
  gifPlayback: false,
});

// Audio
await sock.sendMessage(jid, {
  audio: { url: "./audio.ogg" },
  mimetype: "audio/ogg; codecs=opus",
  ptt: true, // voice note
});

// Sticker
await sock.sendMessage(jid, {
  sticker: { url: "./sticker.webp" },
});

// Sticker pack
await sock.sendMessage(
  jid,
  makeStickerPack({
    name: "Cloud Starter Pack",
    publisher: "Cloud",
    description: "Starter sticker pack",
    stickers: [
      { url: "./stickers/1.webp", emojis: ["🔥"] },
      { url: "./stickers/2.webp", emojis: ["😎"] },
    ],
    cover: { url: "./stickers/cover.webp" },
  }),
);

// Document
await sock.sendMessage(jid, {
  document: { url: "./file.pdf" },
  fileName: "document.pdf",
  mimetype: "application/pdf",
});

// Reaction
await sock.sendMessage(jid, {
  react: { key: msg.key, text: "👍" },
});

// Location
await sock.sendMessage(jid, {
  location: {
    degreesLatitude: -6.2,
    degreesLongitude: 106.8,
    name: "Jakarta",
  },
});

// Contact
await sock.sendMessage(jid, {
  contacts: {
    displayName: "Contacts",
    contacts: [
      { vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:John\nTEL:+628xxx\nEND:VCARD" },
    ],
  },
});

// Poll
await sock.sendMessage(jid, {
  poll: {
    name: "Vote!",
    values: ["Option A", "Option B", "Option C"],
    selectableCount: 1,
  },
});

// Forward message
await sock.sendMessage(jid, {
  forward: msg,
  forwardingScore: 1,
  isForwarded: true,
});

// Delete message
await sock.sendMessage(jid, { delete: msg.key });

// Edit message
await sock.sendMessage(jid, {
  text: "Edited text",
  edit: msg.key,
});
```

---

### Interactive Messages

**Native Flow Buttons:**

```js
await sock.sendMessage(jid, {
  interactiveMessage: {
    title: "Welcome!",
    footer: "Powered by Cloud",
    buttons: [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "Menu",
          id: "menu",
        }),
      },
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "Website",
          url: "https://example.com",
        }),
      },
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "Copy Code",
          copy_code: "CLOUD2024",
        }),
      },
    ],
    header: "Choose an option",
    image: { url: "https://example.com/banner.jpg" },
  },
});
```

**List Menu (single_select):**

```js
await sock.sendMessage(jid, {
  interactiveMessage: {
    title: "Select Category",
    footer: "Powered by Cloud",
    buttons: [
      {
        name: "single_select",
        buttonParamsJson: JSON.stringify({
          title: "Menu",
          sections: [
            {
              title: "Games",
              rows: [
                { title: "Quiz", id: ".quiz" },
                { title: "Tebak Gambar", id: ".tebakgambar" },
              ],
            },
            {
              title: "Tools",
              rows: [
                { title: "Sticker", id: ".sticker" },
                { title: "TTS", id: ".tts" },
              ],
            },
          ],
        }),
      },
    ],
    header: "Bot Menu",
  },
});
```

---

### Album Messages

```js
await sock.sendMessage(jid, {
  albumMessage: [
    { image: { url: "./photo1.jpg" }, caption: "First" },
    { image: { url: "./photo2.jpg" }, caption: "Second" },
    { video: { url: "./clip.mp4" }, caption: "Video" },
  ],
});
```

> [!NOTE]
> Albums automatically set `expectedImageCount` and `expectedVideoCount` based on array content.

---

### AI Rich Response Messages

Send messages styled like Meta AI — tables, code blocks, and rich text. All rendered via `botForwardedMessage` > `richResponseMessage`.

**Table (with heading):**

```js
await sock.sendTable(
  jid,
  "Java vs JavaScript",
  ["Feature", "Java", "JavaScript"],
  [
    ["Type", "Compiled", "Interpreted"],
    ["Typing", "Static", "Dynamic"],
    ["Main Use", "Enterprise", "Web, Full-stack"],
  ],
  quoted,
  {
    headerText: "Comparison:",
    footer: "Hope this helps!",
  },
);
```

**List (without heading):**

```js
await sock.sendList(
  jid,
  "Bot Info",
  [
    ["Name", "Cloud AI"],
    ["Version", "2.4.0"],
    ["Developer", "Kaze"],
  ],
  quoted,
  { footer: "© Cloud AI" },
);
```

**Code Block V1 (basic syntax highlighting):**

```js
await sock.sendCodeBlock(
  jid,
  `const greeting = "Hello World"
function sayHello(name) {
    return greeting + " " + name
}
sayHello("Cloud")`,
  quoted,
  {
    language: "javascript",
    title: "Example Code",
    footer: "Powered by Cloud",
  },
);
```

**Supported V1 languages:** `javascript`, `typescript`, `python`

**Table V2 (Unified Response):**

The V2 table uses the **unified response** format with `GenATableUXPrimitive` typename and base64-encoded data, matching the Meta AI rich response protocol.

**Features over V1:**

- String-based table input with flexible delimiters (`|` or `,` for columns, `;;` for rows)
- Unified response sections with `GenATableUXPrimitive` / `GenAIMarkdownTextUXPrimitive` typenames
- Dual output: `rows` (for submessages) + `unified_rows` (for sections)
- Enhanced `contextInfo` with `botMessageSharingInfo`

```js
await sock.sendTableV2(
  jid,
  [
    "Java vs JavaScript", // title
    "Feature | Java | JavaScript", // header (pipe-delimited)
    "Type | Compiled | Interpreted;;Typing | Static | Dynamic;;Main Use | Enterprise | Web, Full-stack", // rows (;; separated, | or , delimited)
  ],
  quoted,
  {
    headerText: "Comparison:",
    text: "Here is a comparison table:",
    footer: "Hope this helps!",
  },
);
```

**Input format:**

- `table[0]` — title string
- `table[1]` — header row (columns separated by `|` or `,`)
- `table[2+]` — data rows (rows separated by `;;`, columns by `|` or `,`)

**V2 Options:**

| Option       | Type     | Default | Description                                          |
| ------------ | -------- | ------- | ---------------------------------------------------- |
| `title`      | `string` | —       | Title (used if `headerText` not set)                 |
| `headerText` | `string` | —       | Text shown before the table                          |
| `text`       | `string` | —       | Markdown text section (GenAIMarkdownTextUXPrimitive) |
| `footer`     | `string` | —       | Text shown after the table                           |

---

### Code Block V2 (Unified Response)

The V2 code block uses the **unified response** format with `sections/view_model/primitive` structure and base64-encoded data, matching the Meta AI rich response protocol exactly.

**Features over V1:**

- 6 language families with keyword detection
- `/* */` block comment support
- `#` comment support for python/bash/lua
- Hex/binary/octal number literals
- Dual token output: numeric `codeBlock` + string-typed `unified_codeBlock`
- Unified response sections with `GenAICodeUXPrimitive` / `GenAIMarkdownTextUXPrimitive` typenames
- Enhanced `contextInfo` with `botMessageSharingInfo`

```js
await sock.sendCodeBlockV2(
  jid,
  `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
  quoted,
  {
    language: "go",
    title: "Go Example",
    text: "Here is a Go code snippet:",
    footer: "Powered by Cloud",
  },
);
```

**Supported V2 languages:**

| Language Key | Aliases                  |
| ------------ | ------------------------ |
| `javascript` | `js`, `typescript`, `ts` |
| `python`     | `py`                     |
| `go`         | `golang`                 |
| `lua`        | —                        |
| `bash`       | `sh`, `shell`            |

**V2 Options:**

| Option     | Type     | Default        | Description                                          |
| ---------- | -------- | -------------- | ---------------------------------------------------- |
| `language` | `string` | `'javascript'` | Programming language for syntax highlighting         |
| `title`    | `string` | —              | Title text shown before the code block               |
| `text`     | `string` | —              | Markdown text section (GenAIMarkdownTextUXPrimitive) |
| `footer`   | `string` | —              | Footer text shown after the code block               |

**V2 Token Types:**

| Code | V1 Name   | V2 Name   | Description                                        |
| ---- | --------- | --------- | -------------------------------------------------- |
| 0    | `DEFAULT` | `DEFAULT` | Normal text, whitespace, operators                 |
| 1    | `KEYWORD` | `KEYWORD` | Language keywords (`const`, `func`, `if`, etc.)    |
| 2    | `METHOD`  | `METHOD`  | Function/method calls (identifier followed by `(`) |
| 3    | `STRING`  | `STR`     | String literals (`"..."`, `'...'`, `` `...` ``)    |
| 4    | `NUMBER`  | `NUMBER`  | Numeric values (int, float, hex, binary, octal)    |
| 5    | `COMMENT` | `COMMENT` | Comments (`//`, `/* */`, `#`)                      |

---

### Link Message (Inline Embeds)

Send rich text with inline clickable links using `{{IE_N}}display_text{{/IE_N}}` placeholders, with optional citation metadata and verification proofs.

```js
await sock.sendLink(
  jid,
  "Upload results:\n✅ Freeimage\n🔗 Klik: {{IE_0}}link disini{{/IE_0}}\n✅ Yardsansh\n🔗 Klik: {{IE_1}}link disini{{/IE_1}}",
  ["https://example.com/upload1", "https://example.com/upload2"],
  quoted,
  {
    headerText: "📁 Media Uploader V3",
    footer: "✨ Selesai!",
    botJid: "867051314767696@bot",
    forwardingScore: 3,
    citations: [
      {
        sourceTitle: "Freeimage",
        citationNumber: 1,
        faviconCdnUrl: "https://cdn.example.com/favicon.ico",
      },
      { sourceTitle: "Yardsansh", citationNumber: 2 },
    ],
    proofs: [
      {
        version: 1,
        useCase: 1,
        signature: "base64signature==",
        certificateChain: ["base64cert1", "base64cert2"],
      },
    ],
  },
);
```

**Link Options:**

| Option            | Type         | Default                 | Description                           |
| ----------------- | ------------ | ----------------------- | ------------------------------------- |
| `headerText`      | `string`     | —                       | Text shown before the link content    |
| `footer`          | `string`     | —                       | Text shown after the link content     |
| `botJid`          | `string`     | `'867051314767696@bot'` | Bot JID for forwardedAiBotMessageInfo |
| `forwardingScore` | `number`     | `3`                     | Forward score for context info        |
| `citations`       | `Citation[]` | `[]`                    | Citation metadata entries             |
| `proofs`          | `Proof[]`    | `[]`                    | Verification proof entries            |

**Citation object:**

| Field            | Type     | Description                                  |
| ---------------- | -------- | -------------------------------------------- |
| `sourceQuery`    | `string` | Source query text                            |
| `faviconCdnUrl`  | `string` | CDN URL for favicon                          |
| `citationNumber` | `number` | Citation index (auto-incremented if omitted) |
| `sourceTitle`    | `string` | Title of the source                          |

**Proof object:**

| Field              | Type       | Description              |
| ------------------ | ---------- | ------------------------ |
| `version`          | `number`   | Proof version            |
| `useCase`          | `number`   | Use case identifier      |
| `signature`        | `string`   | Base64 signature         |
| `certificateChain` | `string[]` | Base64 certificate chain |

**Link V2 (search-result style):**

```js
await sock.sendLinkV2(
  jid,
  "Search results:\n- {{IE_0}}Official docs{{/IE_0}}\n- {{IE_1}}GitHub repo{{/IE_1}}",
  [
    {
      url: "https://www.npmjs.com/package/ichigokurosaki-baileys",
      displayName: "Official docs",
      sourceDisplayName: "npm",
      sourceSubtitle: "package registry",
    },
    {
      url: "https://github.com/FathulGans/ichigokurosaki-baileys",
      displayName: "GitHub repo",
      sourceDisplayName: "github",
      sourceSubtitle: "source hosting",
    },
  ],
  quoted,
  {
    headerText: "ichigokurosaki-baileys",
    footer: "Reference links",
    searchEngine: "MAME",
  },
);
```

---

### Other Message Types

**Payment Request:**

```js
await sock.sendMessage(jid, {
  requestPaymentMessage: {
    amount: 50000,
    currency: "IDR",
    note: "Payment for order #123",
    from: "628xxx@s.whatsapp.net",
  },
});
```

**Event:**

```js
await sock.sendMessage(jid, {
  eventMessage: {
    name: "Community Meetup",
    description: "Join us for the monthly meetup!",
    startTime: Date.now() + 86400000,
    endTime: Date.now() + 90000000,
    location: {
      name: "Jakarta",
      degreesLatitude: -6.2,
      degreesLongitude: 106.8,
    },
  },
});
```

**Poll Result:**

```js
await sock.sendMessage(jid, {
  pollResultMessage: {
    name: "Favorite Color?",
    pollVotes: [
      { optionName: "Red", optionVoteCount: 42 },
      { optionName: "Blue", optionVoteCount: 38 },
      { optionName: "Green", optionVoteCount: 25 },
    ],
  },
});
```

**Status with Mentions:**

```js
await sock.sendStatusMention({ text: "Big update coming!" }, [
  "628xxx@s.whatsapp.net",
  "groupid@g.us",
]);
```

**Product Message:**

```js
await sock.sendMessage(jid, {
  productMessage: {
    title: "Wireless Headphones",
    description: "High quality bluetooth headphones",
    productId: "WH-001",
    retailerId: "cloud-shop",
    url: "https://example.com/product",
    priceAmount1000: 299000,
    currencyCode: "IDR",
    thumbnail: { url: "https://example.com/product.jpg" },
    body: "Check out this product!",
    footer: "Cloud Shop",
    buttons: [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "Buy Now",
          id: "buy_wh001",
        }),
      },
    ],
  },
});
```

**Mixed Rich Message (custom submessages):**

```js
await sock.sendRichMessage(
  jid,
  [
    { messageType: 2, messageText: "Here is some info:" },
    {
      messageType: 4,
      tableMetadata: {
        title: "Stats",
        rows: [
          { items: ["Metric", "Value"], isHeading: true },
          { items: ["Users", "1000"] },
          { items: ["Uptime", "99.9%"] },
        ],
      },
    },
    { messageType: 2, messageText: "And some code:" },
    {
      messageType: 5,
      codeMetadata: {
        codeLanguage: "javascript",
        codeBlocks: [{ highlightType: 0, codeContent: 'console.log("OK")' }],
      },
    },
  ],
  quoted,
);
```

**SubMessage Types:**

| messageType | Name          | Payload Field          |
| ----------- | ------------- | ---------------------- |
| 0           | UNKNOWN       | —                      |
| 1           | GRID_IMAGE    | `gridImageMetadata`    |
| 2           | TEXT          | `messageText`          |
| 3           | INLINE_IMAGE  | `imageMetadata`        |
| 4           | TABLE         | `tableMetadata`        |
| 5           | CODE          | `codeMetadata`         |
| 6           | DYNAMIC       | `dynamicMetadata`      |
| 7           | MAP           | `mapMetadata`          |
| 8           | LATEX         | `latexMetadata`        |
| 9           | CONTENT_ITEMS | `contentItemsMetadata` |

---

### Newsletter Methods

```js
// Resolve channel URL to metadata
const info = await sock.cekIDSaluran("https://whatsapp.com/channel/xxxxx");
console.log(info.name, info.subscribers);

// Bulk follow multiple channels
await sock.newsletterMultipleFollow("id1@newsletter id2@newsletter");

// Fetch all subscribed channels
const channels = await sock.newsletterFetchAllSubscribe();

// Generic action (follow/unfollow/mute/unmute)
await sock.newsletterAction("id@newsletter", "follow");

// Create newsletter
const nl = await sock.newsletterCreate("My Channel", "Description");

// Update newsletter
await sock.newsletterUpdate("id@newsletter", { name: "New Name" });

// Get subscriber count
const { subscribers } = await sock.newsletterSubscribers("id@newsletter");

// Get metadata
const meta = await sock.newsletterMetadata("jid", "id@newsletter");

// Follow / Unfollow
await sock.newsletterFollow("id@newsletter");
await sock.newsletterUnfollow("id@newsletter");

// Mute / Unmute
await sock.newsletterMute("id@newsletter");
await sock.newsletterUnmute("id@newsletter");

// Update name / description / picture
await sock.newsletterUpdateName("id@newsletter", "New Name");
await sock.newsletterUpdateDescription("id@newsletter", "New Desc");
await sock.newsletterUpdatePicture("id@newsletter", mediaUpload);
await sock.newsletterRemovePicture("id@newsletter");

// React to message
await sock.newsletterReactMessage("id@newsletter", serverId, "👍");

// Fetch messages
const msgs = await sock.newsletterFetchMessages("id@newsletter", 50, 0, 0);

// Admin operations
const count = await sock.newsletterAdminCount("id@newsletter");
await sock.newsletterChangeOwner("id@newsletter", newOwnerJid);
await sock.newsletterDemote("id@newsletter", userJid);
await sock.newsletterDelete("id@newsletter");
```

---

### Group Methods

```js
// Fetch group metadata
const meta = await sock.groupMetadata("id@g.us");

// Create group
const group = await sock.groupCreate("My Group", ["628xxx@s.whatsapp.net"]);

// Leave group
await sock.groupLeave("id@g.us");

// Update subject / description
await sock.groupUpdateSubject("id@g.us", "New Subject");
await sock.groupUpdateDescription("id@g.us", "New Description");

// Participant actions: add, remove, promote, demote
const result = await sock.groupParticipantsUpdate(
  "id@g.us",
  ["628xxx@s.whatsapp.net"],
  "add", // 'remove' | 'promote' | 'demote'
);

// Handle join requests
const requests = await sock.groupRequestParticipantsList("id@g.us");
await sock.groupRequestParticipantsUpdate(
  "id@g.us",
  ["628xxx@s.whatsapp.net"],
  "approve",
);

// Invite code
const code = await sock.groupInviteCode("id@g.us");
await sock.groupRevokeInvite("id@g.us");
await sock.groupAcceptInvite("ABCDE12345");
const info = await sock.groupGetInviteInfo("ABCDE12345");

// Settings: announcement, not_announcement, locked, unlocked
await sock.groupSettingUpdate("id@g.us", "announcement");
await sock.groupSettingUpdate("id@g.us", "locked");

// Member add mode / Join approval
await sock.groupMemberAddMode("id@g.us", "admin_add");
await sock.groupJoinApprovalMode("id@g.us", "on");

// Toggle disappearing messages
await sock.groupToggleEphemeral("id@g.us", 86400); // 24h

// Fetch all participating groups
const groups = await sock.groupFetchAllParticipating();

// Update member label
await sock.updateMemberLabel("id@g.us", "VIP");
```

---

### Community Methods

```js
// Fetch community metadata
const meta = await sock.communityMetadata("communityid@g.us");

// Create community
const community = await sock.communityCreate(
  "Our Community",
  "Community description",
);

// Create a subgroup under a community
const subgroup = await sock.communityCreateGroup(
  "Announcements",
  ["628xxx@s.whatsapp.net"],
  "communityid@g.us",
);

// Link / unlink an existing group
await sock.communityLinkGroup("groupid@g.us", "communityid@g.us");
await sock.communityUnlinkGroup("groupid@g.us", "communityid@g.us");

// Fetch linked groups
const linked = await sock.communityFetchLinkedGroups("communityid@g.us");

// Invite handling
const code = await sock.communityInviteCode("communityid@g.us");
await sock.communityRevokeInvite("communityid@g.us");
await sock.communityAcceptInvite(code);
const inviteInfo = await sock.communityGetInviteInfo(code);

// Requests / participants
const requests =
  await sock.communityRequestParticipantsList("communityid@g.us");
await sock.communityRequestParticipantsUpdate(
  "communityid@g.us",
  ["628xxx@s.whatsapp.net"],
  "approve",
);
await sock.communityParticipantsUpdate(
  "communityid@g.us",
  ["628xxx@s.whatsapp.net"],
  "add",
);

// Settings
await sock.communityUpdateSubject("communityid@g.us", "New Subject");
await sock.communityUpdateDescription("communityid@g.us", "New Description");
await sock.communityToggleEphemeral("communityid@g.us", 86400);
await sock.communitySettingUpdate("communityid@g.us", "announcement");
await sock.communityMemberAddMode("communityid@g.us", "admin_add");
await sock.communityJoinApprovalMode("communityid@g.us", "on");

// Leave / list all
await sock.communityLeave("communityid@g.us");
const communities = await sock.communityFetchAllParticipating();
```

---

### Business Methods

```js
// Catalog
const { products, nextPageCursor } = await sock.getCatalog({
  jid: "628xxx@s.whatsapp.net",
  limit: 10,
});

const { collections } = await sock.getCollections("628xxx@s.whatsapp.net", 10);

// Orders
const order = await sock.getOrderDetails(orderId, tokenBase64);

// Product CRUD
const product = await sock.productCreate({
  name: "Premium Package",
  description: "Official premium plan",
  price: 150000,
  currency: "IDR",
  originCountryCode: "ID",
  images: [mediaUpload],
});

await sock.productUpdate(product.id, {
  name: "Premium Package Plus",
  description: "Official premium plan plus",
  price: 175000,
  currency: "IDR",
  images: [mediaUpload],
});

await sock.productDelete([product.id]);

// Business profile
await sock.updateBusinessProfile({
  address: "Jakarta, Indonesia",
  description: "Official store",
  websites: ["https://example.com"],
  email: "hello@example.com",
  hours: {
    timezone: "Asia/Jakarta",
    days: [{ day: "mon", mode: "open_24h" }],
  },
});

// Legacy alias is still available for backward compatibility
await sock.updateBussinesProfile({
  description: "Legacy alias still works",
});

await sock.updateCoverPhoto(mediaUpload);
await sock.removeCoverPhoto(coverId);

// Quick replies
await sock.addOrEditQuickReply({
  shortcut: "hello",
  message: "Hello from business account",
});

await sock.removeQuickReply(timestamp);
```

---

### Chat & Profile Methods

```js
// Profile picture
const url = await sock.profilePictureUrl(jid, "image");
await sock.updateProfilePicture(jid, mediaUpload);
await sock.removeProfilePicture(jid);

// Profile name / status
await sock.updateProfileName("My Name");
await sock.updateProfileStatus("Available");

// Presence
await sock.sendPresenceUpdate("available", jid);
await sock.presenceSubscribe(jid);

// Read receipts
await sock.readMessages([msg.key]);
await sock.sendReceipt(jid, participant, [msgId], "read");

// Block / Unblock
await sock.updateBlockStatus(jid, "block");
await sock.updateBlockStatus(jid, "unblock");

// Fetch blocklist
const list = await sock.fetchBlocklist();

// Chat modifications
await sock.chatModify(
  {
    archive: true,
    lastMessageOrig: msg,
    lastMessage: msg,
  },
  jid,
);

// Star messages
await sock.star(jid, [{ id: msgId, fromMe: true }], true);

// Contact management
await sock.addOrEditContact(jid, { displayName: "Name" });
await sock.removeContact(jid);

// Labels
await sock.addChatLabel(jid, labelId);
await sock.removeChatLabel(jid, labelId);
await sock.addMessageLabel(jid, messageId, labelId);

// App state sync
await sock.resyncAppState(["regular", "critical_block"], true);

// Business profile
const biz = await sock.getBusinessProfile(jid);
```

---

### Privacy Settings

```js
await sock.updateLastSeenPrivacy("all"); // 'all' | 'contacts' | 'contact_blacklist' | 'nobody'
await sock.updateOnlinePrivacy("all"); // 'all' | 'match_last_seen'
await sock.updateProfilePicturePrivacy("contacts");
await sock.updateStatusPrivacy("contacts");
await sock.updateReadReceiptsPrivacy("all"); // 'all' | 'none'
await sock.updateGroupsAddPrivacy("all"); // 'all' | 'contacts'
await sock.updateMessagesPrivacy("all"); // 'all' | 'contacts' | 'nobody'
await sock.updateCallPrivacy("everyone");
await sock.updateDefaultDisappearingMode(86400);
await sock.updateDisableLinkPreviewsPrivacy(true);
```

---

## 📡 Event Reference

```js
sock.ev.on('connection.update', ({ connection, lastDisconnect, qr, isNewLogin, receivedPendingNotifications, isOnline }) => {})
sock.ev.on('creds.update', (update) => {})
sock.ev.on('messaging-history.set', ({ chats, contacts, messages, isLatest }) => {})
sock.ev.on('chats.upsert', (chats) => {})
sock.ev.on('chats.update', (updates) => {})
sock.ev.on('chats.delete', (jids) => {})
sock.ev.on('contacts.upsert', (contacts) => {})
sock.ev.on('contacts.update', (updates) => {})
sock.ev.on('messages.upsert', ({ messages, type }) => {})
sock.ev.on('messages.update', (updates) => {})
sock.ev.on('messages.delete', (keys) => {})
sock.ev.on('messages.reaction', (reactions) => {})
sock.ev.on('message-receipt.update', (updates) => {})
sock.ev.on('groups.update', (updates) => {})
sock.ev.on('group-participants.update', (update) => {})
sock.ev.on('group.join-request', (update) => {})
sock.ev.on('call', (calls) => {})
sock.ev.on('labels.edit', (label) => {})
sock.ev.on('labels.associations', ({ associated, label, type }) => {})
sock.ev.on('newsletter.update', (updates) => {})
sock.ev.on('newsletter.follow', (jid) => {})
sock.ev.on('newsletter.unfollow', (jid) => {})
sock.ev.on('settings.update', ({ isAutoEmojiEnabled, isReadReceiptsEnabled, ... }) => {})
```

---

## 🔧 Utility Exports

```js
import {
  // Auth
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  initAuthCreds,
  BufferJSON,
  fetchLatestBaileysVersion,

  // Code tokenization
  tokenizeCode,
  tokenizeCodeV2,
  CodeHighlightType,
  RichSubMessageType,

  // Rich message generators
  generateTableContent,
  generateTableContentV2,
  toTableMetadataV2,
  generateListContent,
  generateCodeBlockContent,
  generateCodeBlockContentV2,
  generateLinkContent,
  generateLinkContentV2,
  generateRichMessageContent,
  generateLatexContent,
  generateLatexImageContent,
  generateLatexInlineImageContent,
  generateUnifiedResponseContent,
  captureUnifiedResponse,

  // Rich message builders
  buildRichContextInfo,
  buildBotForwardedMessage,

  // Sticker pack helper
  makeStickerPack,

  // Media processing helpers
  transcodeAudioToOggOpus,
  compressImageIfNeeded,
  compressVideoIfNeeded,

  // Language keyword sets
  JS_KEYWORDS,
  PYTHON_KEYWORDS,
  GO_KEYWORDS,
  LUA_KEYWORDS,
  BASH_KEYWORDS,
  LANGUAGE_KEYWORDS,

  // Crypto
  Curve,
  signedKeyPair,
  aesEncryptGCM,
  aesDecryptGCM,

  // JID utilities
  jidEncode,
  jidDecode,
  jidNormalizedUser,
  areJidsSameUser,
  isJidGroup,
  isJidNewsletter,
  isLidUser,
  isPnUser,
  isJidBot,
  isJidMetaAI,
  isJidBroadcast,
  isJidStatusBroadcast,

  // Connection
  DisconnectReason,
  Browsers,

  // Dugong (advanced message types)
  Dugong,

  // Types
  WASocket,
} from "ichigokurosaki-baileys";
```

> [!NOTE]
> In this build, some advanced helper typings may appear first in `lib/Socket/messages-send.d.ts` before they are reflected everywhere else in aggregated socket declarations. If your editor autocomplete lags behind runtime behavior, inspect `lib/Socket/messages-send.js` and `lib/Utils/rich-messages.d.ts` for the most complete helper surface.

---

## 🏗️ Building This Package

This repository ships compiled files, but it still includes the build script used to emit/update `lib/`.

```bash
npm install
npm run build
```

What the build does:

- runs TypeScript with `tsconfig.build.json`
- emits JavaScript and declaration files into `lib/`
- runs `tsc-esm-fix` so generated ESM imports resolve cleanly

Important build notes:

- `tsconfig.json` is authoring-oriented and uses `noEmit: true`
- `tsconfig.build.json` flips emit back on and excludes test files
- published package files are limited to `lib/**/*` and `WAProto/**/*`

### Running Tests

```bash
npm install
npm test
```

This runs the smoke tests in `test/` using Node's built-in test runner (`node --test`) — no extra test framework dependency required. Currently covers the interactive message builders (`Button`, `ButtonV2`, `Carousel`); the `Carousel` test stubs the media-upload path so it runs without `sharp`, `ffmpeg`, or network access.

---

## 🔀 Differences from Official Baileys

| Area                 | Official Baileys v7 | ichigokurosaki-baileys                            |
| -------------------- | ------------------- | ---------------------------------------- |
| Interactive messages | No native support   | Full support via Dugong                  |
| Album messages       | Not supported       | Multi-media albums                       |
| AI Rich Response     | Not available       | Table, code block, rich text             |
| Table V1             | Not available       | Basic table with headers                 |
| Table V2             | Not available       | Unified response + GenATableUXPrimitive  |
| Code Block V1        | Not available       | Syntax highlighting (JS/TS/Python)       |
| Code Block V2        | Not available       | Unified response + 6 languages           |
| Link Message         | Not available       | Inline embeds + citations + verification |
| Business nodes       | Manual injection    | Auto-inject on relay                     |
| Newsletter extras    | Basic only          | Auto-follow, bulk follow, URL resolve    |
| Button detection     | Not available       | `getButtonType()` auto-detect            |
| Payment messages     | Not supported       | Full support                             |
| Event messages       | Basic               | Enhanced all fields                      |
| Status mentions      | Not available       | `sendStatusMention()`                    |
| Product messages     | Not supported       | Catalog + buttons                        |
| LID support          | Basic               | Full LID↔PN mapping + session migration  |
| Identity changes     | No handling         | Debounced session refresh                |
| Message retry        | Basic               | `MessageRetryManager` with cache         |

---

## 🤝 Contributing

1. Fork this repo
2. Create a branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'feat: add feature'`)
4. Run `npm test` and make sure it passes (see [Running Tests](#running-tests))
5. Push to branch (`git push origin feature/name`)
6. Open a Pull Request

---

## 🙏 Credits

`ichigokurosaki-baileys` is built on top of [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys), the open-source WhatsApp Web API library. This package is a modded/rebranded distribution with additional features (interactive messages, VoIP, AI Rich responses, and more) layered on top of that core.

## 📄 License

MIT © [Kaze](https://github.com/FathulGans)

> [!CAUTION]
> This library is for **educational purposes**. Ensure compliance with WhatsApp Terms of Service.

---

<div align="center">

**Made by Kaze**

[⭐ Star this repo](https://github.com/FathulGans/ichigokurosaki-baileys) · [🐛 Report Bug](https://github.com/FathulGans/ichigokurosaki-baileys/issues)

</div>
