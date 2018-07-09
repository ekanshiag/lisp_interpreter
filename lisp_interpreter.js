let add = (args) => {return args.reduce((a,b) => a+b)}
let sub = (a,b) => a-b
let mul = (args) => {return args.reduce((a,b) => a*b, 1)}
let div = (a,b) => a/b
let greater = (a,b) => {return a > b ? true : false}
let less = (a,b) => {return a < b ? true : false}
let greaterEqual = (a,b) => {return a >= b ? true : false}
let lessEqual = (a,b) => {return a <= b ? true : false}
let equal = (a,b) => {return a == b ? true : false}
let abs = (args) => {return args.map(Math.abs)}

let env = {
	'+': add, '-': sub, '*': mul, '/': div,
	'>': greater, '<': less, '>=': greaterEqual, '<=': lessEqual, '=': equal,
	'abs' : abs,
	'append' : add,
	'apply' : (proc,args) => proc(...args),
	'car' : (args) => args[0],
	'cdr' : (args) => args.slice(1),
	'cons' : (x,y) => [x,y],
	'expt' : Math.pow,
	'equal?' : equal,
	'length' : (x) => x.length,
	'list' : (args) => args,
	'list?' : x => Object.getPrototypeOf(x) == Array.prototype,
	'map' : (fn, arr) => arr.map(fn),
	'max' : Math.max,
	'min' : Math.min,
	'not' : x => {if(!x) return T},
	'null?' : x => x == [],
	'number?' : x => Object.getPrototypeOf(x) == Number.prototype,
	'print': console.log,
	'round' : Math.round
}
//append spaces around ( & ) before sending text after reading file
function parse(text){
	let L = []
	while(text.length != 0){
		if(text[0] == ')'){
			let tempL = []
			let x = L.pop()
			while(x != '('){
				tempL.unshift(x)
				x = L.pop()
			}
			if(tempL.length == 1){
				return tempL[0]
			}
			let value = eval(tempL)
			if(value){
				L.push(value)
			}

		}else{
			let token = text.split(' ')[0]
			let result = /^\d+(?:\.\d+)?$/.exec(token)
			L.push(result != null? Number(token) : token)
		}
		text = text.split(' ').slice(1).join(' ')
	}
}
console.log(parse('( ( define r 10 ) ( * 3 ( * r r ) ) )'))

function eval(exp){
	if(Object.getPrototypeOf(exp) == String.prototype){
		return env[exp]
	}else if(Object.getPrototypeOf(exp) == Number.prototype){
		return exp
	}else if(exp[0] == 'if'){
		return exp[1] ? exp[2] : exp[3]
	}else if (exp[0] == 'define'){
		env[exp[1]] = exp[2]
		return null
	}else{
		let proc = eval(exp[0])
		let args = exp.slice(1).map(x => eval(x))
		return proc(args)
	}

}


