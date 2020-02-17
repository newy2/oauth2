const moment = require('moment');
const { CodeGenerator } = require('../code');
const fs = require('fs');

const addToSet = (set, codeGenerator) => {
  while(set.size < size) {
    set.add(codeGenerator.generate());
  }
};

const writeFile = (filePath, set) => {
  const fileStream = fs.createWriteStream(filePath);
  for (const eachLine of set) {
    fileStream.write(eachLine + '\r\n');
  }
  fileStream.end();
};

const size = 100000;

const codeSet16 = new Set();
const codeSet32 = new Set();
const codeSet64 = new Set();
const codeGenerator16 = new CodeGenerator(16);
const codeGenerator32 = new CodeGenerator(32);
const codeGenerator64 = new CodeGenerator(64);

console.time('1. 코드 생성');
addToSet(codeSet16, codeGenerator16);
addToSet(codeSet32, codeGenerator32);
addToSet(codeSet64, codeGenerator64);
console.timeEnd('1. 코드 생성');

const now = moment().format('YYMMDD HH:mm:ss');
console.time('2. 파일 생성');
writeFile(`[${now}] code_16.txt`, codeSet16);
writeFile(`[${now}] code_32.txt`, codeSet32);
writeFile(`[${now}] code_64.txt`, codeSet64);
console.timeEnd('2. 파일 생성');

