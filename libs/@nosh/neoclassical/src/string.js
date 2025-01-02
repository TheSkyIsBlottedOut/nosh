import { NeoCore } from './core.js';
import { NeoArray } from './array.js';
import * as html from 'inc/html.json'
import { NeoNumber } from './number.js';
class NeoString extends NeoCore {
  constructor(str) { this.#value = (typeof str === 'string') ? str : str.toString(); }
  #N(str) { return new NeoString(str) }
  #NA(...args) { return new NeoArray(...args) }
  #NN(...args) { return new NeoNumber(...args) }
  get ascii() { return this.#NA(...this.chars.map((c) => c.charCodeAt(0))) }
  get backwards() { return this.#N(this.value.split('').reverse().join('')) }
  get base64() { return btoa(this); }

  get bytes() { return this.ascii }
  get chars() { return this.#NA(this.value.split('')) }
  get hexbytes() { return this.ascii.map((c) => c.toString(16)) }

  get htmldecoded() {
    return this.#N(this.value.replaceAll(/&([^\s\;]+?);/g, (_, m) => {
      if (html.namedEntities[_]) return html.namedEntities[_];
      const mm = this.#N(m);
      if (m.startsWith('#x')) return NeoString.fromHexCode(mm);
      if (m.startsWith('#')) return NeoString.fromCharCode(mm);
      return mm;
    }))
  }

  get htmlencoded() {
    return this.#N(this.value.replaceAll(/[\u00A0-\u9999<>\&]/g, (c) => {
      if (html.entities[c]) return html.entities[c];
      Object.keys(html.namedEntities).forEach((k) => {
        if (html.namedEntities[k] === c) return `&${k};`;
        return `&#${c.charCodeAt(0)};`
      })
    }))
  }

  get length() { return this.#value.length }
  get lines() { return this.#NA(this.value.split(/\n+/m)) }
  get lower() { return this.toLowerCase() }
  get strip() { return this.#N(this.value.trim()) }
  get upper() { return this.toUpperCase() }
  get urldecoded() { return decodeURIComponent(this.#value) }
  get urlencoded() { return encodeURIComponent(this.#value) }
  get utf8() { return unescape(encodeURIComponent(this)); }

  get value() { return this.#value; }

  get words() { return this.#NA((this.value.split(/\s+/m))) }
  charAt(i) { return this.value.charAt(i) }
  charCodeAt(i) { return this.value.charCodeAt(i) }
  concat(...args) { return this.#N( [ this.#value, ...args].join('') ) }
  includes(str) { return this.value.includes(str) }
  match(regex) { return this.match(regex); }
  matches(regex) { return !!this.match(regex); }
  path(...args) { return this.#N( [ this.value, ...args ].join('/') ) }
  reverse() { return this.backwards }
  split(sep) { return this.#NA(this.value.split(sep)) }
  toLowerCase() { return this.#N(this.value.toLowerCase()) }
  toString() { return this.#value }
  toUpperCase() { return this.#N(this.value.toUpperCase()) }
  trim() { return this.strip }
  valueOf() { return this.#value }

  chunk(n) { return this.#NA(this.match(new RegExp(`.{1,${n}}`, 'g'))) }
  count(sub) { return this.split(sub).length }
  static fromCharCode(...args) { return this.#N(String.fromCharCode(...args)); }
  static fromHexCode(...args) { return this.fromCharCode(parseInt(args, 16)); }
  get isPalindrome() { return this.alphanumeric_only === this.alphanumeric_only.reversed; }

  get notags() { return this.replace(/<[^>]+>/g, ''); }
  get nohtml() { return this.notags; }
  get spaceless() { return this.replace(/\s+/g, ''); }
  get alphanumeric_only() { return this.replace(/\W+/g, ''); }
  get numeric_only() { return this.replace(/\D+/g, ''); }
  get coerceNumber() {
    if (this.isNumeric) return parseFloat(this);
    if (this.isHex) return parseInt(this, 16);
    if (this.isBinary) return parseInt(this, 2);
    if (this.match(/^[0-9A-Z]+$/)) return parseInt(this, 36);
    return parseInt(this.hexchars.join(''), 16);
  }

  get isBinary() { return this.match(/^[01]+$/); }
  get isHex() { return this.match(/^[0-9a-f]+$/i); }
  get isNumeric() { return this.match(/^[0-9]+(?:\.[0-9]+)$/); }
  get isAlpha() { return this.match(/^[a-z]+$/i); }
  levenshteinDistanceFrom(s2) {
    const s1 = this, costs = this.#NA();
    s2 = this.#N(s2)
    s1.chars.each((_, i) => costs[i] = i);
    this.#NN(0).upto(s2.length).each((j) => {
      costs[0] = this.#NN(j);
      s1.chars.each((_, i) => {
        if (s1[i] === s2[j]) costs[i + 1] = costs[i];
        else costs[i + 1] = this.#NN(costs[i + 1]).min(costs[i]).min(costs[i + 1]).plus(1);
      });
    });
    return costs[s2.length];
  }

  get lower() { return this.toLowerCase(); }
  get upper() { return this.toUpperCase(); }

  longestCommonSubstring(s2) {
    let s1 = this.lower, s2 = s2.lower
    if (!s1 || !s2) return ''
    if (s1 === s2) return s1;
    let s1l = s1.length, s2l = s2.length, num = this.#NA(s1l), maxlen = 0, lastSubsBegin = 0, thisSubsBegin = 0, subsequence = '', thisSubsLength = 0, matrix = this.#NA(s1l);
    this.#NN(0).upto(s1l).each((i) => {
      matrix[i] = this.#NA(s2l);
      this.#NN(0).upto(s2l).each((j) => {
        matrix[i][j] = 0;
        if (s1[i] === s2[j]) {
          if ((i === 0) || (j === 0)) matrix[i][j] = 1;
          else matrix[i][j] = matrix[i - 1][j - 1] + 1;
          if (matrix[i][j] > maxlen) {
            maxlen = matrix[i][j];
            thisSubsBegin = i - matrix[i][j] + 1;
            thisSubsLength = matrix[i][j];
          }
        }
      })
    })
    return (maxlen === 0) ? '' : s1.substring(thisSubsBegin, thisSubsBegin + thisSubsLength);
  }

  uncommon_xgrams(s2, minsize = 2) {
    let s1 = this, s2 = s2.neo ? s2 : this.#N(s2), minsize = this.#NN(minsize);
    if (!s1 || !s2) return '';
    if (s1 === s2) return '';
    if (s1.length < minsize || s2.length < minsize) return '';
    minsize = minsize.min(s1.length).min(s2.length);
    let results = this.#NA();
    minsize.upto(1, (n) => {
      let s1grams = s1.chunk(n), s2grams = s2.chunk(n);
      return results.concat(s1grams.filter((x) => !s2grams.includes(x)));
    });
    return results;
  }
  lexemeSimilarity(str2) {
    let str1 = this, str2 = str2.neo ? str2 : this.#N(str2);
    if (!str2) return 0;
    if (str1 === str2) return 1;
    let str1words = str1.words, str2words = str2.words, common = str1words.filter((x) => str2words.includes(x)), uncommon = str1words.filter((x) => !str2words.includes(x));
    return this.#NN(common.length / (common.length + uncommon.length));
  }
  get hexchars() { return this.chars.map((c) => c.charCodeAt(0).toString(16)); }
  get isEmail() { return this.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i); }
  interpolate(data = {}, templateStyle = ':token') {
    // use the word token as the pattern in templatestyle, but assume 'this' is a string that needs to be interpolated
    const templateStyle = this.#N(templateStyle).replace(/\W+/g, '\\$&').replace(/token/g, '(\w+)');
    const pattern = new RegExp(templateStyle, 'g');
    return this.#value.replace(pattern, (_, token) => data[token] ?? '');
  }
  get isPalindrome() { return this.alphanumeric_only === this.alphanumeric_only.reversed; }
  get reversed() { return this.backwards; }
  get isUUID() { return this.match(/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i); }
  get isURL() { return this.match(/^https?:\/\/[^\s]+$/i); }
}

export { NeoString }