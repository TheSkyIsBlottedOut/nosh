import { Authentic } from '@nosh/authentic'
// Authentic uses email/username and password to authenticate.
// it defaults to sqlite in-memory; to change this, change the config sent to the validator.
const authentic = new Authentic({ config: { db: { dialect: 'sqlite', storage: ':memory:' } } })
const { auth, hash } = await authentic.ators.PasswordAuthenticator()
const validateUser = async ({ helpers, pragma, req, preflights }) => {
  helpers.log.info('user.auth.validate')
  const user = await auth(helpers.multisource('username'), helpers.multisource('password'))
  return { user }
}

// this could be updated to use preflights for the required fields
const UserAuth = {
  validate: { handler: validateUser, method: 'post', unauthenticated: true }
}
export { UserAuth }