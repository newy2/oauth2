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

  test('code 발급 요청', async () => {
    assert.equal('code_1', await codeManager.createCode(params));
    assert.equal('code_2', await codeManager.createCode(params));
    assert.equal('code_3', await codeManager.createCode(params));
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

    assert.equal(false, codeManager.isValidCode({ code, requestedAt: requestedAt - 1 }));
    assert.ok(codeManager.isValidCode({ code, requestedAt: requestedAt }));
    assert.ok(codeManager.isValidCode({ code, requestedAt: expiredAt }));
    assert.equal(false, codeManager.isValidCode({ code, requestedAt: expiredAt + 1 }));
  });

  test('발급되지 않은 code 를 검증하는 경우', () => {
    try {
      codeManager.isValidCode({ code: 'not_issued_code' });
      assert.fail();
    } catch(e) {
      assert.equal('invalid_request', e.errorCode);
      assert.equal('발급된 authorization code 가 없습니다.', e.errorDescription);
    }
  });

  test('token 발급 요청', async () => {
    const requestedAt = Date.now();
    const expiredAt = requestedAt + (6 * Time.HOUR);
    const code = await codeManager.createCode({ userId: 'u1234', clientId: '123' });
    const { accessToken, refreshToken } = await codeManager.createTokenByCode({ code, requestedAt });

    assert.equal('code_1', code);
    assert.equal('access_token_1', accessToken);
    assert.equal('refresh_token_1', refreshToken);

    assert.equal(false, codeManager.isValidAccessToken({ accessToken, requestedAt: requestedAt - 1 }));
    assert.ok(codeManager.isValidAccessToken({ accessToken, requestedAt: requestedAt }));
    assert.ok(codeManager.isValidAccessToken({ accessToken, requestedAt: expiredAt }));
    assert.equal(false, codeManager.isValidAccessToken({ accessToken, requestedAt: expiredAt + 1 }));
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
