const isArray = require('lodash.isarray');

module.exports = class BaseModel {
  static fromJson(json = {}, doShallowCopy = false) {
    const checkAlreadyModelObject = (_json) => {
      if (doShallowCopy) {
        return;
      }

      for (let p = _json; p.constructor !== Object; p = p.__proto__) {
        if (p.constructor === BaseModel) {
          throw new Error('이미 다른 Model 클래스의 prototype 을 상속받은 객체입니다!');
        }
      }
    };

    const result = (doShallowCopy) ? {...json} : json;
    if (isArray(result)) {
      result.forEach((each) => {
        checkAlreadyModelObject(each);
        each.__proto__ = this.prototype;
      })
    } else {
      checkAlreadyModelObject(result);
      result.__proto__ = this.prototype;
    }
    return result;
  }


};
