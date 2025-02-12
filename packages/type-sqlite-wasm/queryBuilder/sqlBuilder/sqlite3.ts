import type {
  Bindings,
  FromClause,
  QueryDescription,
  SelectClause,
  SQLWithBindings,
  WhereClause,
} from '../types/query.type'
import { quotes, bracket, isWhereConditionDescription } from '../utils'
import { fromUnit } from './units/from'
import { selectUnit } from './units/select'
import { whereUnit } from './units/where'

export function Sqlite3SQLBuilder(
  description: QueryDescription<any>,
): SQLWithBindings {
  const {
    selectClauses,
    fromClauses,
    whereClauses,
    orderByClauses,
    groupByClauses,
    offsetValue,
    limitValue,
  } = description

  const sql: string[] = []
  const bindings: Bindings = []

  const pushUnitResult = (unit: SQLWithBindings) => {
    sql.push(unit[0])
    bindings.push(...unit[1])
  }

  pushUnitResult(selectUnit(selectClauses))
  pushUnitResult(fromUnit(fromClauses))
  pushUnitResult(whereUnit(whereClauses))

  return [sql.join(' '), bindings]
}
