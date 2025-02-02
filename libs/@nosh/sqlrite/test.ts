import { SQLRite, SQLRiteError, SQLRiteProcessQueue } from './index'
import { test, util } from '../testcase' // vscode doesn't like testcase, probably a tsconfig reload issue. TODO: set this to @nosh/testcase
import { O_O } from '@nosh/unhelpfully'
const SQLRiteTest = O_O.ObjWithDefault(()=>false)

SQLRiteTest.createTable = async () => {
  const db = new SQLRite({ dbfile: ':memory:' })
  await db.$('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)')
  const schema = await db.schema()
  return util.isEqual(schema, [{ type: 'table', name: 'test', tbl_name: 'test', rootpage: 2, sql: 'CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)' }])
}

SQLRiteTest.insert = async () => {
  const db = new SQLRite({ dbfile: ':memory:' })
  await db.$('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)')
  await db.insert({ name: 'test' })
  const rows = await db.$('SELECT * FROM test')
  return util.isEqual(rows, [{ id: 1, name: 'test' }])
}

SQLRiteTest.select = async () => {
  const db = new SQLRite({ dbfile: ':memory:' })
  await db.$('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)')
  await db.insert({ name: 'test' })
  const row = await db.select('test', { id: 1 })
  return util.isEqual(row, { id: 1, name: 'test' })
}