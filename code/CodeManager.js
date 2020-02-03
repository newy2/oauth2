const { Time } = require("../const/consts");

module.exports = class CodeManager {
  static CODE_EXPIRED_AT = 10 * Time.SECOND;
  static ACCESS_TOKEN_EXPIRED_AT = 6 * Time.HOUR;

  constructor({ codeGenerator, accessTokenGenerator, refreshTokenGenerator } = {}) {
    this.issuedCodeList = [];
    this.issuedAccessTokenList = [];
    this.codeGenerator = codeGenerator;
    this.accessTokenGenerator = accessTokenGenerator;
    this.refreshTokenGenerator = refreshTokenGenerator;
  }

  async createCode({ userId, clientId, platform, requestedAt = Date.now() } = {}) {
    const result = this.codeGenerator.generate();
    this.issuedCodeList.push({
      userId,
      clientId,
      platform,
      code: result,
      requestedAt,
      expiredAt: requestedAt + CodeManager.CODE_EXPIRED_AT
    });
    return result;
  }

  async createTokenByCode({ code, requestedAt = Date.now() }) {
    const accessToken = this.accessTokenGenerator.generate();
    const refreshToken = this.refreshTokenGenerator.generate();

    const issuedCode = this.issuedCodeList.find((each) => each.code === code);
    this.issuedAccessTokenList.push({
      accessToken,
      usedCode: issuedCode.code,
      userId: issuedCode.userId,
      clientId: issuedCode.clientId,
      platform: issuedCode.platform,
      requestedAt,
      expiredAt: requestedAt + CodeManager.ACCESS_TOKEN_EXPIRED_AT
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  isIssuedCode({ userId, clientId, platform } = {}) {
    return this.issuedCodeList.find((each) => {
      return each.userId === userId
        && each.clientId === clientId
        && each.platform === platform;
    });
  }

  isValidAccessToken({ accessToken, requestedAt = Date.now() } = {}) {
    const issuedAccessToken = this.issuedAccessTokenList.find((each) => each.accessToken === accessToken);
    if (! issuedAccessToken) {
      throw new Error('invalid_request');
    }

    return (issuedAccessToken.requestedAt <= requestedAt && requestedAt <= issuedAccessToken.expiredAt);
  }

  isValidCode({ code, requestedAt = Date.now() } = {}) {
    const issuedCode = this.issuedCodeList.find((each) => each.code === code);
    if (! issuedCode) {
      throw new Error('invalid_request');
    }

    return (issuedCode.requestedAt <= requestedAt && requestedAt <= issuedCode.expiredAt);
  }
};

