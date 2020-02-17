const OAuthClientInfos = require('../dao/OAuthClientInfos');
const { ErrorFactory } = require('../errors');

module.exports = class RequestParamsValidator {
  static MANDATORY_LIST = {
    code: ['clientId', 'redirectUri', 'responseType'],
    token: ['grantType', 'clientId', 'clientSecret', 'redirectUri', 'code'],
  };

  constructor({ clientIds } = {}) {
    if (! clientIds instanceof OAuthClientInfos) {
      throw new Error();
    }
    this.clientIds = clientIds;
  }

  async validate({ type, params } = {}) {
    RequestParamsValidator.MANDATORY_LIST[type].forEach((each) => {
      if (! params[each]) {
        throw ErrorFactory.newInvalidRequest('파라미터가 잘못되었거나 요청문이 잘못되었습니다.');
      }
    });

    const { responseType, grantType, clientId, clientSecret, redirectUri } = params;

    if (type === 'code' && type !== responseType) {
      throw ErrorFactory.newUnsupportedResponseType('정의되지 않은 반환 형식으로 요청했습니다.');
    }

    if (type === 'token' && type !== grantType) {
      throw ErrorFactory.newUnsupportedGrantType('정의되지 않은 권한 형식으로 요청했습니다.');
    }

    const clientData = await this.clientIds.find({ clientId, clientSecret });
    if (! clientData) {
      throw ErrorFactory.newUnauthorizedClient('인증받지 않은 인증 코드(authorization code)로 요청했습니다.');
    }

    if (redirectUri !== clientData.redirectUri) {
      throw ErrorFactory.newInvalidRequest('서버에 등록된 redirect_uri 와 전달받은 redirect_uri 가 다릅니다.');
    }
  }
};
