const { TokenModel } = require('../model');
const { Time } = require("../const/consts");

module.exports = class TokenDao {
  static EXPIRTED_MAP = {
    100: 10 * Time.SECOND,
    200: 6 * Time.HOUR,
    300: 30 * Time.DAY,
  };

  static rows = [
    {
      type: 100,
      value: 'hjkjsjkdjkdjkdjk',
      createdAt: '2019-01-02',
      expiredAt: '2019-01-02',
    }
  ];
  static rows = [];

  static clear() {
    this.rows = [];
  }

  static find({ tokenType, tokenValue, now = Date.now() }) {

  }

  static setToken(conn, params) {
    const { type, userId, clientId, platform, value, now = Date.now() } = params;

    const row = {
      type,
      userId,
      clientId,
      platform,
      value,
      createdAt: now,
      expiredAt: now + this.EXPIRTED_MAP[type],
    };

    this.rows.push(row);

    return TokenModel.fromJson(row);
  }
};