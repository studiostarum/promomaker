import { type EditorPreferences } from '@/lib/constants'
import { Monitor, Moon, Sun, Settings, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { ImageTransform } from '@/lib/constants'

interface PreferencesDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  defaultTransform: Partial<ImageTransform>
  autoSaveSettings: boolean
  preferences: EditorPreferences
  onUpdatePreferences: (preferences: Partial<EditorPreferences>) => void
  onResetPreferences: () => void
}

export function PreferencesDialog({
  isOpen,
  onOpenChange,
  defaultTransform,
  autoSaveSettings,
  preferences,
  onUpdatePreferences,
  onResetPreferences,
}: PreferencesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Editor Preferences
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                <Button
                  variant={preferences.darkMode === 'light' ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onUpdatePreferences({ darkMode: 'light' })}
                  className="flex-1"
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={preferences.darkMode === 'dark' ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onUpdatePreferences({ darkMode: 'dark' })}
                  className="flex-1"
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Dark
                </Button>
                <Button
                  variant={preferences.darkMode === 'system' ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onUpdatePreferences({ darkMode: 'system' })}
                  className="flex-1"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  System
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="auto-save" className="text-sm font-medium">Auto-save settings</Label>
              <Switch
                id="auto-save"
                checked={autoSaveSettings}
                onCheckedChange={(checked) => onUpdatePreferences({ autoSaveSettings: checked })}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Default Scale</Label>
              <Slider
                value={[defaultTransform.scale ?? 1]}
                onValueChange={([value]) =>
                  onUpdatePreferences({
                    defaultTransform: { ...defaultTransform, scale: value }
                  })
                }
                min={0.1}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-right">
                {(defaultTransform.scale ?? 1).toFixed(1)}x
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={onResetPreferences}
              >
                <RotateCcw className="w-4 h-4" />
                Reset to default
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}