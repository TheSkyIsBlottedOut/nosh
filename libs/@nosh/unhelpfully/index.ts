const _ = (x:null|object=null) => Object.create(x);
const O_O = _({});
type AnyArgs = any[];
type AnyFn = (...args: AnyArgs) => any;
type Obj = Record<string|symbol, any>;
type ObjOrFn = Obj | AnyFn;
O_O.fn = _(); O_O.fn.curry = (fn: AnyFn, ...a: AnyArgs) => (...b: AnyArgs) => fn(...a, ...b)
O_O.fn.toFn = (fo: ObjOrFn) => (typeof fo === 'function' && fo.length === 0) ? fo : () => fo;
O_O.fn.def = O_O.fn.curry(Object.defineProperty)

O_O.add = (key: string) =>{ return { to: (obj: any) => {
  const pp = O_O.fn.curry(O_O.fn.def, obj, key);
  return {
    get: (fn: ()=>any) => pp({ get: O_O.fn.toFn(fn) }),
    set: () => pp({ set: (val: any) => obj[`_${key}`] = val, get: () => obj[`_${key}`] }),
    method: (fn: any) => pp({ get: O_O.fn.toFn(fn) }),
    value: (val: any) => O_O._.prop(obj, key, { value: val })
  }
}
}}
O_O.add('obj').to(O_O).get(() => Object.create(null))
O_O.fn.ext = ((key: string|symbol, fn: AnyFn) => O_O.add(key).to(O_O.fn).method(fn))
O_O.fn.ext('obj', (x = null) => Object.create(x))
O_O.fn.ext('arr', (x = []) => Array.from(x))
O_O.fn.ext('compose', (...fns: any[]) => fns.reduce((f, g) => (...args: any[]) => f(g(...args))))
O_O.fn.pipe = (...fns: any[]) => fns.reduce((f, g) => (...args: any[]) => g(f(...args)));
O_O.Π = O_O.fn.curry((key: any[]) => (c: any) => O_O.add(key).to(O_O.Π).get(O_O.fn.curry(c)))
O_O.fn.up = (obj = { up: O_O.fn.fnize(O_O)}) => Object.getPrototypeOf(obj).up?.() ?? obj?.up?.() ?? obj
O_O.fn.json = (_: any) => typeof _ === 'string' ? JSON.parse(_) : JSON.stringify(_)
O_O.fn.interpolate = (str: string) => (obj: any) => { str.replace(/:(\w+)/g, (_, key) => obj[key] ?? '') }

O_O.ancestorsOf = (obj = {}) => {
  const anc:unknown[] = [];
  let proto = obj;
  while (proto) anc.push(proto);
  proto = O_O._.proto(proto);
  return anc;
}
O_O.methodsOf = (obj: Record<string|symbol, any>) => {
  O_O.ancestorsOf(obj).reduce((acc: Record<string|symbol, any>, anc: Record<string|symbol, any>) => {
    O_O._.props(anc).forEach((prop: string|symbol) => {
      if (typeof obj?.[prop] === "function") acc[prop] = obj[prop];
    });
    return acc;
  }, {});
}

class TypedArray extends Array {
  constructor(...args: AnyArgs){ super (...args) }
  test(type: string, fn: AnyFn) { if (!!fn(this)) this.push(type); return this }
  is(...k: any[]) { return k.filter(x => this.includes(x)) }
  isnt(...k: any[]) { return k.filter(x => !this.includes(x)) }
}


O_O.type = (x: any) => {
  const r: TypedArray = new TypedArray()
  r.push(x?.constructor?.name ?? x?.name ?? typeof x)
  r.test('array', Array.isArray)
  r.test('object', x => x instanceof Object)
  r.test('function', x => typeof x === 'function')
  r.test('integer', x => Number.isInteger(x))
  r.test('number', x => typeof x === 'number')
  r.test('string', x => typeof x === 'string')
  r.test('boolean', x => typeof x === 'boolean')
  r.test('character', x => typeof x === 'string' && (x as string).length === 1)
  r.test('undefined', x => typeof x === 'undefined')
  r.test('null', x => x === null)
  r.test('promise', x => x instanceof Promise)
  r.test('iterable', x => x[Symbol.iterator])
  r.test('async', x => (x as Obj)[Symbol.asyncIterator as symbol|string])
  r.test('generator', x => x[Symbol.iterator] && x[Symbol.iterator].prototype)
  r.test('async-generator', x =>  (x as Obj)[Symbol.asyncIterator] && (x as Obj)[Symbol.asyncIterator].prototype)
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
  r.test('stringable', x => x.toString)
  r.test('callable', x => (x as Record<symbol|string, any>).call)
  return r
}

O_O.ObjWithDefault = class extends Object {
  constructor(obj: any) { super(obj);  this.#default = obj; return this }
  #default = ((obj: any) => Array.isArray(obj) ? obj : [obj]) as Record<symbol|string, any>|((...args:any[])=>any)
  set default(fnOrObj: ((...args: any[])=>any)|Record<symbol|string,any>) { this.#default = fnOrObj }
  use(key: string|symbol, val=null) {
    const pp = O_O.fn.curry(Object.defineProperty, this, key)
    pp({ value: val ?? this.#default })
  }
}
O_O.objectWithDefault = (obj: Record<symbol|string, any>) => new O_O.ObjWithDefault(obj)
O_O.fn.dissectUrl = (url: string) => {
  if (typeof url !== 'string') return { host: 'localhost', protocol: 'http' }
  const grouped_data = url.match(/^(?<protocol>https?)?\:\/\/(?<host>[^\/]+)(\:(?<port>\d+))?(?<path>\/[^\?]+)?(\?(?<querystring>[^\#]+))?(#(?<hashmark>[^\s]+))?/)?.groups
  if (!grouped_data) return { host: 'localhost', protocol: 'http' }
  const { host, protocol, port, hashmark, path, querystring } = grouped_data
  return { host, protocol, port, path, querystring, hashmark }
}

O_O._ = O_O.objectWithDefault({})
O_O._.default = (cval: any) => O_O.fn.curry(cval)
O_O._.use('proto', Object.getPrototypeOf)
O_O._.use('props', Object.getOwnPropertyNames)
O_O._.use('prop', Object.getOwnPropertyDescriptor)
O_O._.use('keys', Object.keys)
O_O._.use('values', Object.values)
O_O._.use('entries', Object.entries)
O_O._.use('zip', Object.fromEntries)
O_O._.use('assign', Object.assign)
O_O._.use('define', Object.defineProperty)
O_O._.use('defineMany', Object.defineProperties)
O_O._.use('create', Object.create)
O_O._.use('freeze', Object.freeze)
O_O._.use('seal', Object.seal)
O_O._.use('noext', Object.preventExtensions)
O_O._.use('frozen', Object.isFrozen)
O_O._.use('sealed', Object.isSealed)
O_O._.use('extensible', Object.isExtensible)

O_O.matchers = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  email: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
  url: /^(http|https):\/\/[a-z0-9.-]+\.[a-z]{2,}$/,
  ip: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}:\d{2}$/,
  datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
  phone: /^\d{3}-\d{3}-\d{4}$/,
  postal: /^\d{5}(?:-?\d{4})$/,
  zip: /^\d{5}(?:-?\d{4})$/,
  ssn: /^\d{3}-\d{2}-\d{4}$/,
  cc: /^\d{4}-\d{4}-\d{4}-\d{4}$/,
  ccv: /^\d{3,4}$/,
  hex: /^#[0-9a-f]{6}$/,
  color: /^rgb\(\d{1,3},\d{1,3},\d{1,3}\)$/,
  rgb: /^rgb\(\d{1,3},\d{1,3},\d{1,3}\)$/,
  rgba: /^rgba\(\d{1,3},\d{1,3},\d{1,3},\d{1,3}\)$/,
  hsl: /^hsl\(\d{1,3},\d{1,3}%,\d{1,3}%\)$/,
  hsla: /^hsla\(\d{1,3},\d{1,3}%,\d{1,3}%,\d{1,3}\)$/,
  hexcolor: /^#[0-9a-f]{6}$/,
  hexcolorshort: /^#[0-9a-f]{3}$/,
  hexcoloralpha: /^#[0-9a-f]{8}$/,
  hexcolorshortalpha: /^#[0-9a-f]{4}$/,
  linguistics: /^(([aeiou]?)([^aeiou]*)([aeiou])([^aeiou]?)+\W{0,12})+|nth$/,
}
O_O.fn.matchStringType = (str: string) => (key: string) => O_O.matchers[key].test(str)
// O_O.fn.matchStringType('rgb(55,155,255)')('rgb')


O_O.fn.intRoot = (n: number) => {
  // largest number which, when squared, is less than n. No cheating with sqrt, we're doing O(log n).
  if (n < 0) return 0
  // start at half of n, which is usually too big.
  let i = Math.max(Math.floor(n >> 2), 1)
  let l = i
  while (!(l * l < n && i * i > n)) {
    l = i
    i += Math.max(1, Math.ceil(i >> 1)) * ((i * i > n) ? -1 : 1)
  }
  return l
}

O_O.primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97] as number[]
O_O.fn.nextPrime = () => {
  let p = O_O.primes[O_O.primes.length - 1] + 2
  while (O_O.primes.some((prime: number) => p % prime === 0)) p += 2
  O_O.primes.push(p)
  return p
}
O_O.fn.primeFactors = (n: number) => {
  let num = Math.abs(Math.floor(n))
  if ([0,1].includes(num)) return [num]
  const factors: number[] = []
  while ((num / 2) > O_O.primes[O_O.primes.length - 1]) O_O.fn.nextPrime()
  O_O.primes.forEach((prime: number) => {
    while (num % prime === 0) {
      factors.push(prime)
      num /= prime
    }
  })
  return factors
}


export { O_O }
export { O_O as unhelpfully }