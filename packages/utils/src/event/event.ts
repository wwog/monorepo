/**
 * @description_zh 一个可以订阅的事件，可以有零个或一个参数。事件本身是一个函数。
 * @description_en An event with zero or one parameters that can be subscribed to. The event is a function itself.
 */
export interface Event<T> {
  (listener: (e: T) => unknown, thisArgs?: any): void
}
