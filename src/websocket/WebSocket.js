const assert = require('assert');
const Frame = require('./Frame');
const FrameBuffer = require('./FrameBuffer');
const RequestBuffer = require('./RequestBuffer');

class WebSocket {

  /**
   * Creates an instance of WebSocket.
   *
   * @param {*} socket
   * @memberof WebSocket
   */
  constructor(webSocketServer, socket, id=null, verbose=false) {
    socket.on('data', (data) => this.onData(data));
    socket.on('close', () => this.onClose());

    this.id = id;
    this.socket = socket;
    this.webSocketServer = webSocketServer;
    this.verbose = verbose;

    this.request = null;
    this.extensions = null;
    this.session = null;
    this.messageProcessor = null;
    this.frameBuffer = new FrameBuffer();
    this.requestBuffer = new RequestBuffer();
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

          this.messageProcessor.onConnect(this.session, this);
        }
      }
    } else {
      let frame = new Frame(data);
      // Process the input buffer via all the supported extensions (order from left to right)
      for (let i = 0; i < this.extensions.length; i++) {
        const extension = this.extensions[i];
        frame = await extension.onRead(frame);
      }

      if (Frame.DATA_FRAME_OPCODES.has(frame.opcode)) {
        // If the frame is a data frame, pass it onto the frame buffer and message processor if
        // a complete message emerges
        const result = this.frameBuffer.ingest(frame);
        if (result !== null) {
          try {
            const [ modifiedData, error ] = await this.messageProcessor._onRead(
              this.session, this, result
            ).then(
              result => [ result, null]
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
      } else {
        // Something else arrived...  If in verbose mode, log it.
        if (this.verbose === true) {
          console.debug(frame.payload.toString());
        }
      }
    }
  }

  async write(data) {
    assert(data instanceof Buffer);

    let frame = Frame.create(data, false, false, false, Frame.OPCODE_TEXT_FRAME, true);
    for (let i = this.extensions.length - 1; i >= 0; i--) {
      const extension = this.extensions[i];
      frame = await extension.onWrite(frame);
    }

    try {
      this.socket.write(frame.buffer);
    } catch(e) {
      if (e.code !== 'ERR_STREAM_WRITE_AFTER_END') {
        // Closing connection if error was unrelated to the connection being closed
        this.socket.end();
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
      this.messageProcessor.onDisconnect(this.session, this);
    }
  }

  getLogHeader() {
    return `WebSocket:${this.id}: `;
  }
}

module.exports = WebSocket;
