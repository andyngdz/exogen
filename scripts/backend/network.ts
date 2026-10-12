import { connect } from 'node:net'

const DOWNLOAD_HOST = 'astral.sh'
const DOWNLOAD_PORT = 443
const CONNECT_TIMEOUT_MS = 5000

/** Thrown when a setup download fails and the machine has no internet connection. */
class OfflineError extends Error {
  constructor() {
    super('No internet connection.')
    this.name = 'OfflineError'
  }
}

/**
 * Resolves true when a TCP connection to the uv download host opens.
 * A DNS lookup alone is not enough: a local resolver cache answers offline.
 */
const isOnline = () =>
  new Promise<boolean>((resolve) => {
    const socket = connect({ host: DOWNLOAD_HOST, port: DOWNLOAD_PORT })

    const finish = (online: boolean) => {
      socket.destroy()
      resolve(online)
    }

    socket.setTimeout(CONNECT_TIMEOUT_MS, () => finish(false))
    socket.once('connect', () => finish(true))
    socket.once('error', () => finish(false))
  })

export { isOnline, OfflineError }
