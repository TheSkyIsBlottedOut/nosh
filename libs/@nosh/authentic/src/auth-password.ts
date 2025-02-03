/*
  Password Authenticator.

  Configuration Requirements:
  - `db` - Config for a SQLRite instance.
  - `auth` - A block object: 
    - `table` - The table in the database where user data is stored.
    - `email_column` - The column in the user table where email addresses are stored.
    - `password_column` - The column in the user table where passwords are stored.
    - `hash` - an object:
    -  -  `method`  - The hashing method to use for passwords. Defaults to 'scrypt'.
    -  -  `options` - Options for the hashing method. Defaults to { N: 16384, r: 8, p: 1 }.
    -  -  `salt` - A salt to use for hashing passwords.
*/
import type { Authentic } from './authentic'
import { SQLRite } from '../../sqlrite'
import { O_O } from '@nosh/unhelpfully'
// @ts-expect-error - no types for scrypt
import scrypt from 'scrypt'
// @ts-expect-error - no types for bun
import Bun from 'bun'
const PasswordDefaultConfig = {
  method: 'scrypt',
  salt: '',
  options: { maxtime: 0.1, maxmem: 32 * 1024 * 1024, maxmemfrac: 0.5 }
}

class PasswordError extends Error { constructor(message: string) { super(message); this.name = 'PasswordError' } }
const incomprehensibly = async (str: string) => await Bun.$`${process.env.Nosh_AppDir}/tk/bin/incomprehensibly "${str.replace(/"/g, '\\"')}"`

const PasswordAuthenticator = (authentic_instance: Authentic) => {
  const config = { db: ':memory:',  ...authentic_instance.config, auth: { ...PasswordDefaultConfig, ...authentic_instance.config.auth } }
  const ator = O_O.obj()
  const validateConfig = () => {
    if (!config.db) throw new PasswordError('No database configuration provided.')
    if (Object.keys(config.auth).length < 1) throw new PasswordError('No authentication configuration provided.')
    if (!config.auth.table) throw new PasswordError('No auth table provided.')
    if (!config.auth.email_column) throw new PasswordError('No auth email_column provided.')
    if (!config.auth.password_column) throw new PasswordError('No auth password_column provided.')
    if (!config.auth.hash) config.auth.hash = PasswordDefaultConfig
    if (!config.auth.hash.method) config.auth.hash.method = PasswordDefaultConfig.method
    if (!config.auth.hash.salt) config.auth.hash.salt = PasswordDefaultConfig.salt
    if (!config.auth.hash.options) config.auth.hash.options = PasswordDefaultConfig.options
    if (!config.auth.hash.options.maxtime) config.auth.hash.options.maxtime = PasswordDefaultConfig.options.maxtime
    if (!config.auth.hash.options.maxmem) config.auth.hash.options.maxmem = PasswordDefaultConfig.options.maxmem
    if (!config.auth.hash.options.maxmemfrac) config.auth.hash.options.maxmemfrac = PasswordDefaultConfig.options.maxmemfrac
    return true
  }
  const { $ } = new SQLRite({ dbfile: config.db })
  
  const params = scrypt.paramsSync(config.auth.hash.options.maxtime, config.auth.hash.options.maxmem, config.auth.hash.options.maxmemfrac)
  ator.hash = async (email: string, password: string): Promise<boolean> => {
    // create a new user
    if (!email) throw new PasswordError('No email provided.')
    if (!password) throw new PasswordError('No password provided.')
    if (!validateConfig()) return false
    password = (config.auth.salt) ? `${password}${config.auth.salt}` : await incomprehensibly(password)
    if (!`${email}`.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) throw new Error('Invalid email address.')
    const hash = await scrypt.kdf(password, params)
    await $(`INSERT INTO ${authentic_instance.config.auth.table} (${authentic_instance.config.auth.email_column}, ${authentic_instance.config.auth.password_column}) VALUES (${email}, ${hash.toString('hex')})`)
    return true
  }
  
  ator.auth = async (email: string, password: string): Promise<boolean> => {
    // verify the password
    if (!email) throw new PasswordError('No email provided.')
    if (!password) throw new PasswordError('No password provided.')
    if (!validateConfig()) return false
    password = (config.auth.salt.length > 0) ? `${password}${config.auth.salt}` : await incomprehensibly(password)
    const user = await $(`SELECT * FROM ${config.auth.table} WHERE ${config.auth.email_column} = ${email}`)
    if (!user) return false
    return await scrypt.verifyKdf(Buffer.from(user[config.auth.password_column], 'hex'), password)
  }

  ator.verify = async(password: string, hash: string): Promise<boolean> => {
    if (!password) throw new PasswordError('No password provided.')
    if (!hash) throw new PasswordError('No hash provided.')
    if (!validateConfig()) return false
    password = (config.auth.salt) ? `${password}${config.auth.hash.salt}` : await incomprehensibly(password)
    return await scrypt.verifyKdf(Buffer.from(hash, 'hex'), password)
  }
}

export { PasswordAuthenticator, incomprehensibly }