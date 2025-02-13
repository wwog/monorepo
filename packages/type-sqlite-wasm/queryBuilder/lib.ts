import { QueryBuilder } from './query'

export * from './query'
export * from './types/query.type'
export * from './utils'

const queryBuilder = new QueryBuilder<{
  id: number
  name: string
  age: number
}>()
  .from('users')
  .where({
    id: 1,
    name: {
      $like: '%n%',
    },
  })
  .toSQL()

console.log(queryBuilder)
