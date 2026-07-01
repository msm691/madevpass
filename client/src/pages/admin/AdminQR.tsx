import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { ShieldCheck } from 'lucide-react'
import AdminShell from '../../components/admin/AdminShell'
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
    <AdminShell title="QR Code admin" back={{ to: '/admin/dashboard', label: 'Tableau de bord' }} max="max-w-sm">
      <div className="flex flex-col items-center pt-2">
        {loading ? (
          <div className="skeleton h-[420px] w-full max-w-sm rounded-3xl" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="border-gradient w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-8 shadow-e4 dark:border-white/10 dark:bg-ink-900"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-400">
                <ShieldCheck size={22} strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display font-semibold text-ink-900 dark:text-white">
                  {user ? `${user.prenom} ${user.nom}` : 'Administrateur'}
                </p>
                <p className="truncate text-xs text-stone-500">{user?.email}</p>
              </div>
            </div>

            <div className="flex justify-center rounded-2xl bg-white p-5 shadow-cobalt-sm ring-1 ring-stone-100">
              <QRCodeSVG value={qrValue} size={208} level="M" />
            </div>

            <p className="mt-6 text-center text-sm text-stone-500">
              Code administrateur sécurisé · rotation automatique
            </p>
          </motion.div>
        )}
      </div>
    </AdminShell>
  )
}
