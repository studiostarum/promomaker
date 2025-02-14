import { useEffect } from 'react'
import { ImageTransform, OverlayType, OVERLAY_TYPES } from '@/lib/constants'

interface ImageExportOptions {
  format: 'image/png' | 'image/jpeg' | 'image/webp'
  quality?: number
}

interface UseKeyboardShortcutsProps {
  isEnabled: boolean
  scale: number
  offsetX: number
  offsetY: number
  overlayType: OverlayType | null
  onTransformChange: (transform: Partial<ImageTransform>) => void
  onSave: (options: ImageExportOptions) => void
  onReset: () => void
  onUndo?: () => void
  onRedo?: () => void
  onSaveState?: () => void
  onShowSavedStates?: () => void
}

export function useKeyboardShortcuts({
  isEnabled,
  scale,
  offsetX,
  offsetY,
  overlayType,
  onTransformChange,
  onSave,
  onReset,
  onUndo,
  onRedo,
  onSaveState,
  onShowSavedStates
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Don't trigger shortcuts with modifier keys (except for saving)
      if (e.altKey || e.metaKey) return

      switch (e.key.toLowerCase()) {
        case 's':
          if (e.ctrlKey && onSaveState) {
            e.preventDefault()
            onSaveState()
          } else if (!e.ctrlKey) {
            e.preventDefault()
            onSave({ format: 'image/png' }) // Default to PNG for keyboard shortcut
          }
          break
        case 'r':
          if (!e.ctrlKey) {
            e.preventDefault()
            onReset()
          }
          break
        case 'b':
          if (e.ctrlKey && onShowSavedStates) {
            e.preventDefault()
            onShowSavedStates()
          }
          break
        case 'z':
          if (e.ctrlKey && onUndo) {
            e.preventDefault()
            onUndo()
          }
          break
        case 'y':
          if (e.ctrlKey && onRedo) {
            e.preventDefault()
            onRedo()
          }
          break
        case '0':
          if (!e.ctrlKey) {
            e.preventDefault()
            onTransformChange({ overlayType: null })
          }
          break
        case '1':
          if (!e.ctrlKey) {
            e.preventDefault()
            onTransformChange({ overlayType: OVERLAY_TYPES.CINEMATIC })
          }
          break
        case '2':
          if (!e.ctrlKey) {
            e.preventDefault()
            onTransformChange({ overlayType: OVERLAY_TYPES.FULL_FRAME })
          }
          break
        case 'arrowleft':
          e.preventDefault()
          onTransformChange({ offsetX: Math.max(-500, offsetX - (e.shiftKey ? 10 : 1)) })
          break
        case 'arrowright':
          e.preventDefault()
          onTransformChange({ offsetX: Math.min(500, offsetX + (e.shiftKey ? 10 : 1)) })
          break
        case 'arrowup':
          e.preventDefault()
          onTransformChange({ offsetY: Math.max(-500, offsetY - (e.shiftKey ? 10 : 1)) })
          break
        case 'arrowdown':
          e.preventDefault()
          onTransformChange({ offsetY: Math.min(500, offsetY + (e.shiftKey ? 10 : 1)) })
          break
        case '-':
        case '_':
          e.preventDefault()
          onTransformChange({ scale: Math.max(0.1, scale - (e.shiftKey ? 0.5 : 0.1)) })
          break
        case '=':
        case '+':
          e.preventDefault()
          onTransformChange({ scale: Math.min(5, scale + (e.shiftKey ? 0.5 : 0.1)) })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isEnabled,
    scale,
    offsetX,
    offsetY,
    onTransformChange,
    onSave,
    onReset,
    onUndo,
    onRedo,
    onSaveState,
    onShowSavedStates
  ])
}