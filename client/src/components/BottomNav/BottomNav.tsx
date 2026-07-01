import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, Search, Heart } from 'lucide-react'
import { cn } from '../../lib/utils'

const TABS = [
  { path: '/carte', label: 'Ma carte', icon: CreditCard },
  { path: '/annuaire', label: 'Annuaire', icon: Search },
  { path: '/favoris', label: 'Favoris', icon: Heart },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-nav mx-auto flex max-w-md items-center justify-around border-t border-stone-200/70 bg-cream/80 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/70">
      {TABS.map((tab) => {
        const active = location.pathname === tab.path
        const Icon = tab.icon
        return (
          <motion.button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
            whileTap={{ scale: 0.92 }}
            className="relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2"
          >
            {active && (
              <>
                <motion.span
                  layoutId="bottomnav-active"
                  className="absolute inset-0 rounded-xl bg-cobalt-500/10"
                  transition={{ type: 'spring', damping: 24, stiffness: 320 }}
                />
                <motion.span
                  layoutId="bottomnav-bar"
                  className="absolute -top-2 h-1 w-8 rounded-full bg-cobalt-500 shadow-cobalt-sm"
                  transition={{ type: 'spring', damping: 24, stiffness: 320 }}
                />
              </>
            )}
            <motion.span animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }} transition={{ type: 'spring', damping: 18, stiffness: 340 }} className="relative z-10">
              <Icon
                size={22}
                strokeWidth={1.75}
                className={cn('transition-colors', active ? 'text-cobalt-600 dark:text-cobalt-400' : 'text-stone-400')}
                fill={tab.label === 'Favoris' && active ? 'currentColor' : 'none'}
              />
            </motion.span>
            <span className={cn('relative z-10 text-[11px] font-semibold transition-colors', active ? 'text-cobalt-600 dark:text-cobalt-400' : 'text-stone-400')}>
              {tab.label}
            </span>
          </motion.button>
        )
      })}
    </nav>
  )
}
