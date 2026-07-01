import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import AdminShell from '../../components/admin/AdminShell'
import api from '../../api/client'

interface Inscription {
  id: string
  prenom: string
  nom: string
  email: string
  documentAttestationUrl: string | null
  createdAt: string
}

export default function Validation() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState<string | null>(null)
  const [refusing, setRefusing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<Inscription[]>('/admin/inscriptions')
      .then(r => setInscriptions(r.data))
      .finally(() => setLoading(false))
  }, [])

  async function refuser(id: string) {
    setRefusing(id)
    setError(null)
    try {
      await api.patch(`/admin/refuser/${id}`)
      setInscriptions(prev => prev.filter(i => i.id !== id))
    } catch {
      setError('Le refus a échoué. Veuillez réessayer.')
    } finally {
      setRefusing(null)
    }
  }

  async function openDocument(documentAttestationUrl: string) {
    const filename = documentAttestationUrl.split('/').pop()
    if (!filename) return
    setError(null)
    try {
      const { data } = await api.get<{ token: string }>(`/documents/token/${filename}`)
      window.open(`/api/documents/${filename}?token=${data.token}`, '_blank')
    } catch {
      setError('Impossible d’ouvrir le document.')
    }
  }

  async function valider(id: string) {
    setValidating(id)
    setError(null)
    try {
      await api.patch(`/admin/valider/${id}`)
      setInscriptions(prev => prev.filter(i => i.id !== id))
    } catch {
      setError('La validation a échoué. Veuillez réessayer.')
    } finally {
      setValidating(null)
    }
  }

  return (
    <AdminShell
      title="Inscriptions en attente"
      back={{ to: '/admin/dashboard', label: 'Tableau de bord' }}
      max="max-w-2xl"
    >
      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400">
          <AlertCircle size={16} strokeWidth={1.75} /> {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-ink-900">
              <div className="skeleton h-12 w-12 flex-shrink-0 rounded-2xl" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="skeleton h-4 w-40 rounded" />
                <div className="skeleton h-3 w-56 rounded" />
              </div>
              <div className="skeleton h-9 w-24 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {!loading && inscriptions.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={32} strokeWidth={1.5} />
          </div>
          <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">Tout est à jour</p>
          <p className="text-sm text-stone-400">Aucune inscription en attente de validation.</p>
        </div>
      )}

      {!loading && inscriptions.length > 0 && (
        <p className="mb-4 text-sm font-medium text-stone-500">
          {inscriptions.length} demande{inscriptions.length > 1 ? 's' : ''} à traiter
        </p>
      )}

      <div className="flex flex-col gap-4">
        {inscriptions.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
            className="lift group flex flex-col gap-4 rounded-2xl border border-black/[0.06] bg-white p-5 hover:border-cobalt-500/40 dark:border-white/[0.07] dark:bg-ink-900 sm:flex-row sm:items-center"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cobalt-600 to-cobalt-400 text-sm font-bold uppercase text-white">
              {u.prenom[0]}{u.nom[0]}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-semibold text-ink-900 dark:text-white">{u.prenom} {u.nom}</p>
              <p className="truncate text-sm text-stone-500">{u.email}</p>
              <p className="mt-0.5 text-xs text-stone-400">
                Inscrit le {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {u.documentAttestationUrl && (
                <button
                  onClick={(e) => { e.stopPropagation(); openDocument(u.documentAttestationUrl!) }}
                  className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-cobalt-600 transition-colors hover:bg-cobalt-500/10 dark:text-cobalt-400"
                >
                  <FileText size={13} strokeWidth={1.75} />
                  Voir le document
                </button>
              )}
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
              <button
                onClick={() => refuser(u.id)}
                disabled={refusing === u.id || validating === u.id}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/50 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-500/10 active:scale-[0.98] disabled:opacity-50 dark:text-red-400"
              >
                <X size={14} strokeWidth={2} />
                {refusing === u.id ? '…' : 'Refuser'}
              </button>
              <button
                onClick={() => valider(u.id)}
                disabled={validating === u.id || refusing === u.id}
                className="flex items-center gap-1.5 rounded-xl bg-success px-3.5 py-2 text-xs font-bold text-white shadow-e2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-e3 active:scale-[0.98] disabled:opacity-50"
              >
                <Check size={14} strokeWidth={2} />
                {validating === u.id ? '…' : 'Valider'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </AdminShell>
  )
}
