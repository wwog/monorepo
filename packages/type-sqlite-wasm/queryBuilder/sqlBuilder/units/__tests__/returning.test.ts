import { returningUnit } from '../returning'
import type { ReturningClause } from '../../../types/query.type'
import { describe, expect, test } from 'vitest'

describe('returningUnit', () => {
  const testCases: Array<{
    name: string
    input: ReturningClause[]
    expected: [string, any[]]
  }> = [
    {
      name: '空RETURNING子句',
      input: [],
      expected: ['', []],
    },
    {
      name: '返回所有列',
      input: [{ rule: '*' }],
      expected: ['RETURNING *', []],
    },
    {
      name: '返回单个列',
      input: [{ rule: 'id' }],
      expected: ['RETURNING "id"', []],
    },
    {
      name: '返回多个列',
      input: [{ rule: 'id' }, { rule: 'name' }],
      expected: ['RETURNING "id", "name"', []],
    },
    {
      name: 'Raw SQL返回',
      input: [
        {
          raw: {
            sql: 'COUNT(*) as count',
          },
        },
      ],
      expected: ['RETURNING COUNT(*) as count', []],
    },
    {
      name: 'Raw SQL带绑定值',
      input: [
        {
          raw: {
            sql: 'CASE WHEN id = ? THEN ? ELSE ? END as result',
            bindings: [1, 'active', 'inactive'],
          },
        },
      ],
      expected: [
        'RETURNING CASE WHEN id = ? THEN ? ELSE ? END as result',
        [1, 'active', 'inactive'],
      ],
    },
    {
      name: '混合规则和Raw SQL',
      input: [
        { rule: 'id' },
        {
          raw: {
            sql: 'created_at',
          },
        },
      ],
      expected: ['RETURNING "id", created_at', []],
    },
  ]

  testCases.forEach(({ name, input, expected }) => {
    test(name, () => {
      const result = returningUnit(input)
      expect(result).toEqual(expected)
    })
  })

  test('错误处理 - 绑定值数量不匹配', () => {
    const input: ReturningClause[] = [
      {
        raw: {
          sql: 'CASE WHEN id = ? THEN ? ELSE ? END',
          bindings: [1, 'active'], // 只提供了两个绑定值，但SQL中有三个占位符
        },
      },
    ]
    expect(() => returningUnit(input)).toThrow(/SQL binding count mismatch/)
  })
}) 