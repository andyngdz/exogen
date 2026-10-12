'use client'

import { useAppVersion } from '@/features/settings/states/useAppVersion'

/** The Updates section's subtitle: the running version. */
export const UpdateSettingsVersion = () => {
  const version = useAppVersion()

  return <>Current version: {version}</>
}
