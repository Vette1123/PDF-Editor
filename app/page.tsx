'use client'

import dynamic from 'next/dynamic'

const PDFEditor = dynamic(() => import('@/components/PDFEditor'), {
  ssr: false,
  loading: () => (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-xl text-slate-600'>Loading PDF Editor...</div>
    </div>
  ),
})

export default function Home() {
  return (
    <main className='min-h-screen bg-linear-to-br from-slate-50 to-slate-100'>
      <PDFEditor />
    </main>
  )
}
