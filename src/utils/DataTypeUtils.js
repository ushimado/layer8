class DataTypeUtils {

  static isNumber(value) {
    return typeof value === 'number';
  }

  static isInteger(value) {
    return (
      DataTypeUtils.isNumber(value) &&
      Math.floor(value) === value
    );
  }

}

module.exports = DataTypeUtils;
