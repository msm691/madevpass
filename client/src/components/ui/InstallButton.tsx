import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Share, Plus, MoreVertical } from 'lucide-react'
import Modal from './Modal'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'ios' | 'android' | 'desktop'

function detectPlatform(): Platform {
  const ua = navigator.userAgent || ''
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && 'ontouchend' in document)
  if (isIOS) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'desktop'
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error iOS Safari non-standard
    window.navigator.standalone === true
  )
}

export default function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [platform] = useState<Platform>(detectPlatform)
  const [installed, setInstalled] = useState(isStandalone)
  const [guideOpen, setGuideOpen] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed) return null

  // Sur navigateurs non éligibles (iOS, ou desktop sans event), on ne masque pas :
  // on affiche le guide manuel. On masque seulement quand l'app est déjà installée.

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      if (outcome === 'accepted') setInstalled(true)
      setDeferred(null)
      return
    }
    setGuideOpen(true)
  }

  const label = platform === 'ios' ? "Sur l'écran d'accueil" : "Télécharger l'app"

  return (
    <>
      <motion.button
        onClick={handleClick}
        aria-label="Installer l'application MADEV Pass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', damping: 24, stiffness: 300 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-overlay flex items-center gap-2 rounded-full border border-cobalt-500/40 bg-cobalt-600 px-4 py-3 text-sm font-semibold text-white shadow-cobalt transition-colors hover:bg-cobalt-500 sm:bottom-6 sm:right-6 max-md:bottom-[calc(env(safe-area-inset-bottom)+5rem)]"
      >
        <Download size={18} strokeWidth={2} />
        <span className="hidden sm:inline">{label}</span>
      </motion.button>

      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Ajouter à l'écran d'accueil">
        <p className="mb-5 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          Installez MADEV Pass comme une application native, sans passer par un store.
        </p>

        {platform === 'ios' ? (
          <ol className="space-y-3">
            <Step n={1} icon={<Share size={18} strokeWidth={1.75} />}>
              Appuyez sur l'icône <strong>Partager</strong> dans la barre de Safari.
            </Step>
            <Step n={2} icon={<Plus size={18} strokeWidth={1.75} />}>
              Choisissez <strong>« Sur l'écran d'accueil »</strong>.
            </Step>
            <Step n={3} icon={<Download size={18} strokeWidth={1.75} />}>
              Validez avec <strong>Ajouter</strong> : l'icône apparaît sur votre écran.
            </Step>
          </ol>
        ) : (
          <ol className="space-y-3">
            <Step n={1} icon={<MoreVertical size={18} strokeWidth={1.75} />}>
              Ouvrez le menu <strong>⋮</strong> de votre navigateur.
            </Step>
            <Step n={2} icon={<Plus size={18} strokeWidth={1.75} />}>
              Sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.
            </Step>
            <Step n={3} icon={<Download size={18} strokeWidth={1.75} />}>
              Confirmez : MADEV Pass s'ouvre ensuite comme une app.
            </Step>
          </ol>
        )}

        <button
          onClick={() => setGuideOpen(false)}
          className="mt-6 w-full rounded-2xl bg-cobalt-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-cobalt-500"
        >
          J'ai compris
        </button>
      </Modal>
    </>
  )
}

function Step({ n, icon, children }: { n: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cobalt-500/30 bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-300">
        {icon}
      </span>
      <span className="pt-1.5 text-sm leading-relaxed text-stone-700 dark:text-stone-200">
        <span className="mr-1 font-semibold text-ink-900 dark:text-white">{n}.</span>
        {children}
      </span>
    </li>
  )
}
