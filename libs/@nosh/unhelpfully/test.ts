import { test, testsuite, util } from '../testcase'
import { O_O } from './index'
const TestUnhelpfully = testsuite()

TestUnhelpfully.obj = async () => {
  const obj = O_O.obj
  return util.isObject(obj)
}

TestUnhelpfully.objectWithDefault = async () => {
  const obj = O_O.objectWithDefault(()=>false)
  return util.isObject(obj)
}

TestUnhelpfully.shim = async () => {
  const obj = O_O.obj
  O_O.add('testgetter').to(obj).get(() => 13)
  return util.isEqual(obj.testgetter, 13)
}

TestUnhelpfully.nextPrime = async () => {
  return util.isEqual(O_O.nextPrime, 101)
}

test(TestUnhelpfully)