import { useState, useCallback } from 'react'
import { IMAGE_CONSTRAINTS } from '@/lib/constants'

interface UseImageLoaderReturn {
  isLoading: boolean
  loadError: string | null
  handleImageLoad: (file: File) => Promise<string>
}

export function useImageLoader(): UseImageLoaderReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const handleImageLoad = useCallback(async (file: File): Promise<string> => {
    setIsLoading(true)
    setLoadError(null)

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      // Validate file size
      if (file.size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE) {
        throw new Error(`Please upload an image smaller than ${IMAGE_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB`)
      }

      // Load and validate image dimensions
      const loadImagePromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const img = new Image()
          img.onload = () => {
            // Image loaded successfully
            resolve(reader.result as string)
          }
          img.onerror = () => {
            reject(new Error('Failed to load image. The file might be corrupted.'))
          }
          img.src = reader.result as string
        }
        reader.onerror = () => {
          reject(new Error('Failed to read the image file'))
        }
        reader.readAsDataURL(file)
      })

      const imageData = await loadImagePromise
      setIsLoading(false)
      return imageData
    } catch (error) {
      setIsLoading(false)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load image'
      setLoadError(errorMessage)
      throw error
    }
  }, [])

  return {
    isLoading,
    loadError,
    handleImageLoad
  }
}