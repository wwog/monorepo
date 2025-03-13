import { QueryBuilder } from './query'

export * from './query'
export * from './types/query.type'
export * from './utils'

const [sql, bind] = new QueryBuilder<{
  chatId: string
  number: number
  sequence: number
  sender: string
  status: number
  type: number
  deleteFlag: number
}>()
  .select('*')
  .from('message')
  .where({
    chatId: '123',
    status: {
      $null: true,
    },
  })
  .orWhere({
    type: {
      $null: true,
    },
  })
  .orderBy('sequence', 'DESC')
  .limit(10)
  .toSQL()

console.log(sql, bind)
