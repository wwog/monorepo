import { ResultKindKey } from './constants'
import { None, Some, type Option } from './option'
import { assertOption, assertResult } from './utils'

/**
 * Error handling with the Result type.
 * Result is a type that represents either success (Ok) or failure (Err).
 */
export interface Result<T, E> {
  readonly [Symbol.toStringTag]: 'Result'
  readonly [ResultKindKey]: 'Ok' | 'Err'
  /**
   * toString() method returns a string representing the object.
   */
  toString(): string
  /**
   * Returns `true` if the result is OK.
   * @example
   * const x = OK(-3)
   * assert(x.isOk(),true)
   */
  isOk(): boolean
  /**
   * Returns `true` if the result is Ok and the value inside of it matches a predicate.
   * @example
   * const x = OK(-3)
   * assert(x.isOkAnd((value) => value < 0),true)
   */
  isOkAnd(predicate: (value: T) => boolean): boolean
  /**
   * Returns `true` if the result is Err.
   * @example
   * const x = Err("Some error message")
   * assert(x.isErr(),true)
   */
  isErr(): boolean
  /**
   * Returns `true` if the result is Err and the value inside of it matches a predicate.
   * @example
   * const x = Err("Some error message")
   * assert(x.isErrAnd((value) => value === "Some error message"),true)
   */
  isErrAnd(predicate: (value: E) => boolean): boolean
  /**
   * Converts from Result<T, E> to Option<T>.
   * Converts self into an Option<T>, consuming self, and discarding the error, if any.
   * @example
   * const x = OK(2)
   * assert(x.ok(),Some(2))
   */
  ok(): Option<T>
  /**
   * Converts from Result<T, E> to Option<E>.
   * Converts self into an Option<E>, consuming self, and discarding the success value, if any.
   * @example
   * const x = Err("Nothing here")
   * assert(x.err(),Some("Nothing here"))
   */
  err(): Option<E>
  /**
   * Maps a Result<T, E> to Result<U, E> by applying a function to a contained Ok value, leaving an Err value untouched.
   * This function can be used to compose the results of two functions.
   * @example
   * const x = OK(21)
   * const y = x.map((value) => value * 2)
   * assert(y,OK(42))
   */
  map<U>(fn: (value: T) => U): Result<U, E>
  /**
   * Returns the provided default (if Err), or applies a function to the Ok value.
   * @example
   * const x = OK("foo")
   * assert(x.mapOr(42,(value) => value.length),3)
   */
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U
  /**
   * Maps a Result<T, E> to U by applying fallback function default to a contained Err value, or function f to a contained Ok value.
   * @example
   * const k = 10
   * const x = Err("bar")
   * assert(x.mapOrElse((value) => k * 2,(value) => value.length),20)
   */
  mapOrElse<U>(defaultFn: (error: E) => U, fn: (value: T) => U): U
  /**
   * Maps a Result<T, E> to Result<T, F> by applying a function to a contained Err value, leaving an Ok value untouched.
   * This function can be used to pass through a successful result while handling an error.
   * @example
   * const x = Err("foo")
   * const y = x.mapErr((value) => value.length)
   * assert(y,Err(3))
   */
  mapErr<F>(fn: (error: E) => F): Result<T, F>
  /**
   * Calls a function with a reference to the value if {@link Ok}.
   * @example
   * const x = OK(2)
   * x.inspect((value) => console.log(value))
   */
  inspect(fn: (value: T) => void): Result<T, E>
  /**
   * Calls a function with a reference to the contained value if {@link Err}.
   */
  inspectErr(fn: (error: E) => void): Result<T, E>
  /**
   * Returns the contained Ok value, consuming the self value.
   * Because this function may panic, its use is generally discouraged.
   * Instead, prefer to use pattern matching and handle the Err case explicitly, or call unwrap_or, unwrap_or_else, or unwrap_or_default.
   * @example
   * const x = OK(2)
   * x.expect("The world is ending")
   */
  expect(message: string): T
  /**
   * Returns the contained Ok value, consuming the self value.
   * Because this function may panic, its use is generally discouraged.
   * Instead, prefer to use pattern matching and handle the Err case explicitly, or call unwrap_or, unwrap_or_else, or unwrap_or_default.
   * @example
   * const x = OK(2)
   * x.unwrap() //2
   */
  unwrap(): T
  /**
   * Returns the contained Err value, consuming the self value.
   * Error if the value is an Ok, with a panic message including the passed message, and the content of the Ok.
   * @example
   * const x = OK(2)
   * x.expectErr("The world is ending") //throw "ExpectErr With 'The world is ending' : 2"
   * const y = Err("emergency failure")
   * y.expectErr("The world is ending") // "The world is ending"
   */
  expectErr(message: string): E
  /**
   * Returns the contained Err value, consuming the self value.
   * @example
   * const x = Err("emergency failure")
   * x.unwrapErr() // "emergency failure"
   */
  unwrapErr(): E
  /**
   * Returns res if the result is Ok, otherwise returns the Err value of self.
   * Arguments passed to and are eagerly evaluated;
   * if you are passing the result of a function call, it is recommended to use and_then
   * @example
   * const x = OK(2)
   * const y = OK(9)
   * assert(x.and(y),OK(9))
   * const x = Err("error")
   * const y = OK(2)
   * assert(x.and(y),Err("error"))
   */
  and<U>(res: Result<U, E>): Result<U, E>
  /**
   * Calls op if the result is Ok, otherwise returns the Err value of self.
   * This function can be used for control flow based on result values.
   * @example
   * const sq = (x: number) => OK(x * x)
   * const err = (x: number) => Err("error")
   * assert(OK(2).andThen(sq).andThen(sq),OK(16))
   * assert(OK(2).andThen(sq).andThen(err),Err("error"))
   * assert(OK(2).andThen(err).andThen(sq),Err("error"))
   * assert(Err("error").andThen(sq).andThen(sq),Err("error"))
   */
  andThen<U>(op: (value: T) => Result<U, E>): Result<U, E>
  /**
   * Returns res if the result is Err, otherwise returns the Ok value of self.
   * Arguments passed to or are eagerly evaluated;
   * if you are passing the result of a function call, it is recommended to use or_else
   * @example
   * const x = OK(2)
   * const y = OK(9)
   * assert(x.or(y),OK(2))
   * const x = Err("error")
   * const y = OK(2)
   * assert(x.or(y),OK(2))
   */
  or<F>(res: Result<T, F>): Result<T, F>
  /**
   * Calls op if the result is Err, otherwise returns the Ok value of self.
   * @example
   * const sq = (x: number) => OK(x * x)
   * const err = (x: number) => Err(x)
   * assert(OK(2).orElse(sq).orElse(sq),OK(2))
   * assert(OK(2).orElse(err).orElse(sq),OK(4))
   * assert(Err(3).orElse(sq).orElse(err),OK(9))
   * assert(Err(3).orElse(err).orElse(err),Err(3))
   */
  orElse<F>(op: (error: E) => Result<T, F>): Result<T, F>
  /**
   * Returns the contained Ok value or a provided default.
   * @example
   * const x = OK(2)
   * assert(x.unwrapOr(10),2)
   * const x = Err("error")
   * assert(x.unwrapOr(10),10)
   */
  unwrapOr(defaultValue: T): T
  /**
   * Returns the contained Ok value or computes it from a closure.
   * @example
   * const k = 10
   * const x = Err("error")
   * assert(x.unwrapOrElse(() => k * 2),20)
   */
  unwrapOrElse(fn: () => T): T
  /**
   * Transposes a Result of an Option into an Option of a Result.
   * Ok(None) will be mapped to None. Ok(Some(_)) and Err(_) will be mapped to Some(Ok(_)) and Some(Err(_)).
   * @example
   * const x = OK(Some(2))
   * assert(x.transpose(),Some(OK(2)))
   */
  transpose(): Option<Result<T, E>>
  /**
   * Converts from Result<Result<T,E>,E> to Result<T,E> by flattening the inner Result.
   */
  flatten(): Result<T, E>
  /**
   * PartialEq
   */
  equals(other: Result<T, E>): boolean
}

/**
 * Contains the success value
 */
export function Ok<E>(): Result<void, E>
export function Ok<T, E>(value: T): Result<T, E>
export function Ok<T, E>(value?: T): Result<T, E> {
  const ok: Result<T, E> = {
    [Symbol.toStringTag]: 'Result',
    [ResultKindKey]: 'Ok',
    toString() {
      return `Ok(${value})`
    },
    isOk() {
      return true
    },
    isOkAnd(predicate) {
      return predicate(value as T)
    },
    isErr() {
      return false
    },
    isErrAnd() {
      return false
    },
    ok() {
      return Some(value as T)
    },
    err() {
      return None
    },
    map(fn) {
      return Ok(fn(value as T))
    },
    mapOr(defaultValue, fn) {
      return fn(value as T)
    },
    mapOrElse(defaultValue, fn) {
      return fn(value as T)
    },
    mapErr() {
      return Ok(value as T)
    },
    inspect(fn) {
      fn(value as T)
      return ok
    },
    inspectErr() {
      return ok
    },
    expect() {
      return value as T
    },
    unwrap() {
      return value as T
    },
    expectErr(message: string) {
      throw TypeError(`ExpectErr With '${message}' : ${value}`)
    },
    unwrapErr() {
      throw TypeError(`UnwrapErr : ${value}`)
    },
    and(res) {
      assertResult(res)
      return res
    },
    andThen(op) {
      const res = op(value as T)
      assertResult(res)
      return res
    },
    or<F>(res: Result<T, F>): Result<T, F> {
      return ok as unknown as Result<T, F>
    },
    orElse<F>(_fn: (error: E) => Result<T, F>): Result<T, F> {
      return ok as unknown as Result<T, F>
    },
    unwrapOr() {
      return value as T
    },
    unwrapOrElse() {
      return value as T
    },
    transpose() {
      const option = value as Option<T>
      assertOption(option)
      return option.isSome() ? Some(Ok(option.unwrap())) : None
    },
    flatten() {
      assertResult(value as Result<T, E>)
      return value as Result<T, E>
    },
    equals(other) {
      assertResult(other)
      return other.isOk() && other.unwrap() === value
    },
  }
  return ok
}

/**
 * Contains the error value.
 */
export function Err<T, E>(error: E): Result<T, E> {
  const err: Result<T, E> = {
    [Symbol.toStringTag]: 'Result',
    [ResultKindKey]: 'Err',
    toString() {
      return `Err(${error})`
    },
    isOk() {
      return false
    },
    isOkAnd() {
      return false
    },
    isErr() {
      return true
    },
    isErrAnd(predicate) {
      return predicate(error)
    },
    ok() {
      return None
    },
    err() {
      return Some(error)
    },
    map() {
      return Err(error)
    },
    mapOr(defaultValue) {
      return defaultValue
    },
    mapOrElse(defaultFn, _fn) {
      return defaultFn(error)
    },
    mapErr(fn) {
      return Err(fn(error))
    },
    inspect() {
      return err
    },
    inspectErr(fn) {
      fn(error)
      return err
    },
    expectErr() {
      return error
    },
    unwrapErr() {
      return error
    },
    expect(message: string) {
      throw TypeError(`${message} : ${error}`)
    },
    unwrap() {
      throw TypeError(`Unwrap : ${error}`)
    },
    and<U>(res: Result<U, E>): Result<U, E> {
      return err as unknown as Result<U, E>
    },
    andThen<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
      return err as unknown as Result<U, E>
    },
    or(res) {
      assertResult(res)
      return res
    },
    orElse(fn) {
      return fn(error)
    },
    unwrapOr(defaultValue) {
      return defaultValue
    },
    unwrapOrElse(fn) {
      return fn()
    },
    transpose() {
      return Some(Err(error))
    },
    flatten() {
      return err
    },
    equals(other) {
      assertResult(other)
      return other.isErr() && other.unwrapErr() === error
    },
  }
  return err
}
