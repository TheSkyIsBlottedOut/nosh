import { O_O } from '@@nosh-libs/unhelpfully'
import { Float } from './integer.ts';


export const enlist = (...args) => {
  if (args.length === 1) {
    if (args[0] instanceof Array) return new NArray(args[0])
    else return new NArray(args[0]);
  } else {
    return new NArray(args);
  }
}


const NArray = class extends Array {
  __iterator_key = 0;
  #__defaults = O_O.fn.obj();
  constructor(...args) { super(...args.map( x => x?.nhanced ? x : x?.up?.() ?? x)); }

  get shuffled() {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
  }
  get reiterate() { this.__iterator_key = 0; return this; }
  get iterate() { return this[this.__iterator_key++]; }
  static up(v) { return v.nhanced ? v : v?.up?.() ?? v }
  get flip() { return new NArray(super.reverse()); }
  inverted() { return new NArray(...this).flip; }
  get sorted() { return this.slice().sort(); }
  get rotated() { return this.slice(1).concat(this[0]); }
  get compact() { delete this[this.indexOf(undefined)]; delete this[this.indexOf(null)]; return this; }

  get random() { return this[Math.floor(Math.random() * this.length)]; }
  get first() { return this[0]; }
  get last() { return this[this.length - 1]; }
  get arraytype() {
    if (this.length === 0) return 'empty';
    if (this.length === 1) return 'singleton';
    const types = this.map(x => typeof x);
    const uniqueTypes = [...new Set(types)];
    if (uniqueTypes.length > 1) return 'array';
    const _this = this;
    switch(uniqueTypes[0]) {
      case 'number':
        if (this.every(x => Number.isInteger(x))) return 'integer';
        if (this.every(x => x > 0 && x < 1)) return 'statistical';
        if (this.every(x => x > 0 && x < 256)) return 'byte';
        if (this.every(x => x > 0 && x < 65536)) return 'word';
        if (this.every(x => x > 0 && x < 4294967296)) return 'double';
        if (this.some(x => x < 0)) return 'signed';
        if (this.every(x => x > 0)) return 'unsigned';
        if (this.every(x => x < 0)) return 'negative';
        if (this.every(x => Math.floor(x) != x)) return 'float';
        else return 'numeric';
      case 'string':
        if (this.every(x => x.length === 1)) return 'character';
        if (this.every(x => x.length === 2)) return 'digram';
        if (this.every(x => x.length === 3)) return 'trigram';
        if (this.every(x => x.length === 4)) return 'quads';
        if (this.map(x => x.length).every((val, i, arr) => val === arr[0])) return `${this[0].length}-gram`
        if (this.every(x => x[-1] === '\n')) return 'lines';
        if (this.every(x => x.includes('\n'))) return 'multiline';
        if (this.every(x => x[-1] === '.')) return 'sentence';
        if (this.every(x => x = ~ /[a-zA-Z]/)) return 'words';
        if (this.every(x => x = ~ /[0-9]/)) return 'digits';
        if (this.every(x => x = ~ /[a-zA-Z0-9]/)) return 'alphanumeric';
        if (this.every(x => x = ~ /[a-zA-Z0-9\W]/)) return 'ascii';
        if (this.every(x => x = ~ /[^\x00-\x7F]/)) return 'unicode';
        if (this.every(x => x = ~ /[a-f0-9]/i)) return 'hexadecimal';
        if (this.every(x => x = ~ /[01]/)) return 'binary';
        else return 'string';
      case 'boolean':
        if (this.every(x => x === true)) return 'true';
        if (this.every(x => x === false)) return 'false';
        return 'boolean';
      case 'object':
        if (this.every(x => x instanceof Array)) {
          if (this.every(x => enlist(x).allNumeric)) return 'matrix';
          if (this.every(x => enlist(x).allString)) return 'lexicon';
          if (this.every(x => enlist(x).allArray)) return 'multidimensional'
          if (this.every(x => enlist(x).allTuples)) return 'tuple';
          if (this.every(x => enlist(x).map(y => y.arraytype).unique.length === 1)) return 'tuple';
          return 'array'
        }
        const classes = _this.map(x => x.constructor.name);
        return [...new Set(classes)].length === 1 ? classes[0] : 'object';
        return 'object';
      case 'function':
        if (new Set(_this.map(x => x.length)).size === 1) return `arity-${this[0].length}`;
        else return 'function';
      case 'undefined':
        return 'undefined';
      default:
        return 'array';
    }
  }
  oneOf(...args) { return this.arraytype in args; }
  get allNumeric() { return this.every(x => typeof x === 'number'); }
  get allString() { return this.every(x => typeof x === 'string'); }
  get allArray() { return this.every(x => Array.isArray(x)); }
  get allTuples() { return (this.allArray ? [...new Set(...this.map(x => x.length))].length === 1 : false); }
  get allFunction() { return this.every(x => typeof x === 'function'); }
  get stddev() { return (this.allNumeric) ? Math.sqrt(this.variance) :  NaN }
  get variance() { return (this.allNumeric) ? this.reduce((a, b) => a + (b - this.mean) ** 2, 0) / this.length : NaN }
  get mean() { return (this.allNumeric) ? this.reduce((a, b) => a + b, 0) / this.length :  NaN; }
  get median() { return (this.allNumeric) ? this.sorted[this.length / 2] : NaN; }
  get mode() { return (this.allNumeric) ? this.unique.map(x => [x, this.filter(y => y === x).length]).sort((a, b) => b[1] - a[1])[0][0] : NaN; }
  get range() { if (this.allNumeric) return this.max - this.min; else return NaN; }
  get hexchars() { if (this.oneOf('character')) return this.map(x => x.charCodeAt(0).toString(16)); else return NaN; }
  get unique() { return [...new Set(this)]; }
  get dup() { return new NArray(...this); }
  get max() {
    if (this.allNumeric) return Math.max(...this); else if (this.allString) return this.sort().last; else return NaN;
  }
  get min() {
    if (this.allNumeric) return Math.min(...this); else if (this.allString) return this.sort().first; else return NaN;
  }
  get sum() { if (this.allNumeric) return this.reduce((a, b) => a + b, 0); else return NaN; }
  get product() { if (this.allNumeric) return this.reduce((a, b) => a * b, 1); else return NaN; }
  get powerset() {
    return this.reduce((a, v) => a.concat(a.map(r => [v].concat(r))), [[]]);
  }
  get dimensions() {
    if (this.allTuples) return this[0].length;
    else return (this.length > 1 ? 1 : 0);
  }
  get transpose() {
    if (this.allArray) {
      return this[0].map((_, i) => this.map(x => x[i]));
    }
    else return NaN;
  }

  set padchar(char) { this.#__defaults.pad_char = char; }
  padFrom(direction = 'left') {
    this.#__defaults ||= O_O.fn.obj();
    this.#__defaults.pad_direction = ['left', 'start', 'begin', 'beginning'].includes(direction) ? 'left' : 'right';

    switch(this.arraytype) {
      case 'integer': this.padchar = 0; break;;
      case 'string': this.padchar = ' '; break;;
      case 'statistical': this.padchar = 0.5; break;;
      case 'byte': this.padchar = 0; break;;
      case 'words': this.padchar = 'lorem'; break;;
      case 'alphanumeric': this.padchar = 'a'; break;;
      case 'ascii': this.padchar = '\x00'; break;;
      case 'unicode': this.padchar = '\u0000'; break;;
      case 'hexadecimal': this.padchar = '00'; break;;
      case 'binary': this.padchar = 0; break;;
      case 'character': this.padchar = ' '; break;;
      case 'digram': this.padchar = '  '; break;;
      case 'trigram': this.padchar = '   '; break;;
      case 'quads': this.padchar = '    '; break;;
      case 'lines': this.padchar = '\n'; break;;
      case 'multiline': this.padchar = '\n\n'; break;;
      case 'sentence': this.padchar = 'OK.'; break;;
      case 'words': this.padchar = 'lorem ipsum dolor sit amet';  break;;
      case 'digits': this.padchar = 0; break;;
      case 'signed': this.padchar = -1; break;;
      case 'unsigned': this.padchar = 1; break;;
      case 'negative': this.padchar = -1; break;;
      case 'float': this.padchar = 0.5; break;;
      case 'numeric': this.padchar = 0; break;;
      case 'boolean': this.padchar = false;  break;;
      default: this.padchar = undefined; break;;
    }
  }

  padded(length, direction = 'left', character = null) {
    this.padFrom(direction);
    const padchar = character ?? this.#__defaults.pad_char;
    const pad_direction = this.#__defaults.pad_direction;
    const pad = new NArray(length - this.length).fill(padchar);
    return pad_direction === 'left' ? this.concat(pad) : pad.concat(this);
  }

  reshape(...args) {
      const dims = args.length; // 2,3,4 should create a 2x3x4 array
      const size = this.flat().length;
      const necessarysize = args.reduce((a, b) => a * b);

      if (size % args.reduce((a, b) => a * b) === 0) {
        const result = new NArray();
        for (let i = 0; i < size; i++) {
          const index = args.map((dim, j) => Math.floor(i / args.slice(j).reduce((a, b) => a * b)) % dim);
          result.push(this.flat()[index.reduce((a, b, j) => a + b * args.slice(j + 1).reduce((a, b) => a * b), 0)]);
        }
        return result;
      }
      else return NaN;
    }
  get flatten() { return this.flat() }
  get upgrade() { for (let i in this) { this[i] = this[i].nhanced ? this[i] : this[i].up; } return this; }
  up() { return new NArray(...this).upgrade }
  extended(...args) { return new NArray(...this, ...args); }
  get nhanced() { return true; }
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

  get isEmpty() { return this.length === 0; }

  lexemeProbability(s2) {
    const matches = new NArray(this.matcheLexemes(s2))
    if (matches.isEmpty) return new Float(0)
    return new Float(matches.map(x => x.length).sum / this.length).sigmoid
  }

  lexemeSimilarity(s2) {
    if (!this.allString) return NaN; // requires a lexeme array; assumes generation by uniqueLexemes
    const matches = this.map(s1 => s1.up.lexemeSimilarity(s2));
    const levendist = this.map(s1 => s1.up.levenshteinDistance(s2));
    const squarecomps = new NArray();
    if (matches.isEmpty) return new Float(0.0)
    (0).up.upto(matches.length, i => {
      squarecomps.push(((matches[i]  + levendist[i]) ** 2) / this[i].length ** 2);
    })
    return new Float(squarecomps.mean.sqrt).sigmoid;
  }

  matchLexemes(s2) {
    if (!this.allString) return [];
    const matches = this.map(s1 => s1.up.longestCommonSubstring(s2));
    if (matches.isEmpty) return new NArray();
    const match = matches.max;
    return matches.filter(x => x === match);
  }

  compareLexemeMatches(lexary) {
    if (this.length == lexary.length) return new Float(0);
    // compare matches by size of strings
    const squared_lengths_1 = NArray.up(this.map(x => x.length).map(x => x ** 2));
    const squared_lengths_2 = NArray.up(lexary.map(x => x.length).map(x => x ** 2));
    const mean_1 = squared_lengths_1.mean.sqrt
    const mean_2 = squared_lengths_2.mean.sqrt
    // which is the more similar set of lexemes? return a float between -1 and 1
    return new Float((squared_lengths_1.sum - mean_1) / (squared_lengths_2.sum - mean_2));
  }

}
O_O.add('up').to(Array).method(() => new NArray().concat(this));
export { NArray }