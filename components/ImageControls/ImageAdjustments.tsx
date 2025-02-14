import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { ImageTransform, IMAGE_CONSTRAINTS } from '@/lib/constants'

interface ImageAdjustmentsProps {
  scale: number
  offsetX: number
  offsetY: number
  onTransformChange: (transform: Partial<ImageTransform>) => void
  onReset: () => void
}

export function ImageAdjustments({
  scale,
  offsetX,
  offsetY,
  onTransformChange,
  onReset
}: ImageAdjustmentsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Label className="dark:text-gray-200">
          Image Adjustments
        </Label>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          title="Reset all adjustments (R)"
          className="dark:hover:bg-gray-800"
        >
          Reset All
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="dark:text-gray-200">Scale</Label>
            <button
              className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
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
            className="w-full [&_[role=slider]]:dark:bg-gray-200"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{IMAGE_CONSTRAINTS.MIN_SCALE}x</span>
            <span>{scale.toFixed(1)}x</span>
            <span>{IMAGE_CONSTRAINTS.MAX_SCALE}x</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="dark:text-gray-200">
              Horizontal Position
            </Label>
            <button
              className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
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
            className="w-full [&_[role=slider]]:dark:bg-gray-200"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{IMAGE_CONSTRAINTS.MIN_OFFSET}px</span>
            <span>{offsetX}px</span>
            <span>{IMAGE_CONSTRAINTS.MAX_OFFSET}px</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="dark:text-gray-200">
              Vertical Position
            </Label>
            <button
              className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
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
            className="w-full [&_[role=slider]]:dark:bg-gray-200"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{IMAGE_CONSTRAINTS.MIN_OFFSET}px</span>
            <span>{offsetY}px</span>
            <span>{IMAGE_CONSTRAINTS.MAX_OFFSET}px</span>
          </div>
        </div>
      </div>
    </div>
  )
}