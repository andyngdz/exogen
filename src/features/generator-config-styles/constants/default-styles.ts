/**
 * Default styles applied on first visit
 * Only applied when styles array is empty
 */
export const DEFAULT_STYLE_IDS = [
  'fooocus_masterpiece',
  'fooocus_negative'
] as const

export type DefaultStyleId = (typeof DEFAULT_STYLE_IDS)[number]

/**
 * localStorage key for tracking if defaults have been applied
 * Namespaced to prevent collisions with other features
 */
export const DEFAULTS_APPLIED_STORAGE_KEY =
  'generator-config-styles:defaults-applied'
