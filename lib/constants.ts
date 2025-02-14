export const IMAGE_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  CANVAS_SIZE: 600,
  MIN_SCALE: 0.1,
  MAX_SCALE: 2,
  MIN_OFFSET: -200,
  MAX_OFFSET: 200,
} as const

export const OVERLAY_TYPES = {
  CINEMATIC: 'cinematic',
  FULL_FRAME: 'full-frame',
} as const

export type OverlayType = typeof OVERLAY_TYPES[keyof typeof OVERLAY_TYPES] | null

export interface ImageTransform {
  scale: number
  offsetX: number
  offsetY: number
  overlayType: OverlayType
}

export const DEFAULT_TRANSFORM: ImageTransform = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  overlayType: null,
}