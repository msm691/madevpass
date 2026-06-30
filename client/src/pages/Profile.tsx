import { useEffect, useRef, useState, type DragEvent } from 'react'
import { motion } from 'framer-motion'
import { FileText, ShieldAlert, AlertTriangle, UploadCloud, CheckCircle2 } from 'lucide-react'
import Navigation from '../components/Navigation/Navigation'
import Modal from '../components/ui/Modal'
import api from '../api/client'
import type { User } from '../types/user'
import { cn } from '../lib/utils'

interface ProfileUser extends User {
  documentAttestationUrl?: string | null
  statutInscription?: string
}

const ROLE_LABEL: Record<string, string> = {
  ETUDIANT: 'Étudiant',
  COMMERCANT: 'Commerçant',
  ADMIN: 'Administrateur',
}

async function openDocument(url: string) {
  const filename = url.split('/').pop()
  if (!filename) return
  try {
    const { data } = await api.get<{ token: string }>(`/documents/token/${filename}`)
    window.open(`/api/documents/${filename}?token=${data.token}`, '_blank')
  } catch {
    alert("Impossible d'ouvrir le document")
  }
}

export default function Profile() {
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get<ProfileUser>('/auth/me')
      .then(res => setUser(res.data))
      .finally(() => setLoading(false))
  }, [])

  async function requestDeletion() {
    setRequesting(true)
    try {
      const { data } = await api.patch<{ statutSuppression: string; dateSuppressionDemandee: string }>('/auth/me/request-deletion')
      setUser(prev => prev ? { ...prev, statutSuppression: 'PENDING_DELETION', dateSuppressionDemandee: data.dateSuppressionDemandee } : prev)
      setConfirmOpen(false)
    } catch {
      alert('Erreur lors de la demande de suppression.')
    } finally {
      setRequesting(false)
    }
  }

  async function uploadDocument(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('attestation', file)
      const { data } = await api.post<{ documentAttestationUrl: string; statutInscription: string }>(
        '/auth/me/document', fd, { headers: { 'Content-Type': undefined } },
      )
      setUser(prev => prev ? { ...prev, documentAttestationUrl: data.documentAttestationUrl, statutInscription: data.statutInscription } : prev)
    } catch {
      alert("Erreur lors de l'envoi du document.")
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadDocument(file)
  }

  const center = 'flex h-screen items-center justify-center text-slate-500 dark:text-slate-400'
  if (loading) return <div className={center}>Chargement…</div>
  if (!user) return <div className={center}>Erreur de chargement</div>

  const pending = user.statutSuppression === 'PENDING_DELETION'

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="relative flex items-start justify-between px-6 pb-8 pt-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-primary-400">Informations</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{user.prenom} {user.nom}</h1>
        </div>
        <Navigation />
      </header>

      <main className="relative mx-auto w-full max-w-xl px-6 pb-16">
        <p className="mb-3 text-xs font-bold uppercase tracking-[2px] text-slate-500">Mon compte</p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          {([['Prénom', user.prenom], ['Nom', user.nom], ['Email', user.email]] as [string, string][]).map(([label, value]) => (
            <Row key={label} label={label}>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</span>
            </Row>
          ))}
          <Row label="Rôle">
            <Badge className="bg-primary/15 text-primary dark:text-primary-400">{ROLE_LABEL[user.role] ?? user.role}</Badge>
          </Row>
          <Row label="Statut" last={!user.numeroCarte}>
            <Badge className={user.isActif ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}>
              {user.isActif ? 'Actif' : 'En attente'}
            </Badge>
          </Row>
          {user.numeroCarte && (
            <Row label="N° Carte" last>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{user.numeroCarte}</span>
            </Row>
          )}
        </motion.div>

        {/* Documents : existant ou zone d'upload différé */}
        <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-[2px] text-slate-500">Documents</p>
        {user.documentAttestationUrl ? (
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-primary-400" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Attestation d'inscription</span>
            </div>
            <button
              onClick={() => openDocument(user.documentAttestationUrl!)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
            >
              Voir
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all',
              dragOver
                ? 'border-primary bg-primary/10'
                : 'border-primary/40 bg-primary/[0.04] hover:border-primary/70 hover:bg-primary/10',
            )}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary-400">
              {uploading ? <CheckCircle2 size={26} className="animate-pulse" /> : <UploadCloud size={26} />}
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100">
                {uploading ? 'Envoi en cours…' : 'Ajouter votre justificatif'}
              </p>
              <p className="mt-1 text-sm text-slate-500">Glissez-déposez ou cliquez · PDF, JPG, PNG — 5 Mo max</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDocument(f) }}
            />
          </div>
        )}

        {/* Zone RGPD / danger */}
        <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-[2px] text-slate-500">Confidentialité (RGPD)</p>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.04] p-6">
          {pending ? (
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-amber-500" />
              <div>
                <p className="font-bold text-amber-600 dark:text-amber-400">Suppression demandée</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Suppression effective sous 14 jours (RGPD).
                  {user.dateSuppressionDemandee && (
                    <> Demandée le {new Date(user.dateSuppressionDemandee).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.</>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-start gap-3">
                <ShieldAlert size={20} className="mt-0.5 flex-shrink-0 text-red-500" />
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Vous pouvez demander la suppression définitive de votre compte et de vos données personnelles.
                </p>
              </div>
              <button
                onClick={() => setConfirmOpen(true)}
                className="w-full rounded-xl border border-red-500/60 bg-red-500/10 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white hover:shadow-[0_0_24px_-6px_rgba(239,68,68,0.7)]"
              >
                Demander la suppression de mon compte
              </button>
            </>
          )}
        </div>
      </main>

      {/* Modale de double confirmation RGPD */}
      <Modal open={confirmOpen} onClose={() => !requesting && setConfirmOpen(false)} title="Confirmer la suppression">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-500">
            <AlertTriangle size={30} />
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Cette action est <span className="font-bold text-red-500">irréversible</span>. Votre compte et vos données seront
            définitivement supprimés. Suppression effective sous <span className="font-bold">14 jours (RGPD)</span>.
          </p>
          <div className="mt-2 flex w-full gap-3">
            <button
              onClick={() => setConfirmOpen(false)}
              disabled={requesting}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Annuler
            </button>
            <button
              onClick={requestDeletion}
              disabled={requesting}
              className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
            >
              {requesting ? 'Envoi…' : 'Confirmer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function Row({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between px-5 py-4', !last && 'border-b border-slate-100 dark:border-slate-800')}>
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      {children}
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={cn('rounded-lg px-2.5 py-1 text-xs font-bold', className)}>{children}</span>
}
