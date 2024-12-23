import { O_O } from "../unhelpfully"

function N(value) {
  return NumberClassifier.up(value);
}

class NumberClassifier {
  #value = 0;
  constructor(value) {
    this.#value = value;
  }
  get classified() {
    return new (this.isFloat ? Float : Integer)(this.#value);
  }
  get isBigInt() {
    return this.#value > Number.MAX_SAFE_INTEGER;
  }
  get isFloat() {
    return Math.floor(this.#value) != this.#value;
  }
  get isNegative() {
    return this.#value < 0;
  }
  get value() {
    return this.#value;
  }
  get nhanced() {
    return true;
  }
  static up(num) {
    return new NumberClassifier(num).classified;
  }
}

const Primes = O_O.fn.obj([2, 3, 5, 7, 11, 13, 17, 19]);
O_O.add("next")
  .to(Primes)
  .get(() => {
    const prime_length = Primes.length;
    var next_candidate = Primes.last + 2;
    while (Primes.length == prime_length) {
      const is_prime = Primes.reduce((s, i) => {
        if (!s) return false;
        if (next_candidate % i == 0) return false;
        return true;
      });
      is_prime ? Primes.push(next_candidate) : (next_candidate += 2);
    }
  });
O_O.add("last")
  .to(Primes)
  .get(() => Primes[Primes.length - 1]);
O_O.add("includes")
  .to(Primes)
  .method((n) => {
    while (Primes.last < n) Primes.next;
    return Primes.includes(n);
  });
O_O.add("testNumber")
  .to(Primes)
  .method((n) => {
    if (n <= Primes.last) return Primes.includes(n);
    while (Primes.last < n) Primes.next; // can be reduced to prime found in 0..sqrt(n)
    return Primes.includes(n);
  });
O_O.add("factorize")
  .to(Primes)
  .method((n) => {
    const factors = [];
    let ptr = 0;
    while (n > 1) {
      const prime = Primes[ptr],
        isprime = prime % n == 0;
      if (isprime) {
        factors.push(prime);
        n /= prime;
      } else {
        ptr += 1;
      }
    }
    return factors;
  });

class Integer {
  #props = O_O.obj({ value: 0, isBigInt: false, isPrime: false });
  #value = 0
  constructor(value) {
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      this.#value = BigInt(value);
      this.#props.isBigInt = true;
    } else {
      this.#value = Number(value);
      this.#props.isBigInt = false;
    }
    this.#props.isPrime = Primes.testNumber(this.#value);
  }
  valueOf() {
    return this.isBigInt ? 0n + this.value : 0 + this.value;
  }
  get value() {
    return this.#props.value;
  }
  get milliseconds() {
    return N(this.value);
  }
  get seconds() {
    return N(this.value * 1000);
  }
  get minutes() {
    return N(this.seconds * 60);
  }
  get hours() {
    return N(this.minutes * 60);
  }
  times(fn) {
    for (let i = 0; i < this.value; i++) fn(i);
  }
  upto(num, fn) {
    for (let i = this.value; i <= num; i++) fn(i);
  }
  downto(num, fn) {
    for (let i = this.value; i >= num; i--) fn(i);
  }
  get days() {
    return N(this.hours * 24);
  }
  get weeks() {
    return N(this.days * 7);
  }
  get months() {
    return N(this.days * 30);
  }
  get years() {
    return N(this.days * 365.25);
  }
  get fromNow() {
    return new Date(Date.now() + this.value);
  }
  get ago() {
    return new Date(Date.now() - this.value);
  }
  get toString() {
    return `${this.value}`;
  }
  get toFloat() {
    return new Float(this.value);
  }
  get nhanced() {
    return true;
  }
  get factors() {
    return Primes.factorize(this.value);
  }
  get info() {
    return { type: "integer", value: this.value, isBigInt: this.isBigInt, factors: this.factors };
  }
  get isBigInt() {
    return +this > Number.MAX_SAFE_INTEGER;
  }
  get abs() {
    return N(Math.abs(this.value));
  }
  get ceil() {
    return N(Math.ceil(this.value));
  }
  get floor() {
    return N(Math.floor(this.value));
  }
  get round() {
    return N(Math.round(this.value));
  }
  get sqrt() {
    return new Float(Math.sqrt(this.value));
  }
  get cbrt() {
    return new Float(Math.cbrt(this.value));
  }
  coerce(...args) {
    const kargs = [this.value, ...args];
    const Klass = kargs.reduce((a, b) => {
      if (a instanceof BigInt || b instanceof BigInt) return BigInt;
      if (a instanceof Float || b instanceof Float) return Float;
      return Integer;
    }, Number);
    return args.map((x) => new Klass(x));
  }
  get bitsize() {
    return this.isBigInt ? this.value.toString(2).length : Math.floor(Math.log2(this.value)) + 1;
  }
  get isNegative() {
    return this.value < 0;
  }
  get isPositive() {
    return this.value > 0;
  }
  get toBinary() {
    return this.value.toString(2);
  }
  get toOctal() {
    return this.value.toString(8);
  }
  get toHex() {
    return this.value.toString(16);
  }
  get length() {
    return this.value.toString().length;
  }
  get isPrime() {
    return this.#props.isPrime;
  }
  get isZero() {
    return this.#value == 0;
  }

  toBase(base) {
    const radix = base;
    if (radix < 2) throw new Error("Radix must be greater than 1");
    if (radix < 36) return this.value.toString(radix);
    var val = BigInt(this.value),
      result = "";
    while (val > 0n) {
      let rem = val % BigInt(radix);
      result = String.fromCodePoint(Number(rem) + 31) + result; // remember to reverse base by subtracting this amount
      val = val / BigInt(radix);
    }
    return result;
  }
  static fromBase(value, base) {
    const radix = base;
    if (radix < 2) throw new Error("Radix must be greater than 1");
    if (radix < 36) return parseInt(value, radix);
    const result = value.split("").reduce((acc, cur) => {
      return acc * BigInt(radix) + BigInt(String.fromCodePoint(cur.charCodeAt(0) - 31));
    }, 0n);
    return new Integer(result);
  }
}

const Float = class {
  #value = 0;
  static maxbyteval(bytes) {
    return 2 ** (bytes * 8) - 1;
  }
  constructor(value) {
    this.#value = value;
  }
  get valueOf() {
    return this.#value;
  }
  get isInteger() {
    return this.floor == (this.#value);
  }
  get toString() {
    return this.isInteger ? `${this.#value}.0` : `${this.#value}`;
  }
  get toInteger() {
    return new Integer(this.floor);
  }
  get isStatistic() {
    return +this < 1.00000000001 && +this >= 0;
  }
  get isNegative() {
    return +this < 0;
  }
  get isPositive() {
    return +this > 0;
  }
  get isZero() {
    return +this == 0;
  }
  get isOne() {
    return +this == 1.0;
  }
  byteform(size = 4) {
    return Math.floor(+this * Float.maxbyteval(size));
  }
  get nhanced() {
    return true;
  }
  get sigmoid() {
    return 1 / (1 + Math.exp(-this));
  }
  get abs() {
    return N(Math.abs(+this));
  }
  get ceil() {
    return N(Math.ceil(+this));
  }
  get floor() {
    return N(Math.floor(+this));
  }
  get round() {
    return N(Math.round(+this));
  }
  get sqrt() {
    return new Float(Math.sqrt(+this));
  }
  get cbrt() {
    return new Float(Math.cbrt(+this));
  }
  get log10() {
    return new Float(Math.log10(+this));
  }
  get log2() {
    return new Float(Math.log2(+this));
  }
  get ln() {
    return new Float(Math.log(+this));
  }
  //get toConversion() { return new Conversion(+this)}
};

export { NumberClassifier, Integer, Float };
