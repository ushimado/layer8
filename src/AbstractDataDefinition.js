const NotImplementedError = require('./errors/NotImplementedError');
const AbstractType = require("./types/AbstractType");

class AbstractDataDefinition extends AbstractType {

  get definition() {
    throw new NotImplementedError();
  }

  test(value, isCreate) {
    value = super.test(value, isCreate);

    const definition = this.definition;
    const target = {};

    for (let key in definition) {
      const targetType = definition[key];
      if (
        isCreate === false ||
        targetType.isOnlyAfterCreate === false
      ) {
        // For data available only after creation, test only if the entity is not being created
        target[key] = targetType.test(key, isCreate);
      }
    }

    return obj;
  }
}

module.exports = AbstractDataDefinition;
