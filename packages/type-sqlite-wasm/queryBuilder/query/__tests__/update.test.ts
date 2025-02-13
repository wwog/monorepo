import { UpdateQuery } from '../update'
import { Sqlite3SQLBuilder } from '../../sqlBuilder/sqlite3'
import { describe, expect, test } from 'vitest'

describe('UpdateQuery', () => {
  const createQuery = () =>
    new UpdateQuery<{
      id: number
      name: string
      age: number
      status: string
      created_at: string
    }>({
      sqlBuilder: Sqlite3SQLBuilder,
    })

  test('基本更新', () => {
    const query = createQuery()
      .update('users', { name: 'John', age: 25 })
      .toSQL()

    expect(query[0]).toBe('UPDATE "users" SET "age" = ?, "name" = ?;')
    expect(query[1]).toEqual([25, 'John'])
  })

  test('带条件的更新', () => {
    const query = createQuery()
      .update('users', { status: 'active' })
      .where({ id: 1 })
      .toSQL()

    expect(query[0]).toBe('UPDATE "users" SET "status" = ? WHERE "id" = ?;')
    expect(query[1]).toEqual(['active', 1])
  })

  test('带返回值的更新', () => {
    const query = createQuery()
      .update('users', { name: 'John' })
      .returning(['id', 'created_at'])
      .toSQL()

    expect(query[0]).toBe(
      'UPDATE "users" SET "name" = ? RETURNING "id", "created_at";',
    )
    expect(query[1]).toEqual(['John'])
  })

  test('带限制的更新', () => {
    const query = createQuery()
      .update('users', { status: 'inactive' })
      .where({ age: { $lt: 18 } })
      .limit(10)
      .toSQL()

    expect(query[0]).toBe(
      'UPDATE "users" SET "status" = ? WHERE "age" < ? LIMIT ?;',
    )
    expect(query[1]).toEqual(['inactive', 18, 10])
  })

  test('复杂条件更新', () => {
    const query = createQuery()
      .update('users', { status: 'active' })
      .where({
        age: { $gte: 18 },
        status: 'pending',
      })
      .returning('*')
      .toSQL()

    expect(query[0]).toBe(
      'UPDATE "users" SET "status" = ? WHERE "age" >= ? AND "status" = ? RETURNING *;',
    )
    expect(query[1]).toEqual(['active', 18, 'pending'])
  })

  test('Raw SQL更新', () => {
    const query = createQuery()
      .updateRaw('UPDATE users SET last_login = CURRENT_TIMESTAMP')
      .where({ id: 1 })
      .toSQL()

    expect(query[0]).toBe(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE "id" = ?;',
    )
    expect(query[1]).toEqual([1])
  })

  test('错误处理 - 无UPDATE子句', () => {
    const query = createQuery()
    expect(() => query.toSQL()).toThrow('No valid SQL generated')
  })

  test('错误处理 - 多个UPDATE子句', () => {
    const query = createQuery()
    expect(() =>
      query
        .update('users', { name: 'John' })
        .update('users', { age: 25 })
        .toSQL(),
    ).toThrow('Multiple UPDATE clauses are not supported')
  })

  test('带排序的更新', () => {
    const query = createQuery()
      .update('users', { status: 'active' })
      .orderBy('name', 'ASC')
      .limit(10)
      .toSQL()

    expect(query[0]).toBe(
      'UPDATE "users" SET "status" = ? ORDER BY "name" ASC LIMIT ?;',
    )
    expect(query[1]).toEqual(['active', 10])
  })

  test('带原始SQL排序的更新', () => {
    const query = createQuery()
      .update('users', { status: 'active' })
      .orderByRaw('RANDOM()')
      .limit(5)
      .toSQL()

    expect(query[0]).toBe(
      'UPDATE "users" SET "status" = ? ORDER BY RANDOM() LIMIT ?;',
    )
    expect(query[1]).toEqual(['active', 5])
  })
})
