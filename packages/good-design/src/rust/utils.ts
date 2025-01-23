import { OptionKindKey, ResultKindKey } from './constants'
import type { Option } from './option'
import type { Result } from './result'

export function isOption<T>(value: unknown): value is Option<T> {
  return value !== null && typeof value === 'object' && OptionKindKey in value
}

export function isResult<T, E>(value: unknown): value is Result<T, E> {
  return value !== null && typeof value === 'object' && ResultKindKey in value
}

/**
 * Asserts that a given value is an `Option`.
 *
 * @typeParam T - The expected type of the value contained within the `Option`.
 * @param o - The value to be checked as an `Option`.
 * @throws {TypeError} If the value is not an `Option`.
 */
export function assertOption<T>(o: Option<T>): void {
  if (!isOption(o)) {
    throw new TypeError(`This(${o}) is not an Option`)
  }
}

/**
 * Asserts that a given value is a `Result`.
 *
 * @typeParam T - The expected type of the value contained within the `Result`.
 * @typeParam E - The expected type of the error contained within the `Result`.
 * @param r - The value to be checked as a `Result`.
 * @throws {TypeError} If the value is not a `Result`.
 */
export function assertResult<T, E>(r: Result<T, E>): void {
  if (!isResult(r)) {
    throw new TypeError(`This(${r}) is not a Result`)
  }
}
