import { useEffect, useState } from 'react'
import { formatFileSize, getImageDimensions } from '@/lib/utils'

interface FileInfoProps {
  file: File
  darkMode?: boolean
}

export function FileInfo({ file, darkMode }: FileInfoProps) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    getImageDimensions(file).then(setDimensions)
  }, [file])

  return (
    <div className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      <div className="flex justify-between">
        <span>Name:</span>
        <span className="font-medium">{file.name}</span>
      </div>
      <div className="flex justify-between">
        <span>Size:</span>
        <span className="font-medium">{formatFileSize(file.size)}</span>
      </div>
      <div className="flex justify-between">
        <span>Type:</span>
        <span className="font-medium">{file.type}</span>
      </div>
      {dimensions && (
        <div className="flex justify-between">
          <span>Dimensions:</span>
          <span className="font-medium">{dimensions.width} × {dimensions.height}</span>
        </div>
      )}
    </div>
  )
}