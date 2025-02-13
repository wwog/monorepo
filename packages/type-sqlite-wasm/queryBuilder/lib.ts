import { QueryBuilder } from './query'

export * from './query'
export * from './types/query.type'
export * from './utils'

const queryBuilder = new QueryBuilder<{
  id: number
  name: string
  age: number
}>()
  .select()
  .from('users')
  .toSQL()

console.log(queryBuilder)
