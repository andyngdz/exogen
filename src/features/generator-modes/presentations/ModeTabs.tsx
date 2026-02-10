'use client'

import {
  useGeneratorModeStore,
  useImage2ImageConfigStore
} from '@/features/generators'
import { GeneratorMode } from '@/types'
import { Tab, Tabs } from '@heroui/react'
import { Image2ImagePanel } from './Image2ImagePanel'
import { Text2ImagePanel } from './Text2ImagePanel'

export const ModeTabs = () => {
  const { mode, setMode } = useGeneratorModeStore()
  const { clearInitImageBase64 } = useImage2ImageConfigStore()

  return (
    <div className="p-4 h-full min-h-0 flex flex-col">
      <Tabs
        aria-label="Generator mode"
        placement="top"
        selectedKey={mode}
        onSelectionChange={(key) => {
          const nextMode = key as GeneratorMode
          setMode(nextMode)

          if (nextMode === GeneratorMode.TEXT_2_IMAGE) {
            clearInitImageBase64()
          }
        }}
        classNames={{
          tabWrapper: 'flex flex-col flex-1 min-h-0',
          base: 'shrink-0 pb-4',
          panel: 'flex-1 min-h-0'
        }}
        variant="solid"
      >
        <Tab key={GeneratorMode.TEXT_2_IMAGE} title="Text to Image">
          <Text2ImagePanel />
        </Tab>
        <Tab key={GeneratorMode.IMAGE_2_IMAGE} title="Image to Image">
          <Image2ImagePanel />
        </Tab>
      </Tabs>
    </div>
  )
}
