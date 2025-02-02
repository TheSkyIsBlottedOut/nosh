/*
  Simple test library for nosh
*/

import { O_O } from '@nosh/unhelpfully'
import { Logger } from '@nosh/logn'


export const test = (testcases: Record<string, () => void>) => {
  const logger = new Logger({ name: 'testcase' })
  const results = O_O.obj
  const run = async () => {
    for (const [name, testcase] of Object.entries(testcases)) {
      try {
        await util.test(name, testcase)
        results[name] = 'PASS'
        logger.info(`✅ ${name} passed`)
      } catch (e) {
        results[name] = 'FAIL'
        logger.error(`⛔️ ${name} failed with error: ${e}`)
      }
    }
    logger.info(`Test results: ${JSON.stringify(results)}`)
  }
  run()
}

export const testsuite = () => O_O.objectWithDefault(()=>false)

export class TestCaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TestCaseError'
  }
}
const util = O_O.obj
util.sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
util.isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)
util.isNotEqual = (a: any, b: any) => JSON.stringify(a) !== JSON.stringify(b)
util.isTruthy = (a: any) => !!a
util.isFalsy = (a: any) => !a
util.isUndefined = (a: any) => typeof a === 'undefined'
util.isNull = (a: any) => a === null
util.isNotNull = (a: any) => a !== null
util.isType = (a: any, b: any) => typeof a === b
util.isString = (a: any) => util.isType(a, 'string')
util.isNumber = (a: any) => util.isType(a, 'number')
util.isObject = (a: any) => util.isType(a, 'object')
util.isArray = (a: any) => Array.isArray(a)
util.isFunction = (a: any) => util.isType(a, 'function')
util.isAsync = (a: any) => !!a[Symbol.asyncIterator]
util.isIterable = (a: any) => !!a[Symbol.iterator]
util.isAsyncIterable = (a: any) => !!a[Symbol.asyncIterator]
util.isGenerator = (a: any) => !!(a[Symbol.iterator] && a[Symbol.iterator].prototype)
util.isAsyncGenerator = (a: any) => !!(a[Symbol.asyncIterator] && a[Symbol.asyncIterator].prototype)
util.isRegExp = (a: any) => !!(util.instance(a, RegExp))
util.isDate = (a: any) => !!(util.instance(a, Date))
util.isError = (a: any) => !!(util.instance(a, Error))
util.isPromise = (a: any) => !!(util.instance(a, Promise))
util.instance = (a: any, b: any) => a instanceof b
util.test = (name: string, fn: () => false | null) => {
  if (fn() === false) throw new TestCaseError(`Test ${name} failed.`)
  return true
}
  
const sampletest = util.test('sample test', () => util.isNotNull(util))
test({ sampletest })
export { util }