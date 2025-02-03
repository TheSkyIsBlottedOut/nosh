import { SQLRite } from '../../sqlrite'

const createUserTable = async (config = { db: ':memory', table: 'users' }) => {
  const db = new SQLRite({ dbfile: config.db })
  await db.$(`CREATE TABLE ${config.table} (id INTEGER PRIMARY KEY, name TEXT, email TEXT, password TEXT, magic_token VARCHAR(36), magic_expires_at TIMESTAMP, created_at TIMESTAMP, updated_at TIMESTAMP)`)
  return {
    db: db,
    table: config.table,
    auth: {
      magic_column: 'magic_token',
      email_column: 'email',
      password_column: 'password',
      magic_expiry_column: 'magic_expiry', // optional
      hash: {
        method: 'scrypt',
        salt: '',
        options: { maxtime: 0.1, maxmem: 32 * 1024 * 1024, maxmemfrac: 0.5 }
      }
    }
  }
}

export { createUserTable }