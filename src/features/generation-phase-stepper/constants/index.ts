import { GenerationPhase } from '@/cores/sockets'

export const PHASE_LABELS: Record<GenerationPhase, string> = {
  [GenerationPhase.IMAGE_GENERATION]: 'Image Generation',
  [GenerationPhase.UPSCALING]: 'Upscaling',
  [GenerationPhase.COMPLETED]: 'Completed'
}
