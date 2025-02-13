import { insertUnit } from '../insert'
import type { InsertClause } from '../../../types/query.type'
import { describe, expect, test } from 'vitest'

describe('insertUnit', () => {
  test('空INSERT子句', () => {
    expect(() => insertUnit()).toThrow('No INSERT clause provided')
  })

  test('单行插入', () => {
    const clauses: InsertClause[] = [
      {
        rule: {
          table: 'users',
          values: { name: 'John', age: 25 },
        },
      },
    ]
    const result = insertUnit(clauses)
    expect(result[0]).toBe('INSERT INTO "users" ("age", "name") VALUES (?, ?)')
    expect(result[1]).toEqual([25, 'John'])
  })

  test('多行插入', () => {
    const clauses: InsertClause[] = [
      {
        rule: {
          table: 'users',
          values: [
            { name: 'John', age: 25 },
            { name: 'Jane', age: 23 },
          ],
        },
      },
    ]
    const result = insertUnit(clauses)
    expect(result[0]).toBe(
      'INSERT INTO "users" ("age", "name") VALUES (?, ?), (?, ?)',
    )
    expect(result[1]).toEqual([25, 'John', 23, 'Jane'])
  })

  test('Raw SQL插入', () => {
    const clauses: InsertClause[] = [
      {
        raw: {
          sql: 'INSERT INTO users (name, age) VALUES (?, ?)',
          bindings: ['John', 25],
        },
      },
    ]
    const result = insertUnit(clauses)
    expect(result[0]).toBe('INSERT INTO users (name, age) VALUES (?, ?)')
    expect(result[1]).toEqual(['John', 25])
  })

  test('多行插入 - 不同列数', () => {
    const clauses: InsertClause[] = [
      {
        rule: {
          table: 'users',
          values: [
            { name: 'John', age: 25, role: 'admin' },
            { name: 'Jane', age: 23 },
          ],
        },
      },
    ]
    const result = insertUnit(clauses)
    expect(result[0]).toBe(
      'INSERT INTO "users" ("age", "name", "role") VALUES (?, ?, ?), (?, ?, NULL)',
    )
    expect(result[1]).toEqual([25, 'John', 'admin', 23, 'Jane'])
  })

  test('错误处理 - 多个INSERT子句', () => {
    const clauses: InsertClause[] = [
      {
        rule: {
          table: 'users',
          values: { name: 'John' },
        },
      },
      {
        rule: {
          table: 'users',
          values: { name: 'Jane' },
        },
      },
    ]
    expect(() => insertUnit(clauses)).toThrow(
      'Multiple INSERT clauses are not supported',
    )
  })

  test('错误处理 - 空值对象', () => {
    const clauses: InsertClause[] = [
      {
        rule: {
          table: 'users',
          values: {},
        },
      },
    ]
    expect(() => insertUnit(clauses)).toThrow('No columns provided for INSERT')
  })

  test('错误处理 - 空值数组', () => {
    const clauses: InsertClause[] = [
      {
        rule: {
          table: 'users',
          values: [],
        },
      },
    ]
    expect(() => insertUnit(clauses)).toThrow('No values provided for INSERT')
  })

  test('错误处理 - 绑定值数量不匹配', () => {
    const clauses: InsertClause[] = [
      {
        raw: {
          sql: 'INSERT INTO users (name, age) VALUES (?, ?)',
          bindings: ['John'], // 只提供了一个绑定值，但SQL中有两个占位符
        },
      },
    ]
    expect(() => insertUnit(clauses)).toThrow(/SQL binding count mismatch/)
  })
})
