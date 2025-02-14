import { useState, useCallback } from 'react'
import { ImageTransform } from '@/lib/constants'

export function useTransformHistory(initialTransform: ImageTransform) {
  const [history, setHistory] = useState<ImageTransform[]>([initialTransform])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [transform, setTransform] = useState<ImageTransform>(initialTransform)

  const updateTransform = useCallback((newTransform: Partial<ImageTransform>) => {
    const updatedTransform = { ...transform, ...newTransform }
    
    setTransform(updatedTransform)
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1)
      return [...newHistory, updatedTransform]
    })
    setCurrentIndex(prev => prev + 1)
  }, [currentIndex, transform])

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      setTransform(history[newIndex])
    }
  }, [currentIndex, history])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      setTransform(history[newIndex])
    }
  }, [currentIndex, history])

  const reset = useCallback((newTransform: ImageTransform) => {
    setTransform(newTransform)
    setHistory([newTransform])
    setCurrentIndex(0)
  }, [])

  return {
    transform,
    updateTransform,
    undo,
    redo,
    reset,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1
  }
}