import { test, testsuite, util } from '../testcase'
import { NoKV } from './index'

const NoKVTest = testsuite()

NoKVTest.create = async () => {
  const kv = new NoKV()
  return util.isTruthy(kv)
}

NoKVTest.set = async () => {
  const kv = new NoKV()
  await kv.write('test', 'test')
  return util.isEqual(await kv.read('test'), 'test')
}

NoKVTest.get = async () => {
  const kv = new NoKV()
  await kv.write('test', 'test')
  return util.isEqual(await kv.read('test'), 'test')
}

NoKVTest.del = async () => {
  const kv = new NoKV()
  await kv.write('test', 'test')
  await kv.delete('test')
  return util.isEqual(await kv.delete('test'), undefined)
}

NoKVTest.keys = async () => {
  const kv = new NoKV()
  await kv.write('test', 'test')
  return util.isEqual(await kv.keys(), ['test'])
}


