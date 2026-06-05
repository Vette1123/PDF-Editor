'use client'

import { useRef } from 'react'
import type { Annotation, TextAnnotation, SignatureAnnotation, Tool } from '@/lib/editor/types'
import { UI_FONTS } from '@/lib/editor/fonts'

export interface AnnotationLayerProps {
  /** Annotations for the page this layer overlays (parent filters by page). */
  annotations: Annotation[]
  scale: number
  tool: Tool
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, patch: Partial<TextAnnotation> & Partial<SignatureAnnotation>) => void
  onStartEditText: (id: string) => void
}

interface DragState {
  id: string
  kind: 'text' | 'signature'
  // pointer offset from the box top-left, in display px
  offsetX: number
  offsetY: number
}

interface ResizeState {
  id: string
  kind: 'text' | 'signature'
  startX: number
  startY: number
  startFontSize?: number
  startWidth?: number
  startHeight?: number
}

const fontCss = (family: TextAnnotation['fontFamily']) =>
  UI_FONTS.find((f) => f.value === family)?.css ?? 'Helvetica, Arial, sans-serif'

export function AnnotationLayer({
  annotations,
  scale,
  tool,
  selectedId,
  onSelect,
  onUpdate,
  onStartEditText,
}: AnnotationLayerProps) {
  const drag = useRef<DragState | null>(null)
  const resize = useRef<ResizeState | null>(null)

  // ---- Drag (move) ----
  const onBoxPointerDown = (
    e: React.PointerEvent,
    ann: Annotation,
  ) => {
    if (tool !== 'select') return
    e.stopPropagation()
    onSelect(ann.id)
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    drag.current = {
      id: ann.id,
      kind: ann.kind,
      offsetX: e.clientX - target.getBoundingClientRect().left,
      offsetY: e.clientY - target.getBoundingClientRect().top,
    }
  }

  const onBoxPointerMove = (e: React.PointerEvent, ann: Annotation) => {
    const d = drag.current
    if (!d || d.id !== ann.id) return
    const parent = (e.currentTarget as HTMLElement).parentElement
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    const x = (e.clientX - rect.left - d.offsetX) / scale
    const y = (e.clientY - rect.top - d.offsetY) / scale
    onUpdate(ann.id, { x, y })
  }

  const endDrag = (e: React.PointerEvent) => {
    if (drag.current) {
      try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {
        /* capture may already be released */
      }
      drag.current = null
    }
  }

  // ---- Resize ----
  const onHandlePointerDown = (e: React.PointerEvent, ann: Annotation) => {
    e.stopPropagation()
    onSelect(ann.id)
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
    resize.current = {
      id: ann.id,
      kind: ann.kind,
      startX: e.clientX,
      startY: e.clientY,
      startFontSize: ann.kind === 'text' ? ann.fontSize : undefined,
      startWidth: ann.kind === 'signature' ? ann.width : undefined,
      startHeight: ann.kind === 'signature' ? ann.height : undefined,
    }
  }

  const onHandlePointerMove = (e: React.PointerEvent, ann: Annotation) => {
    const r = resize.current
    if (!r || r.id !== ann.id) return
    const deltaY = e.clientY - r.startY
    if (r.kind === 'text' && r.startFontSize != null) {
      const next = Math.max(10, Math.min(120, r.startFontSize + deltaY / scale / 2))
      onUpdate(ann.id, { fontSize: Math.round(next) })
    } else if (r.kind === 'signature' && r.startWidth != null && r.startHeight != null) {
      const ratio = r.startHeight / r.startWidth
      const nextWidth = Math.max(40, r.startWidth + deltaY / scale)
      onUpdate(ann.id, {
        width: Math.round(nextWidth),
        height: Math.round(nextWidth * ratio),
      })
    }
  }

  const endResize = (e: React.PointerEvent) => {
    if (resize.current) {
      try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      resize.current = null
    }
  }

  // ---- Keyboard nudge ----
  const onBoxKeyDown = (e: React.KeyboardEvent, ann: Annotation) => {
    if (selectedId !== ann.id) return
    if (ann.kind === 'text' && e.key === 'Enter') {
      e.preventDefault()
      onStartEditText(ann.id)
      return
    }
    const step = e.shiftKey ? 10 : 1
    let dx = 0
    let dy = 0
    if (e.key === 'ArrowLeft') dx = -step
    else if (e.key === 'ArrowRight') dx = step
    else if (e.key === 'ArrowUp') dy = -step
    else if (e.key === 'ArrowDown') dy = step
    else return
    e.preventDefault()
    onUpdate(ann.id, { x: ann.x + dx, y: ann.y + dy })
  }

  const handle = (ann: Annotation, cursor: string) => (
    <span
      onPointerDown={(e) => onHandlePointerDown(e, ann)}
      onPointerMove={(e) => onHandlePointerMove(e, ann)}
      onPointerUp={endResize}
      onPointerCancel={endResize}
      role="presentation"
      className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full border-2 border-[var(--bg-canvas)] bg-[var(--accent)] shadow-[var(--shadow)]"
      style={{ cursor, touchAction: 'none' }}
    />
  )

  return (
    <>
      {annotations.map((ann) => {
        const selected = selectedId === ann.id
        const interactive = tool === 'select'
        if (ann.kind === 'text') {
          return (
            <div
              key={ann.id}
              role="button"
              tabIndex={interactive ? 0 : -1}
              aria-label={`Text annotation: ${ann.text || 'empty'}`}
              onPointerDown={(e) => onBoxPointerDown(e, ann)}
              onPointerMove={(e) => onBoxPointerMove(e, ann)}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onDoubleClick={() => interactive && onStartEditText(ann.id)}
              onKeyDown={(e) => onBoxKeyDown(e, ann)}
              className="absolute select-none whitespace-nowrap"
              style={{
                left: ann.x * scale,
                top: ann.y * scale,
                fontSize: ann.fontSize * scale,
                color: ann.color,
                fontFamily: fontCss(ann.fontFamily),
                fontWeight: ann.fontFamily === 'Helvetica-Bold' ? 700 : 400,
                padding: `${2 * scale}px ${4 * scale}px`,
                lineHeight: 1.1,
                cursor: interactive ? 'move' : 'default',
                touchAction: interactive ? 'none' : 'auto',
                border: selected ? '2px solid var(--accent)' : '1px dashed var(--border-strong)',
                background: selected ? 'rgba(99,102,241,0.08)' : 'transparent',
                outline: 'none',
              }}
            >
              {ann.text || ' '}
              {selected && interactive && handle(ann, 'ns-resize')}
            </div>
          )
        }
        // signature
        return (
          <div
            key={ann.id}
            role="button"
            tabIndex={interactive ? 0 : -1}
            aria-label="Signature annotation"
            onPointerDown={(e) => onBoxPointerDown(e, ann)}
            onPointerMove={(e) => onBoxPointerMove(e, ann)}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={(e) => onBoxKeyDown(e, ann)}
            className="absolute"
            style={{
              left: ann.x * scale,
              top: ann.y * scale,
              width: ann.width * scale,
              height: ann.height * scale,
              padding: 2,
              cursor: interactive ? 'move' : 'default',
              touchAction: interactive ? 'none' : 'auto',
              border: selected ? '2px solid var(--accent)' : '1px dashed var(--border-strong)',
              background: selected ? 'rgba(99,102,241,0.08)' : 'transparent',
              outline: 'none',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ann.imageData}
              alt="Signature"
              draggable={false}
              className="h-full w-full object-contain"
            />
            {selected && interactive && handle(ann, 'nwse-resize')}
          </div>
        )
      })}
    </>
  )
}
