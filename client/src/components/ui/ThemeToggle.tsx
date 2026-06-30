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
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-stone-300 bg-white/60 text-stone-700 transition-colors hover:border-cobalt-500/50 hover:text-cobalt-600 dark:border-white/10 dark:bg-ink-900/60 dark:text-stone-200 dark:hover:text-cobalt-300"
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
          {dark ? <Moon size={17} strokeWidth={1.75} /> : <Sun size={17} strokeWidth={1.75} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
