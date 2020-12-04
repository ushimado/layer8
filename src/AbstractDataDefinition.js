const NotImplementedError = require('./errors/NotImplementedError');
const AbstractType = require("./types/AbstractType");
const ValidationError = require('./errors/ValidationError');

class AbstractDataDefinition extends AbstractType {

  get definition() {
    throw new NotImplementedError();
  }

  test(value, isCreate) {
    value = super.test(value, isCreate);

    const definition = this.definition;
    const target = {};
    let key;

    try {
      for (key in definition) {
        const targetType = definition[key];
        if (
          isCreate === false ||
          targetType.isOnlyAfterCreate === false
        ) {
          // For data available only after creation, test only if the entity is not being created
          target[key] = targetType.test(value[key], isCreate);
        }
      }
    } catch(e) {
      if (e instanceof ValidationError) {
        // Apply the key to the error
        if (e.key === null) {
          e.key = key;
        } else {
          e.key = `${key}.${e.key}`;
        }
      }

      throw e;
    }

    return target;
  }
}

module.exports = AbstractDataDefinition;
