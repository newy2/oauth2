const OAuthClientInfos = require('../model/OAuthClientInfos');
const { ErrorFactory } = require('../errors');

module.exports = class RequestParamsValidator {
  static CODE_TYPE_MANDATORY_LIST = [
    'clientId',
    'redirectUri',
    'responseType',
  ];

  static TOKEN_TYPE_MANDATORY_LIST = [
    'grantType',
    'clientId',
    'clientSecret',
    'redirectUri',
    'code',
  ];

  constructor({ clientIds } = {}) {
    if (! clientIds instanceof OAuthClientInfos) {
      throw new Error();
    }

    this.clientIds = clientIds;
  }

  async validate({ type, params } = {}) {
    this.getMandatoryList(type).forEach((each) => {
      if (! params[each]) {
        throw ErrorFactory.newInvalidRequest('파라미터가 잘못되었거나 요청문이 잘못되었습니다.');
      }
    });

    if (type === 'code' && params.responseType !== 'code') {
      throw ErrorFactory.newUnsupportedResponseType('정의되지 않은 반환 형식으로 요청했습니다.');
    }

    if (type === 'token' && params.grantType !== 'token') {
      throw ErrorFactory.newUnsupportedGrantType('정의되지 않은 권한 형식으로 요청했습니다.');
    }

    const { clientId, clientSecret } = params;
    const clientData = await this.clientIds.find({ clientId, clientSecret });
    if (! clientData) {
      throw ErrorFactory.newUnauthorizedClient('인증받지 않은 인증 코드(authorization code)로 요청했습니다.');
    }

    if (params.redirectUri !== clientData.redirectUri) {
      throw ErrorFactory.newInvalidRequest('서버에 등록된 redirect_uri 와 전달받은 redirect_uri 가 다릅니다.');
    }
  }

  getMandatoryList(type) {
    switch (type) {
      case 'code':
        return RequestParamsValidator.CODE_TYPE_MANDATORY_LIST;
      case 'token':
        return RequestParamsValidator.TOKEN_TYPE_MANDATORY_LIST;
    }
  }
};
