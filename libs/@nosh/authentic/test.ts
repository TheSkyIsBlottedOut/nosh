import { util, testsuite, test } from '../testcase'
import { Authentic } from './index'
import { incomprehensibly } from './src/auth-password'

// note that scrypt itself has a bug - it loads ./build/Release/scrypt and should be loading scrypt.
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

const initAuthentic = async () => {
  const authentic = new Authentic()
  const config = await Authentic.migrations().createUserTable({ db: ':memory:', table: 'users' })
  authentic.config = config
  authentic.cnx.$(`REPLACE INTO ${config.table} (name, email, password) VALUES ('test', 'user@email.com', 'password') WHERE email = 'user@email.com'`)
  return { authentic, config }
}

AuthenticTest.magicTokenCreate = async () => {
  const { authentic } = await initAuthentic()
  const auth = await authentic.ators.MagicLinkAuthenticator()
  const token = await auth.generate()
  return util.isEqual(token.length, 36)
}

AuthenticTest.magicTokenCreateAndVerify = async () => {
  const { authentic } = await initAuthentic()
  const auth = await authentic.ators.MagicLinkAuthenticator()
  const token = await auth.generate('user@email.com')
  const valid = await auth.verify(token)
  return util.isTruthy(valid)
}

AuthenticTest.magicTokenCreateAndVerifyFail = async () => {
  const { authentic, config } = await initAuthentic()
  const auth = await authentic.ators.MagicLinkAuthenticator()
  await auth.generate('user@email.com')
  const valid = await auth.verify('user@email.com', 'invalid')
  return util.isFalsy(valid)
}


test(AuthenticTest)