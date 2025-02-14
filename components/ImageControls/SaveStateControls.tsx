import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, X, Keyboard, BookMarked } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface SaveStateControlsProps {
  onSaveState: (name: string) => Promise<void>
  onShowSavedStates: () => void
}

export function SaveStateControls({
  onSaveState,
  onShowSavedStates,
}: SaveStateControlsProps) {
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [saveName, setSaveName] = useState('')

  // Auto-generate save name based on date/time
  useEffect(() => {
    if (showSaveInput && !saveName) {
      const now = new Date()
      setSaveName(`Edit ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`)
    }
  }, [showSaveInput, saveName])

  const handleSave = async () => {
    if (!saveName.trim()) {
      setShowSaveInput(true)
      return
    }

    try {
      await onSaveState(saveName)
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

  if (showSaveInput) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium dark:text-gray-200">Save Current State</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter a name for this state"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            className="flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave()
              } else if (e.key === 'Escape') {
                setShowSaveInput(false)
                setSaveName('')
              }
            }}
            autoFocus
          />
          <Button
            variant="outline"
            onClick={handleSave}
            className="dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
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
            className="dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Keyboard className="w-3 h-3" /> Press Enter to save, Esc to cancel
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => setShowSaveInput(true)}
        className="flex-1 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        title="Save current state (Ctrl+S)"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Current State
      </Button>
      <Button
        variant="outline"
        onClick={onShowSavedStates}
        className="dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        title="View saved states (Ctrl+B)"
      >
        <BookMarked className="w-4 h-4" />
      </Button>
    </div>
  )
}