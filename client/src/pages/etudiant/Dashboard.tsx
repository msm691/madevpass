import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Bell } from 'lucide-react'
import StudentCard from '../../components/StudentCard/StudentCard'
import BottomNav from '../../components/BottomNav/BottomNav'
import Navigation from '../../components/Navigation/Navigation'
import type { StudentUser } from '../../types/user'
import api from '../../api/client'

const ONBOARDING_KEY = 'madev:onboarded'

function fireWelcomeConfetti() {
  const colors = ['#2347E6', '#6680F4', '#ffffff', '#34d399']
  const burst = (particleRatio: number, opts: confetti.Options) =>
    confetti({
      origin: { y: 0.7 },
      colors,
      particleCount: Math.floor(200 * particleRatio),
      ...opts,
    })

  burst(0.25, { spread: 26, startVelocity: 55 })
  burst(0.2, { spread: 60 })
  burst(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  burst(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  burst(0.1, { spread: 120, startVelocity: 45 })
}

export default function Dashboard() {
  const [user, setUser] = useState<StudentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Première connexion : déclenche confettis + déverrouillage 3D de la carte
  const firstLoginRef = useRef(!sessionStorage.getItem(ONBOARDING_KEY))

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

  useEffect(() => {
    if (!user || !firstLoginRef.current) return
    sessionStorage.setItem(ONBOARDING_KEY, '1')
    const t = setTimeout(fireWelcomeConfetti, 700)
    return () => clearTimeout(t)
  }, [user])

  if (loading) {
    return (
      <div className="relative min-h-screen bg-cream pb-28 dark:bg-ink-950">
        <div className="px-6 pb-6 pt-12">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton mt-2 h-7 w-48 rounded" />
        </div>
        <div className="px-6">
          <div className="skeleton mx-auto h-[220px] w-full max-w-sm rounded-2xl" />
        </div>
      </div>
    )
  }
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">Profil indisponible</p>
        <p className="text-sm text-stone-500 dark:text-stone-400">Nous n’avons pas pu charger votre profil. Réessayez plus tard.</p>
      </div>
    )
  }

  return (
    <div className="grain relative min-h-screen overflow-hidden bg-cream pb-28 dark:bg-ink-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cobalt-500/15 blur-3xl" />

      <header className="relative flex items-start justify-between px-6 pb-6 pt-12">
        <div>
          <p className="text-sm font-medium text-cobalt-600 dark:text-cobalt-400">{firstLoginRef.current ? 'Bienvenue,' : 'Bonjour,'}</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">{user.prenom} {user.nom}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            title="Notifications"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-300 bg-white/60 text-stone-700 transition-colors hover:border-cobalt-500/50 hover:text-cobalt-600 dark:border-white/10 dark:bg-ink-900/60 dark:text-stone-200 dark:hover:text-cobalt-300"
          >
            <Bell size={18} strokeWidth={1.75} />
          </button>
          <Navigation />
        </div>
      </header>

      <section className="relative flex flex-col items-center gap-3 px-6 pt-2">
        <p className="self-start text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Ma carte</p>
        <StudentCard user={user} reveal={firstLoginRef.current} />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-1 text-center text-sm text-stone-400"
        >
          Présentez ce QR code chez nos partenaires
        </motion.p>
      </section>

      {error && <p role="alert" className="py-2 text-center text-sm text-red-500">{error}</p>}
      <BottomNav />
    </div>
  )
}
