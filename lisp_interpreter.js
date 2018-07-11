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
	'apply' : (proc,...args) => proc(...args),
	'begin' : (...args) => args.pop(),
	'car' : (args) => args[0],
	'cdr' : (args) => args.slice(1),
	'cons' : (x,y) => {
		let arr = [x]
		if(Object.getPrototypeOf(y) == Array.prototype){
			if(y.length != 0){
				for (let ele of y){
					arr.push(ele)
				}	
			}
		}else{
			arr.push(y)
		}
		return arr
	},
	'define' : (symbol, exp) => {env[symbol] = eval(exp)},
	'eq?' : (x,y) => x === y,
	'expt' : Math.pow,
	'equal?' : equal,
	'if' : (test, conseq, alt) => eval(test) ? eval(conseq) : eval(alt),
	'lambda' : undefined,
	'length' : (x) => x.length,
	'list' : (...args) => args,
	'list?' : x => Object.getPrototypeOf(x) == Array.prototype,
	'map' : (fn, arr) => arr.map(fn),
	'max' : Math.max,
	'min' : Math.min,
	'not' : x => {if(!x) return T},
	'null?' : x => x == [],
	'number?' : x => Object.getPrototypeOf(x) == Number.prototype,
	'pi' : Math.PI,
	'pow' : Math.pow,
	'print': console.log,
	'procedure' : x => Object.getPrototypeOf(x) == Function.prototype,
	'quote' : x => x,
	'round' : Math.round,
	'set!' : (symbol, exp) => env[symbol] = eval(exp),
	'symbol?' : x => Object.getPrototypeOf(x) == String.prototype,
	'outer' : null
}

function makeEnv(outerEnv, params, args){
	let envObj = {}
	for(let i = 0; i < params.length; i++){
		envObj[params[i]] = args[i]
	}
	envObj['outer'] = outerEnv
	return envObj
}
function defineFunc(symbol, exp, outerEnv){
	return (...args) => eval(exp, makeEnv(outerEnv, symbol, args))
}
function parse(text){
	let result = /^(\s+)/.exec(text)
	if(result){
		text = text.substring(result[0].length)
	}
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
	let result = /^(\s+)/.exec(text)
	if(result){
		text = text.substring(result[0].length)
	}
	let proc = text.split(' ')[0]
	
	while(!text.startsWith(')')){
		result = parse(text)
		parsedText.push(result[0])
		text = result[1]
		
		result = /^(\s+)/.exec(text)
		if(result){
			text = text.substring(result[0].length)
		}
	}

	if(env.hasOwnProperty(proc)){
		if(proc == 'quote' && parsedText.length != 2){
			throw Error("Wrong syntax")
		}else if((proc == 'set!' || proc == 'lambda' || proc == 'define') && parsedText.length != 3){
			throw Error("Wrong syntax")
		}else if(proc == 'if' && parsedText.length != 4){
			throw Error("Wrong syntax")	
		}
	}
	text = text.split(' ').slice(1).join(' ')
	return [parsedText,text]
}
function eval(exp, en = env){
	if(Object.getPrototypeOf(exp) == String.prototype){
		if(en.hasOwnProperty(exp)){
			return en[exp]
		}else{
			return eval(exp, en['outer'])
		}
	}else if(Object.getPrototypeOf(exp) == Number.prototype){
		return exp
	}else if(exp[0] == 'quote'){
		return exp[1]
	}else if(exp[0] == 'if'){
		[_, test, conseq, alt] = exp
		return eval(test, en) ? eval(conseq, en) : eval(alt, en)
	}else if (exp[0] == 'define'){
		env[exp[1]] = eval(exp[2], en)
		return null
	}else if(exp[0] == 'set!'){
		if(en.hasOwnProperty(exp[1])){
			en[exp[1]] = eval(exp[2], en)
			return null
		}else{
			return eval(exp, en['outer'])
		}
	}else if(exp[0] == 'lambda'){
		return defineFunc(exp[1], exp[2], en)
	}else{
		let proc = eval(exp[0],en)
		let args = exp.slice(1).map(x => eval(x, en))
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
		let parsed = parse(text.replace(/\)/g, ' ) ').replace(/\(/g, '( '))
		if(parsed[1]){
			throw Error("Wrong syntax")
		}
		let result = eval(parsed[0])
		if(result != null){
			console.log(result)
		}
		r1.prompt()
	})
}
repl()