import { NArray } from './array';

class NString extends String {
  constructor(...args) { super(...args); }
  get length() { return this.length; }
  get chars() { return new NArray(this.split('')); }
  get words() { return new NArray(this.split(/\s+/m)); }
  get lines() { return new NArray(this.split('\n')); }
  path(o) { return [this, o].join('/') }
  get reversed() { return new NString(this.split('').reverse().join('')); }
  get bytes() { return new NArray(this.split('').map(x => x.charCodeAt(0))); }
  get hexbytes() { return new NArray(this.bytes.map(x => x.toString(16))); }
  get base64() { return btoa(this); }
  matches(regex) { return this.match(regex); }
  get utf8() { return unescape(encodeURIComponent(this)); }
  chunk(n) { return new NArray(this.match(new RegExp(`.{1,${n}}`, 'g'))); }
  get isPalindrome() { return this.alphanumeric_only === this.alphanumeric_only.reversed; }
  get spaceless() { return this.replace(/\s+/g, ''); }
  get alphanumeric_only() { return this.replace(/\W+/g, ''); }
  get numeric_only() { return this.replace(/\D+/g, ''); }
  get isBinary() { return this.match(/^[01]+$/); }
  get isHex() { return this.match(/^[0-9a-f]+$/i); }
  get isNumeric() { return this.match(/^[0-9]+$/); }
  get isAlpha() { return this.match(/^[a-z]+$/i); }
  levenshteinDistanceFrom(s2) {
    const s1 = this;
    const costs = new NArray();
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) costs.push(j);
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1[i - 1] !== s2[j - 1]) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  get lower() { return this.toLowerCase(); }
  get upper() { return this.toUpperCase(); }
  get up() { return this }

  longestCommonSubstring(s2) {
    const s1 = this.toLowerCase();
    s2 = s2.toLowerCase();
    if (!s1 || !s2) return ''
    if (s1 === s2) return s1;
    let s1Length = s1.length;
    let s2Length = s2.length;
    let num = new NArray(s1Length);
    let maxlen = 0;
    let lastSubsBegin = 0;
    let thisSubsBegin = 0;
    let subsequence = '';
    let thisSubsLength = 0;
    let matrix = new NArray(s1Length);
    (0).up.upto(s1Length, i => {
      matrix[i] = new NArray(s2Length);
      (0).up.upto(s2Length, j => {
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
      });
    });
    if (maxlen === 0) return '';
    return s1.substring(thisSubsBegin, thisSubsBegin + thisSubsLength);
  }

  uncommon_xgrams(s2, minsize = 2) {
    const s1 = this;
    s2 = s2.nhanced ? s2 : s2.up;
    minsize = Math.min(minsize, s1.length, s2.length);
    minsize.up.upto(1, n => {
      const s1grams = s1.chunk(n)
      const s2grams = s2.chunk(n);
      return NArray.up(s1grams.filter(x => !s2grams.includes(x)));
    })
  }

  lexemeSimilarity(str2) {
    const str1 = this;
    if (!str2.nhanced) str2 = str2.up;
    const str1words = str1.words;
    const str2words = str2.words;
    const common = str1words.filter(x => str2words.includes(x));
    const uncommon = str1words.filter(x => !str2words.includes(x));
    return new Float(common.length / (common.length + uncommon.length))
  }

  get isEmail() { return this.match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i) }
  interpolate(data = {}, templateStyle = ':token'  ) {
    // use the word token as the pattern in templatestyle, but assume 'this' is a string that needs to be interpolated
    if (!data.nhanced) data = data.up;
    templateStyle.replace(/token/g, '(\w+)');
    const pattern = new RegExp(templateStyle, 'g');
    return this.replace(pattern, (_, token) => data[token] ?? '')
  }


}

O_O.add('up').to(String.prototype).get(() => new NString(this));
export { NString };