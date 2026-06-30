import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { ShieldCheck } from 'lucide-react'
import Navigation from '../../components/Navigation/Navigation'
import api from '../../api/client'
import type { User } from '../../types/user'

export default function AdminQR() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<User>('/auth/me')
      .then(r => setUser(r.data))
      .finally(() => setLoading(false))
  }, [])

  const qrValue = JSON.stringify({
    id: user?.id,
    role: 'ADMIN',
    carte: user?.numeroCarte ?? 'ADMIN-MADEV',
    ts: Math.floor(Date.now() / 60000),
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background beams */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <header className="relative flex items-start justify-between px-6 pb-7 pt-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-primary-400">Espace administrateur</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">QR Code Admin</h1>
        </div>
        <Navigation />
      </header>

      <main className="relative flex flex-col items-center px-6 pb-16 pt-6">
        {loading ? (
          <p className="py-20 text-slate-500">Chargement…</p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="glow-ring w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary-400">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {user ? `${user.prenom} ${user.nom}` : 'Administrateur'}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>

            <div className="flex justify-center rounded-2xl bg-white p-5 shadow-glow-sm">
              <QRCodeSVG value={qrValue} size={208} level="M" />
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Code administrateur sécurisé · rotation automatique
            </p>
          </motion.div>
        )}
      </main>
    </div>
  )
}
