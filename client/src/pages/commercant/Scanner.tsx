import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Camera, Check, ScanLine, X } from 'lucide-react'
import api from '../../api/client'
import { cn } from '../../lib/utils'

interface Feedback {
  ok: boolean
  title: string
  message: string
}

function CornerMark({ className }: { className: string }) {
  return <span className={cn('absolute h-7 w-7 border-primary', className)} />
}

// Beep de validation doux via Web Audio (aucun asset à charger)
function successChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const gain = ctx.createGain()
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4)

    const notes = [880, 1318.5] // La5 -> Mi6, montée façon Apple Pay
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.connect(gain)
      osc.start(ctx.currentTime + i * 0.09)
      osc.stop(ctx.currentTime + i * 0.09 + 0.18)
    })
    setTimeout(() => ctx.close(), 600)
  } catch {
    /* audio non supporté : silencieux */
  }
}

export default function Scanner() {
  const navigate = useNavigate()
  const qrRef = useRef<Html5Qrcode | null>(null)
  const processing = useRef(false)
  const [scanning, setScanning] = useState(false)
  const [starting, setStarting] = useState(false)
  const [cameraErr, setCameraErr] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const handleScan = useCallback(async (token: string) => {
    if (processing.current) return
    processing.current = true

    // Feedback immédiat (haptique + audio) dès la lecture du QR, avant l'appel réseau
    if (navigator.vibrate) navigator.vibrate([200])
    successChime()

    try {
      const { data } = await api.post<{ message?: string; etudiant?: string }>('/passages/scan', { qrToken: token })
      setFeedback({
        ok: true,
        title: data.etudiant ?? 'Passage validé',
        message: data.message ?? 'Accès accordé avec succès.',
      })
    } catch (err: unknown) {
      const e = err as { response?: { status: number; data?: { message?: string } } }
      const status = e.response?.status ?? 0
      const msg = e.response?.data?.message ?? ''
      const map: Record<number, [string, string]> = {
        400: ['QR invalide', msg || 'QR code expiré ou invalide.'],
        403: ['Non autorisé', msg || "Ce QR n'est pas rattaché à votre commerce."],
        404: ['Introuvable', msg || 'Étudiant ou offre introuvable.'],
      }
      const [title, message] = map[status] ?? ['Erreur', msg || 'Erreur serveur. Réessayez.']
      setFeedback({ ok: false, title, message })
    }
  }, [])

  const startScan = useCallback(async () => {
    if (starting || scanning) return
    setCameraErr(null)
    setStarting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      stream.getTracks().forEach(t => t.stop())

      const qr = new Html5Qrcode('qr-reader')
      qrRef.current = qr
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScan,
        () => {},
      )
      setScanning(true)
    } catch (err: unknown) {
      const name = (err as DOMException)?.name ?? ''
      const msg = String(err)
      if (name === 'NotAllowedError' || msg.includes('NotAllowed') || msg.includes('Permission')) {
        setCameraErr('Accès caméra refusé. Autorisez-le dans les réglages du navigateur.')
      } else if (name === 'NotFoundError' || msg.includes('NotFound')) {
        setCameraErr('Aucune caméra détectée sur cet appareil.')
      } else {
        setCameraErr("Impossible d'accéder à la caméra.")
      }
    } finally {
      setStarting(false)
    }
  }, [handleScan, scanning, starting])

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraErr("Votre navigateur ne supporte pas l'accès à la caméra.")
      return
    }

    // Override total du chrome natif de html5-qrcode (cadre blanc, bordures, dashboard)
    const style = document.createElement('style')
    style.textContent = [
      '#qr-reader { width:100% !important; height:100% !important; border:none !important; background:transparent !important; }',
      '#qr-reader * { border:none !important; box-shadow:none !important; }',
      '#qr-reader video { width:100% !important; height:100% !important; object-fit:cover !important; position:absolute !important; inset:0 !important; }',
      '#qr-reader canvas { opacity:0 !important; pointer-events:none !important; }',
      '#qr-reader__scan_region { border:none !important; background:transparent !important; box-shadow:none !important; }',
      '#qr-reader__scan_region img, #qr-reader__scan_region > span { display:none !important; }',
      '#qr-reader__dashboard, #qr-reader__header_message, #qr-shaded-region { display:none !important; }',
    ].join('\n')
    document.head.appendChild(style)

    return () => {
      style.remove()
      const q = qrRef.current
      if (q) {
        q.stop().catch(() => {}).finally(() => { try { q.clear() } catch { /* already cleared */ } })
      }
    }
  }, [])

  function dismiss() {
    setFeedback(null)
    processing.current = false
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950">
      {/* Header glassmorphism */}
      <div className="z-10 flex flex-shrink-0 items-center justify-between bg-black/50 p-4 backdrop-blur-xl">
        <button
          onClick={() => navigate('/commercant')}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white transition-colors hover:bg-white/25"
        >
          <ArrowLeft size={22} />
        </button>
        <span className="text-base font-bold text-white">Mode Caisse</span>
        <div className="w-11" />
      </div>

      <div className="relative flex-1 overflow-hidden bg-black">
        <div id="qr-reader" className="absolute inset-0" />

        {cameraErr ? (
          <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-4 bg-slate-950 px-8">
            <Camera size={52} className="text-primary-400" />
            <p className="max-w-xs text-center leading-relaxed text-slate-400">{cameraErr}</p>
            <button
              onClick={() => navigate('/commercant')}
              className="mt-2 rounded-2xl bg-primary px-8 py-3 font-semibold text-white shadow-glow transition-colors hover:bg-violet-500"
            >
              Retour
            </button>
          </div>
        ) : scanning ? (
          <div className="pointer-events-none absolute inset-0 z-[5] flex flex-col items-center justify-center gap-7" aria-hidden="true">
            {/* Cadre violet + scan-line animée */}
            <div className="relative aspect-square w-[min(70vw,18rem)] overflow-hidden rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
              <CornerMark className="-left-0.5 -top-0.5 rounded-tl-lg border-l-[3px] border-t-[3px]" />
              <CornerMark className="-right-0.5 -top-0.5 rounded-tr-lg border-r-[3px] border-t-[3px]" />
              <CornerMark className="-bottom-0.5 -left-0.5 rounded-bl-lg border-b-[3px] border-l-[3px]" />
              <CornerMark className="-bottom-0.5 -right-0.5 rounded-br-lg border-b-[3px] border-r-[3px]" />

              <motion.div
                initial={{ top: '4%' }}
                animate={{ top: ['4%', '96%', '4%'] }}
                transition={{ duration: 2.6, ease: 'easeInOut', repeat: Infinity }}
                className="absolute left-2 right-2 h-0.5 rounded-full bg-primary shadow-[0_0_14px_4px_rgba(124,58,237,0.8)]"
              />
              <div className="absolute inset-0 bg-primary/5" />
            </div>
            <p className="px-8 text-center text-sm font-medium text-white/85">
              Pointez la caméra sur le QR code étudiant
            </p>
          </div>
        ) : (
          // État inactif : écran noir + FAB massif pour dégainer la caméra
          <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-10 bg-slate-950 px-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <ScanLine size={56} className="text-primary-400" />
              <p className="text-lg font-bold text-white">Prêt à encaisser</p>
              <p className="max-w-xs text-sm leading-relaxed text-slate-400">
                Démarrez la caméra pour valider le passage d'un étudiant.
              </p>
            </div>

            <motion.button
              onClick={startScan}
              disabled={starting}
              whileTap={{ scale: 0.94 }}
              className="flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-full bg-primary text-white shadow-[0_0_60px_-4px_rgba(124,58,237,0.9)] ring-8 ring-primary/20 transition-colors hover:bg-violet-500 disabled:opacity-70"
            >
              <Camera size={46} />
              <span className="text-sm font-extrabold uppercase tracking-wider">
                {starting ? 'Activation…' : 'Démarrer'}
              </span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Feedback sheet */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
            onClick={dismiss}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              className={cn(
                'w-full max-w-md rounded-t-3xl border-t-4 bg-white px-7 pb-11 pt-8 dark:bg-slate-900',
                feedback.ok ? 'border-emerald-500' : 'border-red-500',
              )}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full',
                  feedback.ok ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500',
                )}>
                  {feedback.ok ? <Check size={30} /> : <X size={30} />}
                </div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{feedback.title}</p>
                <p className="text-center text-sm leading-relaxed text-slate-500">{feedback.message}</p>
                <button
                  onClick={dismiss}
                  className={cn(
                    'mt-3 w-full rounded-2xl py-4 text-base font-bold text-white transition-colors',
                    feedback.ok ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600',
                  )}
                >
                  {feedback.ok ? 'Scan suivant' : 'Réessayer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
