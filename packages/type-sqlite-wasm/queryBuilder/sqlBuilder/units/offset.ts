import { SQLWithBindings } from '../../types/query.type'
import { isPositiveInteger } from '../../utils'

export const offsetUnit = (offsetValue?: number): SQLWithBindings => {
  if (offsetValue === undefined) {
    return ['', []]
  }

  if (isPositiveInteger(offsetValue) === false) {
    throw new Error('Invalid offset value')
  }
  return ['OFFSET ?', [offsetValue]]
}
