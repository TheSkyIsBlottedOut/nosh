import { open } from 'lmdb';

class NoKV {
  #pubkey = ''
  #privkey = ''
  constructor(dbname, options = {}) {
    this.dbname = dbname;
    this.options = options;
    this.db = open(NoKV.defaultPath, { ...options, name: dbname });
  }
  static set defaultPath(path) { this._defaultPath = path }
  static get defaultPath() {
    return this._defaultPath ?? [Bun.env.DIRENV_DIR ?? Bun.env.Nosh_Dir?.replace(/\.nosh/, ''), 'data', 'db'].join('/')
  }

  async get(key) {
    const result = this.db.get(key)
    try {
      return JSON.parse(result)
    } catch (e) {
      return result
    }
  }

  async set(key, value) {
    return this.db.put(key, JSON.stringify(value))
  }

  set pubkey(key) { this.#pubkey = key }
  get pubkey() { return this.#pubkey }
  set privkey(key) { this.#privkey = key }




}