// define backtick functions
import { O_O } from '@nosh/unhelpfully'
// @ts-expect-error - no types for bun:sqlite
import { Database } from 'bun:sqlite'

// Class for encapsulation of SQLRite functionality.

class SQLRite {
  _config: { dbfile?: string; };
  _dbcnx: Database | null;
  constructor(conf = {}) {
    this._config = conf;
    this._dbcnx = null as Database | null; // load database when null
  }
  set config(conf) { this._config = conf; }
  get config() { return this._config; }
  get dblocation() {
    if (!this.config.dbfile) throw new Error('No database file location provided (add dbfile: "path/to/dbfile" to your config).');
    if (this.config.dbfile === ':memory:') return ':memory:';
    if (this.config.dbfile.startsWith('/')) return this.config.dbfile;
    return `${process.env.Nosh_AppDir}/data/${this.config.dbfile}`;
  }

  get cnx() { if (!this._dbcnx) this._dbcnx = new Database(this.dblocation); return this._dbcnx; }
  create() { const db = new Database(this.dblocation); db.close(); }

  $: (sql: string, ...params: any[]) => any = (sql, ...params) => {
    return this.cnx.prepare(sql).run(...params);
  }

  get schema() {
    return this.$('SELECT * FROM sqlite_master WHERE type = "table"');
  }
}


export { SQLRite };


