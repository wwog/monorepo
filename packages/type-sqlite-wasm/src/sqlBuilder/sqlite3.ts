import type {
  FromClause,
  QueryDescription,
  SelectClause,
  WhereClause,
} from '../types/query.type'
import { quotes, bracket, isWhereConditionDescription } from '../utils'

export function Sqlite3SQLBuilder(description: QueryDescription<any>): string {
  const {
    selectClauses,
    fromClauses,
    whereClauses,
    orderByClauses,
    groupByClauses,
    offsetValue,
    limitValue,
  } = description

  const selectUnit = (selectClauses: SelectClause[]) => {
    const hasSelectClauses = selectClauses.length > 0
    const query: string[] = []
    if (hasSelectClauses === false) {
      query.push('*')
    } else {
      selectClauses.forEach((selectClause) => {
        query.push(quotes(selectClause.rule))
      })
    }
    return 'SELECT ' + query.join(', ')
  }

  const fromUnit = (fromClauses: FromClause[]) => {
    if (fromClauses.length === 0) {
      throw new Error('FROM clause is required')
    }
    if (fromClauses.length > 1) {
      throw new Error('Multiple FROM clauses are not supported')
    }

    let query = ''
    for (let idx = 0; idx < fromClauses.length; idx++) {
      const element = fromClauses[idx]!
      if (element.rule) {
        query += bracket(element.rule)
      } else if (element.raw) {
        query += bracket(element.raw.sql)
      }
    }

    return 'FROM ' + query
  }

  const whereUnit = (whereClauses: WhereClause[]) => {
    const hasQuery = whereClauses.length > 0
    if (hasQuery === false) {
      return ''
    }
    const query: string[] = []
    for (let idx = 0; idx < whereClauses.length; idx++) {
      const it = whereClauses[idx]!
      if (it.rule) {
        const { type, conditions } = it.rule
        const conditionKeys = Object.keys(conditions)
        const conditionQuery: string[] = []

        for (let idx = 0; idx < conditionKeys.length; idx++) {
          const key = conditionKeys[idx]!
          const value = conditions[key]
          if (isWhereConditionDescription(value)) {
            if (value.$eq) {
              conditionQuery.push(`${quotes(key)} = ${value.$eq}`)
            }
          } else {
            conditionQuery.push(`${quotes(key)} = ${value}`)
          }
        }
      }
    }
  }

  let query = ``
  const selectStr = selectUnit(selectClauses)
  const fromStr = fromUnit(fromClauses)
  query += `${selectStr} ${fromStr}`

  return query
}
