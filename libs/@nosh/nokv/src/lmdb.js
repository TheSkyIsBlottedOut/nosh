import { O_O } from 'unhelpfully'
import { bruteForceRepoRoot } from 'freebooter'
import lmdb from 'lmdb'
const rootDir = await bruteForceRepoRoot()


class NoKV {
  #database_path = ''
  #db = null
  #current = null
  #config = O_O.obj
  constructor(dbname, options = {}) {
    this.#config = { ...NoKV.defaultOptions, ...options }
    this.#database_path = [rootDir, 'data', 'db', dbname].join('/')
    this.#db = lmdb.open({
      path: this.#database_path,
      compression: this.#config.compression ?? true,
      maxReaders: this.#config.maxReaders ?? 126, // default
      maxDbs: this.#config.maxDbs ?? 12, // default
    })
    this.#current = this.#db
    process.on('beforeExit', this.onTerminate.bind(this))
  }

  use(dbschema) { this.#current = this.#db.openDB(dbschema) }

  onTerminate() {
    this.#db.close();
  }

  ensureConnection() {
    //todo: test connection with lightweight call
  }


  static defaultOptions() {
    return {
      sync: { read: true, write: false }
    }
  }



  // cbor requires cbor-x
  static dataStorageTypes() {
    ['msgpack', 'json', 'string', 'cbor', 'binary', 'ordered-binary']
  }



}

export { NoKV }