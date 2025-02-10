import type {
  Keyof,
  Raw,
  WhereClause,
  WhereCondition,
  WhereType,
} from '../../types/query.type'
import { isWhereConditionDescription, quotes } from '../../utils'

type BasePartItem = {
  $eq?: any[]
  $neq?: any[]
  $gt?: any[]
  $gte?: any[]
  $lt?: any[]
  $lte?: any[]
  $like?: any[]
  $in?: any[]
  $nin?: any[]
  $null?: any[]
  $between?: any[]
  $notBetween?: any[]
}

type SuffixAttrs<T extends Record<string, any>, P extends string> = {
  [K in keyof T as `${K & string}${P}`]: T[K]
}
type AndPartItem = SuffixAttrs<BasePartItem, '_and'>
type OrPartItem = SuffixAttrs<BasePartItem, '_or'>
type PartItem = AndPartItem & OrPartItem
type PreprocessResult = {
  conditionParts: Map<string, PartItem>
  rawParts: Raw[]
}

/**
 * Optimize the structure during the setting process
 */
const optimizeSet = (
  target: any,
  source: any,
  key: Keyof<BasePartItem>,
  type: WhereType,
) => {
  if (source[key] === undefined) {
    return
  }
  const targetKey = `${key}_${type}` as Keyof<PartItem>
}

/**
 * @description Preprocess the where condition, convert it to {@link BasePartItem} format, and the original {@link Raw} format, which is convenient for subsequent optimization and conversion to SQL
 */
const preprocess = (whereClauses: WhereClause[]): PreprocessResult => {
  const parts = new Map<string, PartItem>()
  const rawParts: Raw[] = []

  whereClauses.forEach((whereClause) => {
    const { rule, raw } = whereClause
    if (raw) {
      rawParts.push(raw)
      return
    }

    const { condition, type } = rule!
    const columns = Object.keys(condition)
    //skip in empty condition
    if (columns.length === 0) {
      return
    }

    columns.forEach((column) => {
      const partHasColumn = parts.has(column)
      if (partHasColumn === false) {
        parts.set(column, {})
      }
      const partItem: PartItem = parts.get(column)!
      const sourceCondition = condition[column]

      if (isWhereConditionDescription(sourceCondition)) {
        optimizeSet(parts, sourceCondition, '$eq', type)
        optimizeSet(parts, sourceCondition, '$neq', type)
        optimizeSet(parts, sourceCondition, '$gt', type)
        optimizeSet(parts, sourceCondition, '$gte', type)
        optimizeSet(parts, sourceCondition, '$lt', type)
        optimizeSet(parts, sourceCondition, '$lte', type)
        optimizeSet(parts, sourceCondition, '$like', type)
        optimizeSet(parts, sourceCondition, '$in', type)
        optimizeSet(parts, sourceCondition, '$nin', type)
        optimizeSet(parts, sourceCondition, '$null', type)
        optimizeSet(parts, sourceCondition, '$between', type)
        optimizeSet(parts, sourceCondition, '$notBetween', type)
      } else {
        //if the condition is not an object, it is considered to be an equal condition
        optimizeSet(parts, { $eq: sourceCondition }, '$eq', type)
      }
    })
  })

  return {
    conditionParts: parts,
    rawParts,
  }
}

const convertToSQL = (optimizeResult: any) => {}

export const whereUnit = (whereClauses: WhereClause[]) => {
  const hasQuery = whereClauses.length > 0
  if (hasQuery === false) {
    return ''
  }
  const preprocessResult = preprocess(whereClauses)
  console.log(preprocessResult)
  return ''
}
