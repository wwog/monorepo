import { QueryBuilder } from './query'

interface UserTable {
  id: number
  name: string
  age: number
}

const queryBuilder = new QueryBuilder<UserTable>()

const query = queryBuilder
  .select(['name', 'age'])
  .from('users')
  .where({
    name: 'John',
    age: {
      $lt: 30,
    },
  })
  .orWhere({
    name: 'Jack',
    age: {
      $gt: 30,
    },
  })
  .orderBy('age', 'ASC')
  .limit(10)
  .offset(0)
  .groupBy('age')

console.log(query.toSQL().unwrap())
