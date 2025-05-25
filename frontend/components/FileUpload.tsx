'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  disabled?: boolean
}

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0]
        if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
          setFile(selectedFile)
          onFileSelect(selectedFile)
        } else {
          alert('CSVファイルのみアップロード可能です')
        }
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled,
  })

  const removeFile = () => {
    setFile(null)
    onFileSelect(null)
  }

  return (
    <div>
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          } ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            {isDragActive
              ? 'ファイルをドロップしてください'
              : 'CSVファイルをドラッグ&ドロップ、またはクリックして選択'}
          </p>
          <p className="text-xs text-gray-500">最大ファイルサイズ: 10MB</p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
