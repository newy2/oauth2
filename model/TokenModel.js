const BaseModel = require('./BaseModel');

module.exports = class TokenModel extends BaseModel {
  isValid(now = Date.now()) {
    return this.createdAt <= now && now <= this.expiredAt;
  }

  getValue() {
    return this.value;
  }
};