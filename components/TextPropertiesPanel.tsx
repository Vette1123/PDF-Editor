'use client'

import { TextAnnotation } from './PDFEditor'
import { Type, Palette } from 'lucide-react'

interface TextPropertiesPanelProps {
  annotation: TextAnnotation
  onUpdate: (updates: Partial<TextAnnotation>) => void
}

export default function TextPropertiesPanel({
  annotation,
  onUpdate,
}: TextPropertiesPanelProps) {
  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48]
  const colors = [
    '#000000',
    '#FF0000',
    '#0000FF',
    '#00FF00',
    '#FF00FF',
    '#FFFF00',
    '#00FFFF',
    '#808080',
  ]

  return (
    <div className='absolute right-6 top-24 bg-white rounded-lg shadow-xl border border-slate-200 p-4 w-64 z-10'>
      <h3 className='text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2'>
        <Type size={16} />
        Text Properties
      </h3>

      {/* Font Size */}
      <div className='mb-4'>
        <label className='block text-xs font-medium text-slate-700 mb-2'>
          Font Size
        </label>
        <select
          value={annotation.fontSize}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
          className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        >
          {fontSizes.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </div>

      {/* Color */}
      <div className='mb-4'>
        <label className='block text-xs font-medium text-slate-700 mb-2 flex items-center gap-1'>
          <Palette size={14} />
          Color
        </label>
        <div className='grid grid-cols-4 gap-2'>
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onUpdate({ color })}
              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                annotation.color === color
                  ? 'border-blue-500 scale-110'
                  : 'border-slate-300 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <input
          type='color'
          value={annotation.color}
          onChange={(e) => onUpdate({ color: e.target.value })}
          className='w-full mt-2 h-10 rounded-lg border border-slate-300 cursor-pointer'
        />
      </div>

      {/* Text Content */}
      <div>
        <label className='block text-xs font-medium text-slate-700 mb-2'>
          Text Content
        </label>
        <textarea
          value={annotation.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className='w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
          rows={3}
          placeholder='Enter text here...'
        />
      </div>
    </div>
  )
}
