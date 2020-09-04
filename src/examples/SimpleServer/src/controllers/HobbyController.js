const {
  Controller,
  Endpoint,
  JSONResponse,
 } = require('layer8');
const AuthenticationService = require('../services/AuthenticationService');
const HobbyAccessors = require('../api/HobbyAccessors');
const assert = require('assert');

class HobbyController extends Controller {

  constructor() {
    super(
      '/api/hobby',
      [
        new Endpoint('/', Endpoint.INDEX),
        new Endpoint('/:id', Endpoint.GET),
        new Endpoint('/:id', Endpoint.DELETE),
      ],
      [
        AuthenticationService.use,
      ]
    );
  }

  /**
   * Returns a list of all the hobbies by name (without detailed information)
   */
  async validateIndex(ctx, session) {
    return [];
  }

  async executeIndex(session) {
    const hobbies = [];
    HobbyController.HOBBIES.forEach(hobby => {
      hobbies.push({
        id: hobby.id,
        name: hobby.name,
      });
    })
    return new JSONResponse(hobbies);
  }

  async validateGet(ctx, session) {
    return [
      HobbyAccessors.ID.validate(ctx.params),
    ];
  }

  async executeGet(session, id) {
    assert(id in HobbyController.HOBBY_BY_ID, `ID ${id} not found`);

    return new JSONResponse(HobbyController.HOBBY_BY_ID[id]);
  }

  async validateDelete(ctx, session) {
    return [
      HobbyAccessors.ID.validate(ctx.params),
    ]
  }

  async executeDelete(session, id) {
    assert(id in HobbyController.HOBBY_BY_ID, `ID ${id} not found`);
    delete HobbyController.HOBBY_BY_ID[id];

    HobbyController.HOBBIES = HobbyController.HOBBIES.filter(hobby => hobby.id !== id);
  }
}

// Some example hobbies for the sake of illustrating a request with "id" as a path argument
HobbyController.HOBBIES = [
  {
    id: 1,
    name: "Fishing",
    description: "Catching fish for fun",
    barrierToEntry: "Low",
  },
  {
    id: 2,
    name: "Motocross",
    description: "Dirt bike riding on specialized dirt track",
    barrierToEntry: "Medium",
  },
  {
    id: 3,
    name: "Scuba diving",
    description: "Underwater exploration with assisted breathing device",
    barrierToEntry: "High",
  },
  {
    id: 4,
    name: "Singing",
    description: "Producing pleasing melodies using one's own voice",
    barrierToEntry: "Low",
  },
  {
    id: 5,
    name: "Flying",
    description: "Flying by way of motorized aircraft",
    barrierToEntry: 'High'
  }
];

HobbyController.HOBBY_BY_ID = {};
HobbyController.HOBBIES.forEach(hobby => {
  HobbyController.HOBBY_BY_ID[hobby.id] = hobby;
})

module.exports = HobbyController;
