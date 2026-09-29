'use client'

import { useGeneratorModeTabs } from '@/features/generator-modes/states/useGeneratorModeTabs'
import { GeneratorMode } from '@/types'
import { Tabs } from '@heroui/react'
import { Image2ImagePanel } from './Image2ImagePanel'
import { Text2ImagePanel } from './Text2ImagePanel'

export const ModeTabs = () => {
  const { mode, onModeChange } = useGeneratorModeTabs()

  return (
    <div className="p-4 h-full min-h-0 flex flex-col">
      <Tabs
        className="flex-1 min-h-0"
        selectedKey={mode}
        onSelectionChange={onModeChange}
      >
        <Tabs.ListContainer className="w-fit shrink-0">
          <Tabs.List aria-label="Generator mode" className="whitespace-nowrap">
            <Tabs.Tab id={GeneratorMode.TEXT_2_IMAGE}>
              Text to Image
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id={GeneratorMode.IMAGE_2_IMAGE}>
              Image to Image
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id={GeneratorMode.TEXT_2_IMAGE} className="flex-1 min-h-0">
          <Text2ImagePanel />
        </Tabs.Panel>
        <Tabs.Panel id={GeneratorMode.IMAGE_2_IMAGE} className="flex-1 min-h-0">
          <Image2ImagePanel />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
