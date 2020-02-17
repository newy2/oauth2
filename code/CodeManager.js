const { Time } = require("../const/consts");
const { ErrorFactory } = require("../errors");
const { TokenModel } = require('../model');
const { TokenDao } = require('../dao');

module.exports = class CodeManager {
  static CODE_EXPIRED_AT = 10 * Time.SECOND;
  static ACCESS_TOKEN_EXPIRED_AT = 6 * Time.HOUR;
  static REFRESH_TOKEN_EXPIRED_AT = 30 * Time.DAY;

  constructor({ codeGenerator, accessTokenGenerator, refreshTokenGenerator } = {}) {
    this.issuedAuthorizationList = [];
    this.issuedTokenList = [];
    this.codeGenerator = codeGenerator;
    this.accessTokenGenerator = accessTokenGenerator;
    this.refreshTokenGenerator = refreshTokenGenerator;
  }

  async createAuthorizationCode({ userId, clientId, platform, requestedAt = Date.now() } = {}) {
    const authorizationCode = this.codeGenerator.generate();
    if (await this.isIssuedAuthorizationCode({ userId, clientId, platform, requestedAt })) {
      const index = this.issuedAuthorizationList.findIndex((each) => (
        each.userId === userId
        && each.clientId === clientId
        && each.platform === platform
      ));
      this.issuedAuthorizationList.splice(index, 1);
    }

    this.issuedAuthorizationList.push({
      userId,
      clientId,
      platform,
      authorizationCode,
      requestedAt,
      expiredAt: requestedAt + CodeManager.CODE_EXPIRED_AT
    });
    return authorizationCode;
  }

  async createTokenByAuthorizationCode({ authorizationCode, requestedAt = Date.now() }) {
    const accessToken = this.accessTokenGenerator.generate();
    const refreshToken = this.refreshTokenGenerator.generate();

    const issuedCode = this.issuedAuthorizationList.find((each) => each.authorizationCode === authorizationCode);

    this.issuedTokenList.push({
      accessToken,
      refreshToken,
      usedCode: issuedCode.authorizationCode,
      userId: issuedCode.userId,
      clientId: issuedCode.clientId,
      platform: issuedCode.platform,
      requestedAt,
      accessTokenExpiredAt: requestedAt + CodeManager.ACCESS_TOKEN_EXPIRED_AT,
      refreshTokenExpiredAt: requestedAt + CodeManager.REFRESH_TOKEN_EXPIRED_AT,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async isIssuedAuthorizationCode({ userId, clientId, platform, requestedAt = Date.now() } = {}) {
    return this.issuedAuthorizationList.find((each) => (
      each.userId === userId
      && each.clientId === clientId
      && each.platform === platform
      && each.expiredAt > requestedAt
    ));
  }

  isValidAuthorizationCode({ authorizationCode, requestedAt = Date.now() } = {}) {
    const code = this.issuedAuthorizationList.find((each) => each.authorizationCode === authorizationCode);
    if (! code) {
      throw ErrorFactory.newInvalidRequest('발급된 authorization code 가 없습니다.');
    }

    return TokenModel.fromJson({
      token: code.authorizationCode,
      createdAt: code.requestedAt,
      expiredAt: code.expiredAt,
    }).isValid(requestedAt);
  }

  isValidAccessToken({ accessToken, requestedAt = Date.now() } = {}) {
    const token = this.issuedTokenList.find((each) => each.accessToken === accessToken);
    if (! token) {
      throw new Error('invalid_request');
    }

    return TokenModel.fromJson({
      token: token.accessToken,
      createdAt: token.requestedAt,
      expiredAt: token.accessTokenExpiredAt,
    }).isValid(requestedAt);
  }

  isValidRefreshToken({ refreshToken, requestedAt = Date.now() } = {}) {
    const token = this.issuedTokenList.find((each) => each.refreshToken === refreshToken);
    if (! token) {
      throw new Error('invalid_request');
    }

    return TokenModel.fromJson({
      token: token.refreshToken,
      createdAt: token.requestedAt,
      expiredAt: token.refreshTokenExpiredAt,
    }).isValid(requestedAt);
  }
};

