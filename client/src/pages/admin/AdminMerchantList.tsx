import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Store, MapPin, Tag, Users, CheckCircle2, Clock, Plus } from 'lucide-react'
import Navigation from '../../components/Navigation/Navigation'
import api from '../../api/client'

interface Merchant {
  id: string
  nom: string
  adresse: string
  ville: string
  estValide: boolean
  nbOffres: number
  nbPassages: number
  categorie: { id: number; nom: string; icone: string | null }
  proprietaire: { id: string; prenom: string; nom: string; email: string; isActif: boolean }
}

export default function AdminMerchantList() {
  const navigate = useNavigate()
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<Merchant[]>('/admin/merchants')
      .then(res => setMerchants(res.data))
      .catch(() => setError('Impossible de charger les commerçants.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="relative flex items-start justify-between px-6 pb-7 pt-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-primary-400">Espace administrateur</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Commerçants</h1>
        </div>
        <Navigation />
      </header>

      <main className="relative mx-auto w-full max-w-3xl px-4 pb-16">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            {loading ? 'Chargement…' : `${merchants.length} commerce${merchants.length > 1 ? 's' : ''}`}
          </p>
          <button
            onClick={() => navigate('/admin/merchant/new')}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-violet-500"
          >
            <Plus size={14} /> Nouveau
          </button>
        </div>

        {error && <p className="py-12 text-center text-red-500">{error}</p>}
        {!loading && !error && merchants.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
            <Store size={40} className="text-primary-400" />
            <p>Aucun commerçant enregistré.</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {merchants.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-glow dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                  {m.categorie.icone ?? '🏪'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-bold text-slate-900 dark:text-slate-100">{m.nom}</p>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      m.estValide ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    }`}>
                      {m.estValide ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                      {m.estValide ? 'Validé' : 'En attente'}
                    </span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-slate-500">
                    <MapPin size={13} /> {m.adresse}, {m.ville}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {m.proprietaire.prenom} {m.proprietaire.nom} · {m.proprietaire.email}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-[11px] font-bold text-primary dark:text-primary-400">
                      <Tag size={11} /> {m.categorie.nom}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {m.nbOffres} offre{m.nbOffres > 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <Users size={11} /> {m.nbPassages} passage{m.nbPassages > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
