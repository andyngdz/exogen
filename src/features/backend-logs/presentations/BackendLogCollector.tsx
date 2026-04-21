'use client'

import { FC, PropsWithChildren } from 'react'
import { useBackendLogCollector } from '../states'

export const BackendLogCollector: FC<PropsWithChildren> = ({ children }) => {
  useBackendLogCollector()

  return children
}
