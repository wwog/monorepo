const WarnListenerSize = 1000;

class UniqueContainer<T> {
  public readonly value: T;
  constructor(value: T) {
    this.value = value;
  }
}
export interface EmitterOptions<T> {
  onListenerError?: (e: any) => void;
  onWillAddFirstListener?: (
    listenerContainer: ListenerContainer<T>,
    thisArg: Emitter<T>
  ) => void;
  onDidAddFirstListener?: (
    listenerContainer: ListenerContainer<T>,
    thisArg: Emitter<T>
  ) => void;
  onWillDispose?: (
    listenerContainer: ListenerContainer<T>,
    thisArg: Emitter<T>
  ) => void;
  onDidDispose?: (
    listenerContainer: ListenerContainer<T>,
    thisArg: Emitter<T>
  ) => void;
  onWillPushListener?: (
    listenerContainer: ListenerContainer<T>,
    thisArg: Emitter<T>
  ) => void;
  onDidPushListener?: (
    listenerContainer: ListenerContainer<T>,
    thisArg: Emitter<T>
  ) => void;
}

type ListenerContainer<T> = UniqueContainer<
  (data: T extends undefined ? void : T) => void
>;
type Listeners<T> = (ListenerContainer<T> | undefined)[];

export interface Event<T> {
  (listener: (e: T) => any, thisArgs?: any): { dispose: () => void };
}
export class Emitter<T = undefined> {
  private _event?: Event<T>;
  protected _listeners?: Listeners<T>;
  protected _options?: EmitterOptions<T>;

  constructor(options?: EmitterOptions<T>) {
    this._options = options;
  }

  fire(data: T extends undefined ? void : T): void {
    // 你的逻辑代码
  }
}
