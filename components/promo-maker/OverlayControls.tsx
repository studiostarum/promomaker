"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface OverlayControlsProps {
  visible: boolean;
  opacity: number;
  onVisibleChange: (visible: boolean) => void;
  onOpacityChange: (opacity: number) => void;
}

export function OverlayControls({
  visible,
  opacity,
  onVisibleChange,
  onOpacityChange,
}: OverlayControlsProps) {
  return (
    <div className="absolute top-2 left-2 z-10 flex flex-col gap-2 bg-background/50 backdrop-blur-sm p-2 rounded-lg">
      <div className="flex items-center gap-2">
        <Label className="text-xs">Overlay</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onVisibleChange(!visible)}
        >
          {visible ? 'Hide' : 'Show'}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs">Opacity</Label>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity * 100}
          onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
          className="w-24 h-2"
        />
      </div>
    </div>
  );
} 