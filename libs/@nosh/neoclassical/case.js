// string case switcher
import { O_O } from 'unhelpfully'
import { NString } from './string'

const Case = O_O.fn.obj
Case.matchers = {
  human: /\s+/g,
  camel: /(?=[A-Z]+)/g,
  snake: /_/g,
  kebab: /-/g,
  title: /\s/g,
  sentence: /\s/g,
  pascal: /(?=[A-Z]+)/g,
  upper: /\s+/g,
  lower: /\s+/g,
  capitalize: /\s+/g,
  delimited: /\W+/g,
  piped: /\|+/g,
  dotted: /\.+/g,
  quoted: /['"]+/g,
  csv: /,+/g,
  tsv: /\t+/g,
  spaced: /\s+/g,
  slashed: /\/+/g,
  backslashed: /\\+/g,
  environment_variable: /_+/g
}
Case.types = Object.keys(Case.matchers)

// first we match tokens, then we convert the array
const converters = {
  human: ((ary) => ary.join(' ').capitalize),
  camel: ((ary) => ary.map((x, i) => i === 0 ? x.lower : x.capitalize).join('')),
  snake: ((ary) => ary.join('_').lower),
  kebab: ((ary) => ary.join('-').lower),
  title: ((ary) => ary.map(x => x.capitalize).join(' ')),
  sentence: ((ary) => ary.map(x => x.capitalize).join(' ')),
  pascal: ((ary) => ary.map(x => x.capitalize).join('')),
  upper: ((ary) => ary.join(' ').upper),
  lower: ((ary) => ary.join(' ').lower),
  capitalize: ((ary) => ary.map(x => x.capitalize).join(' ')),
  delimited: ((ary) => ary.join(' ')),
  piped: ((ary) => ary.join('|')),
  dotted: ((ary) => ary.join('.')),
  quoted: ((ary) => ary.join('"')),
  csv: ((ary) => ary.join(',')),
  tsv: ((ary) => ary.join('\t')),
  spaced: ((ary) => ary.join(' ')),
  slashed: ((ary) => ary.join('/')),
  backslashed: ((ary) => ary.join('\\')),
  environment_variable: ((ary) => ary.map(x => x.upper).join('_'))
}

const convertCase = (str, from, to) => {
  const tokens = str.split(Case.matchers[from])
  return new NString(converters[to](tokens))
}

const discoverCase = (str) => {
  const typematchctrs = {}
  for (let type of Case.types) {
    typematchctrs[type] = str.match(Case.matchers[type])?.length ?? 0
  }
  return typematchctrs.entries.sort((a, b) => b[1] - a[1])[0][0]
}
Case._convert = convertCase
Case.convert = (str) => ({ to: O_O.fn.curry(convertCase, str, discoverCase(str)) })
Case.types.forEach(type => {
  O_O.add(type).to(Case).value({ to: O_O.obj })
  Case.types.forEach(resval => {
    O_O.add(resval).to(Case[type].to).value((str) => convertCase(str, type, resval))
  })
})
// yes you can kebab.to.kebab
export { Case }
