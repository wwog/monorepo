import { fromUnit } from '../from'
import type { FromClause } from '../../../types/query.type'
import { describe, expect, test } from 'vitest'

describe('fromUnit', () => {
  const testCases: Array<{
    name: string
    input: FromClause[]
    expected: [string, any[]]
  }> = [
    {
      name: '简单表名',
      input: [{ rule: 'users' }],
      expected: ['FROM (users)', []]
    },
    {
      name: 'Raw SQL',
      input: [{ 
        raw: {
          sql: 'users JOIN profiles ON users.id = ? AND profiles.user_id = ?',
          bindings: [1, 2]
        }
      }],
      expected: ['FROM (users JOIN profiles ON users.id = ? AND profiles.user_id = ?)', [1, 2]]
    },
    {
      name: 'Raw SQL无绑定值',
      input: [{ 
        raw: {
          sql: 'users JOIN profiles ON users.id = profiles.user_id'
        }
      }],
      expected: ['FROM (users JOIN profiles ON users.id = profiles.user_id)', []]
    }
  ]

  testCases.forEach(({ name, input, expected }) => {
    test(name, () => {
      const result = fromUnit(input)
      expect(result).toEqual(expected)
    })
  })

  test('错误处理 - 空FROM子句', () => {
    expect(() => fromUnit([])).toThrow('FROM clause is required')
  })

  test('错误处理 - 多个FROM子句', () => {
    const input: FromClause[] = [
      { rule: 'users' },
      { rule: 'profiles' }
    ]
    expect(() => fromUnit(input)).toThrow('Multiple FROM clauses are not supported')
  })

  test('错误处理 - 绑定值数量不匹配', () => {
    const input: FromClause[] = [{
      raw: {
        sql: 'users JOIN profiles ON users.id = ? AND profiles.status = ?',
        bindings: [1] // 只提供了一个绑定值，但SQL中有两个占位符
      }
    }]
    expect(() => fromUnit(input)).toThrow(/SQL binding count mismatch/)
  })

  test('错误处理 - 绑定值过多', () => {
    const input: FromClause[] = [{
      raw: {
        sql: 'users JOIN profiles ON users.id = ?',
        bindings: [1, 2, 3] // 提供了三个绑定值，但SQL中只有一个占位符
      }
    }]
    expect(() => fromUnit(input)).toThrow(/SQL binding count mismatch/)
  })

  test('LIKE条件使用单引号', () => {
    const input: FromClause[] = [{
      raw: {
        sql: "users WHERE name LIKE '%?%' AND id = ?",
        bindings: [1] 
      }
    }]
    expect(() => fromUnit(input)).not.toThrow()
  })
}) 