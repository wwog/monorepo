import type {
  Keyof,
  Raw,
  WhereClause,
  WhereCondition,
  WhereConditionDescription,
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
  target: PartItem,
  source: WhereConditionDescription,
  type: WhereType,
  column: string,
  key: Keyof<BasePartItem>,
) => {
  if (source[key] === undefined) {
    return
  }
  const targetKey = `${key}_${type}` as Keyof<PartItem>
  const getTargetValue = (type: WhereType, key: Keyof<BasePartItem>) => {
    if (type === 'AND') {
      return target[`${key}_and`] ?? []
    }
    return target[`${key}_or`] ?? []
  }
  if (target[targetKey] === undefined) {
    target[targetKey] = []
  }
  const targetArray = target[targetKey]!

  if (type === 'AND') {
    if (key === '$eq') {
      //当加入 AND 类型的 $eq 条件时，其他有相等性质的条件都应该导致错误
      if (getTargetValue('AND', '$eq').length > 0) {
        throw new Error()
      }
    }
  }
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
        optimizeSet(partItem, sourceCondition, type, column, '$eq')
        optimizeSet(partItem, sourceCondition, type, column, '$neq')
        optimizeSet(partItem, sourceCondition, type, column, '$gt')
        optimizeSet(partItem, sourceCondition, type, column, '$gte')
        optimizeSet(partItem, sourceCondition, type, column, '$lt')
        optimizeSet(partItem, sourceCondition, type, column, '$lte')
        optimizeSet(partItem, sourceCondition, type, column, '$like')
        optimizeSet(partItem, sourceCondition, type, column, '$in')
        optimizeSet(partItem, sourceCondition, type, column, '$nin')
        optimizeSet(partItem, sourceCondition, type, column, '$null')
        optimizeSet(partItem, sourceCondition, type, column, '$between')
        optimizeSet(partItem, sourceCondition, type, column, '$notBetween')
      } else {
        //if the condition is not an object, it is considered to be an equal condition
        optimizeSet(partItem, { $eq: sourceCondition }, type, column, '$eq')
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
