import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ShortcutsHelp } from './ShortcutsHelp'
import { drawImageOnCanvas, drawOverlay } from '@/lib/imageUtils'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { ImageTransform, IMAGE_CONSTRAINTS } from '@/lib/constants'

interface ImageExportOptions {
  format: 'image/png' | 'image/jpeg' | 'image/webp'
  quality?: number
}

interface ImageCanvasProps extends ImageTransform {
  image: string | null
  onTransformChange: (transform: Partial<ImageTransform>) => void
  onSave: (options: ImageExportOptions) => void
  onReset?: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  darkMode?: boolean
}

export function ImageCanvas({ 
  image, 
  scale,
  offsetX,
  offsetY,
  overlayType,
  onTransformChange,
  onSave,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  darkMode
}: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  useKeyboardShortcuts({
    isEnabled: Boolean(image),
    scale,
    offsetX,
    offsetY,
    overlayType,
    onTransformChange,
    onSave,
    onReset: onReset || (() => {}),
    onUndo,
    onRedo
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault()
        setShowShortcuts(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const renderCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas || !image) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      setIsLoading(true)
      canvas.width = IMAGE_CONSTRAINTS.CANVAS_SIZE
      canvas.height = IMAGE_CONSTRAINTS.CANVAS_SIZE

      // Set canvas background based on dark mode
      ctx.fillStyle = darkMode ? '#1f2937' : '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const img = new Image()
      img.onload = () => {
        drawImageOnCanvas(ctx, img, IMAGE_CONSTRAINTS.CANVAS_SIZE, scale, offsetX, offsetY)
        
        if (overlayType) {
          drawOverlay(ctx, IMAGE_CONSTRAINTS.CANVAS_SIZE, overlayType)
        }
        
        setIsLoading(false)
      }
      img.src = image
    }

    renderCanvas()
  }, [image, overlayType, scale, offsetX, offsetY, darkMode])

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef}
        className={`rounded-lg aspect-square ${
          darkMode 
            ? 'border border-gray-700' 
            : 'border border-gray-200'
        } ${isLoading ? 'opacity-50' : ''}`}
        style={{ 
          width: `${IMAGE_CONSTRAINTS.CANVAS_SIZE}px`, 
          height: `${IMAGE_CONSTRAINTS.CANVAS_SIZE}px` 
        }}
        tabIndex={0}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
            darkMode ? 'border-gray-400' : 'border-gray-900'
          }`}></div>
        </div>
      )}
      {image && (
        <>
          <div className={`absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-sm p-1 ${
            darkMode ? 'bg-gray-800/80' : 'bg-white/80'
          }`}>
            <div className="flex gap-1">
              <Button
                variant={darkMode ? "ghost" : "secondary"}
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
                className="h-6 px-2"
                title="Undo (Ctrl+Z)"
              >
                ↩
              </Button>
              <Button
                variant={darkMode ? "ghost" : "secondary"}
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
                className="h-6 px-2"
                title="Redo (Ctrl+Y)"
              >
                ↪
              </Button>
            </div>
            <div className={`text-xs ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Press ? for keyboard shortcuts
            </div>
          </div>
          <ShortcutsHelp 
            isOpen={showShortcuts} 
            onOpenChange={setShowShortcuts} 
          />
        </>
      )}
    </div>
  )
}
