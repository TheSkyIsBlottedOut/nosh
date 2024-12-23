import { O_O } from "../unhelpfully";
class NObject extends Object {
  constructor(...args) {
    super(...args);
  }

  get keys() {
    return Object.keys(this);
  }
  get values() {
    return Object.values(this);
  }
  get entries() {
    return Object.entries(this);
  }
  get inverse() {
    return Object.fromEntries(this.entries.map(([k, v]) => [v, k]));
  }
  get random() {
    return NArray.up(this.entries).random;
  }
  get ancestors() {
    const response = new NArray();
    response.push(this);
    while (Object.getPrototypeOf(response.last)) {
      response.push(Object.getPrototypeOf(response.last));
      response.push(Object.getPrototypeOf(response.last).constructor);
    }
    return response;
  }
  select(fn) {
    return NObject.fromEntries(this.entries.filter(([k, v]) => !!fn(k, v)));
  }
  reject(fn) {
    const response = new NArray(this.entries.filter(([k, v]) => !fn(k, v)));
    return new NObject.fromEntries(response);
  }
  filter(fn) {
    return this.select(fn);
  }
  static fromEntries(entries) {
    return new NObject(super.fromEntries(entries));
  }
  get compact() {
    return NObject.fromEntries(this.reject((k, v) => !v));
  }
  get length() {
    return this.keys.length;
  }

  get proto() {
    return Object.getPrototypeOf(this);
  }
  get cons() {
    return this.constructor;
  }
  get nhanced() {
    return true;
  }
  get up() {
    return this;
  }
  static create(obj) {
    return new NObject(Object.create(obj));
  }
}
O_O.add("up")
  .to(Object)
  .get(() => new NObject(this));

export { NObject };
