import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function Modal({ open, onClose, title, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-modal flex items-center justify-center bg-ink-950/60 px-6 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
            className="border-gradient relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white p-7 shadow-e5 dark:border-white/10 dark:bg-ink-900"
          >
            <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-cobalt-500/10 blur-3xl" />
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 transition-colors hover:bg-stone-500/10 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X size={18} strokeWidth={1.75} />
            </button>
            {title && <h2 className="mb-5 pr-8 font-display text-xl font-bold tracking-tight text-ink-900 dark:text-white">{title}</h2>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
