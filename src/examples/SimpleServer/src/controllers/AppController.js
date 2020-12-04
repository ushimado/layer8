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
      null,
      '/app',
      [
        new Endpoint('/', Endpoint.INDEX),
      ],
    );
  }

  async index(session, urlParams, queryArgs) {
    return new ResponseObject(
      fs.readFileSync(path.resolve(__dirname, '..', 'templates', 'app.html'))
    )
  }

}

module.exports = AppController;
