import { useDockPills } from '@/features/generator-dock/states/useDockPills'
import { DockPillKind } from '@/features/generator-dock/types'
import { Chip } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import {
  Blend,
  Dices,
  Layers,
  LucideIcon,
  Maximize2,
  Package,
  Scan,
  SlidersHorizontal,
  WandSparkles
} from 'lucide-react'

const PILL_ICONS: Record<DockPillKind, LucideIcon> = {
  [DockPillKind.SIZE]: Scan,
  [DockPillKind.DENOISE]: Blend,
  [DockPillKind.IMAGES]: Layers,
  [DockPillKind.SAMPLING]: SlidersHorizontal,
  [DockPillKind.SEED]: Dices,
  [DockPillKind.HIRES]: Maximize2,
  [DockPillKind.LORA]: Package,
  [DockPillKind.STYLE]: WandSparkles
}

export const GeneratorDockPills = () => {
  const { pills } = useDockPills()

  return (
    <ul aria-label="Current settings" className="contents">
      {map(pills, (pill) => {
        const Icon = PILL_ICONS[pill.kind]

        return (
          <li key={pill.key}>
            <Chip size="sm" variant="secondary">
              <Icon size={12} className="text-muted" />
              <Chip.Label>{pill.label}</Chip.Label>
            </Chip>
          </li>
        )
      })}
    </ul>
  )
}
