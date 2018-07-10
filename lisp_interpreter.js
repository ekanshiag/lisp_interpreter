
let add = (...args) => {return args.reduce((a,b) => a+b,0)}
let sub = (a,b) => a-b
let mul = (...args) => {return args.reduce((a,b) => a*b, 1)}
let div = (a,b) => a/b
let greater = (a,b) => {return a > b ? true : false}
let less = (a,b) => {return a < b ? true : false}
let greaterEqual = (a,b) => {return a >= b ? true : false}
let lessEqual = (a,b) => {return a <= b ? true : false}
let equal = (a,b) => {return a == b ? true : false}
let abs = (...args) => {return args.map(Math.abs)}

let env = {
	'+': add, '-': sub, '*': mul, '/': div,
	'>': greater, '<': less, '>=': greaterEqual, '<=': lessEqual, '=': equal,
	'abs' : abs,
	'append' : add,
	'apply' : (proc,args) => proc(...args),
	'begin' : (...args) => args.pop(),
	'car' : (args) => args[0],
	'cdr' : (args) => args.slice(1),
	'cons' : (x,y) => [x,y],
	'define' : (symbol, exp) => {env[symbol] = eval(exp)},
	'eq?' : (x,y) => x === y,
	'expt' : Math.pow,
	'equal?' : equal,
	'if' : (test, conseq, alt) => eval(test) ? eval(conseq) : eval(alt),
	'length' : (x) => x.length,
	'list' : (args) => args,
	'list?' : x => Object.getPrototypeOf(x) == Array.prototype,
	'map' : (fn, arr) => arr.map(fn),
	'max' : Math.max,
	'min' : Math.min,
	'not' : x => {if(!x) return T},
	'null?' : x => x == [],
	'number?' : x => Object.getPrototypeOf(x) == Number.prototype,
	'pi' : Math.PI,
	'print': console.log,
	'procedure' : x => Object.getPrototypeOf(x) == Function.prototype,
	'round' : Math.round,
	'symbol?' : x => Object.getPrototypeOf(x) == String.prototype
}

function parse(text){
	if(text.startsWith(')')){
		throw Error("Wrong syntax")
	}
	if(text.startsWith('(')){
		return parseList(text)
	}else{
		let token = text.split(' ')[0]
		let value = /^\d+(?:\.\d+)?$/.exec(token) != null ? Number(token) : token
		return([value, text.substring(token.length)])
	}
}
function parseList(text){
	let parsedText = []
	text = text.slice(1)
	let proc = text.split(' ')[0]
	if(!env.hasOwnProperty(proc)){
		throw Error("Wrong syntax")
	}
	parsedText.push(proc)
	text = text.split(' ').slice(1).join(' ')
	while(!text.startsWith(')')){
		let result = parse(text)
		parsedText.push(result[0])
		text = result[1]
		result = /^(\s+)/.exec(text)
		if(result){
			text = text.substring(result[0].length)
		}
	}
	text = text.split(' ').slice(1).join(' ')
	return [parsedText,text]
}

function eval(exp){
	if(Object.getPrototypeOf(exp) == String.prototype){
		return env[exp]
	}else if(Object.getPrototypeOf(exp) == Number.prototype){
		return exp
	}else if(exp[0] == 'if'){
		[_, test, conseq, alt] = exp
		return eval(test) ? eval(conseq) : eval(alt)
	}else if (exp[0] == 'define'){
		env[exp[1]] = eval(exp[2])
		return null
	}else{
		let proc = eval(exp[0])
		let args = exp.slice(1).map(x => eval(x))
		return proc(...args)		
		}	
	}

function repl(){
	const readLine = require('readline')
	const r1 = readLine.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt : 'lis.js>'
	})

	r1.prompt()
	r1.on('line', (text) => {
		console.log(text)
		let parsed = parse(text.replace(/\)/g, ' ) '))
		let result = eval(parsed[0])
		if(result != null){
		console.log(result)
		}
		r1.prompt()
	})
}
repl()