const assert = require("assert");
const {suite, test, setup, teardown} = require("mocha");
const { CodeGenerator, CodeManager } = require('../code');

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
    class FakeCodeGenerator {
      currentIndex = 0;
      codeList = ['code_1', 'code_2', 'code_3'];

      generate() {
        return this.codeList[this.currentIndex++];
      }
    }

    codeManager = new CodeManager({
      codeGenerator: new FakeCodeGenerator(),
    });

    params = {
      userId: 'user_1',
      clientId: 'client_1',
      platform: 'pc',
    };
  });

  test('code 발급 요청', async () => {
    const code = await codeManager.createCode(params);
    assert.equal(code, 'code_1');
  });

  test('code 발급여부 확인', async () => {
    await codeManager.createCode(params);
    const isIssued = codeManager.isIssuedCode(params);
    assert.ok(isIssued);
  });

  test('발급된 code 검증', async () => {
    const requestedAt = Date.now();
    const expiredAt = requestedAt + (10 * 1000);
    const code = await codeManager.createCode({ ...params, requestedAt });
    assert.ok(codeManager.isValidCode({ code, requestedAt }));
    assert.ok(codeManager.isValidCode({ code, requestedAt: expiredAt - 1 }));
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


  //
  // test('token 발급 요청', () => {
  //   const codeManager = new CodeManager({
  //     codeGenerator: {
  //       generate: () => {
  //         return 'code_1234';
  //       }
  //     },
  //     accessTokenGenerator: {
  //       generate: () => {
  //         return 'access_token_1234';
  //       }
  //     },
  //     refreshTokenGenerator: {
  //       generate: () => {
  //         return 'refresh_token_1234';
  //       }
  //     }
  //   });
  //
  //   const code = codeManager.createCode({ userId: 'u1234', clientId: '123' });
  //   const token = codeManager.createTokenByCode(code);
  //   const token = codeManager.createTokenByRefreshToken(code);
  //
  //   assert.equal(code, 'code1234');
  //   assert.equal(token.accressToken, 'token1234');
  // });
  //
  // test('token 재사용 요청 ~> code, token 파기하기', () => {
  //
  // });
});
