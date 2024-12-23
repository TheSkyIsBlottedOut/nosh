const _ = (x=null) => Object.create(x);
const O_O = _('O_O')
O_O.fn = _(); O_O.fn.curry = (fn, ...a) => (...b) => fn(...a, ...b)
O_O.fn.fnize = (fo) => typeof fo === 'function' ? fo : () => fo;
O_O.fn.def = O_O.fn.curry(Object.defineProperty)

O_O.add = (key) => ({ to: (obj) => {
  const pp = O_O.fn.curry(O_O.fn.def, obj, key);
  return {
    get: (fn) => pp({ get: O_O.fn.fnize(fn) }),
    var: (fn) => pp({ set: (val) => obj[`_${key}`] = val, get: () => obj[`_${key}`] }),
    method: (fn) => pp({ get: O_O.fn.fnize(fn) }),
    value: (val) => O_O._.prop(obj, key, { value: val })

}}})
O_O.add('obj').to(O_O.fn).method((x=null) => Object.create(x))
O_O.add('obj').to(O_O).get(()=>Object.create(null))
O_O.fn.ext = ((key, fn) => O_O.add(key).to(O_O.fn).method(fn))


O_O.fn.ext('compose', (...fns) => fns.reduce((f, g) => (...args) => f(g(...args))))
O_O.fn.pipe = (...fns) => fns.reduce((f, g) => (...args) => g(f(...args)));
O_O.Π = O_O.fn.curry((key) => (c) => O_O.add(key).to(O_O.Π).get(O_O.fn.curry(c)))
O_O.fn.up = (obj = { up: O_O.fn.fnize(O_O)}) => Object.getPrototypeOf(obj).up?.() ?? obj?.up?.() ?? obj
O_O.fn.json = (_) => typeof _ === 'string' ? JSON.parse(_) : JSON.stringify(_)
O_O.fn.interpolate = (str) => (obj) => { str.replace(/:(\w+)/g, (_, key) => obj[key] ?? '') }

O_O.type = (x) => {
  const r = new Array();
  r.push(x?.constructor?.name ?? x?.name ?? typeof x)
  O_O.add('test').to(r).method((tag, fn) => { if (fn(x)) r.push(tag) ; return r })
  O_O.add('is').to(r).method((...k) => k.select(x => r.includes(x)))
  O_O.add('isnt').to(r).method((...k) => k.select(x => !r.includes(x)))
  r.test('array', Array.isArray)
  r.test('object', x => x instanceof Object)
  r.test('function', x => typeof x === 'function')
  r.test('integer', x => Number.isInteger(x))
  r.test('number', x => typeof x === 'number')
  r.test('string', x => typeof x === 'string')
  r.test('boolean', x => typeof x === 'boolean')
  r.test('character', x => typeof x === 'string' && x.length === 1)
  r.test('undefined', x => typeof x === 'undefined')
  r.test('null', x => x === null)
  r.test('promise', x => x instanceof Promise)
  r.test('iterable', x => x[Symbol.iterator])
  r.test('async', x => x[Symbol.asyncIterator])
  r.test('generator', x => x[Symbol.iterator] && x[Symbol.iterator].prototype)
  r.test('async-generator', x => x[Symbol.asyncIterator] && x[Symbol.asyncIterator].prototype)
  r.test('regexp', x => x instanceof RegExp)
  r.test('date', x => x instanceof Date)
  r.test('error', x => x instanceof Error)
  r.test('symbol', x => typeof x === 'symbol')
  r.test('bigint', x => typeof x === 'bigint')
  r.test('map', x => x instanceof Map)
  r.test('set', x => x instanceof Set)
  r.test('weakmap', x => x instanceof WeakMap)
  r.test('weakset', x => x instanceof WeakSet)
  r.test('arraybuffer', x => x instanceof ArrayBuffer)
  r.test('dataview', x => x instanceof DataView)
  r.test('typedarray', x => x instanceof TypedArray)
  r.test('stringable', x => x.toString)
  r.test('callable', x => x.call)
  return r
}


export { O_O }
export { O_O as unhelpfully}