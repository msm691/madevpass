import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Tag, Users, CheckCircle2, Clock, Plus, Pencil, Search, AlertCircle } from 'lucide-react'
import AdminShell from '../../components/admin/AdminShell'
import Modal from '../../components/ui/Modal'
import api from '../../api/client'
import type { Categorie } from '../../types/commerce'

interface Merchant {
  id: string
  nom: string
  description: string
  adresse: string
  ville: string
  codePostal: string
  telephone: string
  siteWeb: string
  estValide: boolean
  nbOffres: number
  nbPassages: number
  categorie: { id: number; nom: string; icone: string | null }
  proprietaire: { id: string; prenom: string; nom: string; email: string; isActif: boolean }
}

interface EditForm {
  nom: string
  description: string
  adresse: string
  ville: string
  codePostal: string
  telephone: string
  siteWeb: string
  categorieId: number
  estValide: boolean
}

export default function AdminMerchantList() {
  const navigate = useNavigate()
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const [categories, setCategories] = useState<Categorie[]>([])
  const [editMerchant, setEditMerchant] = useState<Merchant | null>(null)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  useEffect(() => {
    api.get<Merchant[]>('/admin/merchants')
      .then(res => setMerchants(res.data))
      .catch(() => setError('Impossible de charger les commerçants.'))
      .finally(() => setLoading(false))
    api.get<Categorie[]>('/categories').then(r => setCategories(r.data)).catch(() => {})
  }, [])

  function openEdit(m: Merchant) {
    setEditMerchant(m)
    setEditForm({
      nom: m.nom,
      description: m.description ?? '',
      adresse: m.adresse,
      ville: m.ville,
      codePostal: m.codePostal ?? '',
      telephone: m.telephone ?? '',
      siteWeb: m.siteWeb ?? '',
      categorieId: m.categorie.id,
      estValide: m.estValide,
    })
    setEditError(null)
  }

  async function saveEdit() {
    if (!editMerchant || !editForm) return
    setSaving(true)
    setEditError(null)
    try {
      const { data } = await api.patch<Merchant>(`/admin/merchants/${editMerchant.id}`, editForm)
      setMerchants(prev => prev.map(m => m.id === editMerchant.id ? data : m))
      setEditMerchant(null)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setEditError(typeof msg === 'string' ? msg : 'La modification a échoué.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-cobalt-500 dark:border-white/10 dark:bg-ink-800 dark:text-stone-100'

  const q = query.trim().toLowerCase()
  const filtered = q
    ? merchants.filter(m => `${m.nom} ${m.ville} ${m.adresse} ${m.categorie.nom} ${m.proprietaire.prenom} ${m.proprietaire.nom} ${m.proprietaire.email}`.toLowerCase().includes(q))
    : merchants

  return (
    <AdminShell
      title="Commerçants"
      back={{ to: '/admin/dashboard', label: 'Tableau de bord' }}
      action={
        <button
          onClick={() => navigate('/admin/merchant/new')}
          className="sheen flex items-center gap-1.5 rounded-xl bg-cobalt-500 px-4 py-2 text-sm font-bold text-white shadow-cobalt-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-cobalt-600 hover:shadow-e3 active:scale-[0.98]"
        >
          <Plus size={15} strokeWidth={2} /> Nouveau
        </button>
      }
    >
      {loading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-ink-900">
              <div className="skeleton h-12 w-12 flex-shrink-0 rounded-2xl" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="skeleton h-4 w-44 rounded" />
                <div className="skeleton h-3 w-60 rounded" />
                <div className="skeleton mt-1 h-5 w-32 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-stone-400">
          <p className="font-display text-base font-semibold text-ink-900 dark:text-white">Chargement impossible</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && merchants.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-20 text-center text-stone-400">
          <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">Aucun commerçant</p>
          <p className="text-sm">Ajoutez votre premier commerçant partenaire.</p>
        </div>
      )}

      {!loading && !error && merchants.length > 0 && (
        <div className="relative mb-4">
          <Search size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un commerce (nom, ville, catégorie)…"
            className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 text-sm text-ink-900 outline-none transition-colors focus:border-cobalt-500 dark:border-white/10 dark:bg-ink-900 dark:text-stone-100"
          />
        </div>
      )}

      {!loading && merchants.length > 0 && (
        <p className="mb-4 text-sm font-medium text-stone-500">
          <span className="tnum">{filtered.length}</span> commerce{filtered.length > 1 ? 's' : ''}
        </p>
      )}

      {!loading && !error && merchants.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-stone-400">
          <p className="font-display text-base font-semibold text-ink-900 dark:text-white">Aucun résultat</p>
          <p className="text-sm">Aucun commerce ne correspond à « {query} ».</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filtered.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
            className="lift group rounded-2xl border border-black/[0.06] bg-white p-5 hover:border-cobalt-500/40 dark:border-white/[0.07] dark:bg-ink-900"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-cobalt-500/10 text-2xl transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                {m.categorie.icone ?? '🏪'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display font-semibold text-ink-900 dark:text-white">{m.nom}</p>
                  <span className={`flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    m.estValide ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}>
                    {m.estValide ? <CheckCircle2 size={11} strokeWidth={2} /> : <Clock size={11} strokeWidth={2} />}
                    {m.estValide ? 'Validé' : 'En attente'}
                  </span>
                </div>
                <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-stone-500">
                  <MapPin size={13} strokeWidth={1.75} /> {m.adresse}, {m.ville}
                </p>
                <p className="mt-0.5 truncate text-xs text-stone-400">
                  {m.proprietaire.prenom} {m.proprietaire.nom} · {m.proprietaire.email}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 rounded-lg bg-cobalt-500/12 px-2.5 py-1 text-[11px] font-semibold text-cobalt-700 dark:text-cobalt-300">
                    <Tag size={11} strokeWidth={1.75} /> {m.categorie.nom}
                  </span>
                  <span className="tnum rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-500 dark:bg-ink-800 dark:text-stone-400">
                    {m.nbOffres} offre{m.nbOffres > 1 ? 's' : ''}
                  </span>
                  <span className="tnum flex items-center gap-1 rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-500 dark:bg-ink-800 dark:text-stone-400">
                    <Users size={11} strokeWidth={1.75} /> {m.nbPassages} passage{m.nbPassages > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <button
                onClick={() => openEdit(m)}
                title="Modifier"
                aria-label="Modifier le commerce"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-500 transition-colors hover:border-cobalt-500/50 hover:text-cobalt-600 dark:border-white/10 dark:hover:text-cobalt-300"
              >
                <Pencil size={15} strokeWidth={1.75} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal open={!!editMerchant} onClose={() => !saving && setEditMerchant(null)} title="Modifier le commerce">
        {editForm && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">Nom du commerce</label>
              <input type="text" value={editForm.nom} onChange={(e) => setEditForm(f => f && { ...f, nom: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">Catégorie</label>
              <select value={editForm.categorieId} onChange={(e) => setEditForm(f => f && { ...f, categorieId: Number(e.target.value) })} className={inputCls}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icone ?? ''} {c.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">Description</label>
              <textarea value={editForm.description} onChange={(e) => setEditForm(f => f && { ...f, description: e.target.value })} rows={3} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">Adresse</label>
              <input type="text" value={editForm.adresse} onChange={(e) => setEditForm(f => f && { ...f, adresse: e.target.value })} className={inputCls} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">Ville</label>
                <input type="text" value={editForm.ville} onChange={(e) => setEditForm(f => f && { ...f, ville: e.target.value })} className={inputCls} />
              </div>
              <div className="w-32">
                <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">Code postal</label>
                <input type="text" value={editForm.codePostal} onChange={(e) => setEditForm(f => f && { ...f, codePostal: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">Téléphone</label>
                <input type="tel" value={editForm.telephone} onChange={(e) => setEditForm(f => f && { ...f, telephone: e.target.value })} className={inputCls} />
              </div>
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">Site web</label>
                <input type="text" value={editForm.siteWeb} onChange={(e) => setEditForm(f => f && { ...f, siteWeb: e.target.value })} className={inputCls} />
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-lg border border-stone-200 px-4 py-3 dark:border-white/10">
              <input type="checkbox" checked={editForm.estValide} onChange={(e) => setEditForm(f => f && { ...f, estValide: e.target.checked })} className="h-4 w-4 accent-cobalt-500" />
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Commerce validé</span>
            </label>

            {editError && (
              <p role="alert" className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400">
                <AlertCircle size={16} strokeWidth={1.75} /> {editError}
              </p>
            )}
            <div className="mt-1 flex gap-3">
              <button
                onClick={() => setEditMerchant(null)}
                disabled={saving}
                className="flex-1 rounded-xl border border-stone-200 bg-white py-3 text-sm font-semibold text-stone-600 transition-colors hover:bg-cream dark:border-white/10 dark:bg-ink-800 dark:text-stone-300"
              >
                Annuler
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 rounded-xl bg-cobalt-500 py-3 text-sm font-bold text-white shadow-cobalt transition-colors hover:bg-cobalt-600 disabled:opacity-60"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminShell>
  )
}
