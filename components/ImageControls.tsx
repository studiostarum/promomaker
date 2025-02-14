import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ImageTransform, IMAGE_CONSTRAINTS, OVERLAY_TYPES, OverlayType } from '@/lib/constants'
import { 
  Layers, 
  ChevronDown, 
  LayoutPanelTop, 
  LayoutTemplate, 
  X, 
  Save, 
  BookMarked,
  Download,
  Keyboard,
  Image
} from 'lucide-react'
import { SavedStatesDialog } from './SavedStatesDialog'
import { useSavedStates, SavedState } from '@/hooks/useSavedStates'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { toast } from '@/hooks/use-toast'

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
  darkMode?: boolean
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
  darkMode
}: ImageControlsProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showSavedStates, setShowSavedStates] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [exportFormat, setExportFormat] = useState<ImageExportOptions>({
    format: 'image/png',
    quality: 0.9
  })
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
    onSaveState: () => setShowSaveInput(true),
    onShowSavedStates: () => setShowSavedStates(true)
  })

  // Auto-generate save name based on date/time
  useEffect(() => {
    if (showSaveInput && !saveName) {
      const now = new Date()
      setSaveName(`Edit ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`)
    }
  }, [showSaveInput, saveName])

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const event = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>
      onImageUpload(event)
    }
  }

  const handleSaveState = async () => {
    if (!image) return
    
    if (!saveName) {
      setShowSaveInput(true)
      return
    }

    try {
      await saveState({
        name: saveName,
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
        description: `Saved as "${saveName}"`,
      })

      setSaveName('')
      setShowSaveInput(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save state",
        variant: "destructive"
      })
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore state",
        variant: "destructive"
      })
    }
  }, [onRestoreState, toast])

  useEffect(() => {
    if (onRestoreState) {
      onTransformChange({
        scale: scale,
        offsetX: offsetX,
        offsetY: offsetY,
        overlayType: overlayType
      })
    }
  }, [scale, offsetX, offsetY, overlayType, onTransformChange, onRestoreState])

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
      setShowSavedStates(false) // Close dialog after successful clear
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear saved states",
        variant: "destructive"
      })
    }
  }, [clearAllStates, toast])

  return (
    <div className="flex flex-col gap-4 w-full">
      <div 
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragging 
            ? darkMode 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-blue-500 bg-blue-50'
            : darkMode
              ? 'border-gray-700 hover:border-gray-600'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onImageUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className={`text-center text-sm ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {isDragging 
            ? 'Drop image here' 
            : 'Drop image here, paste from clipboard, or click to upload'}
        </div>
        <div className={`text-center text-xs mt-1 ${
          darkMode ? 'text-gray-500' : 'text-gray-400'
        }`}>
          Supports JPG, PNG, and WebP
        </div>
      </div>
      
      {image && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className={darkMode ? 'text-gray-200' : ''}>
                Image Adjustments
              </Label>
              <Button 
                variant={darkMode ? "ghost" : "outline"}
                size="sm"
                onClick={onReset}
                title="Reset all adjustments (R)"
                className={darkMode ? 'hover:bg-gray-800' : ''}
              >
                Reset All
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className={darkMode ? 'text-gray-200' : ''}>Scale</Label>
                <button 
                  className={`text-xs ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  onClick={() => onTransformChange({ scale: 1 })}
                  title="Reset scale"
                >
                  Reset
                </button>
              </div>
              <Slider
                value={[scale]}
                onValueChange={([value]) => onTransformChange({ scale: value })}
                min={IMAGE_CONSTRAINTS.MIN_SCALE}
                max={IMAGE_CONSTRAINTS.MAX_SCALE}
                step={0.1}
                className={`w-full ${darkMode ? '[&_[role=slider]]:bg-gray-200' : ''}`}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span className={darkMode ? 'text-gray-400' : ''}>
                  {IMAGE_CONSTRAINTS.MIN_SCALE}x
                </span>
                <span className={darkMode ? 'text-gray-400' : ''}>
                  {scale.toFixed(1)}x
                </span>
                <span className={darkMode ? 'text-gray-400' : ''}>
                  {IMAGE_CONSTRAINTS.MAX_SCALE}x
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className={darkMode ? 'text-gray-200' : ''}>
                  Horizontal Position
                </Label>
                <button 
                  className={`text-xs ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  onClick={() => onTransformChange({ offsetX: 0 })}
                  title="Center horizontally"
                >
                  Center
                </button>
              </div>
              <Slider
                value={[offsetX]}
                onValueChange={([value]) => onTransformChange({ offsetX: value })}
                min={IMAGE_CONSTRAINTS.MIN_OFFSET}
                max={IMAGE_CONSTRAINTS.MAX_OFFSET}
                step={1}
                className={`w-full ${darkMode ? '[&_[role=slider]]:bg-gray-200' : ''}`}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span className={darkMode ? 'text-gray-400' : ''}>
                  {IMAGE_CONSTRAINTS.MIN_OFFSET}px
                </span>
                <span className={darkMode ? 'text-gray-400' : ''}>
                  {offsetX}px
                </span>
                <span className={darkMode ? 'text-gray-400' : ''}>
                  {IMAGE_CONSTRAINTS.MAX_OFFSET}px
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className={darkMode ? 'text-gray-200' : ''}>
                  Vertical Position
                </Label>
                <button 
                  className={`text-xs ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  onClick={() => onTransformChange({ offsetY: 0 })}
                  title="Center vertically"
                >
                  Center
                </button>
              </div>
              <Slider
                value={[offsetY]}
                onValueChange={([value]) => onTransformChange({ offsetY: value })}
                min={IMAGE_CONSTRAINTS.MIN_OFFSET}
                max={IMAGE_CONSTRAINTS.MAX_OFFSET}
                step={1}
                className={`w-full ${darkMode ? '[&_[role=slider]]:bg-gray-200' : ''}`}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span className={darkMode ? 'text-gray-400' : ''}>
                  {IMAGE_CONSTRAINTS.MIN_OFFSET}px
                </span>
                <span className={darkMode ? 'text-gray-400' : ''}>
                  {offsetY}px
                </span>
                <span className={darkMode ? 'text-gray-400' : ''}>
                  {IMAGE_CONSTRAINTS.MAX_OFFSET}px
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {showSaveInput ? (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Save Current State</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a name for this state"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveState()
                      } else if (e.key === 'Escape') {
                        setShowSaveInput(false)
                        setSaveName('')
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    variant="outline"
                    onClick={handleSaveState}
                    className="dark:border-border dark:text-foreground whitespace-nowrap"
                    disabled={!saveName.trim()}
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowSaveInput(false)
                      setSaveName('')
                    }}
                    className="dark:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Keyboard className="w-3 h-3" /> Press Enter to save, Esc to cancel
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveInput(true)}
                  className="flex-1 dark:border-border dark:text-foreground"
                  title="Save current state (Ctrl+S)"
                >
                  <Save className="w-4 h-4" />
                  Save Current State
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSavedStates(true)}
                  className="dark:border-border dark:text-foreground"
                  title="View saved states (Ctrl+B)"
                >
                  <BookMarked className="w-4 h-4" />
                </Button>
              </div>
            )}

            <Label className={darkMode ? 'text-gray-200' : ''}>Overlay</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant={darkMode ? "ghost" : "outline"}
                  className={`w-full ${darkMode ? 'border-gray-700 hover:bg-gray-800' : ''}`}
                  title="Choose overlay type (1/2/0)"
                >
                  {overlayType 
                    ? `${overlayType.charAt(0).toUpperCase() + overlayType.slice(1)} Overlay` 
                    : 'Choose Overlay'
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dark:bg-card">
                <DropdownMenuItem 
                  onClick={() => onTransformChange({ overlayType: OVERLAY_TYPES.CINEMATIC })}
                  className="dark:text-foreground dark:focus:text-foreground dark:focus:bg-accent/20 dark:hover:bg-accent/10"
                >
                  <LayoutPanelTop className="h-4 w-4" />
                  Cinematic Bars (1)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onTransformChange({ overlayType: OVERLAY_TYPES.FULL_FRAME })}
                  className="dark:text-foreground dark:focus:text-foreground dark:focus:bg-accent/20 dark:hover:bg-accent/10"
                >
                  <LayoutTemplate className="h-4 w-4" />
                  Full Frame Bars (2)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onTransformChange({ overlayType: null })}
                  className="dark:text-foreground dark:focus:text-foreground dark:focus:bg-accent/20 dark:hover:bg-accent/10"
                >
                  <X className="h-4 w-4" />
                  Remove Overlay (0)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  onClick={(e) => e.preventDefault()}
                  className={`w-full ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  title="Export image (S)"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Image
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem 
                  onClick={() => onSave({ format: 'image/png' })}
                >
                  <Image className="w-4 h-4 mr-2" />
                  PNG (Lossless)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onSave({ format: 'image/jpeg', quality: 0.9 })}
                >
                  <Image className="w-4 h-4 mr-2" />
                  JPEG (High Quality)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onSave({ format: 'image/webp', quality: 0.9 })}
                >
                  <Image className="w-4 h-4 mr-2" />
                  WebP (Best Compression)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        darkMode={darkMode}
      />
    </div>
  )
}