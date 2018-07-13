'use strict'

let env = {
  '+': (...args) => { return args.reduce((a, b) => a + b, 0) },
  '-': (a, b) => b === undefined ? -a : a - b,
  '*': (...args) => { return args.reduce((a, b) => a * b, 1) },
  '/': (a, b) => a / b,
  '>': (a, b) => a > b,
  '<': (a, b) => a < b,
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
  '=': (a, b) => a === b,
  'abs': (...args) => { return args.map(Math.abs) },
  'append': (x, y) => x.concat(y),
  'apply': (proc, args) => proc(...args),
  'begin': (...args) => args.pop(),
  'car': (args) => args[0],
  'cdr': (args) => args.slice(1),
  'cons': (x, y) => {
    let arr = [x]
    if (Object.getPrototypeOf(y) === Array.prototype) {
      if (y.length !== 0) {
        for (let ele of y) {
          arr.push(ele)
        }
      }
    } else {
      arr.push(y)
    }
    return arr
  },
  'eq?': (x, y) => x === y,
  'expt': Math.pow,
  'equal?': (a, b) => a === b,
  'length': (x) => x.length,
  'list': (...args) => args,
  'list?': x => Object.getPrototypeOf(x) === Array.prototype,
  'map': (fn, ...arr) => {
  	let mappedArr = []
  	for (let i = 0; i < arr[0].length; i++) {
  		let args = []
  		for (let j = 0; j < arr.length; j++) {
  			args.push(arr[j][i])
  		}
  		mappedArr.push(fn(...args))
  	}
  	return mappedArr
  },
  'max': Math.max,
  'min': Math.min,
  'not': x => { if (!x) return true },
  'null?': x => x === [],
  'number?': x => Object.getPrototypeOf(x) === Number.prototype,
  'pi': Math.PI,
  'pow': Math.pow,
  'print': console.log,
  'procedure?': x => Object.getPrototypeOf(x) === Function.prototype,
  'round': Math.round,
  'sqrt': Math.sqrt,
  'symbol?': x => Object.getPrototypeOf(x) === String.prototype,
  'outer': null
}

function makeEnv (outerEnv, params, args) {
  let envObj = {}
  if (Object.getPrototypeOf(params) === Array.prototype) {
    for (let i = 0; i < params.length; i++) {
      envObj[params[i]] = args[i]
    }
  } else {
    envObj[params] = args
  }
  envObj['outer'] = outerEnv
  return envObj
}
function defineFunc (symbol, exp, outerEnv) {
  return (...args) => evaluate(exp, makeEnv(outerEnv, symbol, args))
}
function parse (text) {
  if (text.startsWith(')')) {
    throw Error('Wrong syntax')
  }
  if (text.startsWith('(')) {
    return parseList(text)
  } else {
    let value = /^(?:\-)?\d+(?:\.\d+)?/.exec(text)
    if (value) {
      return [Number(value[0]), text.substring(value[0].length)]
    } else {
      value = /^\S+/.exec(text)
      if (value) {
        return [value[0], text.substring(value[0].length)]
      } else {
      	throw Error('Wrong syntax')
      }
    }
  }
}
function parseList (text) {
  let parsedText = []
  text = text.slice(1)
  let result = /^(\s+)/.exec(text)
  if (result) {
    text = text.substring(result[0].length)
  }

  while (!text.startsWith(')')) {
    result = parse(text)
    parsedText.push(result[0])
    text = result[1]

    result = /^(\s+)/.exec(text)
    if (result) {
      text = text.substring(result[0].length)
    }
  }

  text = text.split(' ').slice(1).join(' ')
  return [parsedText, text]
}
function evaluate (exp, en = env) {
  if (Object.getPrototypeOf(exp) === String.prototype) {
    if (en.hasOwnProperty(exp)) {
      return en[exp]
    } else {
      return evaluate(exp, en['outer'])
    }
  } else if (Object.getPrototypeOf(exp) === Number.prototype) {
    return exp
  } else if (exp[0] === 'quote') {
    return exp[1]
  } else if (exp[0] === 'if') {
    let [_, test, conseq, alt] = exp
    return evaluate(test, en) ? evaluate(conseq, en) : evaluate(alt, en)
  } else if (exp[0] === 'define') {
    env[exp[1]] = evaluate(exp[2], en)
    return null
  } else if (exp[0] === 'set!') {
    if (en.hasOwnProperty(exp[1])) {
      en[exp[1]] = evaluate(exp[2], en)
      return null
    } else {
      return evaluate(exp, en['outer'])
    }
  } else if (exp[0] === 'lambda') {
    return defineFunc(exp[1], exp[2], en)
  } else {
    let proc = evaluate(exp[0], en)
    let args = exp.slice(1).map(x => evaluate(x, en))
    return proc(...args)
  }
}

function schemestr (exp) {
  if (Object.getPrototypeOf(exp) === Array.prototype) {
    return ('(' + exp.map(schemestr).join(' ') + ')')
  } else {
    return String(exp)
  }
}
function repl () {
  const readLine = require('readline')
  const r1 = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'lis.js>'
  })

  r1.prompt()
  r1.on('line', (text) => {
    let parsed = parse(text.replace(/\)/g, ' ) ').replace(/\(/g, '( '))
    if (parsed[1]) {
      throw Error('Wrong syntax')
    }
    let result = evaluate(parsed[0])
    if (result !== null) {
      console.log(schemestr(result))
    }
    r1.prompt()
  })
}
// repl()

function fileRead () {
  let fs = require('fs')
  fs.readFile('testData.txt', (err, text) => {
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
}

fileRead()
