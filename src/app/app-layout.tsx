'use client'

import {
  initializeBackend,
  useBackendInitStore
} from '@/cores/backend-initialization'
import { FullScreenLoader } from '@/cores/presentations'
import { usePathname } from 'next/navigation'
import { FC, PropsWithChildren, useEffect, useMemo } from 'react'

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname()
  const isInitialized = useBackendInitStore((state) => state.isInitialized)
  const isHomePage = pathname === '/'
  // Home page (HealthCheck) should always render to show initialization logs
  // Other pages should wait for backend initialization to complete
  const shouldRenderContent = isHomePage || isInitialized
  const content = useMemo(() => {
    if (shouldRenderContent) return children

    return <FullScreenLoader message="Initializing backend..." />
  }, [children, shouldRenderContent])

  useEffect(() => {
    initializeBackend()
  }, [])

  return <main className="flex h-screen justify-center">{content}</main>
}
