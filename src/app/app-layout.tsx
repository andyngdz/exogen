'use client'

import {
  initializeBackend,
  useBackendInitStore
} from '@/cores/backend-initialization'
import { FullScreenLoader } from '@/cores/presentations'
import { AppFooter } from '@/features/app-footer'
import { usePathname } from 'next/navigation'
import { FC, PropsWithChildren, useEffect, useMemo } from 'react'

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname()
  const isInitialized = useBackendInitStore((state) => state.isInitialized)
  const isHomePage = pathname === '/'
  // The editor has its own rail and status bar in place of the footer.
  const hasFooter = pathname !== '/editor'
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

  return (
    <div className="flex flex-col gap-0 h-screen">
      <main className="flex justify-center flex-1">{content}</main>
      {hasFooter && <AppFooter />}
    </div>
  )
}
