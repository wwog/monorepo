import type { WhereConditionDescription } from './types/query.type'

export function quotes(str: string): string {
  return `"${str}"`
}

export function bracket(str: string): string {
  return `(${str})`
}

export function isWhereConditionDescription(
  condition: any,
): condition is WhereConditionDescription {
  if (typeof condition === 'object' && condition !== null) {
    return true
  }
  return false
}
