import * as freebooter from './index';
import { test, util, testsuite } from '../testcase'
const { Freebooter, pragma } = freebooter
const FreebooterTest = testsuite()
FreebooterTest.create = async () => {
  const fb = new Freebooter()
  return util.isTruthy(fb)
}

FreebooterTest.createWithPragma = async () => {
  const fb = new Freebooter({ pragma: pragma })
  return util.isTruthy(fb)
}

FreebooterTest.pragmaNeoArray = async () => {
  const neoarray = pragma.NeoArray
  return util.isTruthy(neoarray)
}

FreebooterTest.pragmaNeoArrayAccess = async () => {
  const neoarray = pragma.NeoArray.from([1, 2, 3])
  return util.isEqual(neoarray.mean, 2)
}

// need to test boot sequences
const serviceconfig = {
  services: {
    test: {
      boot: ['test2', 'test3'],
      shutdown: ['test4', 'test5']
    }
  }
}

FreebooterTest.bootSequence = async () => {
  const fb = new Freebooter(serviceconfig)
  util.test('bootConfig', async () => util.isEqual(fb.config, serviceconfig.services.test))
}

test(FreebooterTest)
