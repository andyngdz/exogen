import { StagePanelTone } from '@/features/generator-stage/types'
import { Kbd } from '@heroui/react'
import { Sparkles } from 'lucide-react'
import { GeneratorStagePanel } from './GeneratorStagePanel'

export const GeneratorStageFirstRun = () => {
  return (
    <GeneratorStagePanel
      icon={<Sparkles size={18} />}
      tone={StagePanelTone.ACCENT}
      title="Your first image"
      description={
        <>
          Describe it in the prompt below and press{' '}
          <Kbd>
            <Kbd.Abbr keyValue="ctrl" />
            <Kbd.Abbr keyValue="enter" />
          </Kbd>
          . Results and your recent runs show up here.
        </>
      }
    />
  )
}
