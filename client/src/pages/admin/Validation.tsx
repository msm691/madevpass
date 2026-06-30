import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, X, FileText, CheckCircle2 } from 'lucide-react'
import Navigation from '../../components/Navigation/Navigation'
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

  useEffect(() => {
    api.get<Inscription[]>('/admin/inscriptions')
      .then(r => setInscriptions(r.data))
      .finally(() => setLoading(false))
  }, [])

  async function refuser(id: string) {
    setRefusing(id)
    try {
      await api.patch(`/admin/refuser/${id}`)
      setInscriptions(prev => prev.filter(i => i.id !== id))
    } catch {
      alert('Erreur lors du refus')
    } finally {
      setRefusing(null)
    }
  }

  async function openDocument(documentAttestationUrl: string) {
    const filename = documentAttestationUrl.split('/').pop()
    if (!filename) return
    try {
      const { data } = await api.get<{ token: string }>(`/documents/token/${filename}`)
      window.open(`/api/documents/${filename}?token=${data.token}`, '_blank')
    } catch {
      alert("Impossible d'ouvrir le document")
    }
  }

  async function valider(id: string) {
    setValidating(id)
    try {
      await api.patch(`/admin/valider/${id}`)
      setInscriptions(prev => prev.filter(i => i.id !== id))
    } catch {
      alert('Erreur lors de la validation')
    } finally {
      setValidating(null)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="relative flex items-start justify-between px-6 pb-7 pt-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-primary-400">Espace administrateur</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Inscriptions en attente</h1>
        </div>
        <Navigation />
      </header>

      <main className="relative mx-auto w-full max-w-2xl px-4 pb-16">
        {loading && <p className="py-16 text-center text-slate-500">Chargement…</p>}

        {!loading && inscriptions.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
            <CheckCircle2 size={40} className="text-emerald-500" />
            <p>Aucune inscription en attente.</p>
          </div>
        )}

        {!loading && inscriptions.length > 0 && (
          <p className="mb-4 text-sm font-medium text-slate-500">
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
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-glow dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-400 text-sm font-extrabold uppercase text-white">
                {u.prenom[0]}{u.nom[0]}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900 dark:text-slate-100">{u.prenom} {u.nom}</p>
                <p className="truncate text-sm text-slate-500">{u.email}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Inscrit le {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {u.documentAttestationUrl && (
                  <button
                    onClick={(e) => { e.stopPropagation(); openDocument(u.documentAttestationUrl!) }}
                    className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 dark:text-primary-400"
                  >
                    <FileText size={13} />
                    Voir le document
                  </button>
                )}
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  onClick={() => refuser(u.id)}
                  disabled={refusing === u.id || validating === u.id}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/50 px-3 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  <X size={14} />
                  {refusing === u.id ? '…' : 'Refuser'}
                </button>
                <button
                  onClick={() => valider(u.id)}
                  disabled={validating === u.id || refusing === u.id}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                >
                  <Check size={14} />
                  {validating === u.id ? '…' : 'Valider'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
