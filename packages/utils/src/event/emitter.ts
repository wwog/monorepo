import { Event } from './event.js'

export class Emitter<T = void> {
  private _event?: Event<T>

  fire(data: T): void {
    const a = 1
  }
}
