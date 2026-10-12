const RANDOM_SEED = -1

export class PhotoviewService {
  /** Seed text for the viewer header; -1 means each run drew its own seed. */
  toSeedLabel(seed?: number) {
    if (seed === RANDOM_SEED) return 'Random'
    if (!seed && seed !== 0) return
    return `${seed}`
  }
}

export const photoviewService = new PhotoviewService()
