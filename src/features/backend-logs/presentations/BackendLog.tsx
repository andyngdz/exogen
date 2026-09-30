'use client'

import { Button, useOverlayState } from '@heroui/react'
import { SquareChevronRight } from 'lucide-react'
import { BackendLogDrawer } from './BackendLogDrawer'

/** Console button for the onboarding footer; the editor opens the drawer from its rail. */
export const BackendLog = () => {
  const drawerState = useOverlayState()

  return (
    <section>
      <Button
        variant="ghost"
        className="text-foreground"
        onPress={drawerState.open}
      >
        Console
        <SquareChevronRight size={16} />
      </Button>
      <BackendLogDrawer
        isOpen={drawerState.isOpen}
        onOpenChange={drawerState.setOpen}
      />
    </section>
  )
}
