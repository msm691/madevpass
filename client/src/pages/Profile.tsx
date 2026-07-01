import { useEffect, useRef, useState, type DragEvent } from 'react'
import { motion } from 'framer-motion'
import { FileText, ShieldAlert, AlertTriangle, UploadCloud, CheckCircle2, Bell, BellRing } from 'lucide-react'
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

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const buffer = new ArrayBuffer(raw.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i)
  return view
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
  const [pushState, setPushState] = useState<'idle' | 'loading' | 'enabled' | 'denied' | 'unsupported'>('idle')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushState('unsupported')
    } else if (Notification.permission === 'denied') {
      setPushState('denied')
    }
  }, [])

  async function enablePush() {
    setPushState('loading')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setPushState('denied')
        return
      }
      // serviceWorker.ready ne se résout jamais si aucun SW n'est enregistré : on borne l'attente
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, rej) =>
          setTimeout(() => rej(new Error('SW_TIMEOUT')), 8000),
        ),
      ])
      const { data } = await api.get<{ publicKey: string }>('/notifications/vapid-public-key')
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(data.publicKey),
        }))
      await api.post('/notifications/subscribe', sub)
      setPushState('enabled')
    } catch {
      setPushState('idle')
      alert("Impossible d'activer les alertes.")
    }
  }

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

  const center = 'flex h-screen items-center justify-center text-stone-500 dark:text-stone-400'
  if (loading) return <div className={center}>Chargement…</div>
  if (!user) return <div className={center}>Erreur de chargement</div>

  const pending = user.statutSuppression === 'PENDING_DELETION'

  return (
    <div className="grain relative min-h-screen overflow-hidden bg-cream dark:bg-ink-950">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-72 opacity-40 dark:opacity-25" />
      <div className="aurora-blob -top-40 left-1/2 h-96 w-96 -translate-x-1/2 bg-cobalt-500/15" />

      <header className="relative flex items-start justify-between px-6 pb-8 pt-12">
        <div>
          <p className="text-eyebrow uppercase text-cobalt-600 dark:text-cobalt-400">Informations</p>
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">{user.prenom} {user.nom}</h1>
        </div>
        <Navigation />
      </header>

      <main className="relative mx-auto w-full max-w-xl px-6 pb-16">
        <p className="mb-3 text-xs font-bold uppercase tracking-[2px] text-stone-500">Mon compte</p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-e2 dark:border-white/[0.07] dark:bg-ink-900"
        >
          {([['Prénom', user.prenom], ['Nom', user.nom], ['Email', user.email]] as [string, string][]).map(([label, value]) => (
            <Row key={label} label={label}>
              <span className="text-sm font-medium text-ink-800 dark:text-stone-200">{value}</span>
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
              <span className="text-sm font-medium text-ink-800 dark:text-stone-200">{user.numeroCarte}</span>
            </Row>
          )}
        </motion.div>

        {/* Documents : existant ou zone d'upload différé */}
        <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-[2px] text-stone-500">Documents</p>
        {user.documentAttestationUrl ? (
          <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-primary-400" />
              <span className="text-sm font-medium text-ink-800 dark:text-stone-200">Attestation d'inscription</span>
            </div>
            <button
              onClick={() => openDocument(user.documentAttestationUrl!)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cobalt-500"
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
              <p className="font-bold text-ink-800 dark:text-stone-100">
                {uploading ? 'Envoi en cours…' : 'Ajouter votre justificatif'}
              </p>
              <p className="mt-1 text-sm text-stone-500">Glissez-déposez ou cliquez · PDF, JPG, PNG — 5 Mo max</p>
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

        {/* Notifications Web Push (étudiant) */}
        {user.role === 'ETUDIANT' && (
          <>
            <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-[2px] text-stone-500">Notifications</p>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary-400">
                  {pushState === 'enabled' ? <BellRing size={20} /> : <Bell size={20} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-800 dark:text-stone-100">Alertes nouvelles offres</p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {pushState === 'enabled'
                      ? 'Activées · vous serez prévenu pour vos favoris'
                      : pushState === 'denied'
                        ? 'Bloquées dans les réglages du navigateur'
                        : pushState === 'unsupported'
                          ? 'Non supporté sur cet appareil'
                          : 'Soyez prévenu dès qu’un favori publie une offre'}
                  </p>
                </div>
              </div>
              <button
                onClick={enablePush}
                disabled={pushState === 'enabled' || pushState === 'loading' || pushState === 'denied' || pushState === 'unsupported'}
                className={cn(
                  'flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-all',
                  pushState === 'enabled'
                    ? 'cursor-default bg-emerald-500/15 text-emerald-500'
                    : pushState === 'denied' || pushState === 'unsupported'
                      ? 'cursor-not-allowed bg-stone-200 text-stone-400 dark:bg-ink-800'
                      : 'bg-primary text-white hover:bg-cobalt-500 disabled:opacity-60',
                )}
              >
                {pushState === 'enabled' ? '🔔 Activées' : pushState === 'loading' ? 'Activation…' : '🔔 Activer'}
              </button>
            </div>
          </>
        )}

        {/* Zone RGPD / danger */}
        <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-[2px] text-stone-500">Confidentialité (RGPD)</p>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.04] p-6">
          {pending ? (
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-amber-500" />
              <div>
                <p className="font-bold text-amber-600 dark:text-amber-400">Suppression demandée</p>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
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
                <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
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
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            Cette action est <span className="font-bold text-red-500">irréversible</span>. Votre compte et vos données seront
            définitivement supprimés. Suppression effective sous <span className="font-bold">14 jours (RGPD)</span>.
          </p>
          <div className="mt-2 flex w-full gap-3">
            <button
              onClick={() => setConfirmOpen(false)}
              disabled={requesting}
              className="flex-1 rounded-xl border border-stone-200 bg-white py-3 text-sm font-semibold text-stone-600 transition-colors hover:bg-cream dark:border-ink-700 dark:bg-ink-800 dark:text-stone-300"
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
    <div className={cn('flex items-center justify-between px-5 py-4', !last && 'border-b border-stone-100 dark:border-ink-800')}>
      <span className="text-sm font-semibold text-stone-500">{label}</span>
      {children}
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={cn('rounded-lg px-2.5 py-1 text-xs font-bold', className)}>{children}</span>
}
