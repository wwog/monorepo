import type { FromClause, SQLWithBindings } from '../../types/query.type'
import { bracket, validateBindings } from '../../utils'

export const fromUnit = (fromClauses: FromClause[]): SQLWithBindings => {
  if (fromClauses.length === 0) {
    throw new Error('FROM clause is required')
  }
  if (fromClauses.length > 1) {
    throw new Error('Multiple FROM clauses are not supported')
  }

  const fromClause = fromClauses[0]!
  let sql = ''
  let bindings: any[] = []

  if (fromClause.rule) {
    sql = bracket(fromClause.rule)
  } else if (fromClause.raw) {
    sql = bracket(fromClause.raw.sql)
    bindings = fromClause.raw.bindings || []
    validateBindings([fromClause.raw.sql, bindings])
  }

  return [`FROM ${sql}`, bindings]
}
