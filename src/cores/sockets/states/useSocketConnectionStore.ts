import { create } from 'zustand'

export enum SocketConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected'
}

export interface SocketConnectionState {
  status: SocketConnectionStatus
  /** Epoch milliseconds of the last successful connection. */
  lastConnectedAt?: number
}

export const useSocketConnectionStore = create<SocketConnectionState>()(() => ({
  status: SocketConnectionStatus.CONNECTING
}))

export const SOCKET_CONNECTION_ACTIONS = {
  markConnecting: () =>
    useSocketConnectionStore.setState({
      status: SocketConnectionStatus.CONNECTING
    }),
  markConnected: () =>
    useSocketConnectionStore.setState({
      status: SocketConnectionStatus.CONNECTED,
      lastConnectedAt: Date.now()
    }),
  markDisconnected: () =>
    useSocketConnectionStore.setState({
      status: SocketConnectionStatus.DISCONNECTED
    })
}
