const assert = require("assert");
const {suite, test, setup, teardown} = require("mocha");
const CommonError = require("../errors/CommonError");

class InvalidRequestError extends CommonError { }
class UnauthorizedCodeError extends CommonError { }

suite('CommonError', () => {
  test('#name', () => {
    assert.equal('common', new CommonError().errorCode);

    const invalidRequestError = new InvalidRequestError({ statusCode: 400, message: '잘못된 입력입니다.' });
    assert.equal(400, invalidRequestError.statusCode);
    assert.equal('invalid_request', invalidRequestError.errorCode);
    assert.equal('잘못된 입력입니다.', invalidRequestError.message);

    const unauthorizedCodeError = new UnauthorizedCodeError();
    assert.equal(500, unauthorizedCodeError.statusCode);
    assert.equal('unauthorized_code', unauthorizedCodeError.errorCode);
    assert.equal('unauthorized_code', unauthorizedCodeError.message);
  });
});
