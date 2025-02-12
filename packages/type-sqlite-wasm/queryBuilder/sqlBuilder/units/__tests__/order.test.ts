import { orderUnit } from '../order'
import type { OrderByClause } from '../../../types/query.type'
import { describe, expect, test } from 'vitest'

describe('orderUnit', () => {
  const testCases: Array<{
    name: string
    input: OrderByClause[]
    expected: [string, any[]]
  }> = [
    {
      name: '空排序',
      input: [],
      expected: ['', []],
    },
    {
      name: '单列排序',
      input: [{ rule: { column: 'name' } }],
      expected: ['ORDER BY "name"', []],
    },
    {
      name: '指定排序方向',
      input: [{ rule: { column: 'age', direction: 'DESC' } }],
      expected: ['ORDER BY "age" DESC', []],
    },
    {
      name: '指定空值位置',
      input: [{ rule: { column: 'score', nulls: 'LAST' } }],
      expected: ['ORDER BY "score" NULLS LAST', []],
    },
    {
      name: '多列排序',
      input: [
        { rule: { column: 'name', direction: 'ASC' } },
        { rule: { column: 'age', direction: 'DESC' } },
      ],
      expected: ['ORDER BY "name" ASC, "age" DESC', []],
    },
    {
      name: 'Raw SQL排序',
      input: [
        {
          raw: {
            sql: 'RANDOM()',
          },
        },
      ],
      expected: ['ORDER BY RANDOM()', []],
    },
    {
      name: 'Raw SQL带绑定值',
      input: [
        {
          raw: {
            sql: 'CASE WHEN id = ? THEN 0 ELSE 1 END',
            bindings: [1],
          },
        },
      ],
      expected: ['ORDER BY CASE WHEN id = ? THEN 0 ELSE 1 END', [1]],
    },
    {
      name: '混合规则和Raw SQL',
      input: [
        { rule: { column: 'name', direction: 'ASC' } },
        { raw: { sql: 'RANDOM()' } },
      ],
      expected: ['ORDER BY "name" ASC, RANDOM()', []],
    },
  ]

  testCases.forEach(({ name, input, expected }) => {
    test(name, () => {
      const result = orderUnit(input)
      expect(result).toEqual(expected)
    })
  })
})
