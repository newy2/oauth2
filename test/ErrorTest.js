const assert = require("assert");
const {suite, test, setup, teardown} = require("mocha");
const { ErrorFactory } = require("../errors");

suite('ErrorFactory', () => {
  test('#newError', () => {
    // 에러 메세지가 없는 경우, errorDescription 으로 errorCode
    const invalidRequestError = ErrorFactory.newInvalidRequest();
    assert.equal(400, invalidRequestError.statusCode);
    assert.equal('invalid_request', invalidRequestError.errorCode);
    assert.equal('invalid_request', invalidRequestError.errorDescription);
    assert.equal(invalidRequestError.errorCode, invalidRequestError.errorDescription);

    // 커스텀 errorDescription
    const unauthorizedClient = ErrorFactory.newUnauthorizedClient('커스텀 에러 메세지');
    assert.equal(400, unauthorizedClient.statusCode);
    assert.equal('unauthorized_client', unauthorizedClient.errorCode);
    assert.equal('커스텀 에러 메세지', unauthorizedClient.errorDescription);

    const accessDenied = ErrorFactory.newAccessDenied();
    assert.equal(400, accessDenied.statusCode);
    assert.equal('access_denied', accessDenied.errorCode);

    const invalidScope = ErrorFactory.newInvalidScope();
    assert.equal(400, invalidScope.statusCode);
    assert.equal('invalid_scope', invalidScope.errorCode);

    const invalidClient = ErrorFactory.newInvalidClient();
    assert.equal(400, invalidClient.statusCode);
    assert.equal('invalid_client', invalidClient.errorCode);

    const invalidGrant = ErrorFactory.newInvalidGrant();
    assert.equal(400, invalidGrant.statusCode);
    assert.equal('invalid_grant', invalidGrant.errorCode);

    const unsupportedResponseType = ErrorFactory.newUnsupportedResponseType();
    assert.equal(400, unsupportedResponseType.statusCode);
    assert.equal('unsupported_response_type', unsupportedResponseType.errorCode);

    const unsupportedGrantType = ErrorFactory.newUnsupportedGrantType();
    assert.equal(400, unsupportedGrantType.statusCode);
    assert.equal('unsupported_grant_type', unsupportedGrantType.errorCode);

    const serverError = ErrorFactory.newServerError();
    assert.equal(500, serverError.statusCode);
    assert.equal('server_error', serverError.errorCode);

    const temporarilyUnavailable = ErrorFactory.newTemporarilyUnavailable();
    assert.equal(503, temporarilyUnavailable.statusCode);
    assert.equal('temporarily_unavailable', temporarilyUnavailable.errorCode);
  });
});
