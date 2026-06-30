import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { FolderPlus, CheckCircle2, Tag } from 'lucide-react'
import Navigation from '../../components/Navigation/Navigation'
import api from '../../api/client'

interface Categorie {
  id: number
  nom: string
  slug: string
  icone: string | null
  nbCommerces: number
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Categorie[]>([])
  const [loading, setLoading] = useState(true)
  const [nom, setNom] = useState('')
  const [icone, setIcone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.get<Categorie[]>('/admin/categories')
      .then(res => setCategories(res.data))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const { data } = await api.post<Categorie>('/admin/categories', { nom, icone })
      setCategories(prev => [...prev, data].sort((a, b) => a.nom.localeCompare(b.nom)))
      setNom(''); setIcone('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(typeof msg === 'string' ? msg : 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  const input = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-violet-600/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
  const label = 'mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300'

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="relative flex items-start justify-between px-6 pb-7 pt-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-primary-400">Espace administrateur</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Catégories</h1>
        </div>
        <Navigation />
      </header>

      <main className="relative mx-auto w-full max-w-xl px-6 pb-16">
        {success && (
          <p className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-500">
            <CheckCircle2 size={16} /> Catégorie créée
          </p>
        )}

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          onSubmit={handleSubmit}
          className="mb-7 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[2px] text-slate-500">
            <FolderPlus size={15} className="text-primary-400" /> Nouvelle catégorie
          </p>
          <div className="flex gap-3">
            <div className="w-20">
              <label className={label}>Icône</label>
              <input className={`${input} text-center`} value={icone} onChange={e => setIcone(e.target.value)} placeholder="☕" maxLength={2} />
            </div>
            <div className="flex-1">
              <label className={label}>Nom</label>
              <input required className={input} value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Restauration" />
            </div>
          </div>
          {error && <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="mt-4 w-full rounded-xl bg-primary py-3 font-bold text-white shadow-glow transition-colors hover:bg-violet-500 disabled:opacity-60"
          >
            {saving ? 'Création…' : 'Créer la catégorie'}
          </button>
        </motion.form>

        <p className="mb-3 text-xs font-bold uppercase tracking-[2px] text-slate-500">
          {loading ? 'Chargement…' : `${categories.length} catégorie${categories.length > 1 ? 's' : ''}`}
        </p>
        <div className="flex flex-col gap-3">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl">
                {c.icone ?? <Tag size={18} className="text-primary-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900 dark:text-slate-100">{c.nom}</p>
                <p className="truncate text-xs text-slate-400">/{c.slug}</p>
              </div>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {c.nbCommerces} commerce{c.nbCommerces > 1 ? 's' : ''}
              </span>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
