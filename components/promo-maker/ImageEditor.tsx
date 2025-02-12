"use client";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { ImageTransform } from "./types";
import { useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface ImageEditorProps {
  image: string | null;
  onSave: () => void;
  onDownload: () => void;
  imageTransform: ImageTransform;
  onTransformChange: (transform: ImageTransform) => void;
  overlayVisible: boolean;
  overlayOpacity: number;
  onOverlayVisibleChange: (visible: boolean) => void;
  onOverlayOpacityChange: (opacity: number) => void;
}

const TransformInitializer = ({ 
  savedTransform, 
  setTransform,
  centerView,
}: { 
  savedTransform: ImageTransform; 
  setTransform: (x: number, y: number, scale: number) => void;
  centerView: () => void;
}) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      const timer = setTimeout(() => {
        centerView();
        setTransform(savedTransform.x, savedTransform.y, savedTransform.scale);
        initialized.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [savedTransform, setTransform, centerView]);

  return null;
};

export function ImageEditor({
  image,
  onSave,
  onDownload,
  imageTransform,
  onTransformChange,
  overlayVisible,
  overlayOpacity,
  onOverlayVisibleChange,
  onOverlayOpacityChange,
}: ImageEditorProps) {
  return (
    <div className="space-y-2">
      <div className="relative aspect-square border rounded-lg overflow-hidden bg-muted/10">
        <TransformWrapper
          minScale={0.5}
          maxScale={3}
          initialScale={imageTransform.scale}
          initialPositionX={imageTransform.x}
          initialPositionY={imageTransform.y}
          limitToBounds={false}
          onTransformed={(e) => {
            onTransformChange({
              scale: e.state.scale,
              x: e.state.positionX,
              y: e.state.positionY,
            });
          }}
        >
          {({ zoomIn, zoomOut, resetTransform, setTransform, centerView }) => (
            <>
              <TransformInitializer
                savedTransform={imageTransform}
                setTransform={setTransform}
                centerView={centerView}
              />

              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                }}
              >
                {image ? (
                  <img
                    src={image}
                    alt="Base Image"
                    className="w-full h-full object-contain"
                    style={{
                      minWidth: "100%",
                      minHeight: "100%",
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <p className="text-sm">Upload or paste an image to start</p>
                  </div>
                )}
              </TransformComponent>

              {overlayVisible && (
                <img
                  src="/overlay.svg"
                  alt="Overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    opacity: overlayOpacity,
                  }}
                />
              )}

              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 p-4">
                {/* Overlay controls */}
                <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onOverlayVisibleChange(!overlayVisible)}
                    aria-label={overlayVisible ? "Hide overlay" : "Show overlay"}
                  >
                    {overlayVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  {overlayVisible && (
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={overlayOpacity * 100}
                      onChange={(e) => onOverlayOpacityChange(Number(e.target.value) / 100)}
                      className="w-24 h-2"
                      aria-label="Overlay opacity"
                    />
                  )}
                </div>

                <div className="h-full w-px bg-border/50" />

                {/* Transform controls */}
                <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => zoomIn()}
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => zoomOut()}
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => resetTransform()}
                    aria-label="Reset transform"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
} 