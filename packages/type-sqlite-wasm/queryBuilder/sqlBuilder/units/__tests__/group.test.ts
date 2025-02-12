import { groupUnit } from '../group'
import type { GroupByClause } from '../../../types/query.type'
import { describe, expect, test } from 'vitest'

describe('groupUnit', () => {
  const testCases: Array<{
    name: string
    input: GroupByClause[]
    expected: [string, any[]]
  }> = [
    {
      name: '空GROUP BY子句',
      input: [],
      expected: ['', []],
    },
    {
      name: '单列GROUP BY',
      input: [{ rule: { column: 'name' } }],
      expected: ['GROUP BY "name"', []],
    },
    {
      name: '多列GROUP BY',
      input: [{ rule: { column: 'name' } }, { rule: { column: 'age' } }],
      expected: ['GROUP BY "name", "age"', []],
    },
    {
      name: 'Raw SQL GROUP BY',
      input: [
        {
          raw: {
            sql: 'SUBSTR(name, 1, 1)',
          },
        },
      ],
      expected: ['GROUP BY SUBSTR(name, 1, 1)', []],
    },
    {
      name: 'Raw SQL GROUP BY带绑定值',
      input: [
        {
          raw: {
            sql: 'SUBSTR(name, 1, ?)',
            bindings: [1],
          },
        },
      ],
      expected: ['GROUP BY SUBSTR(name, 1, ?)', [1]],
    },
  ]

  testCases.forEach(({ name, input, expected }) => {
    test(name, () => {
      const result = groupUnit(input)
      expect(result).toEqual(expected)
    })
  })

  test('错误处理 - 绑定值数量不匹配', () => {
    const input: GroupByClause[] = [
      {
        raw: {
          sql: 'SUBSTR(name, 1, ?)',
          bindings: [1, 2], // 提供了两个绑定值，但SQL中只有一个占位符
        },
      },
    ]
    expect(() => groupUnit(input)).toThrow(/SQL binding count mismatch/)
  })
})
