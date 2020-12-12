const assert = require('assert');
const Frame = require('./Frame');
const FrameBuffer = require('./FrameBuffer');
const RequestBuffer = require('./RequestBuffer');
const DataBuffer = require('./DataBuffer');
const crypto = require('crypto');

class WebSocket {

  static SEC_WEBSOCKET_KEY = 'Sec-WebSocket-Key';
  static SEC_WEBSOCKET_EXTENSIONS = 'Sec-WebSocket-Extensions';
  static SEC_WEBSOCKET_ACCEPT = 'Sec-WebSocket-Accept';
  static SEC_WEBSOCKET_VERSION = 'Sec-WebSocket-Version';

  static GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  static PROTOCOL = 'HTTP/1.1';

  static DEFAULT_MAX_FRAME_PAYLOAD_SIZE = 1024 * 64;

  static OPTION_VERBOSE = 'verbose';
  static OPTION_MAX_FRAME_PAYLOAD_SIZE = 'maxFramePayloadSize';
  static OPTION_EXTENSIONS = 'extensions';
  static OPTION_TEST_FORCE_DONT_MASK = 'testDontForceMask';
  static OPTION_TEST_SEND_FRAGMENTED_FRAME = 'testSendFragmentedFrame';

  static WS_PROTOCOLS = {
    'ws:': 80,
    'wss:': 443,
  }

  static TLS_PROTO = 'wss:';
  static HTTP_PROTOCOL = 'HTTP/1.1';
  static WEBSOCKET_VERSION = 13;

  /**
   * Creates an instance of WebSocket.
   *
   * @memberof WebSocket
   */
  constructor(options=null) {
    if (options === null) {
      options = {};
    }

    this.__id = null;
    this.__verbose = options[WebSocket.OPTION_VERBOSE] === undefined ? false : options[WebSocket.OPTION_VERBOSE];

    this.__handshakeComplete = false;
    this.__extensions = [];
    this.__session = null;
    this.__messageProcessor = null;
    this.__frameBuffer = new FrameBuffer();
    this.__requestBuffer = new RequestBuffer();
    this.__dataBuffer = new DataBuffer();
    this.__maxFramePayloadSize = options[WebSocket.OPTION_MAX_FRAME_PAYLOAD_SIZE] === undefined ? WebSocket.DEFAULT_MAX_FRAME_PAYLOAD_SIZE : options[WebSocket.OPTION_MAX_FRAME_PAYLOAD_SIZE];
    this.__socket = null;

    this.__testForceDontMask = options[WebSocket.OPTION_TEST_FORCE_DONT_MASK] === undefined ? false : options[WebSocket.OPTION_TEST_FORCE_DONT_MASK];
    this.__testSendFragmentedFrame = options[WebSocket.OPTION_TEST_SEND_FRAGMENTED_FRAME] === undefined ? false : options[WebSocket.OPTION_TEST_SEND_FRAGMENTED_FRAME];
  }

  get verbose() {
    return this.__verbose;
  }

  get id() {
    return this.__id;
  }

  get requestBuffer() {
    return this.__requestBuffer;
  }

  get socket() {
    return this.__socket;
  }

  set extensions(value) {
    this.__extensions = value;
  }

  bind(socket, webSocketServer=null, id=null) {
    this.__webSocketServer = webSocketServer;
    this.__socket = socket;
    this.__id = id;

    if (webSocketServer !== null) {
      socket.on('data', (data) => this.onData(data));
      socket.on('close', () => this.onClose());
      if (this.__testSendFragmentedFrame === true) {
        socket.setNoDelay(true);
      }
    }
  }

  async processIncomingData(data) {
    assert(data instanceof Buffer);
    const messages = [];
    const controlFrames = [];

    this.__dataBuffer.ingest(data);
    for (let frame of this.__dataBuffer.getFrames()) {
      let updatedFrame = frame;

      if (Frame.DATA_FRAME_OPCODES.has(updatedFrame.opcode)) {
        // Extensions only run against data frames
        for (let i = 0; i < this.__extensions.length; i++) {
          const extension = this.__extensions[i];
          updatedFrame = await extension.onRead(updatedFrame);
        }

        // If the frame is a data frame, pass it onto the frame buffer and message processor if
        // a complete message emerges
        const result = this.__frameBuffer.ingest(updatedFrame);
        if (result !== null) {
          messages.push(result);
        }
      } else {
        controlFrames.push(updatedFrame);
      }
    }

    return [
      messages,
      controlFrames,
    ];
  }

  processControlFrames(controlFrames) {
    for (let frame of controlFrames) {
      if (frame.opcode === Frame.OPCODE_PING_FRAME) {
        // Respond with a PONG frame
        const pongFrame = Frame.create(
          null, false, false, false, Frame.OPCODE_PONG_FRAME, null, true
        );

        try {
          this.__socket.write(pongFrame.buffer);
        } catch(e) {
          if (e.code !== 'ERR_STREAM_WRITE_AFTER_END') {
            // Closing connection if error was unrelated to the connection being closed
            this.__socket.end();
          }
        }
      }
    }
  }

  async onData(data) {
    assert(data instanceof Buffer)
    if (this.request === null) {
      const request = this.requestBuffer.ingest(data);
      if (request === null) {
        if (this.verbose === true) {
          console.debug(`${this.getLogHeader()}Received partial handshake request\n${data.toString()}`)
        }
      } else {
        if (this.verbose === true) {
          console.debug(`${this.getLogHeader()}Received complete handshake request\n${data.toString()}`)
        }

        const result = await this.webSocketServer.doHandshake(this, request);
        if (result !== null) {
          const [
            request,
            extensions,
            session,
            messageProcessor,
          ] = result;

          this.request = request;
          this.extensions = extensions;
          this.session = session;
          this.messageProcessor = messageProcessor;
          this.messageProcessor._onConnect(this.session, this);
        }
      }
    } else {
      const [ messages, controlFrames ] = await this.processIncomingData(data);

      if (controlFrames.length > 0) {
        this.processControlFrames(controlFrames);
      }

      for (let message of messages) {
        try {
          const [ modifiedData, error ] = await this.messageProcessor._onRead(
            this.session, this, message
          ).then(
            resp => [ resp, null]
          ).catch(
            e => [ null, e]
          );
          if (error !== null) throw error;

          return this.messageProcessor.onRead(this.session, this, modifiedData);
        } catch(e) {
          console.debug(`${this.getLogHeader()}Received an unprocessable message, server initiating disconnect`);
          if (this.verbose === true) {
            console.debug(e);
          }
          this.socket.end();
        }
      }
    }
  }

  async write(data, isClient=false) {
    assert(data instanceof Buffer);
    for (let i = 0; i < data.length; i += this.__maxFramePayloadSize) {
      let frame = Frame.create(
        data.slice(i, i + this.__maxFramePayloadSize),
        false,
        false,
        false,
        Frame.OPCODE_TEXT_FRAME,
        null,
        i + this.__maxFramePayloadSize >= data.length,
      );

      for (let i = this.__extensions.length - 1; i >= 0; i--) {
        const extension = this.__extensions[i];
        frame = await extension.onWrite(frame);
      }

      if (isClient === true && !this.__testForceDontMask) {
        // Client in testing mode can optionally turn off masking to test servers
        const mask = crypto.randomBytes(4);
        frame = Frame.create(
          frame.payload,
          frame.rsv1,
          frame.rsv2,
          frame.rsv3,
          frame.opcode,
          mask,
          frame.isFin,
        );
      }

      try {
        if (this.__testSendFragmentedFrame === true) {
          const percent = Math.random();
          const index = Math.max(1, Math.min(Math.round(frame.buffer.length * percent), frame.buffer.length - 1));
          this.__socket.write(frame.buffer, 0, index);
          this.__socket.write(frame.buffer, index);
        } else {
          this.__socket.write(frame.buffer);
        }
      } catch(e) {
        if (e.code !== 'ERR_STREAM_WRITE_AFTER_END') {
          // Closing connection if error was unrelated to the connection being closed
          this.__socket.end();
        }

        // Break the loop in this event
        return;
      }
    }
  }

  async onClose() {
    if (this.verbose === true) {
      console.debug(`${this.getLogHeader()}Connection closed`)
    }
    this.webSocketServer.cleanup(this);

    // Only fire the message processor if the initial request had completed successfully.  Any
    // disconnect during handshake etc, won't cause the message processor onDisconnect to fire
    // since the onConnect would never have fired.
    if (this.request !== null) {
      this.messageProcessor._onDisconnect(this.session, this);
    }
  }

  getLogHeader() {
    return `WebSocket:${this.id}: `;
  }
}

module.exports = WebSocket;
