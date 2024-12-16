import { Emitter, Event } from '../src/emitter.js'
import { describe, it, expect, vitest } from 'vitest'

describe('Emitter', () => {
  it('should add and remove listeners', () => {
    const emitter = new Emitter<string>()
    const listener = vitest.fn()
    const disposable = emitter.event(listener)

    emitter.fire('test')
    expect(listener).toHaveBeenCalledWith('test')

    disposable.dispose()
    emitter.fire('test2')
    expect(listener).not.toHaveBeenCalledWith('test2')
  })

  it('should fire events to multiple listeners', () => {
    const emitter = new Emitter<string>()
    const listener1 = vitest.fn()
    const listener2 = vitest.fn()
    emitter.event(listener1)
    emitter.event(listener2)

    emitter.fire('test')
    expect(listener1).toHaveBeenCalledWith('test')
    expect(listener2).toHaveBeenCalledWith('test')
  })

  it('should only fire once for once listeners', () => {
    const emitter = new Emitter<string>()
    const listener = vitest.fn()
    const onceListener = Event.once(emitter.event)
    onceListener(listener)

    emitter.fire('test')
    emitter.fire('test2')
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith('test')
  })

  it('should convert promise to event', async () => {
    const promise = Promise.resolve('test')
    const event = Event.fromPromise(promise)
    const listener = vitest.fn()
    event(listener)

    await promise
    expect(listener).toHaveBeenCalledWith('test')
  })

  it('should convert event to promise', async () => {
    const emitter = new Emitter<string>()
    const promise = Event.toPromise(emitter.event)

    emitter.fire('test')
    const result = await promise
    expect(result).toBe('test')
  })

  it('should handle listener errors', () => {
    const errorListener = vitest.fn()
    const emitter = new Emitter<string>({ onListenerError: errorListener })
    const listener = vitest.fn(() => {
      throw new Error('test error')
    })
    emitter.event(listener)

    emitter.fire('test')
    expect(errorListener).toHaveBeenCalled()
  })

  it('should debounce events', () => {
    const emitter = new Emitter<string>()
    const debouncedEvent = Event.debounce(
      emitter.event,
      (last, event) => event,
      100,
    )
    const listener = vitest.fn()
    debouncedEvent(listener)

    emitter.fire('test1')
    emitter.fire('test2')
    emitter.fire('test3')

    expect(listener).not.toHaveBeenCalled()

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(listener).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledWith('test3')
        resolve()
      }, 150)
    })
  })
})
