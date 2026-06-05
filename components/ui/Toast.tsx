'use client'
import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle, Info } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

type Kind = 'success' | 'error' | 'info'
interface Item { id: number; message: string; kind: Kind }
const ToastCtx = createContext<{ toast: (t: { message: string; kind?: Kind }) => void }>({
  toast: () => {},
})

let nextId = 0
const icons = { success: CheckCircle2, error: XCircle, info: Info }
const tints = {
  success: 'text-[var(--success)]', error: 'text-[var(--danger)]', info: 'text-[var(--accent)]',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const toast = useCallback(({ message, kind = 'info' }: { message: string; kind?: Kind }) => {
    const id = nextId++
    setItems((xs) => [...xs, { id, message, kind }])
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 4000)
  }, [])
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((it) => {
            const Icon = icons[it.kind]
            return (
              <motion.div key={it.id} role="status"
                layout
                initial={{ opacity: 0, x: 24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text)] shadow-[var(--shadow)]">
                <Icon size={16} className={tints[it.kind]} />
                {it.message}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
