import { useState, useEffect } from 'react'
import { ImageTransform, DEFAULT_TRANSFORM } from '@/lib/constants'

const PREFERENCES_KEY = 'image-editor-preferences'

interface EditorPreferences {
  defaultTransform: ImageTransform
  autoSaveSettings: boolean
  darkMode: boolean
}

const DEFAULT_PREFERENCES: EditorPreferences = {
  defaultTransform: DEFAULT_TRANSFORM,
  autoSaveSettings: true,
  darkMode: false,
}

export function useEditorPreferences() {
  const [preferences, setPreferences] = useState<EditorPreferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    // Load preferences from localStorage on mount
    const savedPreferences = localStorage.getItem(PREFERENCES_KEY)
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences))
      } catch (e) {
        console.error('Failed to parse saved preferences')
      }
    }
  }, [])

  const updatePreferences = (updates: Partial<EditorPreferences>) => {
    setPreferences(current => {
      const newPreferences = { ...current, ...updates }
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences))
      return newPreferences
    })
  }

  const resetPreferences = () => {
    localStorage.removeItem(PREFERENCES_KEY)
    setPreferences(DEFAULT_PREFERENCES)
  }

  return {
    preferences,
    updatePreferences,
    resetPreferences,
  }
}