import { useState, useCallback } from 'react'
import { ImageTransform } from '@/lib/constants'

interface HistoryState {
  past: ImageTransform[]
  present: ImageTransform
  future: ImageTransform[]
}

export function useTransformHistory(initialTransform: ImageTransform) {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialTransform,
    future: []
  })

  const updateTransform = useCallback((transform: Partial<ImageTransform>) => {
    setHistory(current => ({
      past: [...current.past, current.present],
      present: { ...current.present, ...transform },
      future: []
    }))
  }, [])

  const undo = useCallback(() => {
    setHistory(current => {
      if (current.past.length === 0) return current

      const previous = current.past[current.past.length - 1]
      const newPast = current.past.slice(0, -1)

      return {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future]
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory(current => {
      if (current.future.length === 0) return current

      const next = current.future[0]
      const newFuture = current.future.slice(1)

      return {
        past: [...current.past, current.present],
        present: next,
        future: newFuture
      }
    })
  }, [])

  const reset = useCallback((transform: ImageTransform) => {
    setHistory({
      past: [],
      present: transform,
      future: []
    })
  }, [])

  return {
    transform: history.present,
    updateTransform,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0
  }
}