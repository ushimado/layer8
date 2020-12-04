const {
  Endpoint,
  IntType,
 } = require('layer8');
const AuthenticatedController = require('./AuthenticatedController');
const assert = require('assert');

class HobbyController extends AuthenticatedController {

  static URL_PARAMS = {
    id: new IntType().from(1),
  };

  constructor() {
    super(
      null,
      '/api/hobby',
      [
        new Endpoint('/', Endpoint.INDEX),
        new Endpoint('/:id', Endpoint.GET).urlParams(HobbyController.URL_PARAMS),
        new Endpoint('/:id', Endpoint.DELETE).urlParams(HobbyController.URL_PARAMS),
      ],
    );
  }

  /**
   * Returns a list of all the hobbies by name (without detailed information)
   */
  async index(session, urlParams, queryArgs) {
    const hobbies = [];
    HobbyController.HOBBIES.forEach(hobby => {
      hobbies.push({
        id: hobby.id,
        name: hobby.name,
      });
    })
    return hobbies;
  }

  async get(session, urlParams, queryArgs) {
    assert(urlParams.id in HobbyController.HOBBY_BY_ID, `ID ${urlParams.id} not found`);

    return new HobbyController.HOBBY_BY_ID[urlParams.id];
  }

  async delete(session, urlParams, queryArgs) {
    assert(urlParams.id in HobbyController.HOBBY_BY_ID, `ID ${urlParams.id} not found`);
    delete HobbyController.HOBBY_BY_ID[urlParams.id];

    HobbyController.HOBBIES = HobbyController.HOBBIES.filter(hobby => hobby.id !== urlParams.id);
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
