// Wrapper module. Exposes configuration loader and provides an interface for auth.
import { SQLRite } from '@nosh/sqlrite'
import { MagicLinkAuthenticator } from './auth-magic-link'
import { PasswordAuthenticator } from './auth-password'
import { createUserTable } from './util-create-user-table'
// @ts-expect-error - no types for bun:uuid
import { randomUUIDv7 } from 'bun'

class Authentic {
  _config: { [key: string]: any } = {}

  constructor(config = {}) { this.config = config }
  set config(conf) { this._config = conf }
  get config() { return this._config }
  get uuid() { return randomUUIDv7() }
  get cnx() { return new SQLRite({ dbfile: this.config.db }) }
  get utils() {
    return {
      MagicLinkAuthenticator: async () => MagicLinkAuthenticator(this),
      PasswordAuthenticator: async () => PasswordAuthenticator(this)
    }
  }
  get ators() { return this.utils }
  static migrations() {
    return { createUserTable }
  }
}

export { Authentic }