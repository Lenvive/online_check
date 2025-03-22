const fs = require('fs');

fs.readFileSync('input.txt', 'utf8');

fs.writeFileSync('output.txt', 'Hello World!', 'utf8');

console.log('test_program: File written successfully');
