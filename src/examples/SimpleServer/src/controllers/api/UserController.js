const {
  Controller,
  Endpoint,
  ResponseObject,
 } = require('layer8');

 class UserController extends Controller {

  constructor() {
    super(
      '/app',
      [
        new Endpoint('/', Endpoint.INDEX),
      ],
    );
  }

 }

 module.exports = UserController;
