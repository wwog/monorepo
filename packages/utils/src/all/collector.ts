//#region Collector
export type BatchFunction<Args extends any[], Result> = (
  argsList: Args[],
) => Result

export interface CollectorOptions<Args extends any[], Result = any> {
  /**
   * @description 最大收集数量
   * @description_en Maximum number of collections
   */
  maxCount?: number
  /**
   * @description 超时自动执行(毫秒)
   * @description_en Timeout to automatically execute (milliseconds)
   */
  waitMs?: number
  /**
   * @description 自动执行,开启后您必须传递waitMs或者maxCount(否则报错),默认为true. 当你想要手动调用时,可以设置为false
   * @description_en Automatically execute, must pass waitMs or maxCount (otherwise an error will be reported), the default is true. When you want to manually call it, you can set it to false
   */
  autoFlush?: boolean
  /**
   * @description 执行前回调，可以通过返回false来阻止执行
   * @description_en Callback before execution, can return false to prevent execution
   */
  onBeforeFlush?: (argsList: Args[]) => void | boolean | Promise<void | boolean>
  /**
   * @description 执行后回调
   * @description_en Callback after execution
   */
  onAfterFlush?: (result: Result, argsList: Args[]) => void | Promise<void>
  /**
   * @description 错误回调
   * @description_en Error callback
   */
  onError?: (error: Error, argsList: Args[]) => void | Promise<void>
}

export interface CollectedFunction<Args extends any[], Result = any>
  extends Function {
  (...args: Args): void
  /**
   * @description 手动执行,满足条件的执行会返回结果,否则会返回undefined
   * @description_en Manually execute, the execution that satisfies the condition will return the result, otherwise it will return undefined
   */
  flush(): Promise<Result | undefined>
  /**
   * @description 动态更新配置
   * @description_en Dynamically update configuration
   */
  updateOptions(options: Partial<CollectorOptions<Args>>): void
}

/**
 * @description 创建一个收集器
 * @description_en Create a collector
 * @example
 * ```ts
 * // manual mode
 * const collector = createCollector((argsList) => {
 *   return argsList.map((args) => {
 *     return args.reduce((acc, curr) => acc + curr, 0)
 *   })
 * })
 * collector(1, 2, 3)
 * collector(4, 5, 6)
 * collector(7, 8, 9)
 * collector.flush() // [6, 15, 24]
 * ```
 * ```ts
 * // auto mode
 * const collector = createCollector((argsList) => {
 *   return argsList.map((args) => {
 *     return args.reduce((acc, curr) => acc + curr, 0)
 *   })
 * }, {
 *   autoFlush: true,
 *   waitMs: 1000,
 * })
 * collector(1, 2, 3)
 * collector(4, 5, 6)
 */
export function createCollector<Args extends any[], Result = any>(
  batchFn: BatchFunction<Args, Result>,
  options?: CollectorOptions<Args, Result>,
) {
  const autoFlush = options?.autoFlush ?? true
  const checkOptions = () => {
    if (autoFlush === false) {
      return
    }
    if (options?.waitMs === undefined && options?.maxCount === undefined) {
      throw new Error('waitMs or maxCount must be provided')
    }
    if (
      options?.waitMs !== undefined &&
      (options?.waitMs <= 0 || options?.waitMs === Infinity)
    ) {
      throw new Error('waitMs must be a positive number')
    }
    if (options?.maxCount !== undefined && options?.maxCount <= 0) {
      throw new Error('maxCount must be a positive number')
    }
  }

  checkOptions()

  let currentOptions: CollectorOptions<Args, Result> = {
    ...options,
  }

  let buffer: Args[] = []
  let timer: ReturnType<typeof setTimeout> | null = null

  const scheduleFlush = () => {
    if (timer) {
      return
    }
    if (
      currentOptions.waitMs === undefined ||
      currentOptions.waitMs === Infinity ||
      currentOptions.waitMs <= 0
    ) {
      return
    }
    timer = setTimeout(() => {
      flush()
    }, currentOptions.waitMs)
  }

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
  const checkFlush = () => {
    if (buffer.length >= (currentOptions.maxCount ?? Infinity)) {
      return flush()
    }
    scheduleFlush()
    return Promise.resolve()
  }

  const reset = () => {
    buffer = []
    clearTimer()
  }

  const flush = async () => {
    if (buffer.length === 0) {
      return
    }
    const currentBuffer = [...buffer]
    reset()

    let shouldProceed = true
    if (currentOptions.onBeforeFlush) {
      try {
        const result = await currentOptions.onBeforeFlush(currentBuffer)
        if (result === false) {
          shouldProceed = false
        }
      } catch (error) {
        if (currentOptions.onError) {
          await currentOptions.onError(error as Error, currentBuffer)
        }
        shouldProceed = false
      }
    }
    if (!shouldProceed) {
      buffer.unshift(...currentBuffer)
      scheduleFlush()
      return
    }
    let result: Result = undefined as Result
    try {
      result = (await batchFn(currentBuffer)) as Result
      if (currentOptions.onAfterFlush) {
        await currentOptions.onAfterFlush(result, currentBuffer)
      }
    } catch (error) {
      if (currentOptions.onError) {
        await currentOptions.onError(error as Error, currentBuffer)
      } else {
        throw error
      }
    }
    return result
  }

  const collectedFn = (...args: Args) => {
    buffer.push(args)
    checkFlush()
  }

  collectedFn.flush = flush
  collectedFn.updateOptions = (
    partialOptions: Partial<CollectorOptions<Args>>,
  ) => {
    Object.assign(currentOptions, partialOptions)
  }

  return collectedFn as CollectedFunction<Args>
}
