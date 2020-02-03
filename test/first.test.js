const assert = require('assert');
const {suite, test, setup, teardown} = require("mocha");

suite('Array', () => {
  suite('#indexOf()', () => {
    test('should return -1 when the value is not present', () => {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

suite('테스트용 User 데이터베이스', () => {
  test('find user', async () => {
    const users = new Users();
    const user = {
      email: "user1@gmail.com",
      password: "1234",
    };
    users.addUser(user);
    const found = await users.find(user);
    assert.equal(found.email, "user1@gmail.com");
    assert.equal(found.password, "1234");
    assert.equal(await users.find({ email: "user1@gmail.com" }), undefined, "email 만 사용한 경우");
    assert.equal(await users.find({ email: "user2@gmail.com", password: "1234" }), undefined, "등록되지 않은 사용자 정보로 조회한 경우");
  });
});

suite('Date', () => {
  test('#setDate', () => {
    const date1 = new Date('2020-01-13T01:00:01');
    const date2 = new Date(date1);
    date2.setSeconds(10);
    assert.equal(date1.getSeconds(), 1);
    assert.equal(date2.getSeconds(), 10);
  });
});

suite('Abstract class', () => {
  test('a', async () => {
    class A {
      method1() {
        throw new Error('Must be Override - method1');
      }
      async method2() {
        throw new Error('Must be Override - method2');
      }
    }

    const a = new A();
    try {
      a.method1();
      assert.fail();
    } catch (e) {
      assert.ok(e instanceof Error);
      assert.equal('Must be Override - method1', e.message);
    }

    try {
      await a.method2();
      assert.fail();
    } catch (e) {
      assert.ok(e instanceof Error);
      assert.equal('Must be Override - method2', e.message);
    }

    class B extends A {
      method1() {
        return 'method1';
      }

      method2() {
        return 'method2';
      }
    }

    const b = new B();
    assert.equal('method1', b.method1());
    assert.equal('method2', b.method2());

  });
});


suite('code 생성기', () => {
  let user;
  setup(() => {
    user = {
      email: 'user1@gmail.com',
      password: '1234',
    };
  });

  test('code gen', () => {
    const codeGenerator = new AuthorizationCode();
    const requestTime = Date.now();
    const code = codeGenerator.createCode({
      user,
      requestTime,
    });
    assert.equal(typeof code.code, 'string');
    assert.equal(code.requestTime, requestTime);
    assert.equal(code.expiredTime, requestTime + (10 * 1000));
  });

  test('isExpired', () => {
    const codeGenerator = new AuthorizationCode();
    const requestTime = new Date('2020-01-13T08:00:00');
    const code = codeGenerator.createCode({
      user,
      requestTime: requestTime.getTime(),
    });

    // assert.equal(code.isExpired(new Date('2020-01-13T07:59:59.999')), true);
    assert.equal(code.isExpired(new Date('2020-01-13T08:00:00')), false);
    assert.equal(code.isExpired(new Date('2020-01-13T08:00:10')), false);
    // assert.equal(code.isExpired(new Date('2020-01-13T08:00:10.001')), true);
  });

  test('code check', () => {

  });

  // TODO code 생성하기
  // TODO code 값 확인하기 ->> access_token 발급
  // TODO 10초 이내에 같은 email 로 code 생성을 요청한 경우

  // TODO 이미 access_token 이 있는 email 로 code 생성을 요청한 경우 ->> access_token 비활성화
});


suite('redis test', () => {
  test('test redis', async () => {
    // assert.equal(true, true);
    const Redis = require('ioredis');
    const redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
    // const redis = new Redis();
    assert.notEqual(undefined, redis);


    redis.set("key", "value");
    // const value = await new Promise((resolve, reject) => {
    //     redis.get('abc', (err, reply) => {
    //         if (err) {
    //             reject(err);
    //         } else {
    //             resolve(reply);
    //         }
    //     });
    // });

    // assert.equal(123, value);
  });
});


class Users {
  constructor() {
    this.users = [];
  }

  addUser(user) {
    this.users.push(user);
  }

  async find({ email, password }) {
    return this.users.find((each) => (
      each.email === email && each.password === password
    ));
  }
}

class AuthorizationCode {
  constructor() {
    this.authorizationCodes = {};
  }
  createCode({ user, requestTime = Date.now() }) {
    const code = "abc";
    this.authorizationCodes[code] = {
      requestTime,
      expiredTime: requestTime + (10 * 1000),
      email: user.email,
    };
    return {
      ...this.authorizationCodes[code],
      code,
      isExpired(baseTime = Date.now()) {
        return baseTime <= this.expiredTime && this.expiredTime < baseTime;
      }
    };
  }
}

const genCode = (radix = 36) => {
  const gen = () => {
    return Math.random().toString(radix).substring(2, 15);
  };
  return gen() + gen();
};

const allCapsAlpha = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const allLowerAlpha = [..."abcdefghijklmnopqrstuvwxyz"];
const allUniqueChars = [..."~!@#$%^&*()_+-=[]\{}|;:\",./<>?"];
const allNumbers = [..."0123456789"];

const base = [
  ...allCapsAlpha,
  ...allNumbers,
  ...allLowerAlpha,
  // ...allUniqueChars,
];

const generator = (base, len) => {
  return [...Array(len)]
    // .map(i => base[Math.ceil(Math.random() * base.length)])
    .map(i => base[Math.random() * base.length | 0])
    .join('');
};


// console.time('generator');
// console.log('@@@@generator', generator(base, 1));
// console.timeEnd('generator');
//
// console.time('genCode');
// console.log('@@@@genCode', genCode(36));
// console.timeEnd('genCode');

/**
 * TODO 1. 인가 요청
 * [Request]
 * GET /authorize
 * params: {
 *     response_type: "code",
 *     client_id: 111222333, //웹서버 클라이언트 ID
 *     state: "xzy",
 *     redirection_uri: "https://zzzzzzz",
 * }
 *
 * [Response]
 * {
 *     code: "cescesc",
 * }
 * */
