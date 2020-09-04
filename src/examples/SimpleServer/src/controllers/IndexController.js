const {
  Controller,
  Endpoint,
  ResponseObject
 } = require('layer8');
const fs = require('fs');
const path = require('path');

class IndexController extends Controller {

  constructor() {
    super(
      '/',
      [
        new Endpoint('/', Endpoint.INDEX)
      ]
    );
  }

  /**
   * Returns the home (index) page.
   */
  async validateIndex(ctx, session) {
    return [];
  }

  async executeIndex(session) {
    return new ResponseObject(
      fs.readFileSync(path.resolve(__dirname, '..', 'templates', 'index.html'))
    )
  }

}

module.exports = IndexController;
