'use client'

import { useState, useEffect, useCallback } from 'react'
import { ImageCanvas } from '@/components/ImageCanvas'
import { ImageControls } from '@/components/ImageControls'
import { PreferencesDialog } from '@/components/PreferencesDialog'
import { useImageEditor } from '@/hooks/useImageEditor'
import { useTransformHistory } from '@/hooks/useTransformHistory'
import { useEditorPreferences } from '@/hooks/useEditorPreferences'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { DEFAULT_TRANSFORM, type ImageTransform } from '@/lib/constants'

export default function Home() {
  const [showPreferences, setShowPreferences] = useState(false)
  const { preferences, isDarkMode, updatePreferences, resetPreferences } = useEditorPreferences()

  const defaultTransform: ImageTransform = {
    ...DEFAULT_TRANSFORM,
    ...preferences.defaultTransform
  }

  const {
    image,
    handleImageUpload,
    saveImage,
    handleTransformChange: updateEditor,
    handleRestoreState,
    ...transform
  } = useImageEditor()

  const {
    transform: historyTransform,
    updateTransform,
    undo,
    redo,
    reset,
    canUndo,
    canRedo
  } = useTransformHistory(defaultTransform)

  const handleTransformChange = useCallback((newTransform: Partial<ImageTransform>) => {
    updateTransform(newTransform)
    updateEditor(newTransform)
  }, [updateTransform, updateEditor])

  const handleReset = useCallback(() => {
    const newTransform = {
      ...DEFAULT_TRANSFORM,
      ...preferences.defaultTransform
    }
    reset(newTransform)
    updateEditor(newTransform)
  }, [preferences.defaultTransform, reset, updateEditor])

  return (
    <main className={`min-h-screen bg-gradient-to-br ${isDarkMode
        ? 'from-gray-900 to-gray-800 text-white'
        : 'from-gray-50 to-white'
      } bg-fixed`}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
              Image Editor
            </h1>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Upload, adjust, and add overlays to your images
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowPreferences(true)}
            className={`flex items-center gap-2 ${isDarkMode ? 'border-border text-foreground hover:bg-accent/20' : ''
              }`}
          >
            <Settings className="h-4 w-4" />
            Preferences
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-64 lg:sticky lg:top-8 space-y-6">
            <ImageControls
              image={image}
              {...historyTransform}
              onImageUpload={handleImageUpload}
              onTransformChange={handleTransformChange}
              onSave={saveImage}
              onReset={handleReset}
              onRestoreState={handleRestoreState}
              darkMode={isDarkMode}
            />
          </div>

          <div className={`flex-1 flex items-center justify-center p-8 rounded-lg shadow-sm border ${isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-100'
            }`}>
            {image ? (
              <ImageCanvas
                image={image}
                {...historyTransform}
                onTransformChange={handleTransformChange}
                onSave={saveImage}
                onReset={handleReset}
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
                darkMode={isDarkMode}
              />
            ) : (
              <div className="text-center text-gray-500">
                <svg
                  className={`mx-auto h-12 w-12 mb-4 ${isDarkMode ? 'text-gray-600' : ''
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-400' : ''
                  }`}>
                  No image selected
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : ''
                  }`}>
                  Upload an image to get started
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={`mt-8 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
          <p>Press ? for keyboard shortcuts • Ctrl+Z to undo • Ctrl+Y to redo</p>
        </div>

        <PreferencesDialog
          isOpen={showPreferences}
          onOpenChange={setShowPreferences}
          defaultTransform={preferences.defaultTransform}
          autoSaveSettings={preferences.autoSaveSettings}
          darkMode={isDarkMode}
          preferences={preferences}
          onUpdatePreferences={updatePreferences}
          onResetPreferences={resetPreferences}
        />
      </div>
    </main>
  )
}
