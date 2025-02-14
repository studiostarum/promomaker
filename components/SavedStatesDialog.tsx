import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SavedState } from '@/hooks/useSavedStates'
import { Save, Trash2, Download, Upload, Clock, XCircle, Database, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { formatFileSize } from '@/lib/utils'
import Image from 'next/image'

interface SavedStatesDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  savedStates: SavedState[]
  onRestoreState: (state: SavedState) => void
  onDeleteState: (id: string) => void
  onClearAllStates?: () => void
  onExportStates: () => void
  onImportStates: (jsonData: string) => Promise<boolean>
  storageUsage?: number
  maxStorageSize?: number
  darkMode?: boolean
}

export function SavedStatesDialog({
  isOpen,
  onOpenChange,
  savedStates,
  onRestoreState,
  onDeleteState,
  onClearAllStates,
  onExportStates,
  onImportStates,
  storageUsage = 0,
  maxStorageSize = 50 * 1024 * 1024,
  darkMode
}: SavedStatesDialogProps) {
  const [importError, setImportError] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        try {
          await onImportStates(content)
          setImportError(null)
        } catch (error) {
          setImportError(error instanceof Error ? error.message : 'Failed to import states')
        }
      }
    }
    reader.readAsText(file)
  }

  const storagePercentage = (storageUsage / maxStorageSize) * 100
  const isStorageWarning = storagePercentage > 80

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Save className="w-5 h-5" />
            Saved States
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {savedStates.length} saved {savedStates.length === 1 ? 'state' : 'states'}
              </div>
              <div className="text-sm flex items-center gap-1 text-muted-foreground">
                <Database className="w-4 h-4" />
                {formatFileSize(storageUsage)} used
                {isStorageWarning && (
                  <span className="text-yellow-500 dark:text-yellow-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {storagePercentage.toFixed(0)}% full
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onExportStates}
                className="dark:border-border dark:text-foreground"
                disabled={savedStates.length === 0}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('import-states')?.click()}
                  className="dark:border-border dark:text-foreground"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </Button>
                <input
                  id="import-states"
                  type="file"
                  accept="application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </div>
              {onClearAllStates && savedStates.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearConfirm(true)}
                  className="dark:border-border dark:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {importError && (
            <div className="text-sm text-destructive flex items-center gap-2 bg-destructive/10 p-2 rounded">
              <XCircle className="w-4 h-4" />
              {importError}
            </div>
          )}

          {showClearConfirm && (
            <div className="text-sm bg-destructive/10 p-4 rounded space-y-3">
              <div className="font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Clear all saved states?
              </div>
              <p className="text-muted-foreground">
                This action cannot be undone. All saved states will be permanently deleted.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (onClearAllStates) {
                      onClearAllStates()
                    }
                    setShowClearConfirm(false)
                  }}
                >
                  Yes, clear all
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {savedStates.map((state) => (
              <div 
                key={state.id} 
                className={`relative group rounded-lg border p-3 hover:border-primary transition-colors ${
                  darkMode ? 'border-border/50' : ''
                }`}
              >
                <div className="aspect-square mb-2 bg-secondary/20 rounded relative overflow-hidden">
                  {state.thumbnail && (
                    <div className="absolute inset-0 w-full h-full relative">
                      <Image
                        src={state.thumbnail}
                        alt="Saved state preview"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onRestoreState(state)}
                      className="dark:bg-background/90"
                    >
                      Restore
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium truncate">{state.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(state.timestamp, { addSuffix: true })}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteState(state.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {savedStates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No saved states yet. Use Ctrl+S to save your current work.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}