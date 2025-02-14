import { OverlayType } from './constants'

export const calculateImageHash = async (imageData: string) => {
  const data = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(imageData))
  return Array.from(new Uint8Array(data))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export interface ImageSettings {
  scale: number
  offsetX: number
  offsetY: number
  overlayType: string | null
}

export const DEFAULT_SETTINGS: ImageSettings = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  overlayType: null
}

export const drawImageOnCanvas = async (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasSize: number,
  scale: number,
  offsetX: number,
  offsetY: number
): Promise<void> => {
  // Clear canvas
  ctx.clearRect(0, 0, canvasSize, canvasSize)
  
  // Calculate image dimensions while maintaining aspect ratio and filling canvas
  const imgAspect = img.width / img.height
  const canvasAspect = 1 // canvas is square

  let drawWidth: number
  let drawHeight: number

  if (imgAspect > canvasAspect) {
    // Image is wider than canvas - fit to height first
    drawHeight = canvasSize
    drawWidth = drawHeight * imgAspect
  } else {
    // Image is taller than canvas - fit to width first
    drawWidth = canvasSize
    drawHeight = drawWidth / imgAspect
  }

  // Calculate scaling to ensure image covers the canvas
  const scaleToFill = Math.max(
    canvasSize / drawWidth,
    canvasSize / drawHeight
  )

  // Apply base scaling to ensure coverage
  drawWidth *= scaleToFill
  drawHeight *= scaleToFill

  // Apply user scale
  drawWidth *= scale
  drawHeight *= scale

  // Calculate center position
  const centerX = canvasSize / 2
  const centerY = canvasSize / 2

  // Draw image with offset from center
  ctx.drawImage(
    img,
    centerX - (drawWidth / 2) + offsetX,
    centerY - (drawHeight / 2) + offsetY,
    drawWidth,
    drawHeight
  )
}

export const drawOverlay = (
  ctx: CanvasRenderingContext2D,
  canvasSize: number,
  overlayType: OverlayType
): void => {
  if (!overlayType) return

  ctx.fillStyle = 'rgba(0, 0, 0, 1)'
  const barSize = canvasSize * 0.1

  switch (overlayType) {
    case 'cinematic':
      ctx.fillRect(0, 0, canvasSize, barSize)
      ctx.fillRect(0, canvasSize - barSize, canvasSize, barSize)
      break
    case 'full-frame':
      ctx.fillRect(0, 0, canvasSize, barSize) // Top
      ctx.fillRect(0, canvasSize - barSize, canvasSize, barSize) // Bottom
      ctx.fillRect(0, 0, barSize, canvasSize) // Left
      ctx.fillRect(canvasSize - barSize, 0, barSize, canvasSize) // Right
      break
  }
}

export async function compressImage(
  imageData: string,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d', {
        alpha: false, // Optimize for JPEG output
        willReadFrequently: false
      })

      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // Calculate dimensions while maintaining aspect ratio
      let width = img.width
      let height = img.height
      const aspectRatio = width / height

      if (width > maxWidth) {
        width = maxWidth
        height = width / aspectRatio
      }

      if (height > maxHeight) {
        height = maxHeight
        width = height * aspectRatio
      }

      // Round dimensions to even numbers for better compression
      width = Math.round(width / 2) * 2
      height = Math.round(height / 2) * 2

      // Set canvas size
      canvas.width = width
      canvas.height = height

      // Configure rendering
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.fillStyle = '#FFFFFF' // Set white background
      ctx.fillRect(0, 0, width, height)

      // Draw image with bicubic interpolation
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to JPEG with progressive encoding
      const quality_ = Math.max(0.5, Math.min(1, quality)) // Ensure quality is between 0.5 and 1
      const compressed = canvas.toDataURL('image/jpeg', quality_)

      // Clean up
      canvas.width = 1
      canvas.height = 1
      
      resolve(compressed)
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageData
  })
}