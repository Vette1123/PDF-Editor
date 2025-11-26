'use client'

import { useCallback, useState, useRef } from 'react'
import { Upload, FileText } from 'lucide-react'

interface PDFUploadProps {
  onFileUpload: (file: File) => void
}

export default function PDFUpload({ onFileUpload }: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        const file = files[0]
        if (file.type === 'application/pdf') {
          onFileUpload(file)
        } else {
          alert('Please upload a PDF file')
        }
      }
    },
    [onFileUpload]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        const file = files[0]
        if (file.type === 'application/pdf') {
          onFileUpload(file)
        } else {
          alert('Please upload a PDF file')
        }
      }
      // Reset the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [onFileUpload]
  )

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className='flex items-center justify-center h-full p-8'>
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          w-full max-w-2xl p-12 border-2 border-dashed rounded-2xl
          transition-all duration-200 cursor-pointer
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-105'
              : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'
          }
        `}
      >
        <div className='flex flex-col items-center'>
          <div className='w-20 h-20 mb-6 rounded-full bg-blue-100 flex items-center justify-center'>
            {isDragging ? (
              <FileText size={40} className='text-blue-600' />
            ) : (
              <Upload size={40} className='text-blue-600' />
            )}
          </div>
          <h2 className='text-2xl font-semibold text-slate-800 mb-2'>
            {isDragging ? 'Drop your PDF here' : 'Upload PDF Document'}
          </h2>
          <p className='text-slate-600 mb-6 text-center'>
            Drag and drop your PDF file here, or click the button below
          </p>
          <button
            type='button'
            onClick={handleButtonClick}
            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shadow-md hover:shadow-lg'
          >
            Choose File
          </button>
          <input
            ref={fileInputRef}
            type='file'
            accept='application/pdf'
            onChange={handleFileInput}
            className='hidden'
          />
          <p className='text-sm text-slate-500 mt-4'>
            Supports: PDF files up to 50MB
          </p>
        </div>
      </div>
    </div>
  )
}
