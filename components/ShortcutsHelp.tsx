import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ShortcutsHelpProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const SHORTCUTS = [
  { key: 'Arrow Keys', description: 'Move image position' },
  { key: 'Shift + Arrows', description: 'Move in larger steps' },
  { key: '+/-', description: 'Adjust image scale' },
  { key: 'Shift + +/-', description: 'Scale in larger steps' },
  { key: '1', description: 'Toggle cinematic overlay' },
  { key: '2', description: 'Toggle full-frame overlay' },
  { key: '0', description: 'Remove overlay' },
  { key: 'R', description: 'Reset all transformations' },
  { key: 'S', description: 'Save image' },
  { key: 'Ctrl + S', description: 'Save current state' },
  { key: 'Ctrl + B', description: 'Browse saved states' },
  { key: 'Ctrl + Z', description: 'Undo' },
  { key: 'Ctrl + Y', description: 'Redo' },
  { key: '?', description: 'Show/hide shortcuts' }
] as const

export function ShortcutsHelp({ isOpen, onOpenChange }: ShortcutsHelpProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {SHORTCUTS.map(({ key, description }) => (
            <div key={key} className="flex flex-col items-start gap-2">
              <kbd className="px-2 py-1 text-sm uppercase font-semibold rounded bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                {key}
              </kbd>
              <span className="text-gray-600 dark:text-gray-300">
                {description}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}