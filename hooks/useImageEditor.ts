import { useState, useCallback, useRef, useEffect } from 'react'
import { useToast } from './use-toast'
import { useImageLoader } from './useImageLoader'
import { calculateImageHash } from '@/lib/imageUtils'
import { 
  ImageTransform, 
  DEFAULT_TRANSFORM,
  OverlayType 
} from '@/lib/constants'

interface UseImageEditorReturn extends ImageTransform {
  image: string | null
  isLoading: boolean
  loadError: string | null
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleTransformChange: (transform: Partial<ImageTransform>) => void
  handleReset: () => void
  saveImage: () => void
}

export function useImageEditor(): UseImageEditorReturn {
  const [image, setImage] = useState<string | null>(null)
  const [transform, setTransform] = useState<ImageTransform>(DEFAULT_TRANSFORM)
  const { toast } = useToast()
  const { isLoading, loadError, handleImageLoad } = useImageLoader()
  
  const imageSettingsMap = useRef<Map<string, ImageTransform>>(new Map())

  const handleTransformChange = useCallback((newTransform: Partial<ImageTransform>) => {
    setTransform(current => ({
      ...current,
      ...newTransform
    }))
  }, [])

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

  const saveImage = useCallback(() => {
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
      link.download = `edited-image-${timestamp}.png`
      link.href = canvas.toDataURL()
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
        imageSettingsMap.current.set(imageHash, transform)
      }
    }
    saveCurrentSettings()
  }, [image, transform])

  return {
    image,
    isLoading,
    loadError,
    ...transform,
    handleImageUpload,
    handleTransformChange,
    handleReset,
    saveImage,
  }
}