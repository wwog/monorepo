import { describe, it, expect } from 'vitest'
import {
  getRandomIntInclusive,
  getRandomIntExclusive,
  getRandomIntExcludeMax,
  getRandomString,
} from '../src/random'

describe('random.ts', () => {
  it('getRandomIntInclusive should return a number within the range inclusive', () => {
    const min = 1
    const max = 10
    const result = getRandomIntInclusive(min, max)
    expect(result).toBeGreaterThanOrEqual(min)
    expect(result).toBeLessThanOrEqual(max)
  })

  it('getRandomIntExclusive should return a number within the range exclusive', () => {
    const min = 1
    const max = 10
    const result = getRandomIntExclusive(min, max)
    expect(result).toBeGreaterThan(min)
    expect(result).toBeLessThan(max)
  })

  it('getRandomIntExcludeMax should return a number within the range excluding max', () => {
    const min = 1
    const max = 10
    const result = getRandomIntExcludeMax(min, max)
    expect(result).toBeGreaterThanOrEqual(min)
    expect(result).toBeLessThan(max)
  })

  it('getRandomString should return a string of specified length', () => {
    const length = 8
    const result = getRandomString(length)
    expect(result).toHaveLength(length)
  })

  it('getRandomString should return a string containing only specified characters', () => {
    const length = 8
    const chars = 'abc'
    const result = getRandomString(length, chars)
    for (const char of result) {
      expect(chars).toContain(char)
    }
  })

  it('getRandomIntInclusive should return a number within the range inclusive', () => {
    for (let i = 0; i < 100; i++) {
      const min = 1
      const max = 10
      const result = getRandomIntInclusive(min, max)
      expect(result).toBeGreaterThanOrEqual(min)
      expect(result).toBeLessThanOrEqual(max)
    }
  })
})
