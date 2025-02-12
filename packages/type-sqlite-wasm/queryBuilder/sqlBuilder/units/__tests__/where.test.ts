import { whereUnit } from '../where'
import type { WhereClause } from '../../../types/query.type'
import { describe, expect, test } from 'vitest'

describe('whereUnit', () => {
  const testCases: Array<{
    name: string
    input: WhereClause[]
    expected: [string, any[]]
  }> = [
    {
      name: '空条件',
      input: [],
      expected: ['', []],
    },
    {
      name: '简单相等条件',
      input: [{ rule: { condition: { age: 18 }, type: 'AND' } }],
      expected: ['WHERE "age" = ?', [18]],
    },
    {
      name: '多个AND条件',
      input: [
        {
          rule: {
            condition: { age: { $gte: 18 }, status: 'active' },
            type: 'AND',
          },
        },
      ],
      expected: ['WHERE "age" >= ? AND "status" = ?', [18, 'active']],
    },
    {
      name: 'OR条件',
      input: [
        { rule: { condition: { status: 'active' }, type: 'AND' } },
        { rule: { condition: { status: 'pending' }, type: 'OR' } },
      ],
      expected: ['WHERE "status" = ? OR "status" = ?', ['active', 'pending']],
    },
    {
      name: 'BETWEEN条件',
      input: [
        { rule: { condition: { age: { $between: [18, 30] } }, type: 'AND' } },
      ],
      expected: ['WHERE "age" BETWEEN ? AND ?', [18, 30]],
    },
    {
      name: '复杂IN条件',
      input: [
        {
          rule: {
            condition: { status: { $in: ['active', 'pending'] } },
            type: 'AND',
          },
        },
      ],
      expected: ['WHERE "status" IN (?, ?)', ['active', 'pending']],
    },
    {
      name: 'NULL条件',
      input: [
        { rule: { condition: { deletedAt: { $null: true } }, type: 'AND' } },
      ],
      expected: ['WHERE "deletedAt" IS NULL', []],
    },
    {
      name: 'LIKE条件',
      input: [
        { rule: { condition: { name: { $like: 'John%' } }, type: 'AND' } },
        { rule: { condition: { name: { $like: '%Doe%' } }, type: 'OR' } },
      ],
      expected: ['WHERE "name" LIKE ? OR "name" LIKE ?', ['John%', '%Doe%']],
    },
    {
      name: '复杂组合条件',
      input: [
        {
          rule: {
            condition: {
              age: { $gte: 18, $lte: 60 },
              status: 'active',
            },
            type: 'AND',
          },
        },
        {
          rule: {
            condition: { score: { $gt: 80 } },
            type: 'OR',
          },
        },
      ],
      expected: [
        'WHERE "age" >= ? AND "age" <= ? AND "status" = ? OR "score" > ?',
        [18, 60, 'active', 80],
      ],
    },
    {
      name: 'Raw SQL条件',
      input: [
        {
          raw: { sql: 'created_at > ?', bindings: ['2024-01-01'], type: 'AND' },
        },
      ],
      expected: ['WHERE created_at > ?', ['2024-01-01']],
    },
    {
      name: '混合Raw SQL和普通条件',
      input: [
        { rule: { condition: { status: 'active' }, type: 'AND' } },
        { raw: { sql: 'score > ?', bindings: [80], type: 'OR' } },
      ],
      expected: ['WHERE "status" = ? OR score > ?', ['active', 80]],
    },
  ]

  testCases.forEach(({ name, input, expected }) => {
    test(name, () => {
      const result = whereUnit(input)
      expect(result).toEqual(expected)
    })
  })

  test('错误处理 - 条件数量超限', () => {
    const input: WhereClause[] = Array(1001)
      .fill(0)
      .map((_, i) => ({
        rule: { condition: { [`field${i}`]: i }, type: 'AND' },
      }))

    expect(() => whereUnit(input)).toThrow(/Too many conditions/)
  })

  test('错误处理 - BETWEEN无效范围', () => {
    const input: WhereClause[] = [
      {
        rule: { condition: { age: { $between: [30, 18] } }, type: 'AND' },
      },
    ]

    expect(() => whereUnit(input)).toThrow(/invalid range/)
  })
})
