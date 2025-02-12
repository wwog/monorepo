import type {
  Bindings,
  QueryDescription,
  SQLWithBindings,
} from '../types/query.type'
import { fromUnit } from './units/from'
import { selectUnit } from './units/select'
import { whereUnit } from './units/where'
import { orderUnit } from './units/order'

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
    if (unit[0] === '') return
    sql.push(unit[0])
    bindings.push(...unit[1])
  }

  pushUnitResult(selectUnit(selectClauses))
  pushUnitResult(fromUnit(fromClauses))
  pushUnitResult(whereUnit(whereClauses))
  pushUnitResult(orderUnit(orderByClauses))

  return [sql.join(' '), bindings]
}
