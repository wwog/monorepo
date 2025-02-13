import { fromUnit } from '../from'
import type { FromClause } from '../../../types/query.type'
import { describe, expect, test } from 'vitest'

describe('fromUnit', () => {
  test('应该正确处理简单表名', () => {
    const input: FromClause[] = [{ rule: 'users' }]
    const expected: [string, any[]] = ['FROM "users"', []]
    expect(fromUnit(input)).toEqual(expected)
  })

  test('应该正确处理带绑定值的Raw SQL', () => {
    const input: FromClause[] = [
      {
        raw: {
          sql: 'users JOIN profiles ON users.id = ? AND profiles.user_id = ?',
          bindings: [1, 2],
        },
      },
    ]
    const expected: [string, any[]] = [
      'FROM users JOIN profiles ON users.id = ? AND profiles.user_id = ?',
      [1, 2],
    ]
    expect(fromUnit(input)).toEqual(expected)
  })

  test('应该正确处理无绑定值的Raw SQL', () => {
    const input: FromClause[] = [
      {
        raw: {
          sql: 'users JOIN profiles ON users.id = profiles.user_id',
        },
      },
    ]
    const expected: [string, any[]] = [
      'FROM users JOIN profiles ON users.id = profiles.user_id',
      [],
    ]
    expect(fromUnit(input)).toEqual(expected)
  })

  test('空FROM子句应该抛出错误', () => {
    expect(() => fromUnit([])).toThrow('FROM clause is required')
  })

  test('多个FROM子句应该抛出错误', () => {
    const input: FromClause[] = [{ rule: 'users' }, { rule: 'profiles' }]
    expect(() => fromUnit(input)).toThrow(
      'Multiple FROM clauses are not supported',
    )
  })

  test('绑定值数量少于占位符时应该抛出错误', () => {
    const input: FromClause[] = [
      {
        raw: {
          sql: 'users JOIN profiles ON users.id = ? AND profiles.status = ?',
          bindings: [1], // 只提供了一个绑定值，但SQL中有两个占位符
        },
      },
    ]
    expect(() => fromUnit(input)).toThrow(/SQL binding count mismatch/)
  })

  test('绑定值数量多于占位符时应该抛出错误', () => {
    const input: FromClause[] = [
      {
        raw: {
          sql: 'users JOIN profiles ON users.id = ?',
          bindings: [1, 2, 3], // 提供了三个绑定值，但SQL中只有一个占位符
        },
      },
    ]
    expect(() => fromUnit(input)).toThrow(/SQL binding count mismatch/)
  })

  test('LIKE条件中的问号不应被视为占位符', () => {
    const input: FromClause[] = [
      {
        raw: {
          sql: "users WHERE name LIKE '%?%' AND id = ?",
          bindings: [1],
        },
      },
    ]
    expect(() => fromUnit(input)).toThrow()
  })
})
