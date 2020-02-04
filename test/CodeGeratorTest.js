const assert = require("assert");
const {suite, test, setup, teardown} = require("mocha");
const { CodeGenerator, CodeManager } = require('../code');
const { Time } = require("../const/consts");

suite('CodeGenerator', () => {
  test('#range', () => {
    const range = (value) => Math.floor((value + 9) / 10);
    assert.equal(1, range(1));
    assert.equal(1, range(10));
    assert.equal(2, range(11));
  });

  test('#generate', () => {
    const codeGenerator = new CodeGenerator(16);
    const code = codeGenerator.generate();
    assert.equal('string', typeof code);
    assert.equal(16, code.length);
  });
});

suite('CodeManager', () => {
  let codeManager;
  let params;
  setup(() => {
    class FakeGenerator {
      constructor(prefix) {
        this.currentIndex = 0;
        this.codeList = [...Array(10)].map((_, index) => prefix + (index + 1));
      }

      generate() {
        return this.codeList[this.currentIndex++];
      }
    }

    codeManager = new CodeManager({
      codeGenerator: new FakeGenerator('code_'),
      accessTokenGenerator: new FakeGenerator('access_token_'),
      refreshTokenGenerator: new FakeGenerator('refresh_token_'),
    });

    params = {
      userId: 'user_1',
      clientId: 'client_1',
      platform: 'pc',
    };
  });

  test('authorization code 발급 요청', async () => {
    assert.equal('code_1', await codeManager.createAuthorizationCode(params));
    assert.ok(await codeManager.isValidAuthorizationCode({ authorizationCode: 'code_1' }));
  });

  test('같은 파라미터로 authorization code 발급 요청을 여러 번 한 경우, 과거에 발급된 code 는 폐기된다.', async () => {
    assert.equal('code_1', await codeManager.createAuthorizationCode(params));
    assert.equal('code_2', await codeManager.createAuthorizationCode(params));
    assert.ok(await codeManager.isValidAuthorizationCode({ authorizationCode: 'code_2' }));
    try {
      await codeManager.isValidAuthorizationCode({ authorizationCode: 'code_1' });
      assert.fail();
    } catch (e) {
      assert.equal('invalid_request', e.errorCode);
      assert.equal('발급된 authorization code 가 없습니다.', e.errorDescription);
    }
  });

  test('authorizationCode 발급여부 확인', async () => {
    await codeManager.createAuthorizationCode(params);
    assert.ok(await codeManager.isIssuedAuthorizationCode(params));
  });

  test('발급되지 않은 authorizationCode 를 검증하는 경우', () => {
    try {
      codeManager.isValidAuthorizationCode({ authorizationCode: 'not_issued_code' });
      assert.fail();
    } catch(e) {
      assert.equal('invalid_request', e.errorCode);
      assert.equal('발급된 authorization code 가 없습니다.', e.errorDescription);
    }
  });

  test('token 발급 요청', async () => {
    const authorizationCode = await codeManager.createAuthorizationCode({ userId: 'u1234', clientId: '123' });
    const { accessToken, refreshToken } = await codeManager.createTokenByAuthorizationCode({ authorizationCode });

    assert.equal('code_1', authorizationCode);
    assert.equal('access_token_1', accessToken);
    assert.equal('refresh_token_1', refreshToken);
    assert.ok(codeManager.isValidAccessToken({ accessToken }));
    assert.ok(codeManager.isValidRefreshToken({ refreshToken }));
  });

  test('authorization code 사용 가능시간 확인', async () => {
    const requestedAt = Date.now();
    const expiredAt = requestedAt + (10 * Time.SECOND);
    const authorizationCode = await codeManager.createAuthorizationCode({ ...params, requestedAt });

    assert.equal(false, codeManager.isValidAuthorizationCode({ authorizationCode, requestedAt: requestedAt - 1 }));
    assert.ok(codeManager.isValidAuthorizationCode({ authorizationCode, requestedAt: requestedAt }));
    assert.ok(codeManager.isValidAuthorizationCode({ authorizationCode, requestedAt: expiredAt }));
    assert.equal(false, codeManager.isValidAuthorizationCode({ authorizationCode, requestedAt: expiredAt + 1 }));
  });

  test('access token 사용 가능시간 확인', async () => {
    const requestedAt = Date.now();
    const expiredAt = requestedAt + (6 * Time.HOUR);
    const authorizationCode = await codeManager.createAuthorizationCode({ userId: 'u1234', clientId: '123' });
    const { accessToken } = await codeManager.createTokenByAuthorizationCode({ authorizationCode, requestedAt });

    assert.equal(false, codeManager.isValidAccessToken({ accessToken, requestedAt: requestedAt - 1 }));
    assert.ok(codeManager.isValidAccessToken({ accessToken, requestedAt: requestedAt }));
    assert.ok(codeManager.isValidAccessToken({ accessToken, requestedAt: expiredAt }));
    assert.equal(false, codeManager.isValidAccessToken({ accessToken, requestedAt: expiredAt + 1 }));
  });

  test('refresh token 사용 가능시간 확인', async () => {
    const requestedAt = Date.now();
    const expiredAt = requestedAt + (30 * Time.DAY);
    const authorizationCode = await codeManager.createAuthorizationCode({ userId: 'u1234', clientId: '123' });
    const { refreshToken } = await codeManager.createTokenByAuthorizationCode({ authorizationCode, requestedAt });

    assert.equal(false, codeManager.isValidRefreshToken({ refreshToken, requestedAt: requestedAt - 1 }));
    assert.ok(codeManager.isValidRefreshToken({ refreshToken, requestedAt: requestedAt }));
    assert.ok(codeManager.isValidRefreshToken({ refreshToken, requestedAt: expiredAt }));
    assert.equal(false, codeManager.isValidRefreshToken({ refreshToken, requestedAt: expiredAt + 1 }));
  });

  test('발급되지 않은 authorizationCode 로 token 을 얻는 경우', () => {
    // TODO 에러
  });

  test('사용기간이 끝난 authorizationCode 로 token 을 얻는 경우', () => {
    // TODO 에러
  });

  test('token 재발금 요청 ~> authorizationCode, token 파기하기', () => {

  });
});
