import {
  DockPill,
  DockPillInput,
  DockPillKind
} from '@/features/generator-dock/types'
import { ImageSizePreset } from '@/features/generator-inspector/types'
import { map } from 'es-toolkit/compat'

const RANDOM_SEED = -1

export class DockPillService {
  /** Summary pills for the dock, in the order the design shows them. */
  toPills(input: DockPillInput): DockPill[] {
    const { values } = input
    const pills: DockPill[] = [
      this.pill(DockPillKind.SIZE, this.toSizeLabel(input))
    ]

    if (input.isImageMode) {
      pills.push(
        this.pill(DockPillKind.DENOISE, `Denoise ${input.denoisingStrength}`)
      )
    }

    pills.push(
      this.pill(
        DockPillKind.IMAGES,
        this.toImagesLabel(values.number_of_images)
      ),
      this.pill(
        DockPillKind.SAMPLING,
        `${input.samplerName} · ${values.steps} steps · CFG ${values.cfg_scale}`
      ),
      this.pill(DockPillKind.SEED, this.toSeedLabel(values.seed))
    )

    if (input.isHiresFixEnabled && values.hires_fix) {
      pills.push(
        this.pill(
          DockPillKind.HIRES,
          `Hires ×${values.hires_fix.upscale_factor}`
        )
      )
    }

    return [
      ...pills,
      ...map(input.loras, (lora) =>
        this.pill(DockPillKind.LORA, `${lora.name} ${lora.weight}`)
      ),
      ...map(input.styleNames, (name) => this.pill(DockPillKind.STYLE, name))
    ]
  }

  private pill(kind: DockPillKind, label: string): DockPill {
    return { key: `${kind}-${label}`, kind, label }
  }

  private toSizeLabel({ values, sizePreset }: DockPillInput) {
    const size = `${values.width} × ${values.height}`

    if (sizePreset === ImageSizePreset.CUSTOM) return size
    return `${sizePreset} · ${size}`
  }

  private toImagesLabel(count: number) {
    if (count === 1) return '1 image'
    return `${count} images`
  }

  private toSeedLabel(seed: number) {
    if (seed === RANDOM_SEED) return 'Random seed'
    return `Seed ${seed}`
  }
}

export const dockPillService = new DockPillService()
