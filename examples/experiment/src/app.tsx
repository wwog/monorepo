import { FC, useEffect, useState } from 'react'
import { RemoteEvent } from './remoteEvent'

const worker = new Worker(new URL('./worker.ts', import.meta.url), {
  type: 'module',
})

//#region component Types
export interface AppProps {}
//#endregion component Types

//#region component
export const App: FC<AppProps> = () => {
  const [remoteEvent, setRemoteEvent] = useState<RemoteEvent | null>(null)
  const [messages, setMessages] = useState<string[]>([])
  const pushMessage = (message: string) => {
    setMessages((prev) => [...prev, message])
  }
  useEffect(() => {
    const remoteEvent = new RemoteEvent()
    // remoteEvent.onMessage((event) => {
    //   pushMessage(event.data)
    // })
    setRemoteEvent(remoteEvent)
    const handleWorkerMessage = (event: MessageEvent) => {
      if (event.data instanceof Uint8Array) {
        const arrayBuffer = event.data
        const uint8Array = new Uint8Array(arrayBuffer)
        const textDecoder = new TextDecoder('utf-8')
        const decodedString = textDecoder.decode(uint8Array)
        console.log(decodedString)
      }
    }
    worker.addEventListener('message', handleWorkerMessage)
    return () => {
      remoteEvent.close()
      worker.removeEventListener('message', handleWorkerMessage)
    }
  }, [])

  if (!remoteEvent) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <button
        onClick={() => {
          remoteEvent.send('Hello')
        }}
      >
        SendMessage
      </button>
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    </div>
  )
}
//#endregion component

/* 
A -> B

A --req-> Scheduler --req-> B

B --res-> A --> resOK -

*/