import { useEffect, useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, Pencil, Tag, CheckCircle2 } from 'lucide-react'
import Navigation from '../../components/Navigation/Navigation'
import api from '../../api/client'

interface Offre {
  id: string
  titre: string
  description: string
  typeRemise: 'POURCENTAGE' | 'MONTANT_FIXE'
  valeurRemise: number
  dateDebut: string
  dateFin: string | null
}

interface FormState {
  titre: string
  description: string
  typeRemise: 'POURCENTAGE' | 'MONTANT_FIXE'
  valeurRemise: string
  dateDebut: string
  dateFin: string
}

const EMPTY_FORM: FormState = {
  titre: '',
  description: '',
  typeRemise: 'POURCENTAGE',
  valeurRemise: '',
  dateDebut: new Date().toISOString().slice(0, 10),
  dateFin: '',
}

async function fetchOffers(): Promise<Offre[]> {
  const res = await api.get<{ offres: Offre[] }>('/commercant/dashboard')
  return res.data.offres
}

function buildPayload(form: FormState) {
  return {
    titre: form.titre,
    description: form.description,
    typeRemise: form.typeRemise,
    valeurRemise: parseFloat(form.valeurRemise),
    dateDebut: form.dateDebut,
    dateFin: form.dateFin || null,
  }
}

async function addOffer(form: FormState): Promise<Offre> {
  const res = await api.post<Offre>('/commercant/offres', buildPayload(form))
  return res.data
}

async function updateOffer(id: string, form: FormState): Promise<Offre> {
  const res = await api.patch<Offre>(`/commercant/offres/${id}`, buildPayload(form))
  return res.data
}

async function deleteOffer(id: string): Promise<void> {
  await api.delete(`/commercant/offres/${id}`)
}

function formatRemise(type: string, valeur: number): string {
  if (type === 'POURCENTAGE') return `-${valeur}%`
  if (type === 'MONTANT_FIXE') return `-${valeur}€`
  return `${valeur}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function MerchantOffers() {
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchOffers()
      .then(setOffres)
      .catch(() => setError('Impossible de charger les offres'))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError(null)
  }

  function startEdit(offre: Offre) {
    setEditingId(offre.id)
    setForm({
      titre: offre.titre,
      description: offre.description ?? '',
      typeRemise: offre.typeRemise,
      valeurRemise: String(offre.valeurRemise ?? ''),
      dateDebut: offre.dateDebut.slice(0, 10),
      dateFin: offre.dateFin ? offre.dateFin.slice(0, 10) : '',
    })
    setShowForm(true)
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      if (editingId) {
        const updated = await updateOffer(editingId, form)
        setOffres(prev => prev.map(o => o.id === editingId ? updated : o))
      } else {
        const newOffre = await addOffer(form)
        setOffres(prev => [...prev, newOffre])
      }
      closeForm()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError(editingId ? "Erreur lors de la modification" : "Erreur lors de l'ajout de l'offre")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await deleteOffer(id)
      setOffres(prev => prev.filter(o => o.id !== id))
    } catch {
      setError('Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  const center = 'flex h-screen items-center justify-center text-stone-500 dark:text-stone-400'
  if (loading) return <div className={center}>Chargement…</div>

  const input = 'w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-cobalt-600/30 dark:border-ink-700 dark:bg-ink-800 dark:text-stone-100'
  const label = 'mb-1.5 block text-xs font-semibold text-stone-600 dark:text-stone-300'

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream pb-12 dark:bg-ink-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="relative flex items-start justify-between px-6 pb-7 pt-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-primary-400">Mon commerce</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900 dark:text-stone-50">Mes Offres</h1>
        </div>
        <Navigation />
      </header>

      <main className="relative mx-auto w-full max-w-2xl px-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[2px] text-stone-500">Offres actives ({offres.length})</p>
          <button
            onClick={() => showForm ? closeForm() : setShowForm(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-cobalt-500"
          >
            {showForm ? <><X size={14} /> Annuler</> : <><Plus size={14} /> Nouvelle offre</>}
          </button>
        </div>

        {error && <p className="mb-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500">{error}</p>}
        {success && (
          <p className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-500">
            <CheckCircle2 size={16} /> {editingId ? 'Offre modifiée' : 'Offre ajoutée'}
          </p>
        )}

        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="mb-5 flex flex-col gap-3.5 overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"
            >
              <p className="text-sm font-bold text-ink-700 dark:text-stone-200">
                {editingId ? "Modifier l'offre" : 'Nouvelle offre'}
              </p>
              <div>
                <label className={label}>Titre</label>
                <input required className={input} value={form.titre} onChange={handleChange('titre')} placeholder="Ex: Café offert" />
              </div>
              <div>
                <label className={label}>Description</label>
                <textarea className={`${input} resize-y`} value={form.description} onChange={handleChange('description')} rows={3} placeholder="Détails de l'offre…" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={label}>Type de remise</label>
                  <select className={input} value={form.typeRemise} onChange={handleChange('typeRemise')}>
                    <option value="POURCENTAGE">Pourcentage (%)</option>
                    <option value="MONTANT_FIXE">Montant fixe (€)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className={label}>Valeur</label>
                  <input required type="number" min="0" step="0.01" className={input} value={form.valeurRemise} onChange={handleChange('valeurRemise')} placeholder={form.typeRemise === 'POURCENTAGE' ? '10' : '5'} />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={label}>Date début</label>
                  <input required type="date" className={input} value={form.dateDebut} onChange={handleChange('dateDebut')} />
                </div>
                <div className="flex-1">
                  <label className={label}>Date fin (optionnel)</label>
                  <input type="date" className={input} value={form.dateFin} onChange={handleChange('dateFin')} />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-1 rounded-xl bg-primary py-3 font-bold text-white shadow-glow transition-colors hover:bg-cobalt-500 disabled:opacity-60"
              >
                {submitting ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : "Ajouter l'offre"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {offres.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-400 dark:border-ink-800 dark:bg-ink-900">
            Aucune offre active. Créez votre première offre !
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {offres.map((offre, i) => (
              <motion.div
                key={offre.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                className="rounded-2xl border border-stone-200 bg-white p-5 transition-colors hover:border-primary/40 dark:border-ink-800 dark:bg-ink-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-2 font-bold text-ink-900 dark:text-stone-100">
                    <Tag size={15} className="text-primary-400" />
                    {offre.titre}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap rounded-lg bg-primary/15 px-2.5 py-1 text-sm font-extrabold text-primary dark:text-primary-400">
                      {formatRemise(offre.typeRemise, offre.valeurRemise)}
                    </span>
                    <button
                      onClick={() => startEdit(offre)}
                      title="Modifier"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:border-primary/50 hover:text-primary dark:border-ink-700 dark:hover:text-primary-400"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(offre.id)}
                      disabled={deletingId === offre.id}
                      title="Supprimer"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/40 text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {offre.description && <p className="mt-2 text-sm leading-relaxed text-stone-500">{offre.description}</p>}
                <div className="mt-2 text-xs font-medium text-stone-400">
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
