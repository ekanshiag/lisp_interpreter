const {parse, evaluate, schemestr} = require('./lisp_interpreter')
const fs = require('fs')

fs.readFile(process.argv[2], (err, text) => {
  if (err) {
    throw err
  }
  let parsed
  text = text.toString().replace(/\)/g, ' ) ').replace(/\(/g, '( ')
  do {
    parsed = parse(text)
    let result = evaluate(parsed[0])
    if (result !== null) {
      console.log(schemestr(result))
    }
    text = parsed[1].slice(1).trim()
  }
  while (text)
})
