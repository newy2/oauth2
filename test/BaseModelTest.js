const assert = require("assert");
const {suite, test, setup} = require("mocha");
const { BaseModel } = require("../model");

class UserInfoModel extends BaseModel {
  getName() {
    return this.name;
  }

  getAddress() {
    return [this.baseAddress, this.detailAddress].join(' ');
  }
}

suite('BaseModelTest', () => {
  let source;

  setup(() => {
    source = {
      name: '박수진',
      baseAddress: '서울시 중구',
      detailAddress: 'xx로 0번길',
      age: 30,
    };
  });

  test('#model 기본 생성법 (데이터 메모리 주소 공유)', () => {
    const model = UserInfoModel.fromJson(source);
    assert.equal('박수진', model.getName());
    assert.equal('서울시 중구 xx로 0번길', model.getAddress());
    assert.equal(model, source, '메모리 주소 공유')
  });

  test('#model 복사 생성법 (shallow copy)', () => {
    const model = UserInfoModel.fromJson(source, true);
    assert.equal('박수진', model.getName());
    assert.equal('서울시 중구 xx로 0번길', model.getAddress());
    assert.notEqual(model, source, '메모리 주소 공유 안 함')
  });

  test('#기존 model 확장하기', () => {
    class ExtendUserInfoModel extends UserInfoModel {
      getAge() {
        return this.age;
      }
    }

    const extendUser = ExtendUserInfoModel.fromJson(source, true);
    assert.equal('박수진', extendUser.getName());
    assert.equal('서울시 중구 xx로 0번길', extendUser.getAddress());
    assert.equal(30, extendUser.getAge());

    const user = UserInfoModel.fromJson(source, true);
    assert.equal('undefined', typeof user.getAge);
  });

  test('#array object 로 model 생성하기', () => {
    const array = [
      {...source},
      {...source},
    ];

    UserInfoModel.fromJson(array);
    const model1 = array[0];
    const model2 = array[1];
    assert.equal('박수진', model1.getName());
    assert.equal('박수진', model2.getName());
  });

  test('#1개의 json 을 여러번 model 코드에 전달하는 경우', () => {
    UserInfoModel.fromJson(source);
    try {
      UserInfoModel.fromJson(source);
      assert.fail();
    } catch (e) {
      assert.equal('이미 다른 Model 클래스의 prototype 을 상속받은 객체입니다!', e.message);
    }
  });
});
