import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ImageTransform, OVERLAY_TYPES, OverlayType } from '@/lib/constants'
import { LayoutPanelTop, LayoutTemplate, X } from 'lucide-react'

interface OverlayControlsProps {
  overlayType: OverlayType | null
  onTransformChange: (transform: Partial<ImageTransform>) => void
}

export function OverlayControls({
  overlayType,
  onTransformChange,
}: OverlayControlsProps) {
  return (
    <div className="space-y-4">
      <Label className="dark:text-gray-200">Overlay</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full dark:border-gray-700 dark:hover:bg-gray-800"
            title="Choose overlay type (1/2/0)"
          >
            {overlayType
              ? `${overlayType.charAt(0).toUpperCase() + overlayType.slice(1)} Overlay`
              : 'Choose Overlay'
            }
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => onTransformChange({ overlayType: OVERLAY_TYPES.CINEMATIC })}
            className="dark:text-foreground dark:focus:text-foreground dark:focus:bg-accent/20 dark:hover:bg-accent/10"
          >
            <LayoutPanelTop className="h-4 w-4 mr-2" />
            Cinematic Bars (1)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onTransformChange({ overlayType: OVERLAY_TYPES.FULL_FRAME })}
            className="dark:text-foreground dark:focus:text-foreground dark:focus:bg-accent/20 dark:hover:bg-accent/10"
          >
            <LayoutTemplate className="h-4 w-4 mr-2" />
            Full Frame Bars (2)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onTransformChange({ overlayType: null })}
            className="dark:text-foreground dark:focus:text-foreground dark:focus:bg-accent/20 dark:hover:bg-accent/10"
          >
            <X className="h-4 w-4 mr-2" />
            Remove Overlay (0)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}