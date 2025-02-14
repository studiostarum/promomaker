import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { ImageTransform } from '@/lib/constants'

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
          <DialogTitle>Editor Preferences</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save">Auto-save settings</Label>
              <Switch
                id="auto-save"
                checked={autoSaveSettings}
                onCheckedChange={(checked) => onUpdatePreferences({ autoSaveSettings: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark mode</Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={(checked) => onUpdatePreferences({ darkMode: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label>Default Scale</Label>
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
              <div className="text-xs text-gray-500 text-right">
                {defaultTransform.scale.toFixed(1)}x
              </div>
            </div>

            <div className="pt-4 space-x-2 flex justify-end">
              <Button variant="outline" onClick={onResetPreferences}>
                Reset to Defaults
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}