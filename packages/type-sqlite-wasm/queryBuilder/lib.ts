import { QueryBuilder } from './query'

export * from './query'
export * from './types/query.type'
export * from './utils'

interface User {
  id: number
  name: string
  age: number
  createdAt: Date
  status: string
  score: number
}

const query = new QueryBuilder<User>()
  .from('users')
  .where({
    id: 1,
  })
  .toSQL()

console.log(query)
