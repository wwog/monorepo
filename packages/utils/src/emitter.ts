import { Disposable, toDisposable, type IDisposable } from './lifecycle.js'
import { StackTrace } from './stackTrace.js'

export interface EventDeliveryQueue {
  _isEventDeliveryQueue: true
}

/**
 * @description_zh 一个可以订阅的事件，可以有零个或一个参数。事件本身是一个函数。
 * @description_en An event with zero or one parameters that can be subscribed to. The event is a function itself.
 */
export interface Event<T> {
  (listener: (e: T) => unknown, thisArgs?: any): IDisposable
}

export namespace Event {
  /**
   * @description 给定一个事件，返回另一个只触发一次的事件。
   * @description_en Given an event, returns another event which only fires once.
   */
  export function once<T>(event: Event<T>): Event<T> {
    return (listener, thisArgs) => {
      let didFire = false
      let result: IDisposable | undefined = undefined
      result = event((e) => {
        if (didFire) {
          return
        } else if (result) {
          result.dispose()
        } else {
          didFire = true
        }
        return listener.call(thisArgs, e)
      }, null)

      if (didFire) {
        result.dispose()
      }

      return result
    }
  }

  /**
   * @description 从事件中创建一个promise，使用{@link Event.once}助手。
   * @description_en Creates a promise out of an event, using the {@link Event.once} helper.
   */
  export function toPromise<T>(event: Event<T>): Promise<T> {
    return new Promise<T>((resolve) => once(event)(resolve))
  }

  /**
   * @description 将一个promise转换为事件,成功时触发promise的值，失败时触发undefined
   * @description_en Converts a promise to an event. The event fires the value of the promise when it resolves and undefined when it fails.
   */
  export function fromPromise<T>(promise: Promise<T>): Event<T | undefined> {
    const result = new Emitter<T | undefined>()

    promise
      .then(
        (res) => {
          result.fire(res)
        },
        () => {
          result.fire(undefined)
        },
      )
      .finally(() => {
        result.dispose()
      })

    return result.event
  }

  export interface DOMEventEmitter {
    addEventListener(event: string | symbol, listener: Function): void
    removeEventListener(event: string | symbol, listener: Function): void
  }

  /**
   * @description 从DOM事件发射器创建一个{@link Event}。
   * @description_en Creates an {@link Event} from a DOM event emitter.
   */
  export function fromDOMEventEmitter<T>(
    emitter: DOMEventEmitter,
    eventName: string,
    map: (...args: any[]) => T = (id) => id,
  ): Event<T> {
    const fn = (...args: any[]) => result.fire(map(...args))
    const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn)
    const onLastListenerRemove = () =>
      emitter.removeEventListener(eventName, fn)
    const result = new Emitter<T>({
      onWillAddFirstListener: onFirstListenerAdd,
      onDidRemoveLastListener: onLastListenerRemove,
    })

    return result.event
  }

  export interface NodeEventEmitter {
    on(event: string | symbol, listener: Function): unknown
    removeListener(event: string | symbol, listener: Function): unknown
  }

  /**
   * Creates an {@link Event} from a node event emitter.
   */
  export function fromNodeEventEmitter<T>(
    emitter: NodeEventEmitter,
    eventName: string,
    map: (...args: any[]) => T = (id) => id,
  ): Event<T> {
    const fn = (...args: any[]) => result.fire(map(...args))
    const onFirstListenerAdd = () => emitter.on(eventName, fn)
    const onLastListenerRemove = () => emitter.removeListener(eventName, fn)
    const result = new Emitter<T>({
      onWillAddFirstListener: onFirstListenerAdd,
      onDidRemoveLastListener: onLastListenerRemove,
    })

    return result.event
  }

  /**
   * @description 转发事件，将事件转发到另一个发射器
   * @description_en Forwards an event, firing the target emitter when the source event fires.
   * @example
   * Event.forward(source, target)
   */
  export function forward<T>(from: Event<T>, to: Emitter<T>): IDisposable {
    return from((e) => to.fire(e))
  }

  /**
   * @description 运行一个函数并订阅一个事件，当事件触发时运行函数
   * @description_en Runs a function and subscribes to an event, running the function when the event fires.
   * @example
   * ```
   * // 初始化时触发，并在每次数据更改时触发
   * // Initialize on trigger and trigger on every data change
   * runAndSubscribe(dataChangeEvent, () => this._updateUI());
   * ```
   */
  export function runAndSubscribe<T>(
    event: Event<T>,
    handler: (e: T) => unknown,
    initial: T,
  ): IDisposable
  export function runAndSubscribe<T>(
    event: Event<T>,
    handler: (e: T | undefined) => unknown,
  ): IDisposable
  export function runAndSubscribe<T>(
    event: Event<T>,
    handler: (e: T | undefined) => unknown,
    initial?: T,
  ): IDisposable {
    handler(initial)
    return event((e) => handler(e))
  }

  /**
   * @description 给定一个事件，创建一个新的发射器，该事件将根据事件去抖延迟并给出一个触发的所有事件的数组事件对象。
   * @description_en Given an event, creates a new emitter that debounces the event with a delay and gives an array event object of all events that have triggered.
   * @param event
   * @param merge
   * @param delay
   * @param leading
   * @param flushOnListenerRemove
   */
  export function debounce<T>(
    event: Event<T>,
    merge: (last: T | undefined, event: T) => T,
    delay?: number,
    leading?: boolean,
    flushOnListenerRemove?: boolean,
  ): Event<T>
  export function debounce<I, O>(
    event: Event<I>,
    merge: (last: O | undefined, event: I) => O,
    delay?: number,
    leading?: boolean,
    flushOnListenerRemove?: boolean,
  ): Event<O>
  export function debounce<I, O>(
    event: Event<I>,
    merge: (last: O | undefined, event: I) => O,
    delay = 100,
    leading = false,
    flushOnListenerRemove = true,
  ): Event<O> {
    let subscription: IDisposable
    let output: O | undefined = undefined
    let handle: any = undefined
    let numDebouncedCalls = 0
    let doFire: (() => void) | undefined

    const options: EmitterOptions = {
      onWillAddFirstListener() {
        subscription = event((cur) => {
          numDebouncedCalls++
          output = merge(output, cur)

          if (leading && !handle) {
            emitter.fire(output)
            output = undefined
          }

          doFire = () => {
            const _output = output
            output = undefined
            handle = undefined
            if (!leading || numDebouncedCalls > 1) {
              emitter.fire(_output!)
            }
            numDebouncedCalls = 0
          }

          clearTimeout(handle)
          handle = setTimeout(doFire, delay)
        })
      },
      onWillRemoveListener() {
        if (flushOnListenerRemove && emitter.hasListeners()) {
          doFire!()
        }
      },
      onDidRemoveLastListener() {
        doFire = undefined
        subscription.dispose()
      },
    }
    const emitter = new Emitter<O>(options)

    return emitter.event
  }
}

/**
 * @description 事件交付队列的私有实现
 * @description_en Private implementation of an event delivery queue
 */
class EventDeliveryQueuePrivate implements EventDeliveryQueue {
  /**
   * @description 是否是事件交付队列
   */
  declare _isEventDeliveryQueue: true

  /**
   * @description 当前监听器列表中的索引
   * @description_en Index in current's listener list.
   */
  public i = -1

  /**
   * @description 传递的最后一个监听器的索引
   * @description_en The last index in the listener's list to deliver.
   */
  public end = 0

  /**
   * @description 当前正在分发的发射器。Emitter._listeners始终是一个数组。
   * @description_en Emitter currently being dispatched on. Emitter._listeners is always an array.
   */
  public current?: Emitter<any>
  /**
   * @description 当前正在发出的值。仅在`current`存在时定义。
   * @description_en Currently emitting value. Defined whenever `current` is.
   */
  public value?: unknown

  /**
   * @description 将发射器和值排队以进行分发
   * @description_en Enqueues an emitter and value for delivery
   */
  public enqueue<T>(emitter: Emitter<T>, value: T, end: number) {
    this.i = 0
    this.end = end
    this.current = emitter
    this.value = value
  }

  public reset() {
    this.i = this.end // force any current emission loop to stop, mainly for during dispose
    this.current = undefined
    this.value = undefined
  }
}

let id = 0
export class UniqueContainer<T> {
  stack?: StackTrace
  public id = id++
  public readonly value: T
  constructor(value: T) {
    this.value = value
  }
}
type ListenerContainer<T> = UniqueContainer<(data: T) => void>
type ListenerOrListeners<T> =
  | (ListenerContainer<T> | undefined)[]
  | ListenerContainer<T>

const forEachListener = <T>(
  listeners: ListenerOrListeners<T>,
  fn: (c: ListenerContainer<T>) => void,
) => {
  if (listeners instanceof UniqueContainer) {
    fn(listeners)
  } else {
    for (let i = 0; i < listeners.length; i++) {
      const l = listeners[i]
      if (l) {
        fn(l)
      }
    }
  }
}

export interface EmitterOptions {
  /**
   * @description 可选函数，用于在添加第一个监听器之前调用
   * @description_en Optional function that's called *before* the very first listener is added
   */
  onWillAddFirstListener?: Function
  /**
   * @description 可选函数，用于在添加第一个监听器之后调用
   * @description_en Optional function that's called *after* the very first listener is added
   */
  onDidAddFirstListener?: Function
  /**
   * @description 可选函数，用于在添加监听器之后调用
   * @description_en Optional function that's called after a listener is added
   */
  onDidAddListener?: Function
  /**
   * @description 可选函数，用于在移除最后一个监听器后调用
   * @description_en Optional function that's called *after* remove the very last listener
   */
  onDidRemoveLastListener?: Function
  /**
   * @description 可选函数，用于在移除监听器之前调用
   * @description_en Optional function that's called *before* a listener is removed
   */
  onWillRemoveListener?: Function
  /**
   * @description 可选函数，用于在监听器抛出错误时调用。默认为{@link onUnexpectedError}
   * @description_en Optional function that's called when a listener throws an error. Defaults to
   * {@link onUnexpectedError}
   */
  onListenerError?: (e: any) => void
  /**
   * @description 传递一个交付队列，这对于确保跨多个发射器的有序事件交付很有用。
   * @description_en Pass in a delivery queue, which is useful for ensuring. in order event delivery across multiple emitters.
   */
  deliveryQueue?: EventDeliveryQueue
}

export class Emitter<T = void> {
  static EnableInjectStackTrace = false
  static setEnableInjectStackTrace(value: boolean) {
    Emitter.EnableInjectStackTrace = value
  }
  private readonly _options?: EmitterOptions
  private _event?: Event<T>
  private _deliveryQueue?: EventDeliveryQueuePrivate
  private _disposed?: true

  protected _listeners?: ListenerOrListeners<T>
  // listeners可能会包含undefined，因此我们需要一个计数器来跟踪实际的大小
  protected _size = 0

  constructor(options?: EmitterOptions) {
    this._options = options
    this._deliveryQueue = options?.deliveryQueue as
      | EventDeliveryQueuePrivate
      | undefined
  }

  /**
   * @description 返回一个事件，每次发射器发出时都会调用
   * @description_en Returns an Event that is fired whenever the emitter emits
   */
  get event(): Event<T> {
    this._event ??= (callback, thisArgs) => {
      if (this._disposed) {
        return Disposable.None
      }

      if (thisArgs) {
        callback = callback.bind(thisArgs)
      }

      const contained = new UniqueContainer(callback)

      if (Emitter.EnableInjectStackTrace) {
        contained.stack = StackTrace.create()
      }

      if (this._listeners === undefined) {
        this._options?.onWillAddFirstListener?.(this)
        this._listeners = contained
        this._options?.onDidAddFirstListener?.(this)
      } else if (this._listeners instanceof UniqueContainer) {
        this._deliveryQueue ??= new EventDeliveryQueuePrivate()
        this._listeners = [this._listeners, contained]
      } else {
        this._listeners.push(contained)
      }

      this._options?.onDidAddListener?.(this)
      this._size++

      const result = toDisposable(() => {
        this._removeListener(contained)
      })

      return result
    }

    return this._event
  }

  private _removeListener(container: ListenerContainer<T>): void {
    this._options?.onWillRemoveListener?.(this)
    if (this._listeners === undefined) {
      return
    }
    if (this._size === 1) {
      this._listeners = undefined
      this._size = 0
      this._options?.onDidRemoveLastListener?.(this)
      return
    }
    const listeners = this._listeners as (ListenerContainer<T> | undefined)[]
    const idx = listeners.indexOf(container)
    if (idx === -1) {
      console.error('EmitterErrorInfo', {
        size: this._size,
        listeners: JSON.stringify(this._listeners),
      })
      throw new Error(
        'Emitter: Attempted to dispose unknown listener, listener not found',
      )
    }
    this._size--
    listeners[idx] = undefined
  }

  /**
   * @description 交付数据到监听器
   */
  private _deliver(
    listener: undefined | UniqueContainer<(data: T) => void>,
    data: T,
  ): void {
    if (listener === undefined) {
      return
    }
    const errorHandler = this._options?.onListenerError
    if (errorHandler === undefined) {
      listener.value(data)
      return
    }
    try {
      listener.value(data)
    } catch (e) {
      errorHandler(e)
    }
  }

  /**
   * @description 交付给队列
   */
  private _deliverQueue(dq: EventDeliveryQueuePrivate): void {
    const listeners = dq.current!._listeners as (
      | ListenerContainer<T>
      | undefined
    )[]
    while (dq.i < dq.end) {
      // important: dq.i is incremented before calling deliver() because it might reenter deliverQueue()
      this._deliver(listeners[dq.i++], dq.value as T)
    }
    dq.reset()
  }

  /**
   * @description 触发事件，传递给监听器
   * @description_en Fires an event, passing the given data to the listeners.
   */
  public fire(data: T): void {
    if (this._deliveryQueue?.current) {
      this._deliverQueue(this._deliveryQueue)
    }

    if (this._listeners === undefined) {
      return
    } else if (this._listeners instanceof UniqueContainer) {
      this._deliver(this._listeners, data)
    } else {
      const dq = this._deliveryQueue!
      dq.enqueue(this, data, this._listeners.length)
      this._deliverQueue(dq)
    }
  }

  /**
   * @description 调用后销毁发射器
   * @description_en Destroys the emitter, releasing all resources
   */
  public dispose(): void {
    if (!this._disposed) {
      this._disposed = true

      if (this._deliveryQueue?.current === this) {
        this._deliveryQueue.reset()
      }

      if (this._listeners) {
        if (Emitter.EnableInjectStackTrace) {
          const listeners = this._listeners
          queueMicrotask(() => {
            forEachListener(listeners, (l) => l.stack?.print())
          })
        }
        this._listeners = undefined
        this._size = 0
      }

      this._options?.onDidRemoveLastListener?.(this)
    }
  }

  /**
   * @description 返回是否有监听器
   * @description_en Returns true if this emitter has listeners
   */
  public hasListeners(): boolean {
    return this._size > 0
  }
}
