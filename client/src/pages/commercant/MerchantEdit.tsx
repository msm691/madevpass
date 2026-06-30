import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Pencil, CheckCircle2 } from 'lucide-react'
import Navigation from '../../components/Navigation/Navigation'
import api from '../../api/client'

interface Commerce {
  id: string
  nom: string
  description: string
  adresse: string
  telephone: string
  siteWeb: string
  estValide: boolean
}

export default function MerchantEdit() {
  const [commerce, setCommerce] = useState<Commerce | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [form, setForm] = useState({
    nom: '',
    description: '',
    adresse: '',
    telephone: '',
    siteWeb: '',
  })

  useEffect(() => {
    api.get<{ commerce: Commerce }>('/commercant/dashboard')
      .then(res => {
        const c = res.data.commerce
        setCommerce(c)
        setForm({
          nom: c.nom ?? '',
          description: c.description ?? '',
          adresse: c.adresse ?? '',
          telephone: c.telephone ?? '',
          siteWeb: c.siteWeb ?? '',
        })
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await api.patch('/commercant/commerce', form)
      setCommerce(prev => prev ? { ...prev, ...form } : prev)
      setSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  function handleChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function handleCancelEdit() {
    if (commerce) {
      setForm({
        nom: commerce.nom ?? '',
        description: commerce.description ?? '',
        adresse: commerce.adresse ?? '',
        telephone: commerce.telephone ?? '',
        siteWeb: commerce.siteWeb ?? '',
      })
    }
    setError(null)
    setIsEditing(false)
  }

  const center = 'flex h-screen items-center justify-center text-slate-500 dark:text-slate-400'
  if (loading) return <div className={center}>Chargement…</div>
  if (!commerce) return <div className={center}>Erreur de chargement</div>

  const input = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-violet-600/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
  const label = 'mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300'

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="relative flex items-start justify-between px-6 pb-7 pt-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-primary-400">Mon commerce</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{commerce.nom}</h1>
        </div>
        <Navigation />
      </header>

      <main className="relative mx-auto w-full max-w-xl px-6 pb-16">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[2px] text-slate-500">Informations</p>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-violet-500"
            >
              <Pencil size={14} />
              Modifier
            </button>
          )}
        </div>

        {success && (
          <p className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-500">
            <CheckCircle2 size={16} /> Modifications enregistrées
          </p>
        )}

        {!isEditing ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            {([
              ['Nom du commerce', commerce.nom],
              ['Adresse', commerce.adresse],
              ['Téléphone', commerce.telephone],
              ['Site web', commerce.siteWeb],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l} className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-500">{l}</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{v || '—'}</span>
              </div>
            ))}
            <div className="flex items-start justify-between px-5 py-4">
              <span className="text-sm font-semibold text-slate-500">Description</span>
              <span className="max-w-[60%] text-right text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                {commerce.description || '—'}
              </span>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {([
              { field: 'nom', label: 'Nom du commerce', type: 'text' },
              { field: 'adresse', label: 'Adresse', type: 'text' },
              { field: 'telephone', label: 'Téléphone', type: 'tel' },
              { field: 'siteWeb', label: 'Site web', type: 'url' },
            ] as { field: keyof typeof form; label: string; type: string }[]).map(({ field, label: l, type }) => (
              <div key={field}>
                <label className={label} htmlFor={field}>{l}</label>
                <input id={field} type={type} className={input} value={form[field]} onChange={handleChange(field)} />
              </div>
            ))}

            <div>
              <label className={label} htmlFor="description">Description</label>
              <textarea id="description" className={`${input} resize-y`} value={form.description} onChange={handleChange('description')} rows={4} />
            </div>

            {error && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-primary py-3.5 font-bold text-white shadow-glow transition-colors hover:bg-violet-500 disabled:opacity-60"
              >
                {saving ? 'Enregistrement…' : 'Sauvegarder'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
