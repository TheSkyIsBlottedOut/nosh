/* Magic Link Authenticator.

  Configuration Requirements:
  - `db` - Config for a SQLRite instance.
  - `auth` - A block object: 
    - `table` - The table in the database where user data is stored.
    - `email_column` - The column in the user table where email addresses are stored.
    - `magic_column` - The column in the user table where magic link tokens are stored.
    - `magic_expiry_column` - The column in the user table where magic link expiry times are stored.
*/
import { Authentic } from './authentic'
import { SQLRite } from '../../sqlrite'
import { O_O } from '@nosh/unhelpfully'
class MagicLinkError extends Error { constructor(message: string) { super(message); this.name = 'MagicLinkError' } }

const MagicLinkAuthenticator = (authentic: Authentic) => {
  const config = authentic.config ?? { db: ':memory:', auth: { table: 'users', email_column: 'email', magic_column: 'magic_token', magic_expiry_column: 'magic_expiry' } }
  const ator = O_O.obj
  const validateConfig = () => {
    if (!config.db) throw new MagicLinkError('No database configuration provided.')
    if (!config.auth) throw new MagicLinkError('No authentication configuration provided.')
    if (!config.auth.table) throw new MagicLinkError('No auth table provided.')
    if (!config.auth.email_column) throw new MagicLinkError('No auth email_column provided.')
    if (!config.auth.magic_column) throw new MagicLinkError('No auth magic_column provided.')
    return true
  }
  const { $ } = new SQLRite({ dbfile: config.db })

  ator.generate = async (email: string) => {
    // generate a magic link
    if (!email) throw new MagicLinkError('No email provided.')
    if (!validateConfig()) return false
    if (!`${email}`.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) throw new Error('Invalid email address.')
    const magicLink = authentic.uuid
    await $(`UPDATE ${config.auth.table} SET ${config.auth.magic_column} = ${magicLink} WHERE ${config.auth.email_column} = ${email}`)
    if (config.auth.magic_expiry_column) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 1)
      await $(`UPDATE ${config.auth.table} SET ${config.auth.magic_expiry_column} = ${expiry} WHERE ${config.auth.email_column} = ${email}`)
    }
    return magicLink
  }

  ator.clearAllExpired = async () => {
    // clear all expired magic links
    if (!validateConfig()) return false
    await $(`DELETE FROM ${config.auth.table} WHERE ${config.auth.magic_expiry_column} < ${new Date()}`)
    return true
  }

  ator.clear = async (email: string) => {
    // clear a magic link
    if (!email) throw new MagicLinkError('No email provided.')
    if (!validateConfig()) return false
    await $(`UPDATE ${config.auth.table} SET ${config.auth.magic_column} = NULL WHERE ${config.auth.email_column} = ${email}`)
    return true
  }

  ator.auth = async (magicLink: string) => {
    // verify the magic link
    if (!magicLink) throw new MagicLinkError('No magic link provided.')
    if (magicLink.length !== 36) throw new MagicLinkError('Invalid magic link.')
    if (!validateConfig()) return null
    const user = await $(`SELECT * FROM ${config.auth.table} WHERE ${config.auth.magic_column} = ${magicLink} LIMIT 1`)
    if (!user) return null
    await ator.clear(user[config.auth.email_column])
    return user
  }
  return ator
}

export { MagicLinkAuthenticator }
