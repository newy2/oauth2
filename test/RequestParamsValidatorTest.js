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
      delete paramsClone[eachKey];
      assert.equal(2, Object.keys(paramsClone).length);

      try {
        await validator.validate({ type: 'code', params: paramsClone });
        assert.fail();
      } catch (e) {
        assert.equal('invalid_request', e.errorCode);
        assert.equal('파라미터가 잘못되었거나 요청문이 잘못되었습니다.', e.errorDescription);
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
      assert.equal('unsupported_response_type', e.errorCode);
      assert.equal('정의되지 않은 반환 형식으로 요청했습니다.', e.errorDescription);
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
        assert.equal('unauthorized_client', e.errorCode);
        assert.equal('인증받지 않은 인증 코드(authorization code)로 요청했습니다.', e.errorDescription);
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
        assert.equal('invalid_request', e.errorCode);
        assert.equal('서버에 등록된 redirect_uri 와 전달받은 redirect_uri 가 다릅니다.', e.errorDescription);
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

    params = camelcaseKeys({
      grant_type: 'token',
      client_id: '123',
      client_secret: 'abc',
      redirect_uri: 'https://example.com/callback',
      code: '0000',
    });
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
      delete paramsClone[eachKey];
      assert.equal(4, Object.keys(paramsClone).length);

      try {
        await validator.validate({
          type: 'token',
          params: paramsClone,
        });
        assert.fail();
      } catch (e) {
        assert.equal('invalid_request', e.errorCode);
        assert.equal('파라미터가 잘못되었거나 요청문이 잘못되었습니다.', e.errorDescription);
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
      assert.equal('unsupported_grant_type', e.errorCode);
      assert.equal('정의되지 않은 권한 형식으로 요청했습니다.', e.errorDescription);
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
        assert.equal('unauthorized_client', e.errorCode);
        assert.equal('인증받지 않은 인증 코드(authorization code)로 요청했습니다.', e.errorDescription);
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
        assert.equal('unauthorized_client', e.errorCode);
        assert.equal('인증받지 않은 인증 코드(authorization code)로 요청했습니다.', e.errorDescription);
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
        assert.equal('invalid_request', e.errorCode);
        assert.equal('서버에 등록된 redirect_uri 와 전달받은 redirect_uri 가 다릅니다.', e.errorDescription);
      }
    });
  });
});