import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface HiresFixEnabledState {
  isHiresFixEnabled: boolean
  setIsHiresFixEnabled: (enabled: boolean) => void
}

export const useHiresFixEnabledStore = create<HiresFixEnabledState>()(
  persist(
    (set) => ({
      isHiresFixEnabled: false,
      setIsHiresFixEnabled: (enabled: boolean) =>
        set({ isHiresFixEnabled: enabled })
    }),
    {
      name: 'generator-hires-fix-enabled'
    }
  )
)
