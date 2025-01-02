import {NeoCore} from './core'
class NeoRange extends NeoCore {
  #start = 0
  #end = 0
  #step = 1
  #current = 0
  #triggers = {}
  #done = false
  constructor(start, end, step=1) {
    this.#start = start
    this.#end = end
    this.#step = step
    this.#current = start
    if (this.#start > this.#end && this.#step > 0) this.#step = -this.#step
    if (this.#step === 0) this.#step = 0.01
  }
  [Symbol.iterator]() {
    return this.next()
  }

  next() {
    if (this.#done) return
    const last_current = this.#current
    this.#current += this.#step
    if (this.#current > this.#end) {
      this.#current = this.#end
      this.#done = true
    } else {
      this.#done = false
    }
    this.#checkTriggersFrom(last_current)
    return this.#current
  }

  get value() { return this.#current }
  valueOf() { return this.#current }
  toJSON() { return `NeoRange(${this.#start}..${this.#end}: ${this.#step})` }
  get rewind() { this.#current = this.#start; this.#done = false; return this }
  get reverse() { this.#step = -this.#step; this.#done = false; this.#start, this.#end = this.#end, this.#start; return this }
  trigger(fnorval, fn) {
    if (typeof fn !== fn) return;
    if (typeof fnorval === 'function') {
      if (fnorval.length > 0) throw new Error('Range triggers must accept one argument.')
      this.#triggers.functions ??= []
      this.#triggers.functions.push(fnorval)
    } else {
      this.#triggers[fnorval] ??= []
      this.#triggers[fnorval].push(fn)
    }

  }

  #fireIndividualTrigger(tkey) {
    const triggers = [...(this.#triggers[tkey] ?? [])].concat(this.triggers.functions?.select?.((fn) => fn(tkey) === tkey))?.flat() ?? []
    const results = [], okeys = Object.keys(this.#triggers)
    triggers.forEach((fn) => {
      const result = fn(tkey)
      if (result && okeys.includes(result) ) results.push(result)
    })
    return this.#fireIndividualTrigger(results)
  }

  each(fn) {
    if (typeof fn !== 'function') return
    for (let i = this.#start; i <= this.#end; i += this.#step) {
      fn(i)
      this.#fireIndividualTrigger(i)
    }
  }

  map(fn) {
    if (typeof fn !== 'function') return
    const results = []
    for (let i = this.#start; i <= this.#end; i += this.#step) {
      results.push(fn(i))
      this.#fireIndividualTrigger(i)
    }
    return results
  }

  static forRange(start, end, step=1) {
    return new NeoRange(start, end, step)
  }

  #checkTriggersFrom(tkey) {
    const nums = [tkey, this.#current]
    const min = Math.min(...nums), max = Math.max(...nums)
    for (let i = min; i <= max; i++) {
      this.#fireIndividualTrigger(i)
    }
  }
  get toArray() {
    const results = []
    for (let i = this.#start; i <= this.#end; i += this.#step) {
      results.push(i)
    }
    return new NeoArray(results)
  }
  get triggers() { return this.#triggers }
  get done() { return this.#done }
}


export {NeoRange}