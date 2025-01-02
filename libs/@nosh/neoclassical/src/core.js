import { O_O } from '@nosh/unhelpfully'
export class NeoCore {
  #core = {}
  #pragma = O_O
  constructor(value) {
    this.#core = Object.create(null)
    this.#core.basics = Object.create(null)
    this.#core.basics.neo = true
    this.#core.value = value
    Object.freeze(this.#core.basics)
  }

  get ancestors() { }
  toString() { return this.#core.value.toString() }
  valueOf() { return this.#core.value.valueOf() }
  toJSON() { return this.#core.value.toJSON() }
  get value() { return this.#core.value }
  static neo(anyval) {
    return new NeoCore(anyval)
  }
  get neo() { return this.core.basics.neo }
}