const { OAuthClientInfos } = require('../../model');

module.exports = class FakeOAuthClientInfos extends OAuthClientInfos {
  static createForTest() {
    const testOAuthClientDataList = [
      {
        clientId: '123',
        redirectUri: 'https://example.com/callback',
        clientSecret: 'abc',
      }
    ];
    return new FakeOAuthClientInfos(testOAuthClientDataList)
  };

  constructor(list) {
    super();
    this.list = list;
  }

  async find({ clientId, clientSecret }) {
    return this.list.find((each) => {
      const isSameClientId = each.clientId === clientId;
      const isSameClientSecret = (clientSecret) ? each.clientSecret === clientSecret : true;
      return isSameClientId && isSameClientSecret;
    });
  }
};
