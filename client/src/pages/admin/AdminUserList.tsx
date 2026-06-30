import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Power, Pencil, AlertCircle, Search } from 'lucide-react'
import AdminShell from '../../components/admin/AdminShell'
import Modal from '../../components/ui/Modal'
import api from '../../api/client'
import type { User } from '../../types/user'
import { cn } from '../../lib/utils'

const ROLE_LABEL: Record<string, string> = {
  ETUDIANT: 'Étudiant',
  COMMERCANT: 'Commerçant',
  ADMIN: 'Admin',
}

const ROLE_STYLE: Record<string, string> = {
  ETUDIANT: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  COMMERCANT: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  ADMIN: 'bg-cobalt-500/15 text-cobalt-700 dark:text-cobalt-300',
}

export default function AdminUserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ prenom: '', nom: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    api.get<User[]>('/admin/users')
      .then(res => setUsers(res.data))
      .catch(() => setError('Impossible de charger les comptes.'))
      .finally(() => setLoading(false))
  }, [])

  function openEdit(u: User) {
    setEditUser(u)
    setEditForm({ prenom: u.prenom, nom: u.nom, email: u.email })
    setEditError(null)
  }

  async function saveEdit() {
    if (!editUser) return
    setSaving(true)
    setEditError(null)
    try {
      await api.patch(`/admin/users/${editUser.id}`, editForm)
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...editForm } : u))
      setEditUser(null)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setEditError(typeof msg === 'string' ? msg : 'La modification a échoué.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce compte ? Cette action est définitive.')) return
    setDeleting(id)
    setActionError(null)
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch {
      setActionError('Suppression impossible : ce compte est lié à des données.')
    } finally {
      setDeleting(null)
    }
  }

  async function toggleActif(user: User) {
    setActionError(null)
    try {
      await api.patch(`/admin/users/${user.id}`, { isActif: !user.isActif })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActif: !u.isActif } : u))
    } catch {
      setActionError('La modification du statut a échoué.')
    }
  }

  const inputCls = 'w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-cobalt-500 dark:border-white/10 dark:bg-ink-800 dark:text-stone-100'

  const q = query.trim().toLowerCase()
  const filtered = q
    ? users.filter(u => `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(q))
    : users

  return (
    <AdminShell title="Liste des comptes" back={{ to: '/admin/dashboard', label: 'Tableau de bord' }} max="max-w-2xl">
      {actionError && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400">
          <AlertCircle size={16} strokeWidth={1.75} /> {actionError}
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-ink-900">
              <div className="skeleton h-12 w-12 flex-shrink-0 rounded-2xl" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="skeleton h-4 w-36 rounded" />
                <div className="skeleton h-3 w-52 rounded" />
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

      {!loading && !error && users.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-20 text-center text-stone-400">
          <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">Aucun compte</p>
          <p className="text-sm">Aucun compte n’a encore été créé.</p>
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="relative mb-4">
          <Search size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un compte (nom, email)…"
            className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 text-sm text-ink-900 outline-none transition-colors focus:border-cobalt-500 dark:border-white/10 dark:bg-ink-900 dark:text-stone-100"
          />
        </div>
      )}

      {!loading && users.length > 0 && (
        <p className="mb-4 text-sm font-medium text-stone-500">
          <span className="tnum">{filtered.length}</span> compte{filtered.length > 1 ? 's' : ''}
        </p>
      )}

      {!loading && !error && users.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-stone-400">
          <p className="font-display text-base font-semibold text-ink-900 dark:text-white">Aucun résultat</p>
          <p className="text-sm">Aucun compte ne correspond à « {query} ».</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {filtered.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-300 hover:border-cobalt-500/40 hover:shadow-card-hover dark:border-white/10 dark:bg-ink-900 sm:flex-row sm:items-center"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cobalt-600 to-cobalt-400 text-sm font-bold uppercase text-white">
              {u.prenom[0]}{u.nom[0]}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-semibold text-ink-900 dark:text-white">{u.prenom} {u.nom}</p>
              <p className="truncate text-sm text-stone-500">{u.email}</p>
              <span className={cn('mt-1.5 inline-block rounded-md px-2 py-0.5 text-[11px] font-bold', ROLE_STYLE[u.role])}>
                {ROLE_LABEL[u.role] ?? u.role}
              </span>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
              <button
                onClick={() => toggleActif(u)}
                title={u.isActif ? 'Désactiver' : 'Activer'}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors active:scale-[0.98]',
                  u.isActif
                    ? 'border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400'
                    : 'border-stone-300 text-stone-400 hover:bg-stone-500/10 dark:border-white/10',
                )}
              >
                <Power size={14} strokeWidth={1.75} />
                {u.isActif ? 'Actif' : 'Inactif'}
              </button>
              <button
                onClick={() => openEdit(u)}
                title="Modifier"
                aria-label="Modifier le compte"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-500 transition-colors hover:border-cobalt-500/50 hover:text-cobalt-600 dark:border-white/10 dark:hover:text-cobalt-300"
              >
                <Pencil size={15} strokeWidth={1.75} />
              </button>
              <button
                onClick={() => handleDelete(u.id)}
                disabled={deleting === u.id}
                title="Supprimer"
                aria-label="Supprimer le compte"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/50 text-red-600 transition-colors hover:bg-red-500/10 active:scale-[0.98] disabled:opacity-40 dark:text-red-400"
              >
                <Trash2 size={15} strokeWidth={1.75} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal open={!!editUser} onClose={() => !saving && setEditUser(null)} title="Modifier le compte">
        <div className="flex flex-col gap-4">
          {([['prenom', 'Prénom'], ['nom', 'Nom'], ['email', 'Email']] as [keyof typeof editForm, string][]).map(([field, label]) => (
            <div key={field}>
              <label className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">{label}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                value={editForm[field]}
                onChange={(e) => setEditForm(prev => ({ ...prev, [field]: e.target.value }))}
                className={inputCls}
              />
            </div>
          ))}
          {editError && <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400">{editError}</p>}
          <div className="mt-1 flex gap-3">
            <button
              onClick={() => setEditUser(null)}
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
      </Modal>
    </AdminShell>
  )
}
