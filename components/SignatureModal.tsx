'use client'

import { useState, useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { X, Pencil, Type, Upload, Eraser } from 'lucide-react'

interface SignatureModalProps {
  onSave: (signatureData: string) => void
  onClose: () => void
}

type SignatureMode = 'draw' | 'type' | 'upload'

export default function SignatureModal({
  onSave,
  onClose,
}: SignatureModalProps) {
  const [mode, setMode] = useState<SignatureMode>('draw')
  const [typedText, setTypedText] = useState('')
  const [selectedFont, setSelectedFont] = useState('Brush Script MT')
  const sigCanvasRef = useRef<SignatureCanvas>(null)
  const typedCanvasRef = useRef<HTMLCanvasElement>(null)

  const fonts = [
    'Brush Script MT',
    'Lucida Handwriting',
    'Segoe Script',
    'Monotype Corsiva',
    'Freestyle Script',
  ]

  const handleClear = () => {
    if (mode === 'draw' && sigCanvasRef.current) {
      sigCanvasRef.current.clear()
    } else if (mode === 'type') {
      setTypedText('')
    }
  }

  const handleSave = () => {
    let signatureData = ''

    if (mode === 'draw' && sigCanvasRef.current) {
      if (sigCanvasRef.current.isEmpty()) {
        alert('Please draw your signature first')
        return
      }
      signatureData = sigCanvasRef.current.toDataURL('image/png')
    } else if (mode === 'type') {
      if (!typedText.trim()) {
        alert('Please enter your signature text')
        return
      }
      const canvas = typedCanvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.font = `48px ${selectedFont}`
          ctx.fillStyle = '#000000'
          ctx.textBaseline = 'middle'
          ctx.fillText(typedText, 10, canvas.height / 2)
          signatureData = canvas.toDataURL('image/png')
        }
      }
    } else if (mode === 'upload') {
      // Handle file upload
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const result = event.target?.result as string
            onSave(result)
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
      return
    }

    if (signatureData) {
      onSave(signatureData)
    }
  }

  useEffect(() => {
    if (mode === 'type' && typedCanvasRef.current) {
      const canvas = typedCanvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (typedText) {
          ctx.font = `48px ${selectedFont}`
          ctx.fillStyle = '#000000'
          ctx.textBaseline = 'middle'
          ctx.fillText(typedText, 10, canvas.height / 2)
        }
      }
    }
  }, [typedText, selectedFont, mode])

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200'>
          <h2 className='text-2xl font-bold text-slate-800'>Add Signature</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-slate-100 rounded-lg transition-colors'
          >
            <X size={24} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className='flex border-b border-slate-200'>
          <button
            onClick={() => setMode('draw')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-colors ${
              mode === 'draw'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Pencil size={20} />
            Draw
          </button>
          <button
            onClick={() => setMode('type')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-colors ${
              mode === 'type'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Type size={20} />
            Type
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-colors ${
              mode === 'upload'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Upload size={20} />
            Upload
          </button>
        </div>

        {/* Content Area */}
        <div className='flex-1 p-6 overflow-auto'>
          {mode === 'draw' && (
            <div className='flex flex-col h-full'>
              <div className='border-2 border-slate-300 rounded-lg overflow-hidden bg-white'>
                <SignatureCanvas
                  ref={sigCanvasRef}
                  canvasProps={{
                    className: 'w-full h-64 cursor-crosshair',
                  }}
                  backgroundColor='white'
                />
              </div>
              <p className='text-sm text-slate-500 mt-3 text-center'>
                Draw your signature above using your mouse or touchscreen
              </p>
            </div>
          )}

          {mode === 'type' && (
            <div className='flex flex-col h-full gap-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>
                  Enter your name
                </label>
                <input
                  type='text'
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder='Type your signature...'
                  className='w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>
                  Choose font style
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  {fonts.map((font) => (
                    <button
                      key={font}
                      onClick={() => setSelectedFont(font)}
                      className={`px-4 py-3 border-2 rounded-lg transition-all ${
                        selectedFont === font
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      style={{ fontFamily: font, fontSize: '20px' }}
                    >
                      {typedText || 'Sample'}
                    </button>
                  ))}
                </div>
              </div>

              <div className='border-2 border-slate-200 rounded-lg p-4 bg-white flex items-center justify-center min-h-[120px]'>
                <canvas
                  ref={typedCanvasRef}
                  width={600}
                  height={100}
                  className='max-w-full'
                />
              </div>
            </div>
          )}

          {mode === 'upload' && (
            <div className='flex flex-col items-center justify-center h-full'>
              <Upload size={64} className='text-slate-400 mb-4' />
              <p className='text-lg text-slate-700 mb-2'>
                Upload Signature Image
              </p>
              <p className='text-sm text-slate-500 mb-6'>
                Click save to select an image from your device
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50'>
          <button
            onClick={handleClear}
            className='flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors'
          >
            <Eraser size={18} />
            Clear
          </button>
          <div className='flex gap-3'>
            <button
              onClick={onClose}
              className='px-6 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              Save Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
