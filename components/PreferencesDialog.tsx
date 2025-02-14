import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { ImageTransform } from '@/lib/constants'
import { Settings, RotateCcw } from 'lucide-react'

interface PreferencesDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  defaultTransform: ImageTransform
  autoSaveSettings: boolean
  darkMode: boolean
  onUpdatePreferences: (updates: { 
    defaultTransform?: ImageTransform
    autoSaveSettings?: boolean
    darkMode?: boolean
  }) => void
  onResetPreferences: () => void
}

export function PreferencesDialog({
  isOpen,
  onOpenChange,
  defaultTransform,
  autoSaveSettings,
  darkMode,
  onUpdatePreferences,
  onResetPreferences,
}: PreferencesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Editor Preferences
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="auto-save" className="text-sm font-medium">Auto-save settings</Label>
              <Switch
                id="auto-save"
                checked={autoSaveSettings}
                onCheckedChange={(checked) => onUpdatePreferences({ autoSaveSettings: checked })}
              />
            </div>

            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="dark-mode" className="text-sm font-medium">Dark mode</Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={(checked) => onUpdatePreferences({ darkMode: checked })}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Default Scale</Label>
              <Slider
                value={[defaultTransform.scale]}
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
                {defaultTransform.scale.toFixed(1)}x
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={onResetPreferences}
                className="dark:border-border dark:text-foreground dark:hover:bg-secondary/80"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </Button>
              <Button 
                onClick={() => onOpenChange(false)}
                className="dark:text-primary-foreground"
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