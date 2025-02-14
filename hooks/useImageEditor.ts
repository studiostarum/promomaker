import { useState, useCallback, useRef, useEffect } from 'react'
import { useToast } from './use-toast'
import { useImageLoader } from './useImageLoader'
import { calculateImageHash } from '@/lib/imageUtils'
import {
  ImageTransform,
  DEFAULT_TRANSFORM,
  OverlayType
} from '@/lib/constants'
import { SavedState } from './useSavedStates'
import { debounce } from 'lodash';

interface ImageExportOptions {
  format: 'image/png' | 'image/jpeg' | 'image/webp'
  quality?: number
}

interface UseImageEditorReturn {
  image: string | null
  isLoading: boolean
  loadError: string | null
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleReset: () => void
  saveImage: (options: ImageExportOptions) => void
  handleRestoreState: (state: SavedState) => void
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void
  handleMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void
  handleWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void
  // Added property for slider updates
  handleTransformChange: (transform: Partial<ImageTransform>) => void
}

export function useImageEditor(): UseImageEditorReturn {
  const [image, setImage] = useState<string | null>(null)
  const [transform, setTransform] = useState<ImageTransform>(DEFAULT_TRANSFORM)
  const { toast } = useToast()
  const { isLoading, loadError, handleImageLoad } = useImageLoader()

  const imageSettingsMap = useRef<Map<string, ImageTransform>>(new Map())
  const isDraggingRef = useRef(false)
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const currentTransformRef = useRef(transform)
  const prevTransformRef = useRef(transform);

  // Keep the ref in sync with state
  useEffect(() => {
    currentTransformRef.current = transform
  }, [transform])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true
    lastMousePosRef.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.style.cursor = 'grabbing'
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return

    const deltaX = e.clientX - lastMousePosRef.current.x
    const deltaY = e.clientY - lastMousePosRef.current.y

    // Update the transform using CSS instead of state
    const newOffsetX = currentTransformRef.current.offsetX + deltaX
    const newOffsetY = currentTransformRef.current.offsetY + deltaY

    e.currentTarget.style.transform = `translate(${newOffsetX}px, ${newOffsetY}px) scale(${currentTransformRef.current.scale})`

    lastMousePosRef.current = { x: e.clientX, y: e.clientY }

    // Store the values in ref for later use
    currentTransformRef.current = {
      ...currentTransformRef.current,
      offsetX: newOffsetX,
      offsetY: newOffsetY
    }
  }, [])

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return

    isDraggingRef.current = false
    e.currentTarget.style.cursor = 'grab'

    // Update the state once at the end of dragging
    setTransform(currentTransformRef.current)
  }, [])

  // Debounced state update function
  const debouncedSetTransform = useCallback(
    debounce((newTransform: ImageTransform) => {
      setTransform(newTransform);
    }, 100), // Adjust the debounce time as needed
    []
  );

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const zoomFactor = 0.1;
    const delta = e.deltaY < 0 ? 1 + zoomFactor : 1 - zoomFactor;
    const newScale = Math.max(0.1, Math.min(5, currentTransformRef.current.scale * delta));

    currentTransformRef.current = {
      ...currentTransformRef.current,
      scale: newScale,
    };

    e.currentTarget.style.transform = `translate(${currentTransformRef.current.offsetX}px, ${currentTransformRef.current.offsetY}px) scale(${newScale})`;

    // Update state using debounced function
    debouncedSetTransform(currentTransformRef.current);
  }, [debouncedSetTransform]);

  const handleTransformChange = useCallback((newTransform: Partial<ImageTransform>) => {
    setTransform(prev => ({ ...prev, ...newTransform }));
  }, []);

  const handleReset = useCallback(() => {
    setTransform(DEFAULT_TRANSFORM)
    toast({
      title: "Reset complete",
      description: "Image position and scale have been reset",
    })
  }, [toast])

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const imageData = await handleImageLoad(file)
      const imageHash = await calculateImageHash(imageData)

      const savedSettings = imageSettingsMap.current.get(imageHash)
      if (savedSettings) {
        setTransform(savedSettings)
        toast({
          title: "Settings restored",
          description: "Previous image settings have been restored",
        })
      } else {
        setTransform(DEFAULT_TRANSFORM)
      }

      setImage(imageData)
      toast({
        title: "Image uploaded",
        description: "Your image has been loaded successfully",
      })
    } catch (error) {
      // Error is already handled by useImageLoader and shown via toast
      setImage(null)
    }
  }, [handleImageLoad, toast])

  const saveImage = useCallback((options: ImageExportOptions) => {
    const canvas = document.querySelector('canvas')
    if (!canvas) {
      toast({
        title: "Error",
        description: "Could not save the image",
        variant: "destructive",
      })
      return
    }

    try {
      const link = document.createElement('a')
      const now = new Date()
      const timestamp = now.toISOString().replace(/[:.]/g, '-')
      const ext = options.format.split('/')[1]
      link.download = `edited-image-${timestamp}.${ext}`

      // For PNG, we don't need quality setting
      if (options.format === 'image/png') {
        link.href = canvas.toDataURL(options.format)
      } else {
        // For other formats, use quality setting
        const quality = options.quality ?? 0.9
        link.href = canvas.toDataURL(options.format, quality)
      }

      link.click()

      toast({
        title: "Success",
        description: "Image saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the image",
        variant: "destructive",
      })
    }
  }, [toast])

  // Save settings whenever they change
  useEffect(() => {
    const saveCurrentSettings = async () => {
      if (image) {
        const imageHash = await calculateImageHash(image)
        const currentSettings = imageSettingsMap.current.get(imageHash)
        if (currentSettings && JSON.stringify(currentSettings) === JSON.stringify(transform)) {
          return
        }
        imageSettingsMap.current.set(imageHash, transform)
      }
    }

    if (JSON.stringify(prevTransformRef.current) !== JSON.stringify(transform)) {
      saveCurrentSettings();
      prevTransformRef.current = transform;
    }
  }, [image, transform])

  const handleRestoreState = useCallback((state: SavedState) => {
    setImage(state.imageData)
    setTransform(state.transform)
  }, [])

  return {
    image,
    isLoading,
    loadError,
    handleImageUpload,
    handleReset,
    saveImage,
    handleRestoreState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    // Return the new update handler so that updateEditor is defined
    handleTransformChange,
  }
}