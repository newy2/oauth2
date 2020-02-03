const assert = require("assert");
const {test} = require("mocha");
const camelcaseKeys = require('camelcase-keys');

test('camelcaseKeys', () => {
  const object = {
    response_type: 'code',
  };
  assert.equal(undefined, camelcaseKeys(object).response_type);
  assert.equal('code', camelcaseKeys(object).responseType);
});
