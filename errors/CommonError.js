const { snakeCase } = require("snake-case");

module.exports = class CommonError extends Error {
  constructor({ message, statusCode = 500 } = {}) {
    super(message);
    this.errorCode = snakeCase((this.constructor.name).replace(/(E|e)rror/g, ''));
    this.statusCode = statusCode;
    this.message = message || this.errorCode;
  }
};
