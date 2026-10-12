import { useEffect } from 'react'
import { SocketEvents } from '@/cores/sockets/constants/events'
import { useSocket } from './useSocket'
import { SOCKET_CONNECTION_ACTIONS } from './useSocketConnectionStore'
import { useSocketEvent } from './useSocketEvent'

/**
 * Keeps useSocketConnectionStore in step with the socket. Mount it once, high
 * in the tree. initializeBackend connects the socket before the editor
 * renders, so the store is seeded from socket.connected instead of waiting for
 * a connect event that already fired.
 */
export const useSocketConnectionWatcher = () => {
  const socket = useSocket()

  useEffect(() => {
    if (socket.connected) {
      SOCKET_CONNECTION_ACTIONS.markConnected()
      return
    }

    SOCKET_CONNECTION_ACTIONS.markConnecting()
  }, [socket])

  useSocketEvent(SocketEvents.CONNECT, SOCKET_CONNECTION_ACTIONS.markConnected)
  useSocketEvent(
    SocketEvents.DISCONNECT,
    SOCKET_CONNECTION_ACTIONS.markDisconnected
  )
  useSocketEvent(
    SocketEvents.CONNECT_ERROR,
    SOCKET_CONNECTION_ACTIONS.markDisconnected
  )
}
