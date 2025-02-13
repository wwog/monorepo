import { QueryBuilder } from './query'

export * from './query'
export * from './types/query.type'
export * from './utils'

const queryBuilder = new QueryBuilder<{
  id: number
  name: string
  age: number
}>()
  .insert('users', [
    { name: 'John', age: 25, id: 1 },
    { name: 'Jane', age: 23 },
  ])
  .returning(['id', 'name'])
  .toSQL()

console.log(queryBuilder)
