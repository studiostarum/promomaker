import { useState } from 'react'
import { useToast } from './use-toast'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function useImageLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleImageLoad = async (file: File): Promise<string> => {
    setIsLoading(true)
    setLoadError(null)

    try {
      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error('Please select a JPG, PNG, or WebP image')
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('Image size must be less than 10MB')
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        
        reader.onload = () => {
          // Validate that it's actually an image
          const img = new Image()
          img.onload = () => {
            setIsLoading(false)
            resolve(reader.result as string)
          }
          img.onerror = () => {
            setIsLoading(false)
            reject(new Error('Invalid image file'))
          }
          img.src = reader.result as string
        }

        reader.onerror = () => {
          setIsLoading(false)
          reject(new Error('Failed to read file'))
        }

        reader.readAsDataURL(file)
      })
    } catch (error) {
      setIsLoading(false)
      const message = error instanceof Error ? error.message : 'Failed to load image'
      setLoadError(message)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  return {
    isLoading,
    loadError,
    handleImageLoad
  }
}