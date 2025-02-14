import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ImageTransform, IMAGE_CONSTRAINTS, OVERLAY_TYPES } from '@/lib/constants'

interface ImageControlsProps extends ImageTransform {
  image: string | null
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onTransformChange: (transform: Partial<ImageTransform>) => void
  onSave: () => void
  onReset: () => void
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
  darkMode
}: ImageControlsProps) {
  const [isDragging, setIsDragging] = useState(false)

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
          accept="image/*"
          onChange={onImageUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className={`text-center text-sm ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {isDragging ? 'Drop image here' : 'Drop image here or click to upload'}
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
              <DropdownMenuContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <DropdownMenuItem 
                  onClick={() => onTransformChange({ overlayType: OVERLAY_TYPES.CINEMATIC })}
                  className={darkMode ? 'hover:bg-gray-700' : ''}
                >
                  Cinematic Bars (1)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onTransformChange({ overlayType: OVERLAY_TYPES.FULL_FRAME })}
                  className={darkMode ? 'hover:bg-gray-700' : ''}
                >
                  Full Frame Bars (2)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onTransformChange({ overlayType: null })}
                  className={darkMode ? 'hover:bg-gray-700' : ''}
                >
                  Remove Overlay (0)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              onClick={onSave} 
              className={`w-full ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              title="Save image (S)"
            >
              Save Image
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}