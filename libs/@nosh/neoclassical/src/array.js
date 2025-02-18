import { NeoCore } from './core.js';
import { NeoNumber } from './number.js';
import { NeoString } from './string.js';
import { NeoRange } from './range.js';
  // constructor options:
  // 1. new NeoArray(1, 2, 3, 4, 5)
  // 2. new NeoArray([1, 2, 3, 4, 5])
  // 3. new NeoArray(5,null) // [null, null, null, null, null]
  // 4. new NeoArray(5, Symbol(0)) // [0, 0, 0, 0, 0]
  // 5. new NeoArray(5, (i) => i**2) // [0, 1, 4, 9, 16]
  // 6. new NeoArray(5) // [undefined, undefined, undefined, undefined, undefined]
class NeoArray extends NeoCore {
  array = []; type = ['array']
  defaultTransform = (i) => i
  validator = (i) => true

  constructor(...args) {
    super(args);
    switch (args.length) {
      case 0: break;
      case 1: {
        if (Array.isArray(args[0])) { this.array = args[0]
        } else if (args[0] instanceof NeoArray) { this.array = args[0].array
        } else if (typeof args[0] === 'number') { this.array = Array.from({ length: args[0] })
        } else if (typeof args[0] === 'function') { this.defaultTransform = args[0]
        } else if (typeof args[0] === 'object') this.#setObjectConfigs(args[0])
        else this.array = [args[0]]
        break;
      }
      case 2: {
        const [t1, t2] = args.map(i => typeof i);
        const [v1, v2] = args;
        if ([t1, t2] == ['number', 'symbol']) {
          const value = parseInt(v2.toString().scan(/Symbol\(([^\)]+)\)/));
          this.array = Array.from({ length: v1 }).fill(value)
        } else if ([t1, t2] == ['number', 'function']) {
          this.array = Array.from({ length: v1 }).map(v2)
          this.defaultTransform = v2;
        } else if ([t1, t2] == ['number', 'object']) {
          v2.length = v1
          v2.value = v2.value ?? undefined
          this.#setObjectConfigs(v2);
        } else if (t1 == 'number') {
          this.array = Array.from({ length: v1 }).fill(v2);
        } else {
          this.array = [v1, v2];
        }
        break;
      }
      case 3: {
        const [t1, t2, t3] = args.map(i => typeof i);
        const [v1, v2, v3] = args;
        if ([t1, t2, t3] == ['number', 'symbol', 'symbol']) {
          const value = parseInt(v2.toString().scan(/(\d+)/));
          const length = parseInt(v3.toString().scan(/(\d+)/));
          this.array = Array.from({ length }).fill(value);
        } else if ([t1, t2, t3] == ['number', 'function', 'function']) {
          this.array = Array.from({ length: v1 }).map(v2);
          this.defaultTransform = v3;
        } else if ([t1, t2, t3] == ['number', 'function', 'object']) {
          this.array = Array.from({ length: v1 }).map(v2);
          this.defaultTransform = v2
          this.#setObjectConfigs(v3);
        } else if ([t1, t2, t3] == ['number', 'object', 'function']) {
          this.defaultTransform = v3;
          this.#setObjectConfigs(v2);x
        } else if ([v1, v2, v3].every(Array.isArray) && v1.length === v2.length && v2.length === v3.length) {
          this.array = v1.map((_, i) => [v1[i], v2[i], v3[i]]);
        } else this.array = [v1, v2, v3];
        break;
      }
      default: {
        this.array = args;
        break;
      }
    }
    this.#typecast();
  }

  #setObjectConfigs(obj) {
    const k = Object.keys(obj);
    if (k.includes('length') && typeof obj.length === 'number') {
      this.array = Array.from({ length: obj.length });
      if (k.includes('value')) this.array.fill(obj.value);
      if (k.includes('transform')) this.defaultTransform = obj.transform;
      if (k.includes('fill')) this.array.fill(obj.fill);
      if (k.includes('validator')) this.validator = obj.validator;
    } else {
      this.array = Object.entries(obj);
    }
  }

  // Methods
  every(fn) { return this.array.every(fn) }
  some(fn) { return this.array.some(fn) }
  all(fn) { return this.every(fn) }
  any(fn) { return this.some(fn) }
  none(fn) { return !this.some(fn) }

  at(idx) { idx < 0 ? this.array[this.array.length + idx] : this.array[idx] }
  get length() { return this.array.length }
  get first() { return this.array[0] }
  filter(fn) { return this.array.filter(fn) }
  select(fn) { return this.filter(fn) }
  findFirst(fnOrObj) { return this.array.find(fnOrObj) }
  findLast(fnOrObj) { return this.array.reverse().find(fnOrObj) }
  find(fnOrObj) { return this.array.select(x => typeof fnOrObj === 'function' ? !!fnOrObj(x) : x === fnOrObj) }
  map(fn) { return this.array.map(fn) }
  push(...values) { this.array.push(...(this.defaultTransform(values))); this.#typecast() }
  concat(...values) { return this.array.concat(...this.defaultTransform(values)) }
  pop() { const val = this.array.pop(); this.#typecast(); return val }
  shift() { const val = this.array.shift(); this.#typecast(); return val }
  unshift(...values) { this.array.unshift(...this.defaultTransform(values)); this.#typecast() }
  slice(start, end) { return this.array.slice(start, end) }
  join(sep) { return new NeoString(this.array.join(sep)) }
  get joined() { return this.join('') }
  get last() { return this.at(-1) }
  get isEmpty() { return this.array.length === 0 }
  get notEmpty() { return this.array.length > 0 }
  get empty() { return this.isEmpty }
  get size() { return this.array.length }
  includes(...values) { return values.every(v => this.array.includes(v)) }
  indexOf(value) { return this.array.indexOf(value) }
  indicesOf(value) { return this.array.reduce((acc, v, i) => v === value ? [...acc, i] : acc, []) }
  get uniq() { return [...new Set(this.array)] }
  get unique() { return this.uniq }
  get compact() { return this.array.filter(i => i) }
  get flatten() { return this.array.flat() }
  get flat() { return this.flatten }
  #N (...args) { return new NeoArray(...args) }
  get grouped() {
    return this.array.reduce((acc, v) => {
      const idx = acc.findIndex(i => i[0] === v);
      if (idx === -1) acc.push([v, 1]);
      else acc[idx].push(v);
      return acc;
    }, this.#N())
  }
  reduce(...args) { return this.array.reduce(...args) }
  inject(...args) { return this.reduce(...args) }

  get groupIndex() {
    return this.array.reduce((acc, v, i) => {
      const idx = acc.findIndex(i => i[0] === v);
      if (idx === -1) acc.push([v, [i]]);
      else acc[idx][1].push(i);
      return acc;
    }, this.#N())
  }
  #typecast() {
    // set accessors
    this.#arrayAccess()
    // determine type
    this.type = ['array']
    if (this.array.every(Array.isArray)) {
      this.type.push('dimensional')
      if (this.array.reduce((s,i) => { return i.every(x => typeof x === 'number') && s}, true)) this.type.push('matrix')
      const subtypes = this.array.map(i => this.#N(i).#typecast())
      let ptr = this.array ?? []
      let dimensions = 1
      while (ptr && Array.isArray(ptr) && ptr.every(i => !!i && Array.isArray(i) && i.length == ptr[0].length)) {
        ptr = ptr[0]
        dimensions++
      }
      this.type.push(`${dimensions}-dimensional`)
    } else {
      if (this.every(Number.isInteger)) this.type.push('integer')
      if (this.every(Number.isFinite)) this.type.push('float')
      if (this.every(Number.isNaN)) this.type.push('NaN')
      if (this.every(i => typeof i === 'string')) {
        this.type.push((this.every(i => i.length === 1)) ? 'character' : 'string')
      }
      if (this.every(i => typeof i == 'number' && i > 0 && i <= 1)) this.type.push('statistical')
      if (this.every(i => typeof i == 'number' && i >= 0)) this.type.push('positive')
      if (this.every(i => typeof i == 'number' && i < 0)) this.type.push('negative')
    }
    if (this.flatten.every(i => typeof i === 'number')) {
      this.type.push('Number')
      this.type.push('numeric')
      const largest = Math.max(...this.array.flat())
      const smallest = Math.min(...this.array.flat())
      if (largest === smallest) this.type.push('constant')
      if (smallest >= 0) this.type.push('unsigned')
      if (smallest >= 0 && largest <= 256) this.type.push('byte')
      if (smallest >= 0 && largest <= 65536) this.type.push('short')
      if (smallest >= 0 && largest <= 4294967296) this.type.push('int')
      if (smallest >= 0 && largest <= 18446744073709551616) this.type.push('long')
      if (smallest >= -128 && largest <= 127) this.type.push('byte', 'signed')
      if (smallest >= -32768 && largest <= 32767) this.type.push('short', 'signed')
      if (smallest >= -2147483648 && largest <= 2147483647) this.type.push('int', 'signed')
      if (smallest >= -9223372036854775808 && largest <= 9223372036854775807) this.type.push('long', 'signed')
      if (this.array.flat().every(i => i % 1 === 0)) this.type.push('integer')
      if (this.array.flat().every(i => i % 1 !== 0)) this.type.push('float')
    }
  }

  #arrayAccess() {
    // clean up any old accessors
    Object.keys(this).filter(k => /^-?\d+/.test(k)).forEach(k => delete this[k])
    // set [ ] accessors for objects in this.array
    for (let i = 0; i < this.array.length; i++) {
      Object.defineProperty(this, i, {
        get: () => this.array[i],
        set: (v) => this.array[i] = v,
        rewrite: (v) => this.array[i] = this.defaultTransform(v),
        configurable: true,
        enumerable: true
      })
    }
    // set -1, -2, -3, etc. accessors for objects in this.array
    for (let i = 1; i <= this.array.length; i++) {
      Object.defineProperty(this, -i, {
        get: () => this.array[this.array.length - i],
        set: (v) => this.array[this.array.length - i] = v,
        rewrite: (v) => this.array[this.array.length - i] = this.defaultTransform(v),
        configurable: true,
        enumerable: true
      })
    }
  }

  isType(...types) { return types.every(t => this.type.includes(t)) }
  isAnyType(...types) { return types.some(t => this.type.includes(t)) }
  reshape(...shape) {
    shape_length = shape.reduce((acc, v) => acc * v, 1)
    if (this.array.flat().length !== shape_length) throw new Error('Invalid shape')
    if (!this.isAnyType('Number', 'statistial', 'matrix', 'character')) throw new Error('Cannot reshape non-matrix arrays')
    const results = []
    const ptr = this.array.flat()
    let i = 0
    while (i < ptr.length) {
      results.push(ptr.slice(i, i + shape[0]))
      i += shape[0]
    }
    return this.#N(results)
  }

  transpose() {
    if (!this.isType('matrix')) throw new Error('Cannot transpose non-matrix arrays')
    const results = []
    for (let i = 0; i < this.array[0].length; i++) {
      results.push(this.array.map(row => row[i]))
    }
    return this.#N(results)
  }

  rotateLeft(n=1) {
    if (this.isType('matrix')) {
      const results = []
      for (let i = this.array[0].length - 1; i >= 0; i--) {
        results.push(this.array.map(row => row[i]))
      }
      return (n==1) ? this.#N(results) : this.#N(results).rotateLeft(n-1)
    } else {
      return this.#N(this.array.slice(n).concat(this.array.slice(0, n)))
    }
  }

  rotateRight(n=1) {
    if (this.isType('matrix')) {
      const results = []; for (let i = 0; i < this.array[0].length; i++) results.push(this.array.map(row => row[i]))
      return (n==1) ? this.#N(results) : this.#N(results).rotateRight(n-1)
    } else {
      return this.#N(this.array.slice(-n).concat(this.array.slice(0, -n)))
    }
  }

  reverse() {
    if (this.isType('matrix')) {
      const results = []
      for (let i = this.array[0].length - 1; i >= 0; i--) {
        results.push(this.array[i])
      }
      return this.#N(results)
    } else {
      return this.#N(this.array.reverse())
    }
  }
  get numeric() {
    // is the array all numbers or arrays of numbers?
    return this.array.every(i => (typeof i === 'number' || this.#N(i).numeric))
  }
  get nonNumeric() { return !this.numeric }
  sort(fn) {
    if (this.isType('matrix')) return this.#N(this.array.map(row => row.sort(fn)))
    return this.#N(this.array.sort(fn))
  }
  static isArray(obj) { return obj instanceof NeoArray  || Array.isArray(obj) }
  dotProduct(other) {
    if (!this.isType('matrix') || !other.isType('matrix')) throw new Error('Cannot dot product non-matrix arrays')
    if (this.array[0].length !== other.array.length) throw new Error('Invalid matrix dimensions')
    const results = []
    for (let i = 0; i < this.array.length; i++) {
      results.push(this.array[i].reduce((acc, v, j) => acc + v * other.array[j][i], 0))
    }
    return this.#N(results)
  }

  sigmoid() {
    if (!this.numeric) throw new Error('Cannot sigmoid non-numeric arrays')
    if (this.isType('matrix')) return this.#N(this.array.map(row => row.map(v => 1 / (1 + Math.exp(-v))))).transpose()
    return this.#N(this.array.map(v => 1 / (1 + Math.exp(-v))))
  }

  loss(other) {
    if (!this.isType('matrix') || !other.isType('matrix')) throw new Error('Cannot calculate loss between non-matrix arrays')
    if (this.array.length !== other.array.length || this.array[0].length !== other.array[0].length) throw new Error('Invalid matrix dimensions')
    return this.#N(this.array.map((row, i) => row.map((v, j) => v - other.array[i][j])))
  }

  get sum() {
    if (!this.numeric) throw new Error('Cannot calculate sum of non-numeric arrays')
    if (this.isType('matrix')) return this.array.flat().reduce((acc, v) => acc + v, 0)
    return this.array.reduce((acc, v) => acc + v, 0)
  }

  get mean() {
    if (!this.numeric) throw new Error('Cannot calculate mean of non-numeric arrays')
    if (this.isType('matrix')) return this.sum / this.array.flat().length
    if (this.isType('Number')) return this.sum / this.array.length
  }

  get avg() { return this.mean }
  get median() {
    if (this.isType('matrix')) return this.#N(this.array).median
    return this.#N(this.array.sort((a, b) => a - b)[Math.floor(this.array.length / 2)])
  }

  get mode() {
    if (!this.numeric) throw new Error('Cannot calculate mode of non-numeric arrays')
    const counts = this.array.reduce((acc, v) => acc.set(v, (acc.get(v) || 0) + 1), new Map())
    const max = Math.max(...counts.values())
    return [...counts.entries()].filter(([_, v]) => v === max).map(([k, _]) => k)
  }

  get range() {
    if (!this.numeric) throw new Error('Cannot calculate range of non-numeric arrays')
    return new NeoRange(Math.min(...this.array), Math.max(...this.array))
  }

  get variance() {
    if (!this.numeric) throw new Error('Cannot calculate variance of non-numeric arrays')
    const mean = this.mean
    return this.array.reduce((acc, v) => acc + (v - mean) ** 2, 0) / this.array.length
  }

  get stddev() { return Math.sqrt(this.variance) }

  get covariance() {
    if (!this.isType('matrix')) throw new Error('Cannot calculate covariance of non-matrix arrays')
    const means = this.array.map(row => row.mean)
    const results = []
    for (let i = 0; i < this.array.length; i++) {
      results.push(this.array[i].map((v, j) => (v - means[i]) * (this.array[j][i] - means[j])))
    }
    return this.#N(results)
  }

  get correlation() {
    if (!this.isType('matrix')) throw new Error('Cannot calculate correlation of non-matrix arrays')
    const cov = this.covariance
    const stddevs = this.array.map(row => row.stddev)
    const results = []
    for (let i = 0; i < this.array.length; i++) {
      results.push(this.array[i].map((v, j) => cov.array[i][j] / (stddevs[i] * stddevs[j])))
    }
    return this.#N(results)
  }

  intersection(other) {
    if (!this.isType('matrix') || !other.isType('matrix')) {
      if (this.array.length !== other.array.length || this.array[0].length !== other.array[0].length) throw new Error('Invalid matrix dimensions')
      const results = []
      for (let i = 0; i < this.array.length; i++) {
        results.push(this.array[i].map((v, j) => v === other.array[i][j] ? v : undefined))
      }
      return this.#N(results)
    } else {
      return this.#N(this.array.filter(i => other.array.includes(i)))
    }
  }

  union(other) {
    if (!this.isType('matrix') || !other.isType('matrix')) {
      if (this.array.length !== other.array.length || this.array[0].length !== other.array[0].length) throw new Error('Invalid matrix dimensions')
      const results = []
      for (let i = 0; i < this.array.length; i++) {
        results.push(this.array[i].map((v, j) => v !== other.array[i][j] ? v : undefined))
      }
      return this.#N(results)
    } else {
      return this.#N(this.array.concat(other.array))
    }
  }

  difference(other) {
    if (!this.isType('matrix') || !other.isType('matrix')) {
      if (this.array.length !== other.array.length || this.array[0].length !== other.array[0].length) throw new Error('Invalid matrix dimensions')
      const results = []
      for (let i = 0; i < this.array.length; i++) {
        results.push(this.array[i].map((v, j) => v !== other.array[i][j] ? v : undefined))
      }
      return this.#N(results)
    } else {
      return this.#N(this.array.filter(i => !other.array.includes(i)))
    }
  }

  symmetricDifference(other) {
    if (!this.isType('matrix') || !other.isType('matrix')) {
      if (this.array.length !== other.array.length || this.array[0].length !== other.array[0].length) throw new Error('Invalid matrix dimensions')
      const results = []
      for (let i = 0; i < this.array.length; i++) {
        results.push(this.array[i].map((v, j) => v !== other.array[i][j] ? v : undefined))
      }
      return this.#N(results)
    } else {
      return this.#N(this.array.filter(i => !other.array.includes(i)).concat(other.array.filter(i => !this.array.includes(i))))
    }
  }

  product() {
    if (!this.numeric) throw new Error('Cannot calculate product of non-numeric arrays')
    if (this.isType('matrix')) return this.array.flat().reduce((acc, v) => acc * v, 1)
    return this.array.reduce((acc, v) => acc * v, 1)
  }

  power() {
    if (!this.numeric) throw new Error('Cannot calculate power of non-numeric arrays')
    if (this.isType('matrix')) return this.array.flat().reduce((acc, v) => acc ** v, 1)
    return this.array.reduce((acc, v) => acc ** v, 1)
  }

  get derivative() {
    if (!this.numeric) throw new Error('Cannot calculate derivative of non-numeric arrays')
    if (this.isType('matrix')) return this.#N(this.array.map(row => row.map(v => v - 1)))
    return this.#N(this.array.map(v => v - 1))
  }

  get identity() {
    if (!this.isType('matrix')) throw new Error('Cannot calculate identity of non-matrix arrays')
    if (this.array.length !== this.array[0].length) throw new Error('Invalid matrix dimensions')
    const results = []
    for (let i = 0; i < this.array.length; i++) {
      results.push(this.array[i].map((v, j) => i === j ? v : 0))
    }
    return this.#N(results)
  }

  get shuffle() {
    return this.#N(this.array.sort(() => Math.random() - 0.5))
  }

  get reverse() {
    if (this.isType('matrix')) return this.#N(this.array.map(row => row.reverse()))
    return this.#N(this.array.reverse())
  }

  get unique() {
    return this.#N(this.array.unique())
  }

  get ascii() {
    if (!this.isType('character')) throw new Error('Cannot convert non-character arrays to ASCII')
    return this.array.map(i => i.charCodeAt(0))
  }

  get frequency() {
    return this.array.reduce((acc, v) => acc.set(v, (acc.get(v) || 0) + 1), new Map())
  }

  get histogram() {
    return [...this.frequency.entries()].sort((a, b) => a[1] - b[1])
  }

  get riffle() {
    return this.shuffle.shuffle.shuffle.shuffle.shuffle.shuffle.shuffle.shuffle.shuffle.shuffle.shuffle
  }

  get draw() {
    return this.riffle.array[ Math.floor(Math.random() * this.array.length) ]
  }

  get sample() {
    return this.array[Math.floor(Math.random() * this.array.length)]
  }

  uniqueLexemes(minlength = 2) {
    if (!this.allString) return NaN;
    // find longest substrings that, when compared to the other strings, distinguish from all except words one is entirely a substring of
    const lexemes = new NObject();
    const strings = this.unique.map(x => x.nhanced ? x : x.up);
    const longest = strings.map(x => x.length).max;
    strings.map(s1 => {
      strings.map(s2 => {
        lexemes[s1] = NArray.up(s1.uncommon_xgrams(s2, minlength));
      })
    })
    return lexemes;
  }
  toString() { return `NeoArray (${this.length}): [${this.array.join(' ,')}]` }
  log() { console.log(this.toString()); return this }
  get empty() { return this.array.length === 0 }
  get hexChars() {
    if (!this.isAnyType('character', 'byte')) throw new Error('Cannot convert non-character arrays to hex')
    if (this.isType('character')) return this.#N(this.array.map(i => i.charCodeAt(0).toString(16)))
    if (this.isType('byte')) return this.#N(this.array.map(i => i.toString(16)))
  }


  lexemeSimilarity(s2) {
    if (!this.allString) return NaN; // requires a lexeme array; assumes generation by uniqueLexemes
    const matches = this.map(s1 => new NeoString(s1).lexemeSimilarity(s2));
    const levendist = this.map(s1 => new NeoString(s1).levenshteinDistance(s2));
    const squarecomps = new NArray();
    if (matches.isEmpty) return new Float(0.0)
    new NeoRange(0, matches.length).each( i => {
      squarecomps.push(((matches[i]  + levendist[i]) ** 2) / this[i].length ** 2);
    })
    return new Float(squarecomps.mean.sqrt).sigmoid;
  }

  matchLexemes(s2) {
    if (!this.isAnyType('character', 'string')) throw new Error('Cannot match non-character arrays');
    const matches = this.map(s1 => NeoString.up(s1).matchLexemes(s2));
    if (matches.empty) return new NeoArray();
    const match = matches.max;
    return matches.filter(x => x === match);
  }

  compareLexemeMatches(lexary) {
    if (this.length == lexary.length) return new Float(0);
    // compare matches by size of strings
    const stddev1 = this.#N(this.map(x => x.length ** 2)).stddev
    const stddev2 = NArray.up(lexary.map(x => x.length ** 2)).stddev
    return new NeoNumber(stddev1 - stddev2).sigmoid;
  }


  lexemeProbability(s2) {
    const matches = this.matchLexemes(s2)
    if (matches.empty) return new NeoNumber(0)
    return this.#N(matches.map(m => m.length)).sum / this.length
  }

  reduceType(type) {
    // remove all elements that are not of the specified type, using typeset values
    switch(type) {
      case 'positive': return this.#N(this.array.filter(i => typeof i === 'number' && i > 0))
      case 'negative': return this.#N(this.array.filter(i => typeof i === 'number' && i < 0))
      case 'integer': return this.#N(this.array.filter(i => typeof i === 'number' && i % 1 === 0))
      case 'float': return this.#N(this.array.filter(i => typeof i === 'number' && i % 1 !== 0))
      case 'NaN': return this.#N(this.array.filter(i => typeof i === 'number' && isNaN(i)))
      case 'Number': return this.#N(this.array.filter(i => typeof i === 'number'))
      case 'numeric': return this.#N(this.array.filter(i => typeof i === 'number'))
      case 'string': return this.#N(this.array.filter(i => typeof i === 'string'))
      case 'character': return this.#N(this.array.filter(i => typeof i === 'string' && i.length === 1))
      case 'matrix': return this.#N(this.array.filter(i => Array.isArray(i) && i.every(j => typeof j === 'number')))
      case 'statistical': return this.#N(this.array.filter(i => typeof i === 'number' && i >= 0 && i <= 1))
      case 'byte': return this.#N(this.array.filter(i => typeof i === 'number' && i >= 0 && i <= 256))
      case 'short': return this.#N(this.array.filter(i => typeof i === 'number' && i >= 0 && i <= 65536))
      case 'int': return this.#N(this.array.filter(i => typeof i === 'number' && i >= 0 && i <= 4294967296))
      case 'long': return this.#N(this.array.filter(i => typeof i === 'number' && i >= 0 && i <= 18446744073709551616))
      case 'unsignedByte': return this.#N(this.array.filter(i => typeof i === 'number' && i >= -128 && i <= 127))
      case 'unsignedShort': return this.#N(this.array.filter(i => typeof i === 'number' && i >= -32768 && i <= 32767))
      case 'unsignedInt': return this.#N(this.array.filter(i => typeof i === 'number' && i >= -2147483648 && i <= 2147483647))
      case 'unsignedLong': return this.#N(this.array.filter(i => typeof i === 'number' && i >= -9223372036854775808 && i <= 9223372036854775807))
      case 'BigInt': return this.#N(this.array.filter(i => typeof i === 'bigint'))
      case 'symbol': return this.#N(this.array.filter(i => typeof i === 'symbol'))
      case 'function': return this.#N(this.array.filter(i => typeof i === 'function'))
      case 'object': return this.#N(this.array.filter(i => typeof i === 'object'))
      case 'boolean': return this.#N(this.array.filter(i => typeof i === 'boolean'))
      case 'undefined': return this.#N(this.array.filter(i => typeof i === 'undefined'))
      case 'null': return this.#N(this.array.filter(i => i === null))
      case 'NaN': return this.#N(this.array.filter(i => isNaN(i)))
      case 'constant': return this.#N(this.array.filter(i => i === this.array[0]))
      case 'unsigned': return this.#N(this.array.filter(i => i >= 0))
      default: return this
    }
  }

  at(...idx) {
    if (idx.length === 1) return this.array[idx[0]]
    idx.reduce((acc, i) => acc[i] ?? undefined, this.array)
  }

  setValueAt(...idx) {
    return { to: (newval) => {
      if (idx.length === 1) this.array[idx[0]] = newval
      ptr = this.array
      while (idx.length > 1) {
        ptr = ptr[idx.shift()] ?? []
      }
      ptr[idx[0]] = newval
    }}
  }
  // Static methods

  static fromArray(...arr) { return new NeoArray(arr) }
  static fromMatrix(...nums) { return new NeoArray(nums) }
  static from(...args) { return new NeoArray(args) }
}

export { NeoArray }