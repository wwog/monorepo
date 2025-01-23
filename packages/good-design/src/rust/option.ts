import { OptionKind, OptionKindKey } from './constants'
import { Err, Ok, type Result } from './result'
import { assertOption, assertResult } from './utils'

/**
 * No value
 */
export interface None extends Option<never> {
  readonly [OptionKindKey]: 'None'
  isSome(): false
  isSomeAnd(predicate: (value: never) => boolean): false
  isNone(): true
  isNoneOr<T extends boolean>(predicate: (value: never) => T): T
  expect(msg: string): never
  unwrap(): never
  unwrapOr<T>(defaultValue: T): T
  unwrapOrElse<T>(f: () => T): T
  map<U>(f: (value: never) => U): None
  mapOr<U>(defaultValue: U, f: (value: never) => U): U
  mapOrElse<U>(defaultFn: () => U, f: (value: never) => U): U
  okOr<E>(error: E): Result<never, E>
  okOrElse<E>(error: () => E): Result<never, E>
  and<U>(optb: Option<U>): None
  andThen<U>(f: (value: never) => Option<U>): None
  filter(predicate: (value: never) => boolean): None
  or<T>(optb: Option<T>): Option<T>
  orElse<T>(f: () => Option<T>): Option<T>
  xor<T>(optb: Option<T>): Option<T>
  inspect(f: (value: never) => void): this
  zip<U>(other: Option<U>): None
  zipWith<U, V>(other: Option<U>, f: (a: never, b: U) => V): None
  unzip(): [None, None]
  transpose(): Result<None, never>
  flatten(): None
}

/**
 * Optional values.
 * @description Type Option represents an optional value: every Option is either Some and contains a value, or None, and does not.
 * Option types are very common in Rust code, as they have a number of uses:
 * - Initial values
 * - Return values for functions that are not defined for every possible input (e.g., the parse method)
 * - Return value for otherwise reporting simple errors, where None is returned on error
 * - Optional struct fields
 * - Optional function arguments
 *
 * {@Link Option} are commonly paired with pattern matching to query the presence of a value and take action, always accounting for the None case.
 */
export interface Option<T> {
  /**
   * [object Option].
   * @private
   */
  readonly [Symbol.toStringTag]: 'Option'
  /**
   * Identify `Some` or `None`.
   *
   * @private
   */
  readonly [OptionKindKey]: OptionKind
  /**
   * toString() method returns a string representing the object.
   */
  toString(): string
  /**
   * Returns `true` if the option is a Some value.
   * @example
   * const x = Some(2);
   * assert(x.isSome(),true);
   */
  isSome(): boolean
  /**
   * Returns `true` if the option is a Some and the value inside of it matches a predicate.
   * @example
   * const x = Some(2);
   * assert(x.isSomeAnd((value) => value === 2),true);
   */
  isSomeAnd(predicate: (value: T) => boolean): boolean
  /**
   * Returns `true` if the option is a None value.
   * @example
   * const x = None();
   * assert(x.isNone(),true);
   */
  isNone(): boolean
  /**
   * Returns `true` if the option is a None or the value inside of it does not match a predicate.
   * @example
   * const x = Some(2);
   * assert(x.isNoneOr((value) => value > 1),true);
   * const x = Some(0)
   * assert(x.isNoneOr((value) => value > 1),false);
   * const x = None();
   * assert(x.isNoneOr((value) => value > 1),true);
   */
  isNoneOr(predicate: (value: T) => boolean): boolean
  /**
   * Returns the contained Some value.
   * @description Error if the value is a None with a error message provided by msg.
   * @error if the value is a None, with a custom error message provided by msg.
   * @example
   * const x = Some(2);
   * assert(x.expect("the world is ending"),2);
   */
  expect(msg: string): T
  /**
   * Returns the contained Some value.
   * @description
   * Because this function may error, its use is generally discouraged.
   * Instead, prefer to use pattern matching and handle the None case explicitly, or call unwrap_or, unwrap_or_else.
   * @error if the value is a None
   * @example
   * const x = Some(2);
   * assert(x.unwrap(),2);
   */
  unwrap(): T
  /**
   * Returns the contained Some value or a default.
   * @description Consumes the self argument then, if Some, returns the contained value, otherwise if None, returns the provided default value.
   * @flag lazily evaluated
   * @example
   * const x = Some(2);
   * assert(x.unwrapOr(0),2);
   * const x = None();
   * assert(x.unwrapOr(0),0);
   */
  unwrapOr(defaultValue: T): T
  /**
   * Returns the contained Some value or computes it from a closure.
   * @description Consumes the self argument then, if Some, returns the contained value, otherwise if None, calls the provided closure.
   * @example
   * const x = Some(2);
   * assert(x.unwrapOrElse(() => 0),2);
   * const x = None();
   * assert(x.unwrapOrElse(() => 0),0);
   */
  unwrapOrElse(f: () => T): T
  /**
   * Maps an Option<T> to Option<U> by applying a function to a contained value (if Some) or returns None (if None).
   * @example
   * const x = Some(2);
   * assert(x.map((value) => value * 2),Some(4));
   */
  map<U>(f: (value: T) => U): Option<U>
  /**
   * Returns the provided default (if None) or applies a function to the contained value (if Some) and returns the result.
   * @example
   * const x = Some("foo");
   * assert(x.mapOr(42, (value) => value.length),3);
   */
  mapOr<U>(defaultValue: U, f: (value: T) => U): U
  /**
   * Computes a default function result (if none), or applies a different function to the contained value (if any).
   * @example
   * const x = Some("foo");
   * assert(x.mapOrElse(() => 42, (value) => value.length),3);
   * const x = None();
   * assert(x.mapOrElse(() => 42, (value) => value.length),42);
   */
  mapOrElse<U>(defaultFn: () => U, f: (value: T) => U): U
  /**
   * Transforms the Option<T> into a Result<T, E>, mapping Some(v) to Ok(v) and None to Err(err).
   * @description Arguments passed to ok_or are eagerly evaluated; if you are passing the result of a function call, it is recommended to use ok_or_else
   * @example
   * const x = Some(2);
   * assert(x.okOr("the world is ending"),OK(2));
   */
  okOr<E>(error: E): Result<T, E>
  /**
   * Transforms the Option<T> into a Result<T, E>, mapping Some(v) to Ok(v) and None to Err(err()).
   * @example
   * const x = Some(2);
   * assert(x.okOrElse(() => "the world is ending"),OK(2));
   */
  okOrElse<E>(error: () => E): Result<T, E>
  /**
   * Returns None if the option is None, otherwise returns optb.
   * @description Arguments passed to and are eagerly evaluated; if you are passing the result of a function call, it is recommended to use and_then
   * @example
   * const x = Some(2);
   * const y = Some(3);
   * assert(x.and(y),Some(3));
   */
  and<U>(optb: Option<U>): Option<U>
  /**
   * Returns None if the option is None, otherwise calls f with the wrapped value and returns the result.
   * Some languages call this operation flatmap.
   * @example
   * const x = Some(2);
   * const y = Some(3);
   * assert(x.andThen((value) => y),Some(3));
   */
  andThen<U>(f: (value: T) => Option<U>): Option<U>
  /**
   * Returns None if the option is None, otherwise calls predicate with the wrapped value and returns:
   * - Some(t) if predicate returns true (where t is the wrapped value), and
   * - None if predicate returns false.
   * @example
   * const x = Some(2);
   * assert(x.filter((value) => value === 2),Some(2));
   */
  filter(predicate: (value: T) => boolean): Option<T>
  /**
   * Returns the option if it contains a value, otherwise returns optb.
   * @description Arguments passed to or are eagerly evaluated; if you are passing the result of a function call, it is recommended to use or_else, which is lazily evaluated.
   * @example
   * const x = Some(2);
   * const y = Some(3);
   * assert(x.or(y),Some(2));
   */
  or(optb: Option<T>): Option<T>
  /**
   * Returns the option if it contains a value, otherwise calls f and returns the result.
   * @example
   * const x = Some(2);
   * const y = Some(3);
   * assert(x.orElse(() => y),Some(2));
   */
  orElse(f: () => Option<T>): Option<T>
  /**
   * Returns Some if exactly one of self, optb is Some, otherwise returns None.
   * @example
   * const x = Some(2);
   * const y = None;
   * assert(x.xor(y),Some(2));
   */
  xor(optb: Option<T>): Option<T>
  /**
   * Calls a function to the contained value if Some.
   * @returns Returns the original option.
   * @example
   * const x = Some(2);
   * x.inspect((value) => console.log(value)).expect("the world is ending");
   */
  inspect(f: (value: T) => void): Option<T>
  /**
   * Zips self with another Option.
   * If self is Some(s) and other is Some(o), this method returns Some((s, o)). Otherwise, None is returned.
   * @example
   * const x = Some(2);
   * const y = Some(3);
   * assert(x.zip(y),Some([2,3]));
   */
  zip<U>(other: Option<U>): Option<[T, U]>
  /**
   * Zips self and another Option with function f.
   * If self is Some(s) and other is Some(o), this method returns Some(f(s, o)). Otherwise, None is returned.
   * @example
   * const x = Some(2);
   * const y = Some(3);
   * assert(x.zipWith(y, (a, b) => a + b),Some(5));
   */
  zipWith<U, V>(other: Option<U>, f: (a: T, b: U) => V): Option<V>
  /**
   * Unzips an option containing a tuple of two options.
   * If self is Some((a, b)) this method returns (Some(a), Some(b)). Otherwise, (None, None) is returned.
   * @example
   * const x = Some([2,3]);
   * const [a, b] = x.unzip();
   */
  unzip<A, B>(): [Option<A>, Option<B>]
  /**
   * Transposes an Option of a Result into a Result of an Option.
   * None will be mapped to Ok(None). Some(Ok(_)) and Some(Err(_)) will be mapped to Ok(Some(_)) and Err(_).
   * @example
   * const x = Some(OK(2));
   * assert(x.transpose(),OK(Some(2)));
   */
  transpose<T, E>(this: Option<Result<T, E>>): Result<Option<T>, E>
  /**
   * Converts from Option<Option<T>> to Option<T>.
   * @example
   * const x = Some(Some(2));
   * assert(x.flatten(),Some(2));
   */
  flatten(this: Option<Option<T>>): Option<T>
  /**
   * PartialEq
   */
  equals(other: Option<T>): boolean
}

export const None = Object.freeze<None>({
  [Symbol.toStringTag]: 'Option',
  [OptionKindKey]: 'None',
  isSome() {
    return false
  },
  isSomeAnd: function (predicate: (value: never) => boolean): false {
    throw false
  },
  isNone: function (): true {
    return true
  },
  isNoneOr: function <T extends boolean>(predicate: (value: never) => T): T {
    return predicate(undefined as never)
  },
  expect: function (msg: string): never {
    throw new TypeError(msg)
  },
  unwrap: function (): never {
    throw new TypeError('Called `unwrap` on a `None` value')
  },
  unwrapOr: function <T>(defaultValue: T): T {
    return defaultValue
  },
  unwrapOrElse: function <T>(f: () => T): T {
    return f()
  },
  map: function <U>(f: (value: never) => U): None {
    return None
  },
  mapOr: function <U>(defaultValue: U, f: (value: never) => U): U {
    return defaultValue
  },
  mapOrElse: function <U>(defaultFn: () => U, f: (value: never) => U): U {
    return defaultFn()
  },
  okOr: function <E>(error: E): Result<never, E> {
    return Err(error)
  },
  okOrElse: function <E>(error: () => E): Result<never, E> {
    return Err(error())
  },
  and: function <U>(optb: Option<U>): None {
    return None
  },
  andThen: function <U>(f: (value: never) => Option<U>): None {
    return None
  },
  filter: function (predicate: (value: never) => boolean): None {
    return None
  },
  or: function <T>(optb: Option<T>): Option<T> {
    assertOption(optb)
    return optb
  },
  orElse: function <T>(f: () => Option<T>): Option<T> {
    return f()
  },
  xor: function <T>(optb: Option<T>): Option<T> {
    assertOption(optb)
    return optb
  },
  inspect: function (f: (value: never) => void): None {
    return None
  },
  zip: function <U>(other: Option<U>): None {
    return None
  },
  zipWith: function <U, V>(other: Option<U>, f: (a: never, b: U) => V): None {
    return None
  },
  unzip: function (): [None, None] {
    return [None, None]
  },
  transpose: function (): Result<None, never> {
    return Ok(None)
  },
  flatten: function (): None {
    return None
  },
  toString: function (): string {
    return 'None'
  },
  equals: function (other: Option<never>): boolean {
    return other.isNone()
  },
})

/**
 * Some value of type T
 */
export function Some<T>(value: T): Option<T> {
  const some: Option<T> = {
    [Symbol.toStringTag]: 'Option',
    [OptionKindKey]: 'Some',

    isSome(): boolean {
      return true
    },
    isSomeAnd(predicate: (value: T) => boolean): boolean {
      return predicate(value)
    },
    isNone(): boolean {
      return false
    },
    isNoneOr(predicate) {
      return predicate(value)
    },
    expect() {
      return value
    },
    unwrap() {
      return value
    },
    unwrapOr() {
      return value
    },
    unwrapOrElse() {
      return value
    },
    map(f) {
      return Some(f(value))
    },
    mapOr(_, f) {
      return f(value)
    },
    mapOrElse(_, f) {
      return f(value)
    },
    okOr(error) {
      return Ok(value)
    },
    okOrElse(error) {
      return Ok(value)
    },
    and(optb) {
      assertOption(optb)
      return optb
    },
    andThen(f) {
      return f(value)
    },
    filter(predicate) {
      return predicate(value) ? some : None
    },
    or() {
      return some
    },
    orElse() {
      return some
    },
    xor(optb) {
      assertOption(optb)
      return optb.isSome() ? None : some
    },
    inspect(f) {
      f(value)
      return some
    },
    zip(other) {
      assertOption(other)
      return other.isSome() ? Some([value, other.unwrap()]) : None
    },
    zipWith(other, f) {
      assertOption(other)
      return other.isSome() ? Some(f(value, other.unwrap())) : None
    },
    unzip<T, U>(): [Option<T>, Option<U>] {
      const tuple = value as unknown as [T, U]
      if (Array.isArray(tuple) && tuple.length === 2) {
        return [Some(tuple[0]), Some(tuple[1])]
      }
      throw new TypeError('Expected a tuple of two elements')
    },
    transpose<T, E>(): Result<Option<T>, E> {
      const r = value as unknown as Result<T, E>
      assertResult(r)
      return r.isOk() ? Ok(Some(r.unwrap())) : Err(r.unwrapErr())
    },
    flatten() {
      const o = value as unknown as Option<T>
      assertOption(o)
      return o
    },
    toString() {
      return `Some(${value})`
    },
    equals(other) {
      assertOption(other)
      return other.isSome() && other.unwrap() === value
    },
  } as const

  return some
}
