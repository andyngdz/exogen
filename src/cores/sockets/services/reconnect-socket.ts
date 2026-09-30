import { useSocketStore } from '@/cores/sockets/states/useSocket'

/** Asks Socket.IO to connect now instead of waiting for its next backoff attempt. */
export const reconnectSocket = () => {
  useSocketStore.getState().socket.connect()
}
