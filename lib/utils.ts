import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
] as const

export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'] as const

export type SupportedImageType = typeof SUPPORTED_IMAGE_TYPES[number]

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 1).toLowerCase()
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = (bytes / Math.pow(k, i)).toFixed(1)
  
  return `${size} ${sizes[i]}`
}

export function generateFileName(originalName: string, suffix: string = ''): string {
  const ext = getFileExtension(originalName)
  const baseName = originalName.slice(0, originalName.lastIndexOf('.'))
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${baseName}${suffix}-${timestamp}.${ext}`
}

export async function compressImage(
  imageData: string, 
  maxWidth: number = 4096,
  maxHeight: number = 4096,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let width = img.width
      let height = img.height

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // Use better image smoothing
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => reject(new Error('Failed to load image for compression'))
    img.src = imageData
  })
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image dimensions'))
    }
    img.src = url
  })
}
