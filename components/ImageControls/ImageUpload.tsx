import { useState } from 'react'

interface ImageUploadProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const event = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>
      onImageUpload(event)
    }
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-4 transition-colors border-gray-300 hover:border-gray-400 dark:border-white/20 dark:hover:border-white/30 dark:hover:bg-white/5`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onImageUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="text-center text-sm dark:text-white">
        {isDragging
          ? 'Drop image here'
          : 'Drop image here, paste from clipboard, or click to upload'}
      </div>
      <div className="text-center text-xs mt-1 dark:text-white/50">
        Supports JPG, PNG, and WebP
      </div>
    </div>
  )
}