const Frame = require('../src/websocket/Frame');
const assert = require('assert');
const crypto = require('crypto');
const WebSocket = require('../src/websocket/WebSocket');

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


  it('Should be able to process a fragmented (frame is broken up across packets) frame', async () => {
    const testSocket = new WebSocket();
    const testString = "hello there, this is my fragmented frame";
    const frame = Frame.create(
      Buffer.from(testString),
      false,
      false,
      false,
      Frame.OPCODE_TEXT_FRAME,
      crypto.randomBytes(4),
      true
    );

    const part1 = frame.slice(0, 5);
    const part2 = frame.slice(5, 10);
    const part3 = frame.slice(10);

    let result;

    result = await testSocket.processIncomingData(part1);
    assert(result[0].length === 0);
    assert(result[1].length === 0);

    result = await testSocket.processIncomingData(part2);
    assert(result[0].length === 0);
    assert(result[1].length === 0);

    const [messages, controlFrames] = await testSocket.processIncomingData(part3);
    assert(messages.length === 1);
    assert(controlFrames.length === 0);
    assert(messages[0].toString() === testString);
  });

  it('Should return a first good frame if 1.5 frames exist', async () => {
    const testSocket = new WebSocket();
    const testString = "hello there, this is my fragmented frame";
    const firstFrame = Frame.create(
      Buffer.from(testString),
      false,
      false,
      false,
      Frame.OPCODE_TEXT_FRAME,
      crypto.randomBytes(4),
      true
    );

    const secondFrame = Frame.create(
      Buffer.from(testString),
      false,
      false,
      false,
      Frame.OPCODE_TEXT_FRAME,
      crypto.randomBytes(4),
      true
    ).slice(0, 5)

    const [messages, controlFrames] = await testSocket.processIncomingData(
      Buffer.concat([firstFrame, secondFrame])
    );
    assert(messages.length === 1);
    assert(controlFrames.length === 0);
    assert(messages[0].toString() === testString);
  });
});
