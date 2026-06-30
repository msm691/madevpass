import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Power, Pencil, Users as UsersIcon } from 'lucide-react'
import Navigation from '../../components/Navigation/Navigation'
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
  ETUDIANT: 'bg-sky-500/15 text-sky-500 dark:text-sky-400',
  COMMERCANT: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  ADMIN: 'bg-primary/15 text-primary dark:text-primary-400',
}

export default function AdminUserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ prenom: '', nom: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

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
      setEditError(typeof msg === 'string' ? msg : 'Erreur lors de la modification')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce compte ?')) return
    setDeleting(id)
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch {
      alert('Suppression impossible (compte lié à des données).')
    } finally {
      setDeleting(null)
    }
  }

  async function toggleActif(user: User) {
    try {
      await api.patch(`/admin/users/${user.id}`, { isActif: !user.isActif })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActif: !u.isActif } : u))
    } catch {
      alert('Erreur lors de la modification')
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="relative flex items-start justify-between px-6 pb-7 pt-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-primary-400">Espace administrateur</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Liste des comptes</h1>
        </div>
        <Navigation />
      </header>

      <main className="relative mx-auto w-full max-w-2xl px-4 pb-16">
        {loading && <p className="py-16 text-center text-slate-500">Chargement…</p>}
        {error && <p className="py-16 text-center text-red-500">{error}</p>}

        {!loading && !error && users.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
            <UsersIcon size={40} className="text-primary-400" />
            <p>Aucun compte trouvé.</p>
          </div>
        )}

        {!loading && users.length > 0 && (
          <p className="mb-4 text-sm font-medium text-slate-500">
            {users.length} compte{users.length > 1 ? 's' : ''}
          </p>
        )}

        <div className="flex flex-col gap-4">
          {users.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-glow dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:translate-x-full group-hover:opacity-100" />

              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-400 text-sm font-extrabold uppercase text-white">
                {u.prenom[0]}{u.nom[0]}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900 dark:text-slate-100">{u.prenom} {u.nom}</p>
                <p className="truncate text-sm text-slate-500">{u.email}</p>
                <span className={cn('mt-1.5 inline-block rounded-md px-2 py-0.5 text-[11px] font-bold', ROLE_STYLE[u.role])}>
                  {ROLE_LABEL[u.role] ?? u.role}
                </span>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  onClick={() => toggleActif(u)}
                  title={u.isActif ? 'Désactiver' : 'Activer'}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors',
                    u.isActif
                      ? 'border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10'
                      : 'border-slate-300 text-slate-400 hover:bg-slate-500/10 dark:border-slate-700',
                  )}
                >
                  <Power size={14} />
                  {u.isActif ? 'Actif' : 'Inactif'}
                </button>
                <button
                  onClick={() => openEdit(u)}
                  title="Modifier"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-primary/50 hover:text-primary dark:border-slate-700 dark:hover:text-primary-400"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  disabled={deleting === u.id}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/50 text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-40"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Modal open={!!editUser} onClose={() => !saving && setEditUser(null)} title="Modifier le compte">
        <div className="flex flex-col gap-4">
          {([['prenom', 'Prénom'], ['nom', 'Nom'], ['email', 'Email']] as [keyof typeof editForm, string][]).map(([field, label]) => (
            <div key={field}>
              <label className="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                value={editForm[field]}
                onChange={(e) => setEditForm(prev => ({ ...prev, [field]: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-violet-600/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          ))}
          {editError && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500">{editError}</p>}
          <div className="mt-1 flex gap-3">
            <button
              onClick={() => setEditUser(null)}
              disabled={saving}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Annuler
            </button>
            <button
              onClick={saveEdit}
              disabled={saving}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-glow transition-colors hover:bg-violet-500 disabled:opacity-60"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
