/*
  Password Authenticator.

  Configuration Requirements:
  - `db` - Config for a SQLRite instance.
  - `auth` - A block object: 
    - `table` - The table in the database where user data is stored.
    - `email_column` - The column in the user table where email addresses are stored.
    - `password_column` - The column in the user table where passwords are stored.
    - `hashing_method` - The hashing method to use for passwords. Defaults to 'scrypt'.
    - `hashing_options` - Options for the hashing method. Defaults to { N: 16384, r: 8, p: 1 }.
    - `salt` - A salt to use for hashing passwords.
*/
import type { Authentic } from './authentic'
import { SQLRite } from '../../sqlrite'
import { O_O } from '@nosh/unhelpfully'
import { scrypt } from 'scrypt'
const PasswordDefaultConfig = {
  hashing_method: 'scrypt',
  hashing_options: { N: 16384, r: 8, p: 1 }
}
class PasswordError extends Error { constructor(message: string) { super(message); this.name = 'PasswordError' } }

const PasswordAuthenticator = (authentic_instance: Authentic) => {
  const config = { db: ':memory:',  ...authentic_instance.config, auth: { ...PasswordDefaultConfig, ...authentic_instance.config.auth } }
  const ator = O_O.obj()
  const validateConfig = () => {
    if (!config.db) throw new PasswordError('No database configuration provided.')
    if (Object.keys(config.auth).length < 1) throw new PasswordError('No authentication configuration provided.')
    if (!config.auth.table) throw new PasswordError('No auth table provided.')
    if (!config.auth.email_column) throw new PasswordError('No auth email_column provided.')
    if (!config.auth.password_column) throw new PasswordError('No auth password_column provided.')
    if (!config.auth.hashing_method) config.auth.hashing_method = 'scrypt'
    if (!config.auth.hashing_options) config.auth.hashing_options = { N: 16384, r: 8, p: 1 }
    return true
  }
  const { $ } = new SQLRite({ dbfile: config.db })
  ator.hash = async (email: string, password: string) => {
    // create a new user
    if (!email) throw new PasswordError('No email provided.')
    if (!password) throw new PasswordError('No password provided.')
    if (!validateConfig()) return false
    if (config.auth.salt) password = `${password}${config.auth.salt}`
    if (!`${email}`.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) throw new Error('Invalid email address.')
    const hash = await scrypt(password, authentic_instance.config.auth.hashing_options)
    await $(`INSERT INTO ${authentic_instance.config.auth.table} (${authentic_instance.config.auth.email_column}, ${authentic_instance.config.auth.password_column}) VALUES (${email}, ${hash.toString('hex')})`)
    return true
  }

  ator.auth = async (email: string, password: string) => {
    // verify the password
    if (!email) throw new PasswordError('No email provided.')
    if (!password) throw new PasswordError('No password provided.')
    if (!validateConfig()) return false
    if (config.auth.salt) password = `${password}${config.auth.salt}`
    const user = $(`SELECT * FROM ${config.auth.table} WHERE ${config.auth.email_column} = ${email}`)
    if (!user) return null
    const hash = await scrypt(password, config.auth.hashing_options)
    return user[config.auth.password_column] === hash.toString('hex') ? user : null
  }

}

export { PasswordAuthenticator }