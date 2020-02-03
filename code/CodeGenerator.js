
module.exports = class CodeGenerator {
  constructor(codeLength) {
    this.codeLength = codeLength;
    this.times = Math.floor((codeLength + 9) / 10);
  }

  getRandomCode() {
    const radius = 32;
    return Math.random().toString(radius).substring(2, 12);
  };

  generate() {
    let result = '';
    for(let i = 0; i <= this.times; i++) {
      result += this.getRandomCode();
    }
    return result.substring(0, this.codeLength);
  }
};


