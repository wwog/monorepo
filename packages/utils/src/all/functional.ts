/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/**
 * @description 组合函数, 从左到右执行
 * @description_en Compose function, execute from left to right
 */
export const composeFn = <T>(...fns: Array<(arg: T) => T>) => {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg)
}

/**
 * @description 组合函数, 从右到左执行
 * @description_en Compose function, execute from right to left
 */
export const composeFnRight = <T>(...fns: Array<(arg: T) => T>) => {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg)
}

/**
 * @description 生成一个只调用一次的函数, 该函数只会调用一次
 * @description_en Given a function, returns a function that is only calling that function once.
 */
export function createSingleCallFunction<T extends Function>(
  this: unknown,
  fn: T,
  fnDidRunCallback?: () => void,
): T {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const _this = this
  let didCall = false
  let result: unknown

  return function () {
    if (didCall) {
      return result
    }

    didCall = true
    if (fnDidRunCallback) {
      try {
        // eslint-disable-next-line prefer-rest-params
        result = fn.apply(_this, arguments)
      } finally {
        fnDidRunCallback()
      }
    } else {
      // eslint-disable-next-line prefer-rest-params
      result = fn.apply(_this, arguments)
    }

    return result
  } as unknown as T
}
