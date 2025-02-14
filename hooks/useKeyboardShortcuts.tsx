import { useEffect } from 'react'
import { ImageTransform, OVERLAY_TYPES } from '../lib/constants'

interface UseKeyboardShortcutsProps {
  isEnabled: boolean
  scale: number
  offsetX: number
  offsetY: number
  overlayType: string | null
  onTransformChange: (transform: Partial<ImageTransform>) => void
  onSave?: () => void
  onReset?: () => void
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
  onShowSavedStates,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEnabled) return

      // Handle undo/redo and save state shortcuts
      if ((e.metaKey || e.ctrlKey) && !e.altKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault()
          onUndo?.()
          return
        }
        if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault()
          onRedo?.()
          return
        }
        if (e.key === 's') {
          e.preventDefault()
          onSaveState?.()
          return
        }
        if (e.key === 'b') {
          e.preventDefault()
          onShowSavedStates?.()
          return
        }
      }

      // Handle other shortcuts only if no modifiers are pressed
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', '1', '2', '0', 'r', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }

      const step = e.shiftKey ? 10 : 1
      const scaleStep = e.shiftKey ? 0.1 : 0.01

      switch (e.key.toLowerCase()) {
        case 'arrowup':
          onTransformChange({ offsetY: offsetY - step })
          break
        case 'arrowdown':
          onTransformChange({ offsetY: offsetY + step })
          break
        case 'arrowleft':
          onTransformChange({ offsetX: offsetX - step })
          break
        case 'arrowright':
          onTransformChange({ offsetX: offsetX + step })
          break
        case '+':
        case '=':
          onTransformChange({ scale: scale + scaleStep })
          break
        case '-':
          onTransformChange({ scale: scale - scaleStep })
          break
        case '1':
          onTransformChange({ 
            overlayType: overlayType === OVERLAY_TYPES.CINEMATIC ? null : OVERLAY_TYPES.CINEMATIC 
          })
          break
        case '2':
          onTransformChange({ 
            overlayType: overlayType === OVERLAY_TYPES.FULL_FRAME ? null : OVERLAY_TYPES.FULL_FRAME 
          })
          break
        case '0':
          onTransformChange({ overlayType: null })
          break
        case 'r':
          onReset?.()
          break
        case 's':
          onSave?.()
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
    overlayType,
    onTransformChange,
    onSave,
    onReset,
    onUndo,
    onRedo,
    onSaveState,
    onShowSavedStates
  ])
}