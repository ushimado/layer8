const Frame = require('../src/websocket/Frame');
const assert = require('assert');
const crypto = require('crypto');

describe("Test frame", () => {

  it('Should have a total length of payload +2 for small frame unmasked', () => {
    const data = Buffer.from("hello world");
    const frame = Frame.create(data, false, false, false, Frame.OPCODE_TEXT_FRAME, null, true);
    assert(frame.totalFrameSize === (2 + data.length));
    assert(frame.buffer.length === frame.totalFrameSize);
  });

  it('Should have a total length of payload +6 for small frame masked', () => {
    const data = Buffer.from("hello world");
    const frame = Frame.create(
      data,
      false,
      false,
      false,
      Frame.OPCODE_TEXT_FRAME,
      crypto.randomBytes(4),
      true
    );
    assert(frame.length === 6 + data.length);
  });

  it('Should unmask to original value prior to masking', () => {
    const data = "hello world";
    const buffer = Frame.create(
      Buffer.from(data),
      false,
      false,
      false,
      Frame.OPCODE_TEXT_FRAME,
      crypto.randomBytes(4),
      true
    );

    const frame = new Frame(buffer);
    assert(frame.payload.toString() === data);
  });

  it('Should have a total length of payload +4 for medium size frame', () => {
    const original = Buffer.alloc(300, "hello");
    const frame = Frame.create(
      Buffer.concat([original]),
      false,
      false,
      false,
      Frame.OPCODE_TEXT_FRAME,
      null,
      true,
    );

    assert(frame.totalFrameSize === 4 + original.length);
    assert(frame.buffer.length === frame.totalFrameSize);
    assert(frame.payload.toString() === original.toString());
  });

  it('Should have a total length of payload +10 for large size frame', () => {
    const original = Buffer.alloc(72000, "hello");
    const frame = Frame.create(
      Buffer.concat([original]),
      false,
      false,
      false,
      Frame.OPCODE_TEXT_FRAME,
      null,
      true,
    );

    assert(frame.totalFrameSize === 10 + original.length);
    assert(frame.buffer.length === frame.totalFrameSize);
    assert(frame.payload.toString() === original.toString());
  });

});
