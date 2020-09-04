const {
  PathEntityIDAccessor,
} = require('layer8');

class HobbyAccessors {};

HobbyAccessors.ID = new PathEntityIDAccessor('id');

module.exports = HobbyAccessors;
