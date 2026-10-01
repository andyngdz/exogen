import { UpdateCheckResult, UpdaterState } from '@types'
import { app, BrowserWindow } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'

// Configure logging
autoUpdater.logger = log
log.transports.file.level = 'info'

// Enable auto-download for stable releases only
autoUpdater.autoDownload = true

// Kept here, not in the renderer, because the download can finish before
// Settings ever mounts.
let updaterState: UpdaterState = {}

/** The current updater state, for a renderer that subscribes late. */
export function getUpdaterState(): UpdaterState {
  return updaterState
}

const setUpdaterState = (patch: UpdaterState) => {
  updaterState = { ...updaterState, ...patch }

  BrowserWindow.getAllWindows().forEach((window) => {
    if (!window.isDestroyed()) {
      window.webContents.send('updater:state', updaterState)
    }
  })
}

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info.version)
  setUpdaterState({ lastCheckedAt: Date.now() })
})

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info.version)
  setUpdaterState({ lastCheckedAt: Date.now() })
})

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err)
})

autoUpdater.on('download-progress', (progressObj) => {
  log.info(`Download speed: ${progressObj.bytesPerSecond}`)
  log.info(`Downloaded ${progressObj.percent}%`)
})

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info.version)
  setUpdaterState({ downloadedVersion: info.version })
})

class UpdateChecker {
  private resolve: (result: UpdateCheckResult) => void
  private reject: (error: Error) => void

  constructor(
    resolve: (result: UpdateCheckResult) => void,
    reject: (error: Error) => void
  ) {
    this.resolve = resolve
    this.reject = reject
  }

  private cleanup() {
    autoUpdater.removeListener('update-available', this.onUpdateAvailable)
    autoUpdater.removeListener(
      'update-not-available',
      this.onUpdateNotAvailable
    )
    autoUpdater.removeListener('error', this.onError)
  }

  private onUpdateAvailable = (info: { version: string }) => {
    this.cleanup()
    this.resolve({ updateAvailable: true, version: info.version })
  }

  private onUpdateNotAvailable = () => {
    this.cleanup()
    this.resolve({ updateAvailable: false })
  }

  private onError = (error: Error) => {
    this.cleanup()
    this.reject(error)
  }

  check() {
    autoUpdater.once('update-available', this.onUpdateAvailable)
    autoUpdater.once('update-not-available', this.onUpdateNotAvailable)
    autoUpdater.once('error', this.onError)
    autoUpdater.checkForUpdates()
  }
}

export function checkForUpdates(): Promise<UpdateCheckResult> {
  // Skip update check in development mode
  if (!app.isPackaged) {
    log.info('Skipping update check in development mode')
    return Promise.resolve({ updateAvailable: false })
  }

  // Skip update check for pre-release versions (beta, alpha, rc, etc.)
  // Pre-releases don't have latest-*.yml files since builds only run for stable releases
  const version = app.getVersion()
  if (version.includes('-')) {
    log.info('Skipping update check for pre-release version:', version)
    return Promise.resolve({ updateAvailable: false })
  }

  return new Promise((resolve, reject) => {
    new UpdateChecker(resolve, reject).check()
  })
}

export const installUpdate = () => {
  autoUpdater.quitAndInstall()
}
