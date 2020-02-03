const assert = require("assert");
const {test} = require("mocha");
const camelcaseKeys = require('camelcase-keys');

test('camelcaseKeys', () => {
  const object = {
    response_type: 'code',
  };
  assert.equal(camelcaseKeys(object).response_type, undefined);
  assert.equal(camelcaseKeys(object).responseType, 'code');
});
