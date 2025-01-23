import { Option } from './option'
import { Result } from './result'
import { isOption, isResult } from './utils'

type MatchOption<T, U> = {
  Some: (value: T) => U
  None: () => U
}

type MatchResult<T, E, U> = {
  Ok: (value: T) => U
  Err: (error: E) => U
}

type Matcher<T, E, U> = MatchOption<T, U> | MatchResult<T, E, U>

/**
 * To match 'Option' and 'Result', all possibilities must be exhausted.
 * @example
 * const opt = Some('test')
 * const result = match(opt, {
 *    Some: (value) => 10086,
 *    None: () => 0,
 * })
 * expect(result).toBe(10086)
 */
export function match<U, T, E>(
  value: Option<T> | Result<T, E>,
  matcher: Matcher<T, E, U>,
): U {
  if (isOption(value)) {
    const optMatcher = matcher as MatchOption<T, U>
    if (!optMatcher.Some || !optMatcher.None) {
      throw new Error('Non-exhaustive match for Option')
    }
    return value.isSome() ? optMatcher.Some(value.unwrap()) : optMatcher.None()
  }
  if (isResult(value)) {
    const resMatcher = matcher as MatchResult<T, E, U>
    if (!resMatcher.Ok || !resMatcher.Err) {
      throw new Error('Non-exhaustive match for Result')
    }
    return value.isOk()
      ? resMatcher.Ok(value.unwrap())
      : resMatcher.Err(value.unwrapErr())
  }
  throw new TypeError('This is not an Option or Result')
}
