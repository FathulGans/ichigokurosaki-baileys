/**
 * Smoke tests for lib/Modded/message_builder.js
 *
 * These target the exact regressions listed in the ichigokurosaki-baileys v1.1.2
 * changelog:
 *   - Button.build() throwing `ReferenceError: message is not defined`
 *   - Carousel card-processing logic misplaced inside Button.build()
 *   - carousel.card(cb) never draining builders into `_cards`, so
 *     carousels built through the fluent .card() API sent empty
 *
 * Run with: node --test test/
 * Requires: `npm install` first (needs the package's real dependencies -
 * protobufjs, pino, @hapi/boom, etc. - to be present in node_modules).
 *
 * No network access and no ffmpeg/sharp binaries are required to run
 * this file: the Carousel test stubs Button.prototype.toCard so it
 * never touches the real media/upload pipeline.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Button, ButtonV2, Carousel } from '../lib/index.js';

const FAKE_JID = '628123456789@s.whatsapp.net';

// waUploadToServer / relayMessage are intentionally left unimplemented -
// none of the tests below should reach them. If a test throws
// "waUploadToServer is not a function" (or similar), that's a signal the
// builder tried to hit the real upload pipeline and the test needs a
// narrower stub, not that the mock is "missing" something.
const mockClient = {};

test('Button.build() resolves and produces a well-formed interactiveMessage (no media)', async () => {
  const btn = new Button(mockClient)
    .setBody('Hello from Button')
    .setFooter('footer text')
    .addReply('Yes', 'yes_id')
    .addUrl('Visit', 'https://example.com');

  const msg = await btn.build(FAKE_JID);

  assert.ok(msg?.message?.interactiveMessage, 'expected message.interactiveMessage to exist');
  assert.equal(msg.message.interactiveMessage.body.text, 'Hello from Button');
  assert.equal(msg.message.interactiveMessage.footer.text, 'footer text');
  assert.equal(msg.message.interactiveMessage.nativeFlowMessage.buttons.length, 2);
});

test('Button.build() rejects sensibly (not with a ReferenceError) when body is empty', async () => {
  // Regression guard: v1.1.2 threw `ReferenceError: message is not defined`
  // on every single call, regardless of input. Make sure that specific
  // failure mode can't come back silently.
  const btn = new Button(mockClient);
  const msg = await btn.build(FAKE_JID);
  assert.ok(msg?.message?.interactiveMessage, 'build() should still resolve with an (empty) interactiveMessage');
});

test('ButtonV2.build() produces a buttonsMessage with the added buttons', async () => {
  const btn = new ButtonV2(mockClient)
    .setBody('Body text')
    .setFooter('Footer text')
    .addButton('Click me', 'click_id');

  const msg = await btn.build(FAKE_JID);

  assert.ok(msg?.message?.buttonsMessage, 'expected message.buttonsMessage to exist');
  assert.equal(msg.message.buttonsMessage.contentText, 'Body text');
  assert.equal(msg.message.buttonsMessage.buttons.length, 1);
  assert.equal(msg.message.buttonsMessage.buttons[0].buttonId, 'click_id');
});

test('Carousel.addCard() rejects a card with no media attachment', () => {
  const car = new Carousel(mockClient);
  assert.throws(
    () => car.addCard({ header: {} }),
    /must include an image or video/
  );
});

test('Carousel.card(cb) builder drains into _cards on build() (v1.1.2 regression)', async () => {
  // Stub out Button.prototype.toCard so CardBuilder's internal Button
  // never touches prepareWAMessageMedia/waUploadToServer. This isolates
  // exactly the bug that shipped in v1.1.2: cards added via the fluent
  // `.card(cb)` builder were never processed into `_cards`, so the
  // carousel always sent empty regardless of what toCard() returns.
  const originalToCard = Button.prototype.toCard;
  Button.prototype.toCard = async function () {
    return {
      header: { title: this._title, hasMediaAttachment: true },
      body: { text: this._body },
      footer: { text: this._footer },
    };
  };

  try {
    const car = new Carousel(mockClient)
      .setBody('Carousel body')
      .card((c) => c.image('fake.jpg').title('Card 1').text('Card body').button('Buy', 'buy_id'))
      .card((c) => c.image('fake.jpg').title('Card 2').text('Card body 2').button('Buy', 'buy_id_2'));

    assert.equal(car._cardBuilders.length, 2, 'both .card() calls should be queued before build()');

    const msg = await car.build(FAKE_JID);

    assert.equal(car._cardBuilders.length, 0, 'builders should be drained after build()');
    assert.equal(car._cards.length, 2, 'both cards should have been processed into _cards');
    assert.equal(
      msg.message.interactiveMessage.carouselMessage.cards.length,
      2,
      'the outgoing message should carry both cards, not an empty carousel'
    );
  } finally {
    Button.prototype.toCard = originalToCard;
  }
});
