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
      null,
      '/',
      [
        new Endpoint('/', Endpoint.INDEX)
      ]
    );
  }

  async index(session, urlParams, queryArgs) {
    return new ResponseObject(
      fs.readFileSync(path.resolve(__dirname, '..', 'templates', 'index.html'))
    )
  }

}

module.exports = IndexController;
