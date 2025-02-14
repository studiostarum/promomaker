import { useState, useEffect } from 'react'
import { ImageTransform, ThemePreference } from '@/lib/constants'

const PREFERENCES_KEY = 'image-editor-preferences'

interface EditorPreferences {
  darkMode: ThemePreference
  defaultTransform: Partial<ImageTransform>
  autoSaveSettings: boolean
}

const defaultPreferences: EditorPreferences = {
  darkMode: 'system',
  defaultTransform: {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    overlayType: null
  },
  autoSaveSettings: true
}

export function useEditorPreferences() {
  const [preferences, setPreferences] = useState<EditorPreferences>(defaultPreferences)
  const [systemDarkMode, setSystemDarkMode] = useState(false)

  useEffect(() => {
    const savedPreferences = localStorage.getItem(PREFERENCES_KEY)
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences))
      } catch (e) {
        console.error('Failed to parse saved preferences')
      }
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemDarkMode(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemDarkMode(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const updatePreferences = (newPreferences: Partial<EditorPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences }
      if (preferences.autoSaveSettings) {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated))
      }
      return updated
    })
  }

  const resetPreferences = () => {
    setPreferences(defaultPreferences)
    localStorage.removeItem(PREFERENCES_KEY)
  }

  const isDarkMode = preferences.darkMode === 'system' ? systemDarkMode : preferences.darkMode === 'dark'

  return {
    preferences,
    isDarkMode,
    updatePreferences,
    resetPreferences
  }
}