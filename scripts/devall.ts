#!/usr/bin/env node
import { $ } from './zx-config'
import { runAsScript, setupLog } from './utils'

setupLog($)

const concurrentlyArgs = [
  '-n',
  'NEXT,ELECTRON',
  '-c',
  'yellow,blue',
  '--kill-others',
  '--success',
  'first',
  'pnpm run dev',
  'tsx scripts/desktop.ts'
]

const startFullDev = async () => {
  console.log('Starting full development environment...')
  await $`concurrently ${concurrentlyArgs}`
}

runAsScript(startFullDev, 'Full development startup failed:')

export { concurrentlyArgs, startFullDev }
