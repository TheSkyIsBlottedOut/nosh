/* Magic Link Authenticator.

  Configuration Requirements:
  - `db` - Config for a SQLRite instance.
  - `auth` - A block object: 
    - `table` - The table in the database where user data is stored.
    - `email_column` - The column in the user table where email addresses are stored.
    - `magic_column` - The column in the user table where magic link tokens are stored.
    - `magic_expiry_column` - The column in the user table where magic link expiry times are stored.
*/
import type { Authentic } from './authentic'
import { SQLRite } from '../../sqlrite'
import { O_O } from '@nosh/unhelpfully'
class MagicLinkError extends Error { constructor(message: string) { super(message); this.name = 'MagicLinkError' } }

const MagicLinkAuthenticator = (authentic_instance: Authentic) => {
  const ator = O_O.obj()
  const validateConfig = () => {
    if (!authentic_instance.config.db) throw new MagicLinkError('No database configuration provided.')
    if (!authentic_instance.config.auth) throw new MagicLinkError('No authentication configuration provided.')
    if (!authentic_instance.config.auth.table) throw new MagicLinkError('No auth table provided.')
    if (!authentic_instance.config.auth.email_column) throw new MagicLinkError('No auth email_column provided.')
    if (!authentic_instance.config.auth.magic_column) throw new MagicLinkError('No auth magic_column provided.')
    return true
  }
  const { $ } = new SQLRite({ dbfile: authentic_instance.config.db })

  ator.send = async (email: string) => {
    // generate a magic link
    if (!email) throw new MagicLinkError('No email provided.')
    if (!validateConfig()) return false
    if (!`${email}`.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) throw new Error('Invalid email address.')
    const magicLink = authentic_instance.uuid
    await $(`UPDATE ${authentic_instance.config.auth.table} SET ${authentic_instance.config.auth.magic_column} = ${magicLink} WHERE ${authentic_instance.config.auth.email_column} = ${email}`)
    if (authentic_instance.config.auth.magic_expiry_column) {
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 1)
      await $(`UPDATE ${authentic_instance.config.auth.table} SET ${authentic_instance.config.auth.magic_expiry_column} = ${expiry} WHERE ${authentic_instance.config.auth.email_column} = ${email}`)
    }
    return magicLink
  }

  ator.verify = async (magicLink: string) => {
    // verify the magic link
    if (!magicLink) throw new MagicLinkError('No magic link provided.')
    if (!validateConfig()) return false
    const user = $(`SELECT * FROM ${authentic_instance.config.auth.table} WHERE ${authentic_instance.config.auth.magic_column} = ${magicLink}`)
    if (!user) return false
    return user[authentic_instance.config.auth.magic_column] === magicLink
  }
  return ator
}

export { MagicLinkAuthenticator }
