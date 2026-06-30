import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../theme/ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      aria-label="Changer de thème"
      className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white/60 text-slate-700 transition-colors hover:border-primary/50 hover:text-primary dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:text-primary-400"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? 'moon' : 'sun'}
          initial={{ y: -12, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 12, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          {dark ? <Moon size={18} /> : <Sun size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
