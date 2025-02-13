import { updateUnit } from '../update'
import type { UpdateClause } from '../../../types/query.type'
import { describe, expect, test } from 'vitest'

describe('updateUnit', () => {
  const testCases: Array<{
    name: string
    input: UpdateClause[]
    expected: [string, any[]]
  }> = [
    {
      name: '空UPDATE子句',
      input: [],
      expected: ['', []],
    },
    {
      name: '基本更新',
      input: [
        {
          rule: {
            table: 'users',
            values: { name: 'John', age: 25 },
          },
        },
      ],
      expected: ['UPDATE "users" SET "age" = ?, "name" = ?', [25, 'John']],
    },
    {
      name: '单列更新',
      input: [
        {
          rule: {
            table: 'users',
            values: { status: 'active' },
          },
        },
      ],
      expected: ['UPDATE "users" SET "status" = ?', ['active']],
    },
    {
      name: 'Raw SQL更新',
      input: [
        {
          raw: {
            sql: 'UPDATE users SET last_login = CURRENT_TIMESTAMP',
          },
        },
      ],
      expected: ['UPDATE users SET last_login = CURRENT_TIMESTAMP', []],
    },
    {
      name: 'Raw SQL带绑定值',
      input: [
        {
          raw: {
            sql: 'UPDATE users SET name = ?, age = ?',
            bindings: ['John', 25],
          },
        },
      ],
      expected: ['UPDATE users SET name = ?, age = ?', ['John', 25]],
    },
  ]

  testCases.forEach(({ name, input, expected }) => {
    test(name, () => {
      const result = updateUnit(input)
      expect(result).toEqual(expected)
    })
  })

  test('错误处理 - 多个UPDATE子句', () => {
    const input: UpdateClause[] = [
      {
        rule: {
          table: 'users',
          values: { name: 'John' },
        },
      },
      {
        rule: {
          table: 'users',
          values: { age: 25 },
        },
      },
    ]
    expect(() => updateUnit(input)).toThrow(
      'Multiple UPDATE clauses are not supported',
    )
  })

  test('错误处理 - 空值对象', () => {
    const input: UpdateClause[] = [
      {
        rule: {
          table: 'users',
          values: {},
        },
      },
    ]
    expect(() => updateUnit(input)).toThrow('No columns provided for UPDATE')
  })

  test('错误处理 - 绑定值数量不匹配', () => {
    const input: UpdateClause[] = [
      {
        raw: {
          sql: 'UPDATE users SET name = ?, age = ?',
          bindings: ['John'], // 只提供了一个绑定值，但SQL中有两个占位符
        },
      },
    ]
    expect(() => updateUnit(input)).toThrow(/SQL binding count mismatch/)
  })
}) 