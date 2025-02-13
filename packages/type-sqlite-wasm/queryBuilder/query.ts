import type {
  ISelectMethods,
  IUpdateMethods,
  IDeleteMethods,
  IInsertMethods,
  OrderByNulls,
  OrderByType,
  Bindings,
  WhereCondition,
  ICommonImpl,
  SQLWithBindings,
  FromClause,
  WhereClause,
  SelectClause,
  SelectColumn,
  OrderByClause,
  GroupByClause,
  UpdateClause,
  SQLBuilder,
} from './types/query.type'
import { Sqlite3SQLBuilder } from './sqlBuilder/sqlite3'

export interface QueryBuilderQueryDesc<T> {
  fromClauses?: FromClause[]
  whereClauses?: WhereClause<T>[]
}
class CommonMethods<T> implements ICommonImpl<T> {
  protected whereClauses: WhereClause<T>[] = []

  where(conditions: WhereCondition<T>): this {
    this.whereClauses.push({
      rule: {
        type: 'AND',
        conditions,
      },
    })
    return this
  }

  orWhere(conditions: WhereCondition<T>): this {
    this.whereClauses.push({
      rule: {
        type: 'OR',
        conditions,
      },
    })
    return this
  }

  whereRaw(sql: string, bindings?: Bindings): this {
    this.whereClauses.push({
      raw: {
        sql,
        bindings,
        type: 'AND',
      },
    })
    return this
  }

  orWhereRaw(sql: string, bindings?: Bindings): this {
    this.whereClauses.push({
      raw: {
        sql,
        bindings,
        type: 'OR',
      },
    })
    return this
  }

  getWhereClauses(): WhereClause<T>[] {
    return this.whereClauses
  }
}

export interface MethodsOptions {
  sqlBuilder: SQLBuilder
}
export interface preClauses<T> {
  whereClauses: WhereClause<T>[]
  fromClauses: FromClause[]
}

/**
 * SELECT [DISTINCT] column_list
 * FROM table_name
 * [WHERE condition]
 * [GROUP BY column_list]
 * [HAVING condition]
 * [ORDER BY column_list [ASC|DESC]]
 * [LIMIT count [OFFSET offset]];
 */
export class SelectMethods<T>
  extends CommonMethods<T>
  implements ISelectMethods<T>
{
  protected selectClauses: SelectClause[]
  protected fromClauses: FromClause[]
  protected orderByClauses: OrderByClause[]
  protected groupByClauses: GroupByClause[]
  protected offsetValue?: number
  protected limitValue?: number
  protected sqlBuilder: SQLBuilder

  constructor(options: MethodsOptions, clauses: preClauses<T>) {
    super()
    this.sqlBuilder = options.sqlBuilder
    this.whereClauses = clauses.whereClauses
    this.fromClauses = clauses.fromClauses
    this.selectClauses = []
    this.orderByClauses = []
    this.groupByClauses = []
  }

  select(columns?: SelectColumn<T> | SelectColumn<T>[]): this {
    if (columns === undefined) {
      this.selectClauses.push({ rule: '*' })
    } else if (typeof columns === 'string') {
      this.selectClauses.push({ rule: columns })
    } else {
      columns.forEach((column) => {
        this.selectClauses.push({ rule: column })
      })
    }
    return this
  }
  from(table: string): this {
    this.fromClauses.push({ rule: table })
    return this
  }
  fromRaw(sql: string, bindings?: Bindings): this {
    this.fromClauses.push({ raw: { sql, bindings } })
    return this
  }
  orderBy(
    column: keyof T,
    direction?: OrderByType,
    nulls?: OrderByNulls,
  ): this {
    this.orderByClauses.push({ rule: { column, direction, nulls } })
    return this
  }
  orderByRaw(sql: string, bindings?: Bindings): this {
    this.orderByClauses.push({ raw: { sql, bindings } })
    return this
  }
  groupBy(column: keyof T): this {
    this.groupByClauses.push({ rule: { column } })
    return this
  }
  groupByRaw(sql: string, bindings?: Bindings): this {
    this.groupByClauses.push({ raw: { sql, bindings } })
    return this
  }
  offset(offset: number): this {
    if (this.offsetValue !== undefined) {
      throw new Error('Offset already set, cannot set again')
    }
    this.offsetValue = offset
    return this
  }
  limit(limit: number): this {
    if (this.limitValue !== undefined) {
      throw new Error('Limit already set, cannot set again')
    }
    this.limitValue = limit
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

    pushResult(this.sqlBuilder.select(this.selectClauses))
    pushResult(this.sqlBuilder.from(this.fromClauses))

    if (this.whereClauses.length > 0) {
      pushResult(this.sqlBuilder.where(this.whereClauses))
    }

    if (this.groupByClauses.length > 0) {
      pushResult(this.sqlBuilder.groupBy(this.groupByClauses))
    }

    if (this.orderByClauses.length > 0) {
      pushResult(this.sqlBuilder.orderBy(this.orderByClauses))
    }

    if (this.limitValue !== undefined) {
      pushResult(this.sqlBuilder.limit(this.limitValue))
    }

    if (this.offsetValue !== undefined) {
      pushResult(this.sqlBuilder.offset(this.offsetValue))
    }

    sql += ';'
    return [sql, bindings]
  }
}

/**
 * UPDATE table_name
 * SET column1 = value1, column2 = value2, ...
 * [WHERE condition]
 * [ORDER BY column_list [ASC|DESC]]
 * [LIMIT count];
 */
export class UpdateMethods<T>
  extends CommonMethods<T>
  implements IUpdateMethods<T>
{
  protected updateClauses: UpdateClause[]
  protected sqlBuilder: SQLBuilder
  constructor(options: MethodsOptions, clauses: preClauses<T>) {
    super()
    this.sqlBuilder = options.sqlBuilder
    this.updateClauses = []
    this.whereClauses = clauses.whereClauses
    if (clauses.fromClauses.length !== 0) {
      throw new Error('Update not support from clause')
    }
  }
  update(table: string, values: Partial<T>): this {
    this.updateClauses.push({ rule: { table, values } })
    return this
  }
  updateRaw(sql: string, bindings?: Bindings): this {
    this.updateClauses.push({ raw: { sql, bindings } })
    return this
  }
}

/**
 * DELETE FROM table_name
 * [WHERE condition]
 * [ORDER BY column_list [ASC|DESC]]
 * [LIMIT count];
 */
export class DeleteMethods<T>
  extends CommonMethods<T>
  implements IDeleteMethods<T>
{
  from(table: string): this {
    throw new Error('Method not implemented.')
  }
  fromRaw(sql: string, bindings?: Bindings): this {
    throw new Error('Method not implemented.')
  }
  delete(): this {
    throw new Error('Method not implemented.')
  }
  deleteRaw(sql: string, bindings?: Bindings): this {
    throw new Error('Method not implemented.')
  }
}

export class InsertMethods<T>
  extends CommonMethods<T>
  implements IInsertMethods<T>
{
  insert(table: string, values: Partial<T> | Partial<T>[]): this {
    throw new Error('Method not implemented.')
  }
  insertRaw(sql: string, bindings?: Bindings): this {
    throw new Error('Method not implemented.')
  }
}

export interface QueryBuilderOptions {
  builder?: SQLBuilder
}

export class QueryBuilder<T>
  implements
    ISelectMethods<T>,
    IUpdateMethods<T>,
    IDeleteMethods<T>,
    IInsertMethods<T>
{
  private queryDesc: {
    fromClauses: FromClause[]
  } = {
    fromClauses: [],
  }
  private SQLBuilder: SQLBuilder
  private commonMethods = new CommonMethods<T>()

  protected _getQueryDesc() {
    return {
      ...this.queryDesc,
      whereClauses: this.commonMethods.getWhereClauses(),
    }
  }

  protected _getMethodsParams() {
    return [{ sqlBuilder: this.SQLBuilder }, this._getQueryDesc()] as const
  }

  constructor(options?: QueryBuilderOptions) {
    this.SQLBuilder = options?.builder ?? Sqlite3SQLBuilder
  }

  select(columns?: SelectColumn<T> | SelectColumn<T>[]) {
    const selectMethods = new SelectMethods<T>(...this._getMethodsParams())
    return selectMethods.select(columns)
  }
  from(table: string): this {
    this.queryDesc.fromClauses.push({ rule: table })
    return this
  }
  fromRaw(sql: string, bindings?: Bindings): this {
    this.queryDesc.fromClauses.push({ raw: { sql, bindings } })
    return this
  }
  orderBy(column: keyof T, direction?: OrderByType, nulls?: OrderByNulls) {
    const selectMethods = new SelectMethods<T>(...this._getMethodsParams())
    return selectMethods.orderBy(column, direction, nulls)
  }
  orderByRaw(sql: string, bindings?: Bindings) {
    const selectMethods = new SelectMethods<T>(...this._getMethodsParams())
    return selectMethods.orderByRaw(sql, bindings)
  }
  groupBy(column: keyof T) {
    const selectMethods = new SelectMethods<T>(...this._getMethodsParams())
    return selectMethods.groupBy(column)
  }
  groupByRaw(sql: string, bindings?: Bindings) {
    const selectMethods = new SelectMethods<T>(...this._getMethodsParams())
    return selectMethods.groupByRaw(sql, bindings)
  }
  offset(offset: number) {
    const selectMethods = new SelectMethods<T>(...this._getMethodsParams())
    return selectMethods.offset(offset)
  }
  limit(limit: number) {
    const selectMethods = new SelectMethods<T>(...this._getMethodsParams())
    return selectMethods.limit(limit)
  }
  update(table: string, values: Partial<T>) {
    const updateMethods = new UpdateMethods<T>(...this._getMethodsParams())
    return updateMethods.update(table, values)
  }
  updateRaw(sql: string, bindings?: Bindings) {
    const updateMethods = new UpdateMethods<T>(...this._getMethodsParams())
    return updateMethods.updateRaw(sql, bindings)
  }
  delete() {
    const deleteMethods = new DeleteMethods<T>()
    return deleteMethods.delete()
  }
  deleteRaw(sql: string, bindings?: Bindings) {
    const deleteMethods = new DeleteMethods<T>()
    return deleteMethods.deleteRaw(sql, bindings)
  }
  insert(table: string, values: Partial<T> | Partial<T>[]) {
    const insertMethods = new InsertMethods<T>()
    return insertMethods.insert(table, values)
  }
  insertRaw(sql: string, bindings?: Bindings) {
    const insertMethods = new InsertMethods<T>()
    return insertMethods.insertRaw(sql, bindings)
  }
  where(conditions: WhereCondition<T>): this {
    this.commonMethods.where(conditions)
    return this
  }
  orWhere(conditions: WhereCondition<T>): this {
    this.commonMethods.orWhere(conditions)
    return this
  }
  whereRaw(sql: string, bindings?: Bindings): this {
    this.commonMethods.whereRaw(sql, bindings)
    return this
  }
  orWhereRaw(sql: string, bindings?: Bindings): this {
    this.commonMethods.orWhereRaw(sql, bindings)
    return this
  }
  toSQL(): SQLWithBindings {
    const selectMethods = new SelectMethods<T>(...this._getMethodsParams())
    return selectMethods.toSQL()
  }
}
