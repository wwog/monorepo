import type {
  Bindings,
  QueryDescription,
  SQLWithBindings,
} from '../types/query.type'
import { fromUnit } from './units/from'
import { selectUnit } from './units/select'
import { whereUnit } from './units/where'
import { groupUnit } from './units/group'
import { orderUnit } from './units/order'
import { offsetUnit } from './units/offset'
import { limitUnit } from './units/limit'

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
  pushUnitResult(groupUnit(groupByClauses))
  pushUnitResult(orderUnit(orderByClauses))
  pushUnitResult(offsetUnit(offsetValue))
  pushUnitResult(limitUnit(limitValue))

  return [sql.join(' '), bindings]
}
