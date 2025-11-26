'use client'

import { Download, MousePointer, PenTool, Trash2, Type } from 'lucide-react'
import { PDFDocument, rgb } from 'pdf-lib'
import { useCallback, useState, useEffect } from 'react'
import PDFUpload from './PDFUpload'
import PDFViewer from './PDFViewer'
import SignatureModal from './SignatureModal'
import TextPropertiesPanel from './TextPropertiesPanel'

export interface TextAnnotation {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  fontFamily: string
  pageNumber: number
}

export interface SignatureAnnotation {
  id: string
  imageData: string
  x: number
  y: number
  width: number
  height: number
  pageNumber: number
}

export type Tool = 'select' | 'text' | 'signature'

export default function PDFEditor() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null)
  const [currentTool, setCurrentTool] = useState<Tool>('select')
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([])
  const [signatureAnnotations, setSignatureAnnotations] = useState<
    SignatureAnnotation[]
  >([])
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<
    string | null
  >(null)

  const handleFileUpload = useCallback(async (file: File) => {
    setPdfFile(file)
    const arrayBuffer = await file.arrayBuffer()
    setPdfArrayBuffer(arrayBuffer)
    setTextAnnotations([])
    setSignatureAnnotations([])
    setCurrentPage(1)
  }, [])

  const handleAddText = useCallback(
    (x: number, y: number) => {
      if (currentTool !== 'text') return

      const newAnnotation: TextAnnotation = {
        id: `text-${Date.now()}`,
        text: 'Click to edit',
        x,
        y,
        fontSize: 16,
        color: '#000000',
        fontFamily: 'Helvetica',
        pageNumber: currentPage,
      }
      setTextAnnotations((prev) => [...prev, newAnnotation])
      setSelectedAnnotationId(newAnnotation.id)
    },
    [currentTool, currentPage]
  )

  const handleSignatureSave = useCallback(
    (signatureData: string) => {
      const signatureId = `sig-${Date.now()}`
      const newSignature: SignatureAnnotation = {
        id: signatureId,
        imageData: signatureData,
        x: 150,
        y: 200,
        width: 200,
        height: 100,
        pageNumber: currentPage,
      }
      setSignatureAnnotations((prev) => [...prev, newSignature])
      setSelectedAnnotationId(signatureId)
      setShowSignatureModal(false)
    },
    [currentPage]
  )

  const handleUpdateText = useCallback(
    (id: string, updates: Partial<TextAnnotation>) => {
      setTextAnnotations((prev) =>
        prev.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann))
      )
    },
    []
  )

  const handleUpdateSignature = useCallback(
    (id: string, updates: Partial<SignatureAnnotation>) => {
      setSignatureAnnotations((prev) =>
        prev.map((ann) => (ann.id === id ? { ...ann, ...updates } : ann))
      )
    },
    []
  )

  const handleDeleteAnnotation = useCallback(
    (id: string) => {
      setTextAnnotations((prev) => prev.filter((ann) => ann.id !== id))
      setSignatureAnnotations((prev) => prev.filter((ann) => ann.id !== id))
      if (selectedAnnotationId === id) {
        setSelectedAnnotationId(null)
      }
    },
    [selectedAnnotationId]
  )

  // Keyboard delete handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedAnnotationId
      ) {
        // Don't delete if user is typing in an input/textarea
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return
        }
        e.preventDefault()
        handleDeleteAnnotation(selectedAnnotationId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedAnnotationId, handleDeleteAnnotation])

  const handleExportPDF = useCallback(async () => {
    if (!pdfArrayBuffer) return

    try {
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer)
      const pages = pdfDoc.getPages()

      // Add text annotations
      for (const annotation of textAnnotations) {
        const page = pages[annotation.pageNumber - 1]
        if (!page) continue

        const { height } = page.getSize()
        const colorMatch = annotation.color.match(
          /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
        )
        const color = colorMatch
          ? rgb(
              parseInt(colorMatch[1], 16) / 255,
              parseInt(colorMatch[2], 16) / 255,
              parseInt(colorMatch[3], 16) / 255
            )
          : rgb(0, 0, 0)

        page.drawText(annotation.text, {
          x: annotation.x,
          y: height - annotation.y - annotation.fontSize,
          size: annotation.fontSize,
          color: color,
        })
      }

      // Add signature annotations
      for (const signature of signatureAnnotations) {
        const page = pages[signature.pageNumber - 1]
        if (!page) continue

        const { height } = page.getSize()

        // Convert base64 to image
        const imageBytes = Uint8Array.from(
          atob(signature.imageData.split(',')[1]),
          (c) => c.charCodeAt(0)
        )

        const image = await pdfDoc.embedPng(imageBytes)

        page.drawImage(image, {
          x: signature.x,
          y: height - signature.y - signature.height,
          width: signature.width,
          height: signature.height,
        })
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `edited-${pdfFile?.name || 'document.pdf'}`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }, [pdfArrayBuffer, textAnnotations, signatureAnnotations, pdfFile])

  return (
    <div className='w-full h-screen flex flex-col'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-slate-200'>
        <div className='max-w-full mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold text-slate-800'>PDF Editor</h1>
            {pdfFile && (
              <div className='flex items-center gap-2'>
                <button
                  onClick={handleExportPDF}
                  className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <Download size={18} />
                  Download PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Toolbar */}
        {pdfFile && (
          <aside className='w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-4'>
            <button
              onClick={() => setCurrentTool('select')}
              className={`p-3 rounded-lg transition-colors ${
                currentTool === 'select'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title='Select'
            >
              <MousePointer size={24} />
            </button>
            <button
              onClick={() => setCurrentTool('text')}
              className={`p-3 rounded-lg transition-colors ${
                currentTool === 'text'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title='Add Text'
            >
              <Type size={24} />
            </button>
            <button
              onClick={() => {
                setCurrentTool('signature')
                setShowSignatureModal(true)
              }}
              className={`p-3 rounded-lg transition-colors ${
                currentTool === 'signature'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title='Add Signature'
            >
              <PenTool size={24} />
            </button>
            {selectedAnnotationId && (
              <button
                onClick={() => handleDeleteAnnotation(selectedAnnotationId)}
                className='p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-auto'
                title='Delete Selected'
              >
                <Trash2 size={24} />
              </button>
            )}
          </aside>
        )}

        {/* PDF Viewer */}
        <main className='flex-1 overflow-auto bg-slate-100'>
          {!pdfFile ? (
            <PDFUpload onFileUpload={handleFileUpload} />
          ) : (
            <PDFViewer
              file={pdfFile}
              currentTool={currentTool}
              textAnnotations={textAnnotations}
              signatureAnnotations={signatureAnnotations}
              onAddText={handleAddText}
              onUpdateText={handleUpdateText}
              onUpdateSignature={handleUpdateSignature}
              selectedAnnotationId={selectedAnnotationId}
              onSelectAnnotation={setSelectedAnnotationId}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </main>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <SignatureModal
          onSave={handleSignatureSave}
          onClose={() => setShowSignatureModal(false)}
        />
      )}

      {/* Text Properties Panel */}
      {selectedAnnotationId &&
        textAnnotations.find((ann) => ann.id === selectedAnnotationId) && (
          <TextPropertiesPanel
            annotation={
              textAnnotations.find((ann) => ann.id === selectedAnnotationId)!
            }
            onUpdate={(updates) =>
              handleUpdateText(selectedAnnotationId, updates)
            }
          />
        )}
    </div>
  )
}
