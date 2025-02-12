import { validateBindings } from '../utils'
import { describe, expect, test } from 'vitest'

describe('validateBindings', () => {
  test('正确的绑定数量', () => {
    expect(() =>
      validateBindings(['SELECT * FROM users WHERE id = ?', [1]]),
    ).not.toThrow()
    expect(() =>
      validateBindings([
        'SELECT * FROM users WHERE id = ? AND age > ?',
        [1, 18],
      ]),
    ).not.toThrow()
  })

  test('没有绑定值的SQL', () => {
    expect(() => validateBindings(['SELECT * FROM users', []])).not.toThrow()
  })

  test('绑定值不足', () => {
    expect(() =>
      validateBindings(['SELECT * FROM users WHERE id = ? AND age > ?', [1]]),
    ).toThrow(/SQL binding count mismatch/)
  })

  test('绑定值过多', () => {
    expect(() =>
      validateBindings(['SELECT * FROM users WHERE id = ?', [1, 2]]),
    ).toThrow(/SQL binding count mismatch/)
  })

  test('LIKE条件使用单引号', () => {
    expect(() =>
      validateBindings([
        "SELECT * FROM users WHERE name LIKE '%?%' AND id = ?",
        [1],
      ]),
    ).toThrow()
  })

  test('复杂SQL语句', () => {
    const sql = `
      SELECT * FROM users 
      WHERE name LIKE ? 
      AND age BETWEEN ? AND ? 
      AND status IN (?, ?, ?)
      AND bio LIKE '%test%'
    `
    expect(() =>
      validateBindings([
        sql,
        ['John%', 18, 30, 'active', 'pending', 'blocked'],
      ]),
    ).not.toThrow()
  })
})
