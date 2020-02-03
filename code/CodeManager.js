module.exports = class CodeManager {
  static EXPIRED_AT = 10 * 1000;

  constructor({ codeGenerator } = {}) {
    this.codeGenerator = codeGenerator;
    this.issuedCodeList = [];
  }

  async createCode({ userId, clientId, platform, requestedAt = Date.now() } = {}) {
    const result = this.codeGenerator.generate();
    this.issuedCodeList.push({
      userId,
      clientId,
      platform,
      code: result,
      requestedAt,
      expiredAt: requestedAt + CodeManager.EXPIRED_AT
    });
    return result;
  }

  isIssuedCode({ userId, clientId, platform }) {
    return this.issuedCodeList.find((each) => {
      return each.userId === userId
        && each.clientId === clientId
        && each.platform === platform;
    });
  }

  isValidCode({ code, requestedAt = Date.now() }) {
    const issuedCode = this.issuedCodeList.find((each) => each.code === code);
    if (! issuedCode) {
      throw new Error('invalid_request');
    }

    return (issuedCode.expiredAt > requestedAt);
  }
};

