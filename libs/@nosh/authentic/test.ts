import { util, testsuite, test } from '../testcase'
import { Authentic } from './index'
import { incomprehensibly } from './src/auth-password'

const AuthenticTest = testsuite()
AuthenticTest.incomprehensibly = async () => {
  const arg1 = await incomprehensibly('test')
  const arg2 = await incomprehensibly('test')
  return util.isEqual(arg1, arg2)
}

AuthenticTest.incomprehensiblyLength = async () => {
  const enc = await incomprehensibly('test')
  return util.isEqual(enc.length, 64)
}