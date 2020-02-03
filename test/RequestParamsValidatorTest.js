const assert = require("assert");
const {suite, test, setup, teardown} = require("mocha");
const { RequestParamsValidator } = require('../code');
const { FakeOAuthClientInfos } = require('./model');
const camelcaseKeys = require('camelcase-keys');

suite('1. 코드얻기 API params 확인', () => {
  let validator;
  let params;
  setup(() => {
    validator = new RequestParamsValidator({
      clientIds: FakeOAuthClientInfos.createForTest(),
    });

    params = camelcaseKeys({
      response_type: 'code',
      client_id: '123',
      redirect_uri: 'https://example.com/callback',
    })
  });

  test('에러 없음 - 필수 파라미터가 모두 있는 경우', async () => {
    try {
      await validator.validate({ params, type: 'code' });
    } catch (e) {
      assert.fail();
    }
  });

  test('invalid_request - 필수 key 가 없는 경우', async () => {
    const mandatoryList = [
      'responseType',
      'clientId',
      'redirectUri',
    ];

    for (const eachKey of mandatoryList) {
      const paramsClone = Object.assign({}, params);
      assert.equal(Object.keys(paramsClone).length, 3);
      delete paramsClone[eachKey];
      assert.equal(Object.keys(paramsClone).length, 2);

      try {
        await validator.validate({ type: 'code', params: paramsClone });
        assert.fail();
      } catch (e) {
        assert.equal(e.message, 'invalid_request');
      }
    }
  });

  test('unsupported_response_type - 지원하지 않은 response_type 을 전달한 경우', async () => {
    try {
      await validator.validate({
        type: 'code',
        params: {
          ...params,
          responseType: 'not_support_response_type'
        }
      });
      assert.fail();
    } catch (e) {
      assert.equal(e.message, 'unsupported_response_type');
    }
  });

  suite('인증서버에 등록되지 않은 client 정보를 전달한 경우', () => {
    test('unauthorized_client - 인증서버에 등록되지 않은 client_id 를 전달한 경우', async () => {
      try {
        await validator.validate({
          type: 'code',
          params: {
            ...params,
            clientId: 'not_registered_client_id',
          },
        });
        assert.fail();
      } catch (e) {
        assert.equal(e.message, 'unauthorized_client');
      }
    });

    test('invalid_request - 인증서버에 등록되지 않은 redirect_uri 를 전달한 경우', async () => {
      try {
        await validator.validate({
          type: 'code',
          params: {
            ...params,
            redirectUri: 'not_registered_redirect_uri',
          },
        });
        assert.fail();
      } catch (e) {
        assert.equal(e.message, 'invalid_request');
      }
    });
  });
});

suite('2. 토큰얻기 API params 확인', () => {
  let validator;
  let params;
  setup(() => {
    validator = new RequestParamsValidator({
      clientIds: FakeOAuthClientInfos.createForTest(),
    });

    params = {
      grantType: 'token',
      clientId: '123',
      clientSecret: 'abc',
      redirectUri: 'https://example.com/callback',
      code: '0000',
    }
  });

  test('에러 없음 - 필수 파라미터가 모두 있는 경우', async () => {
    try {
      await validator.validate({
        params,
        type: 'token',
      });
      assert.ok(true);
    } catch (e) {
      assert.fail();
    }
  });

  test('invalid_request - 필수 key 가 없는 경우', async () => {
    const tokenMandatoryList = [
      'grantType',
      'clientId',
      'clientSecret',
      'redirectUri',
      'code',
    ];

    for(const eachKey of tokenMandatoryList) {
      const paramsClone = Object.assign({}, params);
      assert.equal(Object.keys(paramsClone).length, 5);
      delete paramsClone[eachKey];
      assert.equal(Object.keys(paramsClone).length, 4);

      try {
        await validator.validate({
          type: 'token',
          params: paramsClone,
        });
        assert.fail();
      } catch (e) {
        assert.equal(e.message, 'invalid_request');
      }
    }
  });

  test('unsupported_grant_type - 지원하지 않은 grant_type 을 전달한 경우', async () => {
    try {
      await validator.validate({
        type: 'token',
        params: {
          ...params,
          grantType: 'not_support_grant_type',
        },
      });
      assert.fail();
    } catch (e) {
      assert.equal(e.message, 'unsupported_grant_type');
    }
  });

  suite('인증서버에 등록되지 않은 client 정보를 전달한 경우', () => {
    test('unauthorized_client - 인증서버에 등록되지 않은 client_id 를 전달한 경우', async () => {
      try {
        await validator.validate({
          type: 'token',
          params: {
            ...params,
            clientId: 'not_registered_client_id',
          },
        });
        assert.fail();
      } catch (e) {
        assert.equal(e.message, 'unauthorized_client');
      }
    });

    test('unauthorized_client - 인증서버에 등록되지 않은 client_secret 를 전달한 경우', async () => {
      try {
        await validator.validate({
          type: 'token',
          params: {
            ...params,
            clientSecret: 'not_registered_client_secret',
          },
        });
        assert.fail();
      } catch (e) {
        assert.equal(e.message, 'unauthorized_client');
      }
    });

    test('invalid_request - 인증서버에 등록되지 않은 redirect_uri 를 전달한 경우', async () => {
      try {
        await validator.validate({
          type: 'token',
          params: {
            ...params,
            redirectUri: 'not_registered_redirect_uri',
          },
        });
        assert.fail();
      } catch (e) {
        assert.equal(e.message, 'invalid_request');
      }
    });
  });
});