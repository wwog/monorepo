import { offsetUnit } from '../offset'
import { describe, expect, test } from 'vitest'

describe('offsetUnit', () => {
  test('无offset值', () => {
    const result = offsetUnit()
    expect(result).toEqual(['', []])
  })

  test('offset值为0', () => {
    const result = offsetUnit(0)
    expect(result).toEqual(['', []])
  })

  test('有效的offset值', () => {
    const result = offsetUnit(10)
    expect(result).toEqual(['OFFSET ?', [10]])
  })

  test('无效的offset值', () => {
    expect(() => offsetUnit(-1)).toThrow('Invalid offset value')
    expect(() => offsetUnit(1.5)).toThrow('Invalid offset value')
  })
})
