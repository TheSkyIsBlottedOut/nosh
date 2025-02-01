// Wrapper module. Exposes configuration loader and provides an interface for auth.
import { MagicLinkAuthenticator } from './auth-magic-link'
import { PasswordAuthenticator } from './auth-password'
// @ts-expect-error - no types for bun:uuid
import { randomUUIDv7 } from 'bun'

class Authentic {
  _config: { [key: string]: any } = {}
  _utils: { [key: string]: any } = {}

  constructor() {
    this.config = {}
    this.utils = { MagicLinkAuthenticator, PasswordAuthenticator }
  }
  set config(conf) { this._config = conf }
  get config() { return this._config }
  get uuid() { return randomUUIDv7() }
  set utils(ut) { this._utils = ut }
  get utils() { return this._utils }
  get ators() { return this._utils }
}

export { Authentic }