import { UpdateCheckResult } from '@types'
import { app, BrowserWindow, dialog } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'

// Configure logging
autoUpdater.logger = log
log.transports.file.level = 'info'

// Enable auto-download for stable releases only
autoUpdater.autoDownload = true

let mainWindow: BrowserWindow

export function setMainWindow(win: BrowserWindow) {
  mainWindow = win
}

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info.version)
})

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info.version)
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

  // Show native dialog to install update
  if (!mainWindow || mainWindow.isDestroyed()) {
    return
  }

  dialog
    .showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: `A new version (${info.version}) has been downloaded. Restart to apply the update?`,
      buttons: ['Restart', 'Later']
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
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

export function installUpdate() {
  autoUpdater.quitAndInstall()
}
