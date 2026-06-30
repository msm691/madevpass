import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ScanLine, CheckCircle2, Clock, Tag } from 'lucide-react'
import Navigation from '../../components/Navigation/Navigation'
import api from '../../api/client'

interface Offre {
  id: string
  titre: string
  description: string
  typeRemise: string
  valeurRemise: number
  dateDebut: string
  dateFin: string | null
}

interface DashboardData {
  commerce: { id: string; nom: string; estValide: boolean }
  offres: Offre[]
  totalPassages: number
}

function formatRemise(type: string, valeur: number): string {
  if (type === 'POURCENTAGE') return `-${valeur}%`
  if (type === 'MONTANT_FIXE') return `-${valeur}€`
  return `${valeur}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CommercantDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get<DashboardData>('/commercant/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status !== 401) {
          setError('Impossible de charger le tableau de bord')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const center = 'flex h-screen flex-col items-center justify-center text-slate-500 dark:text-slate-400'
  if (loading) return <div className={center}>Chargement…</div>
  if (error || !data) return <div className={center}><p className="text-red-500">{error ?? 'Erreur de chargement'}</p></div>

  const { commerce, offres, totalPassages } = data

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 pb-12 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="relative flex items-start justify-between px-6 pb-7 pt-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-primary-400">Espace Commerçant</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{commerce.nom}</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            commerce.estValide
              ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-500'
              : 'border-amber-400/40 bg-amber-400/10 text-amber-500'
          }`}>
            {commerce.estValide ? <CheckCircle2 size={13} /> : <Clock size={13} />}
            {commerce.estValide ? 'Validé' : 'En attente'}
          </span>
          <Navigation />
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-2xl px-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-[2px] text-slate-500">Statistiques</p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="glow-ring relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-violet-950 p-6"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-2xl" />
          <span className="block text-5xl font-extrabold leading-none tracking-tight text-white">{totalPassages}</span>
          <span className="mt-2 block text-sm font-medium text-primary-400">Passages validés</span>
        </motion.div>

        <button
          onClick={() => navigate('/commercant/scanner')}
          className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-glow transition-colors hover:bg-violet-500"
        >
          <ScanLine size={20} />
          Scanner un QR
        </button>

        <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-[2px] text-slate-500">Offres actives ({offres.length})</p>
        {offres.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            Aucune offre active pour le moment.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {offres.map((offre, i) => (
              <motion.div
                key={offre.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-primary/40 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                    <Tag size={15} className="text-primary-400" />
                    {offre.titre}
                  </span>
                  <span className="whitespace-nowrap rounded-lg bg-primary/15 px-2.5 py-1 text-sm font-extrabold text-primary dark:text-primary-400">
                    {formatRemise(offre.typeRemise, offre.valeurRemise)}
                  </span>
                </div>
                {offre.description && <p className="mt-2 text-sm leading-relaxed text-slate-500">{offre.description}</p>}
                <div className="mt-2 text-xs font-medium text-slate-400">
                  <span>{formatDate(offre.dateDebut)}</span>
                  {offre.dateFin && <span> → {formatDate(offre.dateFin)}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
