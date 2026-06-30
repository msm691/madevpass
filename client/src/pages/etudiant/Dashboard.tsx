import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import StudentCard from '../../components/StudentCard/StudentCard'
import BottomNav from '../../components/BottomNav/BottomNav'
import Navigation from '../../components/Navigation/Navigation'
import type { StudentUser } from '../../types/user'
import api from '../../api/client'

export default function Dashboard() {
  const [user, setUser] = useState<StudentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<StudentUser>('/auth/me')
      .then((res) => setUser(res.data))
      .catch((err) => {
        if (err.response?.status !== 401) {
          setError('Impossible de charger votre profil')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const center = 'flex h-screen items-center justify-center text-slate-500 dark:text-slate-400'
  if (loading) return <div className={center}>Chargement…</div>
  if (!user) return <div className={center}>Erreur de chargement</div>

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 pb-28 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="relative flex items-start justify-between px-6 pb-6 pt-12">
        <div>
          <p className="text-sm font-medium text-primary-400">Bonjour,</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{user.prenom} {user.nom}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            title="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-slate-700 backdrop-blur-md transition-colors hover:text-primary dark:text-slate-200"
          >
            <Bell size={18} />
          </button>
          <Navigation />
        </div>
      </header>

      <section className="relative flex flex-col items-center gap-3 px-6 pt-2">
        <p className="self-start text-xs font-bold uppercase tracking-[2px] text-slate-500">Ma carte</p>
        <StudentCard user={user} />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-1 text-center text-sm text-slate-400"
        >
          Présentez ce QR code chez nos partenaires
        </motion.p>
      </section>

      {error && <p className="py-2 text-center text-sm text-red-500">{error}</p>}
      <BottomNav />
    </div>
  )
}
