import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Store, CheckCircle2, ArrowLeft } from 'lucide-react'
import Navigation from '../../components/Navigation/Navigation'
import api from '../../api/client'
import type { Categorie } from '../../types/commerce'

interface FormState {
  prenom: string
  nom: string
  email: string
  password: string
  nomCommerce: string
  description: string
  adresse: string
  ville: string
  codePostal: string
  categorieId: string
  telephone: string
  siteWeb: string
}

const EMPTY: FormState = {
  prenom: '', nom: '', email: '', password: '',
  nomCommerce: '', description: '', adresse: '', ville: '', codePostal: '',
  categorieId: '', telephone: '', siteWeb: '',
}

export default function AdminCreateMerchant() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [categories, setCategories] = useState<Categorie[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.get<Categorie[]>('/categories').then(r => {
      setCategories(r.data)
      if (r.data[0]) setForm(f => ({ ...f, categorieId: String(r.data[0].id) }))
    })
  }, [])

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.post('/admin/merchants', { ...form, categorieId: Number(form.categorieId) })
      setSuccess(true)
      setForm({ ...EMPTY, categorieId: form.categorieId })
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[2px] text-primary-400">Espace administrateur</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Nouveau commerçant</h1>
          </div>
        </div>
        <Navigation />
      </header>

      <main className="relative mx-auto w-full max-w-xl px-6 pb-16">
        {success && (
          <p className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-500">
            <CheckCircle2 size={16} /> Compte commerçant créé
          </p>
        )}

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[2px] text-slate-500">
            <Store size={15} className="text-primary-400" /> Compte
          </p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Prénom</label>
              <input required className={input} value={form.prenom} onChange={handleChange('prenom')} />
            </div>
            <div className="flex-1">
              <label className={label}>Nom</label>
              <input required className={input} value={form.nom} onChange={handleChange('nom')} />
            </div>
          </div>
          <div>
            <label className={label}>Email</label>
            <input required type="email" className={input} value={form.email} onChange={handleChange('email')} />
          </div>
          <div>
            <label className={label}>Mot de passe</label>
            <input required type="password" minLength={8} className={input} value={form.password} onChange={handleChange('password')} />
            <span className="mt-1 block text-xs text-slate-500">8 caractères minimum</span>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />
          <p className="text-sm font-bold uppercase tracking-[2px] text-slate-500">Commerce</p>
          <div>
            <label className={label}>Nom du commerce</label>
            <input required className={input} value={form.nomCommerce} onChange={handleChange('nomCommerce')} />
          </div>
          <div>
            <label className={label}>Catégorie</label>
            <select required className={input} value={form.categorieId} onChange={handleChange('categorieId')}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icone ?? ''} {c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Description</label>
            <textarea className={`${input} resize-y`} rows={3} value={form.description} onChange={handleChange('description')} />
          </div>
          <div>
            <label className={label}>Adresse</label>
            <input required className={input} value={form.adresse} onChange={handleChange('adresse')} />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Ville</label>
              <input required className={input} value={form.ville} onChange={handleChange('ville')} />
            </div>
            <div className="flex-1">
              <label className={label}>Code postal</label>
              <input required className={input} value={form.codePostal} onChange={handleChange('codePostal')} />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={label}>Téléphone</label>
              <input type="tel" className={input} value={form.telephone} onChange={handleChange('telephone')} />
            </div>
            <div className="flex-1">
              <label className={label}>Site web</label>
              <input type="url" className={input} value={form.siteWeb} onChange={handleChange('siteWeb')} />
            </div>
          </div>

          {error && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-primary py-3.5 font-bold text-white shadow-glow transition-colors hover:bg-violet-500 disabled:opacity-60"
          >
            {saving ? 'Création…' : 'Créer le compte commerçant'}
          </button>
        </motion.form>
      </main>
    </div>
  )
}
