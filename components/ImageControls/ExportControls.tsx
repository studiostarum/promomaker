import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronDown, Download, Image } from 'lucide-react'

interface ImageExportOptions {
  format: 'image/png' | 'image/jpeg' | 'image/webp'
  quality?: number
}

interface ExportControlsProps {
  onSave: (options: ImageExportOptions) => void
}

export function ExportControls({ onSave }: ExportControlsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          onClick={(e) => e.preventDefault()}
          className="w-full"
          title="Export image (S)"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Image
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => onSave({ format: 'image/png' })}
        >
          <Image className="w-4 h-4 mr-2" aria-label="PNG icon" />
          PNG (Lossless)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSave({ format: 'image/jpeg', quality: 0.9 })}
        >
          <Image className="w-4 h-4 mr-2" aria-label="JPEG icon" />
          JPEG (High Quality)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSave({ format: 'image/webp', quality: 0.9 })}
        >
          <Image className="w-4 h-4 mr-2" aria-label="WebP icon" />
          WebP (Best compression)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}