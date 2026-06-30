import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Maximize2, RefreshCw } from 'lucide-react'
import type { StudentUser } from '../../types/user'
import Modal from '../ui/Modal'

interface Props {
  user: StudentUser
  /** Animation de déverrouillage 3D spectaculaire (première connexion) */
  reveal?: boolean
}

function buildQr(user: StudentUser, minuteTs: number) {
  return JSON.stringify({ id: user.id, carte: user.numeroCarte, ts: minuteTs })
}

export default function StudentCard({ user, reveal = false }: Props) {
  const [open, setOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  // Tick chaque seconde uniquement quand le pop-up est ouvert (timer + rotation QR)
  useEffect(() => {
    if (!open) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [open])

  const initiales = `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
  const minuteTs = Math.floor(now / 60000)
  const secondsLeft = 60 - Math.floor((now % 60000) / 1000)
  const qrValue = buildQr(user, minuteTs)

  const R = 26
  const C = 2 * Math.PI * R
  const progress = secondsLeft / 60

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        style={{ transformPerspective: 1200 }}
        initial={
          reveal
            ? { opacity: 0, rotateY: 180, rotateX: -25, scale: 0.82, y: 40 }
            : { opacity: 0, y: 24, scale: 0.97 }
        }
        animate={{ opacity: 1, rotateY: 0, rotateX: 0, scale: 1, y: 0 }}
        transition={
          reveal
            ? { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }
            : { duration: 0.45, ease: 'easeOut' }
        }
        whileHover={{ scale: 0.985 }}
        className="group relative flex min-h-[220px] w-full max-w-sm flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ink-900 via-ink-900 to-cobalt-950 p-6 text-left text-white shadow-cobalt transition-shadow duration-300 hover:shadow-[0_0_60px_-8px_rgba(35,71,230,0.75)]"
      >
        {reveal && (
          <motion.span
            className="pointer-events-none absolute inset-0 z-20 skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            initial={{ x: '-150%' }}
            animate={{ x: '150%' }}
            transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.9 }}
          />
        )}
        <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-cobalt-500/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-8 h-48 w-48 rounded-full bg-cobalt-400/15 blur-2xl" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-wide text-white">MADEV Pass</span>
            <span className="mt-0.5 font-mono text-[10px] font-medium uppercase tracking-[2px] text-cobalt-300">Carte étudiante · Vienne</span>
          </div>
          <span className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold text-stone-200 opacity-0 transition-opacity group-hover:opacity-100">
            <Maximize2 size={11} strokeWidth={1.75} /> Agrandir
          </span>
        </div>

        <div className="relative z-10 mt-5 flex items-end justify-between">
          <div className="flex flex-1 flex-col gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cobalt-500 to-cobalt-300 text-lg font-bold text-white ring-2 ring-white/15">
              {initiales}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight text-white">
                {user.prenom} {user.nom.toUpperCase()}
              </span>
              <span className="tnum mt-1 font-mono text-[11px] tracking-[1.5px] text-cobalt-300">{user.numeroCarte}</span>
            </div>
            <span className="flex w-fit items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Carte active
            </span>
          </div>

          <div className="ml-4 flex flex-shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-lg">
            <QRCodeSVG value={buildQr(user, Math.floor(Date.now() / 60000))} size={88} level="M" />
          </div>
        </div>
      </motion.button>

      {/* Pop-up QR plein écran + timer de rafraîchissement */}
      <Modal open={open} onClose={() => setOpen(false)} title="Ma carte étudiante">
        <div className="flex flex-col items-center gap-5">
          <motion.div
            key={minuteTs}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-white p-5 shadow-cobalt-sm"
          >
            <QRCodeSVG value={qrValue} size={250} level="M" />
          </motion.div>

          <p className="text-center font-bold text-ink-900 dark:text-white">
            {user.prenom} {user.nom.toUpperCase()}
          </p>
          <p className="tnum -mt-3 font-mono text-xs tracking-[1.5px] text-cobalt-600 dark:text-cobalt-400">{user.numeroCarte}</p>

          <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-white/10 dark:bg-ink-800/50">
            <div className="relative h-14 w-14">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r={R} fill="none" strokeWidth="5" className="stroke-stone-200 dark:stroke-ink-700" />
                <motion.circle
                  cx="32" cy="32" r={R} fill="none" strokeWidth="5" strokeLinecap="round"
                  className="stroke-cobalt-500"
                  strokeDasharray={C}
                  animate={{ strokeDashoffset: C * (1 - progress) }}
                  transition={{ duration: 0.5, ease: 'linear' }}
                />
              </svg>
              <span className="tnum absolute inset-0 flex items-center justify-center text-sm font-bold text-ink-900 dark:text-white">
                {secondsLeft}
              </span>
            </div>
            <div className="text-left">
              <p className="flex items-center gap-1.5 text-sm font-bold text-ink-900 dark:text-white">
                <RefreshCw size={14} strokeWidth={1.75} className="text-cobalt-600 dark:text-cobalt-400" /> Rafraîchissement
              </p>
              <p className="text-xs text-stone-500">
                Nouveau QR dans <span className="tnum font-semibold text-stone-700 dark:text-stone-300">{secondsLeft}s</span>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-stone-400">Présentez ce QR code chez nos partenaires</p>
        </div>
      </Modal>
    </>
  )
}
