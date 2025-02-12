import { insertUnit } from '../insert'
import type { InsertClause } from '../../../types/query.type'
import { describe, expect, test } from 'vitest'

describe('insertUnit', () => {
  const testCases: Array<{
    name: string
    input: InsertClause[]
    expected: [string, any[]]
  }> = [
    {
      name: '空插入语句',
      input: [],
      expected: ['', []],
    },
    {
      name: 'Raw SQL插入',
      input: [
        {
          raw: {
            sql: 'INSERT INTO users (name) VALUES (?)',
            bindings: ['John'],
          },
        },
      ],
      expected: ['INSERT INTO users (name) VALUES (?)', ['John']],
    },
    {
      name: '单行数据插入',
      input: [
        {
          rule: {
            table: 'users',
            values: { name: 'John', age: 30 },
          },
        },
      ],
      expected: ['INSERT INTO "users" ("age", "name") VALUES (?, ?)', [30, 'John']],
    },
    {
      name: '多行数据插入',
      input: [
        {
          rule: {
            table: 'users',
            values: [
              { name: 'John', age: 30 },
              { name: 'Jane', age: 25 },
            ],
          },
        },
      ],
      expected: [
        'INSERT INTO "users" ("age", "name") VALUES (?, ?), (?, ?)',
        [30, 'John', 25, 'Jane'],
      ],
    },
    {
      name: '处理NULL值',
      input: [
        {
          rule: {
            table: 'users',
            values: [
              { name: 'John', age: null },
              { name: 'Jane' },
            ],
          },
        },
      ],
      expected: [
        'INSERT INTO "users" ("age", "name") VALUES (?, ?), (?, ?)',
        [null, 'John', null, 'Jane'],
      ],
    },
  ]

  testCases.forEach(({ name, input, expected }) => {
    test(name, () => {
      const result = insertUnit(input)
      expect(result).toEqual(expected)
    })
  })

  test('错误处理 - 多个INSERT子句', () => {
    const input: InsertClause[] = [
      { rule: { table: 'users', values: { name: 'John' } } },
      { rule: { table: 'users', values: { name: 'Jane' } } },
    ]
    expect(() => insertUnit(input)).toThrow('Multiple INSERT clauses are not supported')
  })

  test('错误处理 - 空值数组', () => {
    const input: InsertClause[] = [
      {
        rule: {
          table: 'users',
          values: [],
        },
      },
    ]
    expect(() => insertUnit(input)).toThrow('No values provided for INSERT')
  })

  test('错误处理 - 空对象值', () => {
    const input: InsertClause[] = [
      {
        rule: {
          table: 'users',
          values: [{}],
        },
      },
    ]
    expect(() => insertUnit(input)).toThrow('No columns provided for INSERT')
  })

  test('错误处理 - 超出批量限制', () => {
    const values = Array(10001).fill({ name: 'John' })
    const input: InsertClause[] = [
      {
        rule: {
          table: 'users',
          values,
        },
      },
    ]
    expect(() => insertUnit(input)).toThrow('Batch size exceeds maximum limit of 10000')
  })
})
