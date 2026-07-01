import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Store, CheckCircle2, AlertCircle } from 'lucide-react'
import AdminShell from '../../components/admin/AdminShell'
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
      setError(typeof msg === 'string' ? msg : 'La création a échoué.')
    } finally {
      setSaving(false)
    }
  }

  const input = 'w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-cobalt-500 dark:border-white/10 dark:bg-ink-800 dark:text-stone-100'
  const label = 'mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300'
  const section = 'flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500'

  return (
    <AdminShell title="Nouveau commerçant" back={{ to: '/admin/commercants', label: 'Commerçants' }} max="max-w-xl">
      {success && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={16} strokeWidth={1.75} /> Compte commerçant créé
        </p>
      )}

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-3xl border border-black/[0.06] bg-white p-6 shadow-e3 dark:border-white/[0.07] dark:bg-ink-900"
        noValidate
      >
        <p className={section}>
          <Store size={15} strokeWidth={1.75} className="text-cobalt-600 dark:text-cobalt-400" /> Compte
        </p>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={label} htmlFor="prenom">Prénom</label>
            <input id="prenom" required className={input} value={form.prenom} onChange={handleChange('prenom')} />
          </div>
          <div className="flex-1">
            <label className={label} htmlFor="nom">Nom</label>
            <input id="nom" required className={input} value={form.nom} onChange={handleChange('nom')} />
          </div>
        </div>
        <div>
          <label className={label} htmlFor="email">Email</label>
          <input id="email" required type="email" className={input} value={form.email} onChange={handleChange('email')} />
        </div>
        <div>
          <label className={label} htmlFor="password">Mot de passe</label>
          <input id="password" required type="password" minLength={8} className={input} value={form.password} onChange={handleChange('password')} />
          <span className="mt-1 block text-xs text-stone-500">8 caractères minimum</span>
        </div>

        <div className="h-px bg-stone-100 dark:bg-white/10" />
        <p className={section}>Commerce</p>
        <div>
          <label className={label} htmlFor="nomCommerce">Nom du commerce</label>
          <input id="nomCommerce" required className={input} value={form.nomCommerce} onChange={handleChange('nomCommerce')} />
        </div>
        <div>
          <label className={label} htmlFor="categorieId">Catégorie</label>
          <select id="categorieId" required className={input} value={form.categorieId} onChange={handleChange('categorieId')}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icone ?? ''} {c.nom}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="description">Description</label>
          <textarea id="description" className={`${input} resize-y`} rows={3} value={form.description} onChange={handleChange('description')} />
        </div>
        <div>
          <label className={label} htmlFor="adresse">Adresse</label>
          <input id="adresse" required className={input} value={form.adresse} onChange={handleChange('adresse')} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={label} htmlFor="ville">Ville</label>
            <input id="ville" required className={input} value={form.ville} onChange={handleChange('ville')} />
          </div>
          <div className="flex-1">
            <label className={label} htmlFor="codePostal">Code postal</label>
            <input id="codePostal" required className={input} value={form.codePostal} onChange={handleChange('codePostal')} />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={label} htmlFor="telephone">Téléphone</label>
            <input id="telephone" type="tel" className={input} value={form.telephone} onChange={handleChange('telephone')} />
          </div>
          <div className="flex-1">
            <label className={label} htmlFor="siteWeb">Site web</label>
            <input id="siteWeb" type="url" className={input} value={form.siteWeb} onChange={handleChange('siteWeb')} />
          </div>
        </div>

        {error && (
          <p role="alert" className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400">
            <AlertCircle size={16} strokeWidth={1.75} /> {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="sheen rounded-xl bg-cobalt-500 py-3.5 font-bold text-white shadow-cobalt transition-all duration-300 hover:bg-cobalt-600 hover:shadow-e4 disabled:opacity-60"
        >
          {saving ? 'Création…' : 'Créer le compte commerçant'}
        </button>
      </motion.form>
    </AdminShell>
  )
}
