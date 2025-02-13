import { InsertQuery } from '../insert'
import { Sqlite3SQLBuilder } from '../../sqlBuilder/sqlite3'
import { describe, expect, test } from 'vitest'

describe('InsertQuery', () => {
  const createQuery = () =>
    new InsertQuery<{
      id: number
      name: string
      age: number
      created_at: string
    }>({
      sqlBuilder: Sqlite3SQLBuilder,
    })

  test('基本插入', () => {
    const query = createQuery()
      .insert('users', { name: 'John', age: 25 })
      .toSQL()

    expect(query[0]).toBe('INSERT INTO "users" ("age", "name") VALUES (?, ?);')
    expect(query[1]).toEqual([25, 'John'])
  })

  test('批量插入', () => {
    const query = createQuery()
      .insert('users', [
        { name: 'John', age: 25 },
        { name: 'Jane', age: 23 },
      ])
      .toSQL()

    expect(query[0]).toBe(
      'INSERT INTO "users" ("age", "name") VALUES (?, ?), (?, ?);',
    )
    expect(query[1]).toEqual([25, 'John', 23, 'Jane'])
  })

  test('带返回值的插入', () => {
    const query = createQuery()
      .insert('users', { name: 'John', age: 25 })
      .returning(['id', 'created_at'])
      .toSQL()

    expect(query[0]).toBe(
      'INSERT INTO "users" ("age", "name") VALUES (?, ?) RETURNING "id", "created_at";',
    )
    expect(query[1]).toEqual([25, 'John'])
  })

  test('Raw SQL插入', () => {
    const query = createQuery()
      .insertRaw('INSERT INTO users (name, age) VALUES (?, ?)', ['John', 25])
      .toSQL()

    expect(query[0]).toBe('INSERT INTO users (name, age) VALUES (?, ?);')
    expect(query[1]).toEqual(['John', 25])
  })

  test('错误处理 - 无INSERT子句', () => {
    const query = createQuery()
    expect(() => query.toSQL()).toThrow('No INSERT clause provided')
  })

  test('错误处理 - 多个INSERT子句', () => {
    const query = createQuery()
    expect(() =>
      query
        .insert('users', { name: 'John' })
        .insert('users', { name: 'Jane' })
        .toSQL(),
    ).toThrow('Multiple INSERT clauses are not supported')
  })
})
