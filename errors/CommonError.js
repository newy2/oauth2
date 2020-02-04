const { snakeCase } = require("snake-case");

module.exports = class CommonError extends Error {
  constructor({ errorDescription, statusCode = 500 } = {}) {
    super(errorDescription);
    this.errorCode = snakeCase((this.constructor.name).replace(/(E|e)rror/g, ''));
    this.statusCode = statusCode;
    this.errorDescription = errorDescription || this.errorCode;
  }
};
