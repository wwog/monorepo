import { limitUnit } from '../limit'
import { describe, expect, test } from 'vitest'

describe('limitUnit', () => {
  test('无limit值', () => {
    const result = limitUnit()
    expect(result).toEqual(['', []])
  })

  test('有效的limit值', () => {
    const result = limitUnit(10)
    expect(result).toEqual(['LIMIT ?', [10]])
  })

  test('无效的limit值', () => {
    expect(() => limitUnit(-1)).toThrow('Invalid limit value')
    expect(() => limitUnit(0)).toThrow('Invalid limit value')
    expect(() => limitUnit(1.5)).toThrow('Invalid limit value')
  })
})
