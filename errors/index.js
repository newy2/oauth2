
class CommonError extends Error {
  constructor({ errorCode, errorDescription, statusCode = 400 } = {}) {
    super(errorDescription);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorDescription = errorDescription || errorCode;
  }
};

class ErrorFactory {
  static newInvalidRequest(errorDescription) {
    return new CommonError({ errorDescription, errorCode: 'invalid_request' });
  }
  static newUnauthorizedClient(errorDescription) {
    return new CommonError({ errorDescription, errorCode: 'unauthorized_client' });
  }
  static newAccessDenied(errorDescription) {
    return new CommonError({ errorDescription, errorCode: 'access_denied' });
  }
  static newInvalidScope(errorDescription) {
    return new CommonError({ errorDescription, errorCode: 'invalid_scope' });
  }
  static newInvalidClient(errorDescription) {
    return new CommonError({ errorDescription, errorCode: 'invalid_client' });
  }
  static newInvalidGrant(errorDescription) {
    return new CommonError({ errorDescription, errorCode: 'invalid_grant' });
  }
  static newUnsupportedResponseType(errorDescription) {
    return new CommonError({ errorDescription, errorCode: 'unsupported_response_type' });
  }
  static newUnsupportedGrantType(errorDescription) {
    return new CommonError({ errorDescription, errorCode: 'unsupported_grant_type' });
  }
  static newServerError(errorDescription) {
    return new CommonError({ errorDescription, errorCode: 'server_error', statusCode: 500 });
  }
  static newTemporarilyUnavailable(errorDescription) {
    return new CommonError({ errorDescription, errorCode: 'temporarily_unavailable', statusCode: 503 });
  }
}

module.exports = {
  ErrorFactory,
  CommonError,
};