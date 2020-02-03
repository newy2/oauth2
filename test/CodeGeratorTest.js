const assert = require("assert");
const {suite, test, setup, teardown} = require("mocha");
const { CodeGenerator, CodeManager } = require('../code');
const { Time } = require("../const/consts");

suite('CodeGenerator', () => {
  test('#range', () => {
    const range = (value) => Math.floor((value + 9) / 10);
    assert.equal(range(1), 1);
    assert.equal(range(10), 1);
    assert.equal(range(11), 2);
  });

  test('#generate', () => {
    const codeGenerator = new CodeGenerator(16);
    const code = codeGenerator.generate();
    assert.equal(typeof code, 'string');
    assert.equal(code.length, 16);
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

  test('code 발급 요청', async () => {
    assert.equal(await codeManager.createCode(params), 'code_1');
    assert.equal(await codeManager.createCode(params), 'code_2');
    assert.equal(await codeManager.createCode(params), 'code_3');
  });

  test('code 발급여부 확인', async () => {
    await codeManager.createCode(params);
    const isIssued = codeManager.isIssuedCode(params);
    assert.ok(isIssued);
  });

  test('발급된 code 검증', async () => {
    const requestedAt = Date.now();
    const expiredAt = requestedAt + (10 * Time.SECOND);
    const code = await codeManager.createCode({ ...params, requestedAt });

    assert.equal(codeManager.isValidCode({ code, requestedAt: requestedAt - 1 }), false);
    assert.equal(codeManager.isValidCode({ code, requestedAt: requestedAt }), true);
    assert.equal(codeManager.isValidCode({ code, requestedAt: expiredAt - 1 }), true);
    assert.equal(codeManager.isValidCode({ code, requestedAt: expiredAt }), false);
  });

  test('발급되지 않은 code 를 검증하는 경우', () => {
    try {
      codeManager.isValidCode({ code: 'not_issued_code' });
      assert.fail();
    } catch(e) {
      assert.equal(e.message, 'invalid_request');
    }
  });

  test('token 발급 요청', async () => {
    const requestedAt = Date.now();
    const expiredAt = requestedAt + (6 * Time.HOUR);
    const code = await codeManager.createCode({ userId: 'u1234', clientId: '123' });
    const { accessToken, refreshToken } = await codeManager.createTokenByCode({ code, requestedAt });
    assert.equal(code, 'code_1');
    assert.equal(accessToken, 'access_token_1');
    assert.equal(refreshToken, 'refresh_token_1');

    assert.equal(codeManager.isValidAccessToken({ accessToken, requestedAt: requestedAt - 1 }), false);
    assert.equal(codeManager.isValidAccessToken({ accessToken, requestedAt: requestedAt }), true);
    assert.equal(codeManager.isValidAccessToken({ accessToken, requestedAt: expiredAt - 1 }), true);
    assert.equal(codeManager.isValidAccessToken({ accessToken, requestedAt: expiredAt }), false);
  });

  test('발급되지 않은 code 로 token 을 얻는 경우', () => {
    // TODO 에러
  });

  test('사용기간이 끝난 code 로 token 을 얻는 경우', () => {
    // TODO 에러
  });

  test('token 재발금 요청 ~> code, token 파기하기', () => {

  });
});
