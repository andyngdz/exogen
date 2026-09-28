#!/usr/bin/env node
import { smokeInstallUv } from './smoke/install-uv'
import { runAsScript } from './utils'

runAsScript(smokeInstallUv, 'uv smoke test failed:')
