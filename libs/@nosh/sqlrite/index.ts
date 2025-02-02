// define backtick functions
import { O_O } from '@nosh/unhelpfully'
// @ts-expect-error - no types for bun:sqlite
import { Database } from 'bun:sqlite'
class SQLRiteError extends Error { constructor(message: string) { super(message); this.name = 'SQLRiteError' } }
type SQLRiteQueueItem = { db: string, sql: string, params: any[], fn: () => any }
// Class for encapsulation of SQLRite functionality.
type SQLRiteSemaphore = { locked: boolean, lock: () => void, unlock: () => void }
type SQLRiteDatabase = { connection: any, name: string, schema: Record<string, any>, indexes: string[], columns: string[], semaphore: SQLRiteSemaphore }  
const SQLRiteProcessQueue = { fn: {} as Record<string, ((...any)=>any)>, databases: O_O.ObjWithDefault({ connection: null, name: '', schema: {}, indexes: [], columns: [], semaphore: { locked: false, lock: () => { }, unlock: () => { } } as SQLRiteSemaphore } as SQLRiteDatabase), queue: [] as SQLRiteQueueItem[] } as Record<string, any>
SQLRiteProcessQueue.fn.tick = () => { if (SQLRiteProcessQueue.databases.semaphore.locked) return; return SQLRiteProcessQueue.fn.processNext() }
SQLRiteProcessQueue.fn.processNext = () => { if (SQLRiteProcessQueue.queue.length > 0) { const { db, sql, params, fn } = SQLRiteProcessQueue.queue.shift() as SQLRiteQueueItem; new SQLRite({ dbfile: db }).$(sql, ...params); fn() } }
SQLRiteProcessQueue.fn.queuedPromise = (db: string, sql: string, ...params: any[]) => { return new Promise((resolve) => { SQLRiteProcessQueue.queue.push({ db, sql, params, fn: resolve }) }) }
SQLRiteProcessQueue.fn.processQueue = () => { SQLRiteProcessQueue.queue.forEach(({ db, sql, params }) => { new SQLRite({ dbfile: db }).$(sql, ...params) }) }
SQLRiteProcessQueue.fn.clearQueue = () => { SQLRiteProcessQueue.queue = [] }
SQLRiteProcessQueue.fn.awaitUnlock = (database: string) => {
  return new Promise<void>((resolve) => {
    const interval = setInterval(() => { if (!SQLRiteProcessQueue.databases[database].semaphore.locked) { clearInterval(interval); resolve() } }, 100)
  })
}
SQLRiteProcessQueue.fn.awaitUnlockAll = () => {
  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (!Object.values(SQLRiteProcessQueue.databases).some((db: any) => (db as SQLRiteDatabase).semaphore.locked)) { clearInterval(interval); resolve() }
      clearInterval(interval); resolve()
    }, 100)
  })
}
SQLRiteProcessQueue.exitEvents = ['exit', 'SIGINT', 'SIGKILL', 'SIGTERM']
SQLRiteProcessQueue.fn.safetyMeasures = () => {
  if (SQLRiteProcessQueue._safety_measures) return;
  setInterval(() => { SQLRiteProcessQueue.fn.tick() }, 100)
  SQLRiteProcessQueue.exitEvents.forEach((signal) => { process.on(signal, () => { SQLRiteProcessQueue.fn.clearQueue() }) })
  SQLRiteProcessQueue._safety_measures = true;
}


class SQLRite {
  _config: { dbfile?: string; };
  constructor(conf = {}) { this._config = conf; }
  get name() { return this.config.dbfile ?? ':memory:' }
  get config() { return this._config ?? {} }
  get cnx() { SQLRiteProcessQueue.fn.safetyMeasures(); return SQLRiteProcessQueue.databases[this.name] }
  async initConnection() {
    if (!SQLRiteProcessQueue.databases[this.name].connection) {
      SQLRiteProcessQueue.databases[this.name].connection = new Database(this.name);
      Promise.all([this.schema, this.indexes(), this.columns()]).catch(e => { throw new SQLRiteError(e) }).then(([schema_, indexes_, columns_]) => {
        SQLRiteProcessQueue.databases[this.name].schema = schema_;
        SQLRiteProcessQueue.databases[this.name].indexes = indexes_;
        SQLRiteProcessQueue.databases[this.name].columns = columns_;
      })
    } else return SQLRiteProcessQueue.fn.awaitUnlock(this.name)
  }

  static connectToDatabases(dbs: string[]) {
    Promise.all(dbs.map((db) => { new SQLRite({ dbfile: db }).initConnection() })).catch(e => { throw new SQLRiteError(e) })
  }

  async $(sql: string, ...params: any[]) {
    this.initConnection();
    return await SQLRiteProcessQueue.fn.queuedPromise(this.name, sql, ...params)
  }

  async freshSchema() { return await this.$('SELECT * FROM sqlite_master WHERE type = "table"') }
  async freshIndexes() { return await this.$('SELECT * FROM sqlite_master WHERE type = "index"') }
  async freshColumns() { return await this.$('PRAGMA table_info()') }
  async schema() { return SQLRiteProcessQueue.databases[this.name].schema ?? this.freshSchema() }
  async indexes() { return SQLRiteProcessQueue.databases[this.name].indexes ?? this.freshIndexes() }
  async columns() { return SQLRiteProcessQueue.databases[this.name].columns ?? this.freshColumns() }
  async drop() { return await this.$('DROP TABLE') }
  async truncate() { return await this.$('DELETE FROM') }
  async insert(data: { [key: string]: any }) {
    const keys = Object.keys(data).join(', '), values = Object.values(data).map(() => '?').join(', ');
    return await this.$(`INSERT INTO (${keys}) VALUES (${values})`, ...Object.values(data));
  }
  async select(table: string, where: { [key: string]: any }) {
    const keys = Object.keys(where).join(' = ? AND ');
    return this.$(`SELECT * FROM ${table} WHERE ${keys} = ?`, ...Object.values(where));
  }
  async count(table: string, where?: { [key: string]: any }) { return this.$(`SELECT COUNT(*) FROM ${table}${where ? ` WHERE ${Object.keys(where).join(' = ? AND ')} = ?` : ''}`, ...(where ? Object.values(where) : [])) }
  async update(table: string, where: { [key: string]: any }, data: { [key: string]: any }) {
    const keys = Object.keys(data).join(' = ?, '); return this.$(`UPDATE ${table} SET ${keys} = ? WHERE ${Object.keys(where).join(' = ? AND ')} = ?`, ...[...Object.values(data), ...Object.values(where)]);
  }
  async delete(table: string, where: { [key: string]: any }) { return this.$(`DELETE FROM ${table} WHERE ${Object.keys(where).join(' = ? AND ')} = ?`, ...Object.values(where)) }
  async createTable(table: string, schema: { [key: string]: string }) {
    const keys = Object.keys(schema).map(k => `${k} ${schema[k]}`).join(', ');
    return this.$(`CREATE TABLE ${table} (${keys})`);
  }
  async createIndex(table: string, index: string, columns: string[]) { return this.$(`CREATE INDEX ${index} ON ${table} (${columns.join(', ')})`) }
  async dropIndex(table: string, index: string) { return this.$(`DROP INDEX ${index}`) }
  async dropTable(table: string) { return this.$(`DROP TABLE ${table}`) }
  async search(table: string, search_column: string, search_term: string) { return this.$(`SELECT * FROM ${table} WHERE ${search_column} LIKE ?`, `%${search_term}%`) }
  async addFullTextIndex(table: string, columns: string[]) { return this.$(`CREATE VIRTUAL TABLE ${table}_search USING FTS4(${columns.join(', ')})`) }
  async searchFullText(table: string, search_term: string) { return this.$(`SELECT * FROM ${table}_search WHERE ${table}_search MATCH ?`, search_term) }
  async tables() { return await this.schema().then((schema) => schema.map((s: any) => s.name)) }
  async tableInfo(table: string) { return await this.$(`PRAGMA table_info(${table})`) }
  static async initDatabases(dbs: string[]) { return await SQLRiteProcessQueue.fn.awaitUnlockAll().then(() => { SQLRite.connectToDatabases(dbs) }) }
}


export { SQLRite, SQLRiteProcessQueue, SQLRiteError }
export type { SQLRiteSemaphore, SQLRiteDatabase, SQLRiteQueueItem }
