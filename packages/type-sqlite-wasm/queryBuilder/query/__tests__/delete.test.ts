import { DeleteQuery } from '../delete'
import { Sqlite3SQLBuilder } from '../../sqlBuilder/sqlite3'
import { describe, expect, test } from 'vitest'

describe('DeleteQuery', () => {
  const createQuery = () =>
    new DeleteQuery<{
      id: number
      name: string
      age: number
      status: string
      created_at: string
    }>({
      sqlBuilder: Sqlite3SQLBuilder,
    })

  test('基本删除', () => {
    const query = createQuery().delete().from('users').toSQL()

    expect(query[0]).toBe('DELETE FROM "users";')
    expect(query[1]).toEqual([])
  })

  test('带条件的删除', () => {
    const query = createQuery().delete().from('users').where({ id: 1 }).toSQL()

    expect(query[0]).toBe('DELETE FROM "users" WHERE "id" = ?;')
    expect(query[1]).toEqual([1])
  })

  test('带返回值的删除', () => {
    const query = createQuery()
      .delete()
      .from('users')
      .where({ id: 1 })
      .returning(['id', 'created_at'])
      .toSQL()

    expect(query[0]).toBe(
      'DELETE FROM "users" WHERE "id" = ? RETURNING "id", "created_at";',
    )
    expect(query[1]).toEqual([1])
  })

  test('带限制的删除', () => {
    const query = createQuery()
      .delete()
      .from('users')
      .where({ age: { $lt: 18 } })
      .limit(10)
      .toSQL()

    expect(query[0]).toBe('DELETE FROM "users" WHERE "age" < ? LIMIT ?;')
    expect(query[1]).toEqual([18, 10])
  })

  test('复杂条件删除', () => {
    const query = createQuery()
      .delete()
      .from('users')
      .where({
        age: { $gte: 18 },
        status: 'inactive',
      })
      .returning('*')
      .toSQL()

    expect(query[0]).toBe(
      'DELETE FROM "users" WHERE "age" >= ? AND "status" = ? RETURNING *;',
    )
    expect(query[1]).toEqual([18, 'inactive'])
  })

  test('错误处理 - 无DELETE子句', () => {
    const query = createQuery()
    expect(() => query.toSQL()).toThrow()
  })

  test('错误处理 - 多个DELETE子句', () => {
    const query = createQuery()
    expect(() => query.delete().delete().from('users').toSQL()).toThrow(
      'Multiple DELETE clauses are not supported',
    )
  })

  test('错误处理 - 无FROM子句', () => {
    const query = createQuery()
    expect(() => query.delete().toSQL()).toThrow('FROM clause is required')
  })
})
