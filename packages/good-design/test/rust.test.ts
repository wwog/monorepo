import { match } from '../src/rust/mod'
//vitest
import { None, Some } from '../src/rust/option'
import { Err, Ok } from '../src/rust/result'
import { describe, it, expect, vitest } from 'vitest'

describe('matchOption', () => {
  it('should match Some', () => {
    const opt = Some('test')
    const result = match(opt, {
      Some: (value) => 10086,
      None: () => 0,
    })
    expect(result).toBe(10086)
  })

  it('should match None', () => {
    const opt = None
    const result = match(opt, {
      Some: (value) => 10086,
      None: () => 0,
    })
    expect(result).toBe(0)
  })

})
