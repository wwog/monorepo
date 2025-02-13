import { Sqlite3SQLBuilder } from '../sqlBuilder/sqlite3'
import type { Bindings, QueryOptions, SelectColumn } from '../types/query.type'
import { SelectQuery } from './select'
import { InsertQuery } from './insert'
import { UpdateQuery } from './update'
import { DeleteQuery } from './delete'
export class QueryBuilder<T> {
  private options: QueryOptions
  constructor(options?: QueryOptions) {
    this.options = options ?? {
      sqlBuilder: Sqlite3SQLBuilder,
    }
  }

  select(columns?: SelectColumn<T> | SelectColumn<T>[]) {
    const query = new SelectQuery<T>(this.options)
    query.select(columns)
    return query
  }

  offset(offset: number) {
    const query = new SelectQuery<T>(this.options)
    query.offset(offset)
    return query
  }

  insert(table: string, values: Partial<T> | Partial<T>[]) {
    const query = new InsertQuery<T>(this.options)
    query.insert(table, values)
    return query
  }

  insertRaw(sql: string, bindings?: Bindings) {
    const query = new InsertQuery<T>(this.options)
    query.insertRaw(sql, bindings)
    return query
  }

  update(table: string, values: Partial<T>) {
    const query = new UpdateQuery<T>(this.options)
    query.update(table, values)
    return query
  }

  updateRaw(sql: string, bindings?: Bindings) {
    const query = new UpdateQuery<T>(this.options)
    query.updateRaw(sql, bindings)
    return query
  }

  delete(tableName?: string) {
    const query = new DeleteQuery<T>(this.options)
    query.delete()
    if (tableName) {
      query.from(tableName)
    }
    return query
  }
}
