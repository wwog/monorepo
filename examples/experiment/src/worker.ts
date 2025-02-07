import { RemoteEvent } from './remoteEvent'

const remoteEvent = new RemoteEvent()
console.log('worker.ts', remoteEvent)
remoteEvent.onMessage((event) => {
  const text = `in Worker中文:: ${event.data}`
  //将text转换为sharedArrayBuffer
  const encoder = new TextEncoder()
  const buffer = encoder.encode(text)
  const sharedArray = new SharedArrayBuffer(buffer.byteLength)
  const sharedArrayView = new Uint8Array(sharedArray)
  sharedArrayView.set(buffer)

  globalThis.postMessage(sharedArrayView)

  const text2 = sharedArrayView.reduce((prev, curr) => {
    return prev + String.fromCharCode(curr)
  }, '')
  console.log('in worker', text2)
})
