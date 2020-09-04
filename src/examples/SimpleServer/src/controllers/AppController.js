const {
  Controller,
  Endpoint,
  ResponseObject,
 } = require('layer8');
const fs = require('fs');
const path = require('path');

class AppController extends Controller {

  constructor() {
    super(
      '/app',
      [
        new Endpoint('/', Endpoint.INDEX),
      ],
    );
  }

  /**
   * Returns the application entrypoint.
   */
  async validateIndex(ctx, session) {
    return [];
  }

  async executeIndex(session) {
    return new ResponseObject(
      fs.readFileSync(path.resolve(__dirname, '..', 'templates', 'app.html'))
    )
  }

}

module.exports = AppController;
