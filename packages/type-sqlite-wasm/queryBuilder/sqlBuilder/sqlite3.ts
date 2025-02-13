import type {
  SelectClause,
  SQLWithBindings,
  FromClause,
  WhereClause,
  GroupByClause,
  OrderByClause,
  SQLBuilder,
} from '../types/query.type'
import { fromUnit } from './units/from'
import { selectUnit } from './units/select'
import { whereUnit } from './units/where'
import { groupUnit } from './units/group'
import { orderUnit } from './units/order'
import { offsetUnit } from './units/offset'
import { limitUnit } from './units/limit'

export const Sqlite3SQLBuilder: SQLBuilder = {
  select: (clause: SelectClause[]): SQLWithBindings => {
    return selectUnit(clause)
  },
  from: (clause: FromClause[]): SQLWithBindings => {
    return fromUnit(clause)
  },
  where: (clause: WhereClause[]): SQLWithBindings => {
    return whereUnit(clause)
  },
  groupBy: (clause: GroupByClause[]): SQLWithBindings => {
    return groupUnit(clause)
  },
  orderBy: (clause: OrderByClause[]): SQLWithBindings => {
    return orderUnit(clause)
  },
  offset: (clause: number): SQLWithBindings => {
    return offsetUnit(clause)
  },
  limit: (clause: number): SQLWithBindings => {
    return limitUnit(clause)
  },
}
