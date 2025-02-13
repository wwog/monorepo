import { Sqlite3SQLBuilder } from '../sqlBuilder/sqlite3'
import type { QueryOptions, SelectColumn } from '../types/query.type'
import { SelectQuery } from './select'

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
}
