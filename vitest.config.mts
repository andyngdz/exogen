import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'node:path'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      // Ensure framer-motion never touches real `window` in tests.
      'framer-motion': path.resolve(
        __dirname,
        'src/cores/test-utils/framerMotionMock.ts'
      ),
      'framer-motion/dist/es/index.mjs': path.resolve(
        __dirname,
        'src/cores/test-utils/framerMotionMock.ts'
      ),
      'framer-motion/dist/cjs/index.js': path.resolve(
        __dirname,
        'src/cores/test-utils/framerMotionMock.ts'
      ),
      'framer-motion/dist/es/components/LazyMotion/index.mjs': path.resolve(
        __dirname,
        'src/cores/test-utils/framerMotionMock.ts'
      )
    }
  },
  test: {
    pool: 'forks',
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: false,
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'scripts/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'scripts/**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      ...configDefaults.exclude,
      '**/index.ts',
      '**/types.ts',
      '**/types/**'
    ],
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'scripts/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
      ],
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        'src/cores/test-utils/framerMotionMock.ts',
        '**/index.ts',
        '**/types.ts',
        '**/types/**'
      ]
    }
  }
})
