import { useState, useEffect } from 'react'
import { ImageTransform } from '@/lib/constants'
import { compressImage } from '@/lib/imageUtils'

export interface SavedState {
  id: string
  name: string
  timestamp: number
  imageData: string
  transform: ImageTransform
  thumbnail?: string
}

const SAVED_STATES_KEY = 'image-editor-saved-states'
const MAX_STATES = 50 // Maximum number of states to keep
const MAX_STORAGE_SIZE = 50 * 1024 * 1024 // 50MB max storage

export function useSavedStates() {
  const [savedStates, setSavedStates] = useState<SavedState[]>([])
  const [storageUsage, setStorageUsage] = useState<number>(0)

  useEffect(() => {
    // Load saved states from localStorage on mount
    const savedData = localStorage.getItem(SAVED_STATES_KEY)
    if (savedData) {
      try {
        const states = JSON.parse(savedData)
        setSavedStates(states)
        calculateStorageUsage(states)
      } catch (e) {
        console.error('Failed to parse saved states')
      }
    }
  }, [])

  const calculateStorageUsage = (states: SavedState[]) => {
    const usage = new TextEncoder().encode(JSON.stringify(states)).length
    setStorageUsage(usage)
    return usage
  }

  const compressStateImage = async (imageData: string): Promise<string> => {
    try {
      // Compress the image while maintaining quality
      return await compressImage(imageData, 2048, 2048, 0.9)
    } catch (e) {
      console.warn('Image compression failed, using original image')
      return imageData
    }
  }

  const saveState = async (state: Omit<SavedState, 'id' | 'timestamp' | 'thumbnail'>) => {
    try {
      // Compress the image data
      const compressedImage = await compressStateImage(state.imageData)
      
      // Generate thumbnail
      const thumbnail = await generateThumbnail(compressedImage)
      
      const newState: SavedState = {
        ...state,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageData: compressedImage,
        thumbnail
      }

      setSavedStates(current => {
        // Remove oldest states if we're over the limit
        let updated = [newState, ...current]
        if (updated.length > MAX_STATES) {
          updated = updated.slice(0, MAX_STATES)
        }

        // Check storage usage
        const usage = calculateStorageUsage(updated)
        if (usage > MAX_STORAGE_SIZE) {
          throw new Error('Storage limit reached. Please delete some saved states first.')
        }

        try {
          localStorage.setItem(SAVED_STATES_KEY, JSON.stringify(updated))
          return updated
        } catch (e) {
          if (e instanceof Error && e.name === 'QuotaExceededError') {
            throw new Error('Browser storage limit reached. Please delete some saved states first.')
          }
          throw e
        }
      })

      return newState
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to save state')
    }
  }

  const deleteState = (id: string) => {
    setSavedStates(current => {
      const updated = current.filter(state => state.id !== id)
      localStorage.setItem(SAVED_STATES_KEY, JSON.stringify(updated))
      calculateStorageUsage(updated)
      return updated
    })
  }

  const clearAllStates = () => {
    localStorage.removeItem(SAVED_STATES_KEY)
    setSavedStates([])
    setStorageUsage(0)
  }

  const exportStates = () => {
    const dataStr = JSON.stringify(savedStates)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `image-states-${new Date().toISOString()}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importStates = async (jsonData: string) => {
    try {
      const imported = JSON.parse(jsonData) as SavedState[]
      
      // Validate imported data structure
      if (!Array.isArray(imported) || !imported.every(isValidSavedState)) {
        throw new Error('Invalid saved states format')
      }

      setSavedStates(current => {
        const updated = [...imported, ...current]
        const usage = calculateStorageUsage(updated)
        
        if (usage > MAX_STORAGE_SIZE) {
          throw new Error('Import would exceed storage limit')
        }

        localStorage.setItem(SAVED_STATES_KEY, JSON.stringify(updated))
        return updated
      })
      return true
    } catch (e) {
      console.error('Failed to import states:', e)
      throw e
    }
  }

  return {
    savedStates,
    saveState,
    deleteState,
    clearAllStates,
    exportStates,
    importStates,
    storageUsage,
    maxStorageSize: MAX_STORAGE_SIZE,
  }
}

// Helper function to generate thumbnails
async function generateThumbnail(imageData: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Set thumbnail size
      const maxSize = 100
      const scale = Math.min(maxSize / img.width, maxSize / img.height)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      
      if (ctx) {
        // Use better image smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      } else {
        reject(new Error('Failed to get canvas context'))
      }
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageData
  })
}

// Type guard for validating imported states
function isValidSavedState(state: any): state is SavedState {
  return (
    typeof state === 'object' &&
    typeof state.id === 'string' &&
    typeof state.name === 'string' &&
    typeof state.timestamp === 'number' &&
    typeof state.imageData === 'string' &&
    typeof state.transform === 'object' &&
    typeof state.transform.scale === 'number' &&
    typeof state.transform.offsetX === 'number' &&
    typeof state.transform.offsetY === 'number' &&
    (state.transform.overlayType === null || typeof state.transform.overlayType === 'string')
  )
}