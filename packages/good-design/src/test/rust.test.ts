import { match } from '../rust/mod'
//vitest
import { None, Some } from '../rust/option'
import { Err, Ok } from '../rust/result'
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
