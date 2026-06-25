import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Toast {
  id: string
  message: string
  icon: string
}

type ToastListener = (toast: Omit<Toast, 'id'>) => void
const listeners = new Set<ToastListener>()

export function toast(icon: string, message: string) {
  const t = { icon, message }
  listeners.forEach(fn => fn(t))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { ...t, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id))
    }, 3000)
  }, [])

  useEffect(() => {
    listeners.add(addToast)
    return () => { listeners.delete(addToast) }
  }, [addToast])

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="bg-zinc-900 border border-zinc-700/50 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3 min-w-[250px]"
          >
            <span className="text-lg">{t.icon}</span>
            <p className="text-sm text-zinc-200">{t.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
