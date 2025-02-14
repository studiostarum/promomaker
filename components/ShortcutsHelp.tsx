import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ShortcutsHelpProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  darkMode?: boolean
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

export function ShortcutsHelp({ isOpen, onOpenChange, darkMode }: ShortcutsHelpProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
        <DialogHeader>
          <DialogTitle className={darkMode ? 'text-gray-100' : ''}>
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {SHORTCUTS.map(({ key, description }) => (
            <div key={key} className="flex items-center gap-2">
              <kbd className={`px-2 py-1 text-xs font-semibold rounded ${
                darkMode 
                  ? 'bg-gray-700 text-gray-200 border border-gray-600' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {key}
              </kbd>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                {description}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}