import { useEffect, useCallback, useRef, useState } from 'react'
import { ImageTransform, OverlayType } from '@/lib/constants'
import { SavedState, useSavedStates } from '@/hooks/useSavedStates'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { toast } from '@/hooks/use-toast'
import { ImageUpload } from './ImageControls/ImageUpload'
import { ImageAdjustments } from './ImageControls/ImageAdjustments'
import { OverlayControls } from './ImageControls/OverlayControls'
import { SaveStateControls } from './ImageControls/SaveStateControls'
import { ExportControls } from './ImageControls/ExportControls'
import { SavedStatesDialog } from './SavedStatesDialog'

interface ImageExportOptions {
  format: 'image/png' | 'image/jpeg' | 'image/webp'
  quality?: number
}

interface ImageControlsProps {
  image: string | null
  scale: number
  offsetX: number
  offsetY: number
  overlayType: OverlayType | null
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onTransformChange: (transform: Partial<ImageTransform>) => void
  onSave: (options: ImageExportOptions) => void
  onReset: () => void
  onRestoreState?: (state: SavedState) => void
}

export function ImageControls({
  image,
  scale,
  offsetX,
  offsetY,
  overlayType,
  onImageUpload,
  onTransformChange,
  onSave,
  onReset,
  onRestoreState,
}: ImageControlsProps) {
  const [showSavedStates, setShowSavedStates] = useState(false)
  const {
    savedStates,
    saveState,
    deleteState,
    clearAllStates,
    exportStates,
    importStates,
    storageUsage,
    maxStorageSize
  } = useSavedStates()

  // Handle keyboard shortcuts
  useKeyboardShortcuts({
    isEnabled: Boolean(image),
    scale,
    offsetX,
    offsetY,
    overlayType,
    onTransformChange,
    onSave,
    onReset,
    onUndo: undefined, // These will be added in a future PR
    onRedo: undefined,
    onSaveState: () => setShowSavedStates(true),
    onShowSavedStates: () => setShowSavedStates(true)
  })

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/') && item.type !== 'image/gif') {
          const file = item.getAsFile()
          if (file) {
            const event = {
              target: { files: [file] }
            } as unknown as React.ChangeEvent<HTMLInputElement>
            onImageUpload(event)
            break
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [onImageUpload])

  const handleSaveState = async (name: string) => {
    if (!image) return

    try {
      await saveState({
        name,
        imageData: image,
        transform: {
          scale,
          offsetX,
          offsetY,
          overlayType
        }
      })

      toast({
        title: "State saved",
        description: `Saved as "${name}"`,
      })
    } catch (error) {
      throw error
    }
  }

  const handleRestoreState = useCallback((state: SavedState) => {
    if (!onRestoreState) return

    try {
      onRestoreState(state)
      setShowSavedStates(false)
      toast({
        title: "State restored",
        description: `Restored "${state.name}"`,
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to restore state",
        variant: "destructive"
      })
    }
  }, [onRestoreState])

  const handleImportStates = async (jsonData: string) => {
    try {
      await importStates(jsonData)
      toast({
        title: "States imported",
        description: "Successfully imported saved states",
      })
      return true
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import states",
        variant: "destructive"
      })
      return false
    }
  }

  const handleDeleteState = (id: string) => {
    deleteState(id)
    toast({
      title: "State deleted",
      description: "The saved state has been removed",
    })
  }

  const handleClearAllStates = useCallback(async () => {
    try {
      clearAllStates()
      toast({
        title: "All states cleared",
        description: "All saved states have been removed",
      })
      setShowSavedStates(false)
    } catch {
      toast({
        title: "Error",
        description: "Failed to clear saved states",
        variant: "destructive"
      })
    }
  }, [clearAllStates])

  return (
    <div className="flex flex-col gap-4 w-full">
      <ImageUpload onImageUpload={onImageUpload} />

      {image && (
        <div className="space-y-6">
          <ImageAdjustments
            scale={scale}
            offsetX={offsetX}
            offsetY={offsetY}
            onTransformChange={onTransformChange}
            onReset={onReset}
          />

          <div className="space-y-4">
            <SaveStateControls
              onSaveState={handleSaveState}
              onShowSavedStates={() => setShowSavedStates(true)}
            />

            <OverlayControls
              overlayType={overlayType}
              onTransformChange={onTransformChange}
            />

            <ExportControls onSave={onSave} />
          </div>
        </div>
      )}

      <SavedStatesDialog
        isOpen={showSavedStates}
        onOpenChange={setShowSavedStates}
        savedStates={savedStates}
        onRestoreState={handleRestoreState}
        onDeleteState={handleDeleteState}
        onClearAllStates={savedStates.length > 0 ? handleClearAllStates : undefined}
        onExportStates={exportStates}
        onImportStates={handleImportStates}
        storageUsage={storageUsage}
        maxStorageSize={maxStorageSize}
      />
    </div>
  )
}