import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { FolderPlus, CheckCircle2, Tag } from 'lucide-react'
import AdminShell from '../../components/admin/AdminShell'
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
      setError(typeof msg === 'string' ? msg : 'La création a échoué.')
    } finally {
      setSaving(false)
    }
  }

  const input = 'w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-cobalt-500 dark:border-white/10 dark:bg-ink-800 dark:text-stone-100'
  const label = 'mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300'

  return (
    <AdminShell title="Catégories" back={{ to: '/admin/dashboard', label: 'Tableau de bord' }} max="max-w-xl">
      {success && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={16} strokeWidth={1.75} /> Catégorie créée
        </p>
      )}

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        onSubmit={handleSubmit}
        className="mb-7 rounded-2xl border border-stone-200 bg-white p-6 shadow-card dark:border-white/10 dark:bg-ink-900"
      >
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          <FolderPlus size={15} strokeWidth={1.75} className="text-cobalt-600 dark:text-cobalt-400" /> Nouvelle catégorie
        </p>
        <div className="flex gap-3">
          <div className="w-20">
            <label className={label} htmlFor="cat-icone">Icône</label>
            <input id="cat-icone" className={`${input} text-center`} value={icone} onChange={e => setIcone(e.target.value)} placeholder="☕" maxLength={2} />
          </div>
          <div className="flex-1">
            <label className={label} htmlFor="cat-nom">Nom</label>
            <input id="cat-nom" required className={input} value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex : Restauration" />
          </div>
        </div>
        {error && <p role="alert" className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full rounded-xl bg-cobalt-500 py-3 font-bold text-white shadow-cobalt transition-colors hover:bg-cobalt-600 disabled:opacity-60"
        >
          {saving ? 'Création…' : 'Créer la catégorie'}
        </button>
      </motion.form>

      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {loading ? 'Chargement…' : `${categories.length} catégorie${categories.length > 1 ? 's' : ''}`}
      </p>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-[68px] rounded-2xl" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
              className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 transition-colors hover:border-cobalt-500/40 dark:border-white/10 dark:bg-ink-900"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-cobalt-500/10 text-xl">
                {c.icone ?? <Tag size={18} strokeWidth={1.75} className="text-cobalt-600 dark:text-cobalt-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold text-ink-900 dark:text-white">{c.nom}</p>
                <p className="truncate font-mono text-xs text-stone-400">/{c.slug}</p>
              </div>
              <span className="tnum rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-500 dark:bg-ink-800 dark:text-stone-400">
                {c.nbCommerces} commerce{c.nbCommerces > 1 ? 's' : ''}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
