import { build } from 'esbuild'
import { cp, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { $ } from './zx-config'
import { projectRoot, setupLog } from './utils'

setupLog($)

const electronDir = join(projectRoot, 'electron')
const compiledTypesDir = join(electronDir, 'types')
const runtimeTypesDir = join(electronDir, 'node_modules', '@types')

const cleanElectronOutputs = async () => {
  await Promise.all([
    rm(join(electronDir, 'main.js'), { force: true }),
    rm(join(electronDir, 'preload.js'), { force: true }),
    rm(join(electronDir, 'backend-port.js'), { force: true }),
    rm(join(electronDir, 'log-streamer.js'), { force: true }),
    rm(join(electronDir, 'updater.js'), { force: true }),
    rm(join(electronDir, 'status-broadcaster.js'), { force: true }),
    rm(join(electronDir, '.build'), { recursive: true, force: true }),
    rm(join(electronDir, 'types'), { recursive: true, force: true })
  ])
}

const generateTypes = async () => {
  console.log('Generating types...')
  await $`tsc --project tsconfig.electron.json --emitDeclarationOnly`
}

const bundleElectronFiles = async () => {
  console.log('Bundling with esbuild...')

  const entryPoints = [
    join(electronDir, 'main.ts'),
    join(electronDir, 'preload.ts'),
    join(electronDir, 'backend-port.ts'),
    join(electronDir, 'log-streamer.ts'),
    join(electronDir, 'updater.ts'),
    join(electronDir, 'status-broadcaster.ts')
  ]

  await build({
    entryPoints,
    bundle: true,
    platform: 'node',
    target: 'node18',
    outdir: electronDir,
    format: 'cjs',
    external: ['electron', 'electron-updater', 'electron-log', 'fix-path'],
    sourcemap: false
  })
}

const syncRuntimeTypes = async () => {
  console.log('Syncing types...')
  await rm(runtimeTypesDir, { recursive: true, force: true })
  await mkdir(runtimeTypesDir, { recursive: true })
  await cp(compiledTypesDir, runtimeTypesDir, { recursive: true })
}

const compileElectron = async () => {
  console.log('Compiling Electron TypeScript files...')

  await cleanElectronOutputs()
  await generateTypes()
  await bundleElectronFiles()
  await syncRuntimeTypes()

  console.log('Electron compilation complete')
}

const startElectron = async () => {
  console.log('Starting Electron...')
  try {
    await $`electron .`
  } catch (error) {
    console.error('Electron process error:', error)
    throw error
  }
}

export { compileElectron, startElectron }
