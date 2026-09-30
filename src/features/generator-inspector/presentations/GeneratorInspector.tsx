'use client'

import { useDefaultStyles } from '@/features/generator-config-styles/states'
import { useImageSizeFamilySync } from '@/features/generator-inspector/states/useImageSizeFamilySync'
import { Tabs } from '@heroui/react'
import clsx from 'clsx'
import { GeneratorInspectorBasic } from './basic/GeneratorInspectorBasic'
import { GeneratorInspectorHires } from './GeneratorInspectorHires'
import { GeneratorInspectorLora } from './GeneratorInspectorLora'
import { GeneratorInspectorStyles } from './GeneratorInspectorStyles'

export const GeneratorInspector = () => {
  // Mounted here, not in a tab: a model can finish loading while another tab
  // is open, and first-run default styles must apply without opening Styles.
  useImageSizeFamilySync()
  useDefaultStyles()

  return (
    <aside
      className={clsx(
        'w-75 shrink-0 overflow-y-auto',
        'border-l border-separator'
      )}
    >
      <Tabs variant="secondary">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Inspector">
            <Tabs.Tab id="basic">
              Basic
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="hires">
              Hires
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="lora">
              LoRA
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="styles">
              Styles
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id="basic" className="p-0">
          <GeneratorInspectorBasic />
        </Tabs.Panel>
        <Tabs.Panel id="hires" className="p-0">
          <GeneratorInspectorHires />
        </Tabs.Panel>
        <Tabs.Panel id="lora" className="p-0">
          <GeneratorInspectorLora />
        </Tabs.Panel>
        <Tabs.Panel id="styles" className="p-0">
          <GeneratorInspectorStyles />
        </Tabs.Panel>
      </Tabs>
    </aside>
  )
}
