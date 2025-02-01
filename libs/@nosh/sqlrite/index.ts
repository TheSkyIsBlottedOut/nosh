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
      if (!Object.values(SQLRiteProcessQueue.databases).some((db: { semaphore: { locked: boolean } }) => db.semaphore.locked)) {
        clearInterval(interval); resolve()
      }
    }, 100)
  })
}
SQLRiteProcessQueue.fn.safetyMeasures = () => {
  if (SQLRiteProcessQueue._safety_measures) return;
  setInterval(() => { SQLRiteProcessQueue.fn.tick() }, 100)
  process.on('exit', () => { SQLRiteProcessQueue.fn.killConnections() })
  process.on('SIGINT', () => { SQLRiteProcessQueue.fn.killConnections() })
  SQLRiteProcessQueue._safety_measures = true;
}


class SQLRite {
  _config: { dbfile?: string; };
  constructor(conf = {}) { this._config = conf; }
  get name() { return this.config.dbfile ?? ':memory:' }
  get config() { return this._config; }
  get cnx() { SQLRiteProcessQueue.fn.safetyMeasures(); return SQLRiteProcessQueue.databases[this.name] }
  async initConnection() {
    if (!SQLRiteProcessQueue.databases[this.name].connection) {
      SQLRiteProcessQueue.databases[this.name].connection = new Database(this.name);
      Promise.all([this.schema, this.indexes(this.name), this.columns(this.name)]).catch(e => { throw new SQLRiteError(e) }).then(([schema_, indexes_, columns_]) => {
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

  get schema() { return this.$('SELECT * FROM sqlite_master WHERE type = "table"') }
  indexes(table: string) { return this.$(`PRAGMA index_list(${table})`) }
  columns(table: string) { return this.$(`PRAGMA table_info(${table})`) }
  drop(table: string) { return this.$(`DROP TABLE ${table}`) }
  truncate(table: string) { return this.$(`DELETE FROM ${table}`) }
  insert(table: string, data: { [key: string]: any }) {
    const keys = Object.keys(data).join(', '), values = Object.values(data).map(() => '?').join(', ');
    return this.$(`INSERT INTO ${table} (${keys}) VALUES (${values})`, ...Object.values(data));
  }
  select(table: string, where: { [key: string]: any }) {
    const keys = Object.keys(where).join(' = ? AND ');
    return this.$(`SELECT * FROM ${table} WHERE ${keys} = ?`, ...Object.values(where));
  }
  count(table: string, where?: { [key: string]: any }) { return this.$(`SELECT COUNT(*) FROM ${table}${where ? ` WHERE ${Object.keys(where).join(' = ? AND ')} = ?` : ''}`, ...(where ? Object.values(where) : [])) }
  update(table: string, where: { [key: string]: any }, data: { [key: string]: any }) {
    const keys = Object.keys(data).join(' = ?, '); return this.$(`UPDATE ${table} SET ${keys} = ? WHERE ${Object.keys(where).join(' = ? AND ')} = ?`, ...[...Object.values(data), ...Object.values(where)]);
  }
  delete(table: string, where: { [key: string]: any }) { return this.$(`DELETE FROM ${table} WHERE ${Object.keys(where).join(' = ? AND ')} = ?`, ...Object.values(where)) }
  createTable(table: string, schema: { [key: string]: string }) {
    const keys = Object.keys(schema).map(k => `${k} ${schema[k]}`).join(', ');
    return this.$(`CREATE TABLE ${table} (${keys})`);
  }
  createIndex(table: string, index: string, columns: string[]) {
    return this.$(`CREATE INDEX ${index} ON ${table} (${columns.join(', ')})`);
  }
  dropIndex(table: string, index: string) { return this.$(`DROP INDEX ${index}`) }
  dropTable(table: string) { return this.$(`DROP TABLE ${table}`) }
  search(table: string, search_column: string, search_term: string) { return this.$(`SELECT * FROM ${table} WHERE ${search_column} LIKE ?`, `%${search_term}%`) }
  addFullTextIndex(table: string, columns: string[]) { return this.$(`CREATE VIRTUAL TABLE ${table}_search USING FTS4(${columns.join(', ')})`) }
  searchFullText(table: string, search_term: string) { return this.$(`SELECT * FROM ${table}_search WHERE ${table}_search MATCH ?`, search_term) }
  get tables() { return this.schema.map((s: { name: string }) => s.name) }
  get table() { return this.tables }
}

async function startDatabases(...dbs: string[]) {
  SQLRite.connectToDatabases(dbs)
  await SQLRiteProcessQueue.fn.awaitUnlockAll()
}

export { SQLRite, SQLRiteProcessQueue, startDatabases };
export type { SQLRiteSemaphore, SQLRiteDatabase, SQLRiteQueueItem };


