class Counter {
  private count = 0
  next() {
    this.count++
    return this.count
  }
}

export class RemoteEvent {
  static channelName = 'RemoteEvent'
  private channel: BroadcastChannel
  private counter = new Counter()
  constructor() {
    const channel = new BroadcastChannel(RemoteEvent.channelName)
    this.channel = channel
  }

  send(data: any) {
    this.channel.postMessage(this.counter.next() + data)
  }

  onMessage(callback: (event: MessageEvent) => void) {
    this.channel.onmessage = callback
  }

  close() {
    this.channel.close()
  }
}
