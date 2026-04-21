import { $, usePowerShell } from 'zx'

if (process.platform === 'win32') {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  usePowerShell()
}

export * from 'zx'
export { $ }
