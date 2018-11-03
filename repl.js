const {parse, evaluate, schemestr} = require('./lisp_interpreter')

const readLine = require('readline')
const r1 = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'lis.js>'
})

r1.prompt()
r1.on('line', (text) => {
  let parsed = parse(text.trim().replace(/\)/g, ' ) ').replace(/\(/g, '( '))
  if (parsed[1]) {
    throw Error('Wrong syntax')
  }
  let result = evaluate(parsed[0])
  if (result != null) {
    console.log(schemestr(result))
  }
  r1.prompt()
})
