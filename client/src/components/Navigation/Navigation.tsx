import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, User, Users, Tag, Store, UserPlus, FolderTree, LayoutDashboard, ClipboardCheck, LogOut, Menu } from 'lucide-react'
import type { Role } from '../../types/user'
import ThemeToggle from '../ui/ThemeToggle'

type Item = { name: string; path: string; roles: Role[]; icon: React.ElementType }

// La vue "QR Code" diffère selon le rôle : l'admin a sa propre page (/admin/qr),
// étudiant & commerçant passent par /dashboard (redirigé vers leur carte).
const QR_PATH: Record<Role, string> = {
  ADMIN: '/admin/qr',
  ETUDIANT: '/carte',
  COMMERCANT: '/dashboard',
}

const MENU_ITEMS: Item[] = [
  { name: 'QR Code', path: '__qr__', roles: ['ADMIN', 'ETUDIANT', 'COMMERCANT'], icon: QrCode },
  { name: 'Informations', path: '/profile', roles: ['ADMIN', 'ETUDIANT', 'COMMERCANT'], icon: User },
  { name: 'Tableau de bord', path: '/admin/dashboard', roles: ['ADMIN'], icon: LayoutDashboard },
  { name: "Demandes d'inscription", path: '/admin/validation', roles: ['ADMIN'], icon: ClipboardCheck },
  { name: 'Liste des comptes', path: '/admin/users', roles: ['ADMIN'], icon: Users },
  { name: 'Commerçants', path: '/admin/commercants', roles: ['ADMIN'], icon: Store },
  { name: 'Catégories', path: '/admin/categories', roles: ['ADMIN'], icon: FolderTree },
  { name: 'Nouveau commerçant', path: '/admin/merchant/new', roles: ['ADMIN'], icon: UserPlus },
  { name: 'Offres', path: '/merchant/offers', roles: ['COMMERCANT'], icon: Tag },
  { name: 'Mon commerce', path: '/merchant/edit', roles: ['COMMERCANT'], icon: Store },
]

function decodeRole(token: string): Role | null {
  try {
    return JSON.parse(atob(token.split('.')[1])).role ?? null
  } catch {
    return null
  }
}

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<Role | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) setRole(decodeRole(token))
  }, [])

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function logout() {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  function go(item: Item) {
    const path = item.path === '__qr__' && role ? QR_PATH[role] : item.path
    navigate(path)
    setOpen(false)
  }

  const visibleItems = role ? MENU_ITEMS.filter(i => i.roles.includes(role)) : []

  return (
    <div className="flex items-center gap-2" ref={ref}>
      <ThemeToggle />

      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Menu"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:border-cobalt-400/60 hover:bg-cobalt-500/20"
        >
          <Menu size={18} strokeWidth={1.75} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              className="glass absolute right-0 z-overlay mt-2 w-56 overflow-hidden rounded-2xl p-2 shadow-card-hover"
            >
              {visibleItems.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.name}
                    onClick={() => go(item)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-stone-700 transition-colors hover:bg-cobalt-500/10 hover:text-cobalt-600 dark:text-stone-200 dark:hover:text-cobalt-300"
                  >
                    <Icon size={17} strokeWidth={1.75} />
                    {item.name}
                  </button>
                )
              })}
              <div className="my-1 h-px bg-stone-200 dark:bg-white/10" />
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
              >
                <LogOut size={17} strokeWidth={1.75} />
                Déconnexion
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
