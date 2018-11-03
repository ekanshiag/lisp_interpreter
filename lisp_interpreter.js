'use strict'
let equal = (x, y, z) => {
  if (!y) throw Error('Too few arguments')
  if (z) throw Error('Too many arguments')
  return x === y
}

let env = {
  '+': (...args) => args.reduce((a, b) => a + b, 0),
  '-': (...args) => args.length === 1 ? -args : args.reduce((a, b) => a - b),
  '*': (...args) => args.reduce((a, b) => a * b, 1),
  '/': (...args) => args.length === 1 ? 1 / args : args.reduce((a, b) => a / b),
  '>': (...args) => {
    if (args.length < 2) throw Error('Few arguments')
    for (let i = 0; i < args.length - 1; i++) {
      if (args[i] <= args[i + 1]) {
        return false
      }
    }
    return true
  },
  '<': (...args) => {
    if (args.length < 2) throw Error('Few arguments')
    for (let i = 0; i < args.length - 1; i++) {
      if (args[i] >= args[i + 1]) {
        return false
      }
    }
    return true
  },
  '>=': (...args) => {
    if (args.length < 2) throw Error('Few arguments')
    for (let i = 0; i < args.length - 1; i++) {
      if (args[i] < args[i + 1]) {
        return false
      }
    }
    return true
  },
  '<=': (...args) => {
    if (args.length < 2) throw Error('Few arguments')
    for (let i = 0; i < args.length - 1; i++) {
      if (args[i] > args[i + 1]) {
        return false
      }
    }
    return true
  },
  '=': (...args) => {
    if (args.length < 2) throw Error('Few arguments')
    for (let i = 0; i < args.length - 1; i++) {
      if (args[i] !== args[i + 1]) {
        return false
      }
    }
    return true
  },
  'abs': (...args) => args.map(Math.abs),
  'append': (x, y, ...z) => z === undefined ? x.concat(y) : x.concat(y).concat(...z),
  'apply': (proc, args) => proc(...args),
  'begin': (...args) => args.length === 0 ? ['begin'] : args.pop(),
  'car': (...args) => {
    if (args.length > 1) throw Error('Too many arguments')
    return args[0][0]
  },
  'cdr': (...args) => {
    if (args.length > 1) throw Error('Too many arguments')
    return args[0].slice(1)
  },
  'cons': (x, y, z) => {
    if (z) throw Error('Too many arguments')
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
  'eq?': equal,
  'expt': (a, b, c) => {
    if (!b) throw Error('Too few arguments')
    if (c) throw Error('Too many arguments')
    return Math.pow(a, b)
  },
  'equal?': equal,
  'length': (x, y) => {
    if (!x) throw Error('Too few arguments')
    if (y) throw Error('Too many arguments')
    return x.length
  },
  'list': (...args) => args,
  'list?': x => Object.getPrototypeOf(x) === Array.prototype,
  'map': (fn, ...arr) => {
    if (arr.length === 0 || arr.some(x => Object.getPrototypeOf(x) !== Array.prototype)) throw Error('Wrong syntax')
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
  'max': (x, y, ...z) => {
    if (!x || !y) throw Error('Too few arguments')
    return Math.max(x, y, ...z)
  },
  'min': (x, y, ...z) => {
    if (!x || !y) throw Error('Too few arguments')
    return Math.min(x, y, ...z)
  },
  'not': x => {
    if (!x) return true
    else return false
  },
  'null?': x => {
    if (Object.getPrototypeOf(x) === Array.prototype && x.length === 0) return true
    else return false
  },
  'number?': (x, y) => {
    if (y) throw Error('Too many arguments')
    return Object.getPrototypeOf(x) === Number.prototype
  },
  'pi': Math.PI,
  'print': (...args) => {
    if (args.length === 0) throw Error('Too few arguments')
    for (let ele of args) {
      console.log(schemestr(ele))
    }
  },
  'procedure?': (x, y) => {
    if (y) throw Error('Too many arguments')
    return Object.getPrototypeOf(x) === Function.prototype
  },
  'round': (x, y) => {
    if (!x) throw Error('Too few arguments')
    if (y) throw Error('Too many arguments')
    return Math.round(x)
  },
  'sqrt': (x, y) => {
    if (!x) throw Error('Too few arguments')
    if (y) throw Error('Too many arguments')
    return Math.sqrt(x)
  },
  'symbol?': x => Object.getPrototypeOf(x) === String.prototype,
  'if': '',
  'define': '',
  'quote': '',
  'set!': '',
  'lambda': '',
  'outer': null
}

function makeEnv (outerEnv, params, args) {
  let envObj = {}
  if (Object.getPrototypeOf(params) === Array.prototype) {
    for (let i = 0; i < params.length; i++) {
      envObj[params[i]] = args[i]
    }
  } else {
    envObj[params] = arguments
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
    let value = /^(?:-)?\d+(?:\.\d+)?/.exec(text)
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

    result = /^\s+/.exec(text)
    if (result) {
      text = text.substring(result[0].length)
    }
  }

  text = text.split(' ').slice(1).join(' ')
  return [parsedText, text]
}

function evaluate (exp, en = env) {
  if (exp.length === 0) return []
  if (Object.getPrototypeOf(exp) === String.prototype) {
    if (en.hasOwnProperty(exp)) {
      return en[exp]
    } else if (en['outer'] !== null) {
      return evaluate(exp, en['outer'])
    } else {
      throw Error('symbol not defined')
    }
  } else if (Object.getPrototypeOf(exp) === Number.prototype) {
    return exp
  } else if (exp[0] === 'quote') {
    return exp[1]
  } else if (exp[0] === 'if') {
    let [_, test, conseq, alt] = exp
    return evaluate(test, en) ? evaluate(conseq, en) : evaluate(alt, en)
  } else if (exp[0] === 'define') {
    if (env.hasOwnProperty(exp[1])) {
      throw Error('Symbol cannot be a keyword')
    }
    en[exp[1]] = evaluate(exp[2], en)
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

module.exports = {
  parse,
  evaluate,
  schemestr
}
