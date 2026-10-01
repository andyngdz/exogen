import { useSocketConnectionWatcher } from '@/cores/sockets'

/** Keeps the status bar's backend state current on the setup screens. */
export const useOnboardingLayout = () => {
  useSocketConnectionWatcher()
}
