'use client'

import { useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import type { TextAnnotation, SignatureAnnotation, Tool } from './PDFEditor'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`

interface PDFViewerProps {
  file: File
  currentTool: Tool
  textAnnotations: TextAnnotation[]
  signatureAnnotations: SignatureAnnotation[]
  onAddText: (x: number, y: number) => void
  onUpdateText: (id: string, updates: Partial<TextAnnotation>) => void
  onUpdateSignature: (id: string, updates: Partial<SignatureAnnotation>) => void
  selectedAnnotationId: string | null
  onSelectAnnotation: (id: string | null) => void
  currentPage: number
  onPageChange: (page: number) => void
}

export default function PDFViewer({
  file,
  currentTool,
  textAnnotations,
  signatureAnnotations,
  onAddText,
  onUpdateText,
  onUpdateSignature,
  selectedAnnotationId,
  onSelectAnnotation,
  currentPage,
  onPageChange,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [scale, setScale] = useState(1.0)
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<{
    id: string
    type: 'text' | 'signature'
    offsetX: number
    offsetY: number
  } | null>(null)
  const [resizingText, setResizingText] = useState<{
    id: string
    startY: number
    startSize: number
  } | null>(null)
  const [hoverPosition, setHoverPosition] = useState<{
    x: number
    y: number
    pageIndex: number
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    pageRefs.current = new Array(numPages).fill(null)
  }

  const handlePageClick = (
    e: React.MouseEvent<HTMLDivElement>,
    pageNumber: number
  ) => {
    if (currentTool === 'text') {
      const pageElement = pageRefs.current[pageNumber - 1]
      if (!pageElement) return

      const rect = pageElement.getBoundingClientRect()
      const x = (e.clientX - rect.left) / scale
      const y = (e.clientY - rect.top) / scale
      onAddText(x, y)
      setHoverPosition(null)
    }
  }

  const handlePageMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    pageIndex: number
  ) => {
    if (currentTool === 'text' && !draggedItem && !resizingText) {
      const pageElement = pageRefs.current[pageIndex]
      if (!pageElement) return

      const rect = pageElement.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setHoverPosition({ x, y, pageIndex })
    } else {
      setHoverPosition(null)
    }
  }

  const handleMouseDown = (
    e: React.MouseEvent,
    id: string,
    type: 'text' | 'signature',
    currentX: number,
    currentY: number,
    pageNumber: number
  ) => {
    if (currentTool !== 'select') return
    e.stopPropagation()

    const pageElement = pageRefs.current[pageNumber - 1]
    if (!pageElement) return
    const rect = pageElement.getBoundingClientRect()

    const offsetX = e.clientX - rect.left - currentX * scale
    const offsetY = e.clientY - rect.top - currentY * scale

    setDraggedItem({ id, type, offsetX, offsetY })
    onSelectAnnotation(id)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedItem) {
      // Find which page the annotation belongs to
      const annotation =
        textAnnotations.find((a) => a.id === draggedItem.id) ||
        signatureAnnotations.find((a) => a.id === draggedItem.id)
      if (!annotation) return

      const pageElement = pageRefs.current[annotation.pageNumber - 1]
      if (!pageElement) return

      const rect = pageElement.getBoundingClientRect()
      const x = (e.clientX - rect.left - draggedItem.offsetX) / scale
      const y = (e.clientY - rect.top - draggedItem.offsetY) / scale

      if (draggedItem.type === 'text') {
        onUpdateText(draggedItem.id, { x, y })
      } else {
        onUpdateSignature(draggedItem.id, { x, y })
      }
    }

    if (resizingText) {
      const deltaY = e.clientY - resizingText.startY

      // Check if it's a text or signature being resized
      const textAnnotation = textAnnotations.find(
        (a) => a.id === resizingText.id
      )
      const signatureAnnotation = signatureAnnotations.find(
        (a) => a.id === resizingText.id
      )

      if (textAnnotation) {
        const newSize = Math.max(
          10,
          Math.min(72, resizingText.startSize + deltaY / 2)
        )
        onUpdateText(resizingText.id, { fontSize: Math.round(newSize) })
      } else if (signatureAnnotation) {
        const scale = Math.max(0.5, Math.min(3, 1 + deltaY / 200))
        const newWidth = Math.round(resizingText.startSize * scale)
        const newHeight = Math.round(
          (signatureAnnotation.height / signatureAnnotation.width) * newWidth
        )
        onUpdateSignature(resizingText.id, {
          width: newWidth,
          height: newHeight,
        })
      }
    }
  }

  const handleMouseUp = () => {
    setDraggedItem(null)
    setResizingText(null)
  }

  const handleResizeStart = (
    e: React.MouseEvent,
    id: string,
    currentSize: number
  ) => {
    e.stopPropagation()
    setResizingText({
      id,
      startY: e.clientY,
      startSize: currentSize,
    })
    onSelectAnnotation(id)
  }

  const handleSignatureResizeStart = (
    e: React.MouseEvent,
    id: string,
    currentWidth: number
  ) => {
    e.stopPropagation()
    setResizingText({
      id,
      startY: e.clientY,
      startSize: currentWidth,
    })
    onSelectAnnotation(id)
  }

  const handleTextDoubleClick = (id: string) => {
    if (currentTool === 'select') {
      setEditingTextId(id)
    }
  }

  const handleTextChange = (id: string, text: string) => {
    onUpdateText(id, { text })
  }

  const handleTextBlur = () => {
    setEditingTextId(null)
  }

  // Group annotations by page
  const getAnnotationsForPage = (pageNumber: number) => ({
    texts: textAnnotations.filter((ann) => ann.pageNumber === pageNumber),
    signatures: signatureAnnotations.filter(
      (ann) => ann.pageNumber === pageNumber
    ),
  })

  return (
    <div className='h-full flex flex-col'>
      {/* Controls */}
      <div className='bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className='p-2 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <ChevronLeft size={20} />
          </button>
          <span className='text-sm text-slate-700 min-w-[100px] text-center'>
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
            className='p-2 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
            className='p-2 rounded hover:bg-slate-100'
            title='Zoom Out'
          >
            <ZoomOut size={20} />
          </button>
          <span className='text-sm text-slate-700 min-w-[60px] text-center'>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
            className='p-2 rounded hover:bg-slate-100'
            title='Zoom In'
          >
            <ZoomIn size={20} />
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div
        ref={containerRef}
        className='flex-1 overflow-auto bg-slate-100'
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className='flex flex-col items-center gap-6 py-8'>
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from(new Array(numPages), (_, index) => {
              const pageNumber = index + 1
              const { texts, signatures } = getAnnotationsForPage(pageNumber)

              return (
                <div key={`page_${pageNumber}`} className='mb-6 relative'>
                  <div
                    ref={(el) => {
                      pageRefs.current[index] = el
                    }}
                    className='relative bg-white shadow-2xl'
                    onClick={(e) => handlePageClick(e, pageNumber)}
                    onMouseMove={(e) => handlePageMouseMove(e, index)}
                    onMouseLeave={() => setHoverPosition(null)}
                    style={{
                      cursor: currentTool === 'text' ? 'crosshair' : 'default',
                    }}
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />

                    {/* Hover indicator for text placement */}
                    {hoverPosition && hoverPosition.pageIndex === index && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `${hoverPosition.x}px`,
                          top: `${hoverPosition.y}px`,
                          width: '2px',
                          height: '20px',
                          backgroundColor: '#3b82f6',
                          pointerEvents: 'none',
                          animation: 'blink 1s infinite',
                        }}
                      />
                    )}

                    {/* Text Annotations for this page */}
                    {texts.map((annotation) => (
                      <div
                        key={annotation.id}
                        style={{
                          position: 'absolute',
                          left: `${annotation.x * scale}px`,
                          top: `${annotation.y * scale}px`,
                          fontSize: `${annotation.fontSize * scale}px`,
                          color: annotation.color || '#000000',
                          fontFamily: annotation.fontFamily,
                          cursor: currentTool === 'select' ? 'move' : 'default',
                          border:
                            selectedAnnotationId === annotation.id
                              ? '2px solid #3b82f6'
                              : '1px dashed #94a3b8',
                          backgroundColor:
                            selectedAnnotationId === annotation.id
                              ? '#EFF6FF'
                              : 'rgba(255, 255, 255, 0.9)',
                          padding: '2px 4px',
                          minWidth: '100px',
                          whiteSpace: 'nowrap',
                          userSelect: 'none',
                        }}
                        onMouseDown={(e) =>
                          handleMouseDown(
                            e,
                            annotation.id,
                            'text',
                            annotation.x,
                            annotation.y,
                            pageNumber
                          )
                        }
                        onDoubleClick={() =>
                          handleTextDoubleClick(annotation.id)
                        }
                      >
                        {editingTextId === annotation.id ? (
                          <input
                            type='text'
                            value={annotation.text}
                            onChange={(e) =>
                              handleTextChange(annotation.id, e.target.value)
                            }
                            onBlur={handleTextBlur}
                            autoFocus
                            className='bg-transparent border-none outline-none w-full'
                            style={{
                              fontSize: `${annotation.fontSize * scale}px`,
                              color: annotation.color,
                              fontFamily: annotation.fontFamily,
                            }}
                          />
                        ) : (
                          <>
                            {annotation.text}
                            {selectedAnnotationId === annotation.id &&
                              currentTool === 'select' && (
                                <div
                                  className='absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 rounded-full cursor-ns-resize border-2 border-white shadow-md'
                                  onMouseDown={(e) =>
                                    handleResizeStart(
                                      e,
                                      annotation.id,
                                      annotation.fontSize
                                    )
                                  }
                                  title='Resize text'
                                />
                              )}
                          </>
                        )}
                      </div>
                    ))}

                    {/* Signature Annotations for this page */}
                    {signatures.map((signature) => (
                      <div
                        key={signature.id}
                        style={{
                          position: 'absolute',
                          left: `${signature.x * scale}px`,
                          top: `${signature.y * scale}px`,
                          width: `${signature.width * scale}px`,
                          height: `${signature.height * scale}px`,
                          cursor: currentTool === 'select' ? 'move' : 'default',
                          border:
                            selectedAnnotationId === signature.id
                              ? '2px solid #3b82f6'
                              : '1px dashed #94a3b8',
                          backgroundColor:
                            selectedAnnotationId === signature.id
                              ? '#EFF6FF'
                              : 'rgba(255, 255, 255, 0.9)',
                          padding: '4px',
                        }}
                        onMouseDown={(e) =>
                          handleMouseDown(
                            e,
                            signature.id,
                            'signature',
                            signature.x,
                            signature.y,
                            pageNumber
                          )
                        }
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={signature.imageData}
                          alt='Signature'
                          className='w-full h-full object-contain'
                          draggable={false}
                        />
                        {selectedAnnotationId === signature.id &&
                          currentTool === 'select' && (
                            <div
                              className='absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 rounded-full cursor-nwse-resize border-2 border-white shadow-md'
                              onMouseDown={(e) =>
                                handleSignatureResizeStart(
                                  e,
                                  signature.id,
                                  signature.width
                                )
                              }
                              title='Resize signature'
                            />
                          )}
                      </div>
                    ))}
                  </div>

                  {/* Page number indicator */}
                  <div className='absolute -bottom-4 left-0 right-0 text-center'>
                    <span className='inline-block bg-slate-800 text-white text-xs px-3 py-1 rounded-full'>
                      Page {pageNumber}
                    </span>
                  </div>
                </div>
              )
            })}
          </Document>
        </div>
      </div>
    </div>
  )
}
