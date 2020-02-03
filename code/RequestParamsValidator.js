const OAuthClientInfos = require('../model/OAuthClientInfos');

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

  constructor({ clientIds }) {
    if (! clientIds instanceof OAuthClientInfos) {
      throw new Error();
    }

    this.clientIds = clientIds;
  }

  async validate({ type, params }) {
    this.getMandatoryList(type).forEach((each) => {
      if (! params[each]) {
        throw new Error('invalid_request');
      }
    });

    if (type === 'code' && params.responseType !== 'code') {
      throw new Error('unsupported_response_type');
    }

    if (type === 'token' && params.grantType !== 'token') {
      throw new Error('unsupported_grant_type');
    }

    const { clientId, clientSecret } = params;
    const clientData = await this.clientIds.find({ clientId, clientSecret });
    if (! clientData) {
      throw new Error('unauthorized_client');
    }

    if (params.redirectUri !== clientData.redirectUri) {
      throw new Error('invalid_request');
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
