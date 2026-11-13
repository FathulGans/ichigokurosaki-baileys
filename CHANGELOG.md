# Changelog

## [1.1.14]
- `sendMetaStep` fix: v1.1.13 showed a plain forwarded text without "View details". The message body is now a `richResponseMessage` wrapped in `botForwardedMessage` (Meta AI reply format), plus `botMetadata.progressIndicatorMetadata`.
- Step edits are sent with `relayMessage` as a `botForwardedMessage` > `protocolMessage` (`MESSAGE_EDIT`), the same way as richMessage edits.

## [1.1.13]
- `sendMetaStep` fix: v1.1.12 messages did not show up on the receiver. The message is no longer wrapped in `botForwardedMessage`; it is now an `extendedTextMessage` with the AI bot forwarded `contextInfo` (`forwardedAiBotMessageInfo`, `forwardOrigin: 4`) plus `botMetadata.progressIndicatorMetadata`.
- Step edits go through `sendMessage({ edit })`, so the stanza has the `edit="1"` attribute (missing in v1.1.12).
- `meta.done("text")`: `text` becomes `progressDescription`; the message text stays the last step title.

## [1.1.12]
- `sendMetaStep` fix: message is wrapped in `botForwardedMessage` (AI bot forwarded flag) and edits are sent as bot-forwarded edits, so the client shows the steps details instead of plain text and a duplicate message. Message text is the title of the last step.
- New `meta.done(text)`; `meta.finish` is now an alias. `step()` / `done()` / `update()` return `{ key, editId, message }`.

## [1.1.11]
- New `sock.sendMetaStep(jid, { title, body, disabled })` with `meta.step()`, `meta.finish()`, `meta.update()`: step/progress indicator message using `proto.BotProgressIndicatorMetadata`. Step status `PLANNED` / `EXECUTING` / `FINISHED`; options `reasoning`, `sections`, `sources`. Types `MetaStepInput` / `MetaStepHandle` added.

## [1.1.10]
- WAProto updated to **WhatsApp 2.3000.1054022738** (was 2.3000.1053411851): 9 new types, 16 new fields, 12 new enum values (e.g. `Message.VpcRequestMessage`, `Message.PaymentDetailsMessage`, `GroupRootKey`, `GroupRootKeyRequest`, `ClientPayload.IntegrationAttestation`, `StatusAttribution.StatusTemplate`, `Account.PnLearnState`). Nothing was removed; `index.js`, `index.d.ts` and `WAProto.proto` are regenerated from one schema.
- `ChatSolidColorWallpaper.backgroundLightArgb` / `backgroundDarkArgb` are not added: field numbers 1 and 2 are already used by `colorLight` / `colorDark`.
- Existing `sendMessage` / `relayMessage` output is unchanged.

## [1.1.9]
- New `sock.sendPrivateRelay(jid, message, options)`: relay to selected devices only (`mode` include/exclude, `target` number/PN/LID/`:device`, `deviceMode` all/primary/secondary, `targetMe`, `ai`, `statusJidList`). Works for 1:1, groups, status and newsletters.
- New `sendMessage` content: `richMessage` (AI rich response, `editrich` edits the message after sending), `rawMessage`, `photoPoll` (image poll), `buttonLocation` (buttons with a location header).
- New `ai` option on `relayMessage()`; `signalRepository.encryptGroupMessage()` accepts `resetSenderKey`.
- New export `makeInMemoryStore()`; added dependency `@adiwajshing/keyed-db`.
- WAProto: `proto.Message.MediaKeyDomain`, `mediaKeyDomain` on audio/document/image/sticker/video/`MMSThumbnailMetadata`, `proto.BotAvatarMetadata` and `BotMetadata.avatarMetadata` (`index.js` and `WAProto.proto`).
- WAProto updated to **WhatsApp 2.3000.1053411851** (was 2.3000.1038158069): 44 new types, 92 new fields, 95 new enum values (e.g. `Message.RequestLocationMessage`, `Message.RequestLocationUpdateMessage`, `Message.ChatAnimatedWallpaper`, `Message.MusicMessage.Lyrics`, `BotInterjectionMetadata`). Nothing was removed; `getTypeUrl()` is now on every type. `index.js`, `index.d.ts` and `WAProto.proto` are regenerated from one schema.
- Existing `sendMessage` / `relayMessage` output is unchanged.

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
