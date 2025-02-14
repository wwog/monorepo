import { QueryBuilder } from './query'
import { insertUnit } from './sqlBuilder/units/insert'
import { InsertQuery } from './query/insert'
import { Sqlite3SQLBuilder } from './sqlBuilder/sqlite3'

export * from './query'
export * from './types/query.type'
export * from './utils'

const iq = new InsertQuery<{
  id: number
  name: string
  age: number
}>({
  sqlBuilder: Sqlite3SQLBuilder,
})

iq.insert('users')
  .values({ name: 'John', age: 25 })
  .onConflict('id')
  .doUpdate({
    excluded: { age: 'excluded.age' },
    merge: { name: 'Updated' },
  })
