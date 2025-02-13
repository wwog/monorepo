import {
  type IInsertQuery,
  type Bindings,
  type SelectColumn,
  type WhereCondition,
  type SQLWithBindings,
  type InsertClause,
  BaseQuery,
  type QueryOptions,
} from '../types/query.type'
import { ReturningMixin, WhereMixin } from './mixin'

export class InsertQuery<T> extends BaseQuery<T> implements IInsertQuery<T> {
  protected insertClauses: InsertClause<T>[] = []
  // Mixins
  protected whereMixin: WhereMixin<T>
  protected returningMixin: ReturningMixin<T>

  constructor(options: QueryOptions) {
    super(options)
    this.whereMixin = new WhereMixin(this.sqlBuilder)
    this.returningMixin = new ReturningMixin(this.sqlBuilder)
  }

  insert(table: string, values: Partial<T> | Partial<T>[]): this {
    this.insertClauses.push({
      rule: {
        table,
        values,
      },
    })
    return this
  }

  insertRaw(sql: string, bindings?: Bindings): this {
    this.insertClauses.push({
      raw: {
        sql,
        bindings,
      },
    })
    return this
  }

  where(conditions: WhereCondition<T>): this {
    this.whereMixin.where(conditions)
    return this
  }

  orWhere(conditions: WhereCondition<T>): this {
    this.whereMixin.orWhere(conditions)
    return this
  }

  whereRaw(sql: string, bindings?: Bindings): this {
    this.whereMixin.whereRaw(sql, bindings)
    return this
  }

  orWhereRaw(sql: string, bindings?: Bindings): this {
    this.whereMixin.orWhereRaw(sql, bindings)
    return this
  }

  returning(columns?: SelectColumn<T> | SelectColumn<T>[]): this {
    this.returningMixin.returning(columns)
    return this
  }

  returningRaw(sql: string, bindings?: Bindings): this {
    this.returningMixin.returningRaw(sql, bindings)
    return this
  }

  toSQL(): SQLWithBindings {
    let sql = ''
    let bindings: Bindings = []

    const pushResult = (result: SQLWithBindings) => {
      const noSpaceResult = result[0].trim()
      if (noSpaceResult !== '') {
        if (sql !== '') {
          sql += ' '
        }
        sql += noSpaceResult
        bindings.push(...result[1])
      }
    }
    // Process INSERT
    pushResult(this.sqlBuilder.insert(this.insertClauses))

    // Add WHERE clause if exists
    pushResult(this.whereMixin.toSQL())

    // Add RETURNING clause if exists
    pushResult(this.returningMixin.toSQL())

    if (sql === '') {
      throw new Error('No valid SQL generated')
    }

    sql += ';'
    return [sql, bindings]
  }
}
