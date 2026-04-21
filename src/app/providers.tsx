'use client'

import { BackendLogCollector } from '@/features/backend-logs'
import { DownloadWatcher } from '@/features/download-watcher'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { FC, PropsWithChildren } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000
    }
  }
})

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <HeroUIProvider>
      <ToastProvider />
      <QueryClientProvider client={queryClient}>
        <BackendLogCollector>
          <DownloadWatcher>{children}</DownloadWatcher>
        </BackendLogCollector>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-left" />
      </QueryClientProvider>
    </HeroUIProvider>
  )
}
