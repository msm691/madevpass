import { motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import { QrCode, Tag, ScanLine, MapPin } from 'lucide-react'

// Visuel hero : carte MADEV en verre (tilt au survol) affichant le QR,
// entourée de pastilles flottantes. Pur React/Framer/Tilt — aucun WebGL distant.
export default function HeroVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center" style={{ perspective: 1200 }}>
      <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-cobalt-500/25 blur-[90px]" />

      <Tilt
        tiltMaxAngleX={10}
        tiltMaxAngleY={10}
        glareEnable
        glareMaxOpacity={0.18}
        glareColor="#6680F4"
        glarePosition="all"
        glareBorderRadius="1.8rem"
        transitionSpeed={1600}
        className="[transform-style:preserve-3d]"
      >
        <motion.div
          initial={{ y: 14 }}
          animate={{ y: [14, -14, 14] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative h-[420px] w-[210px] rounded-3xl border border-white/15 bg-gradient-to-br from-ink-900 to-cobalt-950 p-3 shadow-cobalt sm:h-[460px] sm:w-[230px]"
        >
          <div className="absolute left-1/2 top-3 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-white/20" />
          <div className="flex h-full flex-col gap-4 rounded-[1.3rem] bg-ink-950/70 p-5">
            <div className="mt-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[2px] text-cobalt-300">MADEV Pass</p>
              <p className="mt-1 font-display text-lg font-bold text-white">Marie Dupont</p>
              <p className="tnum font-mono text-[10px] tracking-[1.5px] text-cobalt-300">MADEV-7F2A9C</p>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <div className="rounded-2xl bg-white p-3 shadow-cobalt-sm">
                <QrCode size={120} strokeWidth={1.75} className="text-ink-950" />
              </div>
            </div>
            <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Carte active
            </span>
          </div>
        </motion.div>
      </Tilt>

      {/* Pastilles flottantes */}
      <FloatChip className="-left-2 top-10 sm:left-2" delay={0} icon={Tag} title="-20 %" sub="Café du Coin" />
      <FloatChip className="-right-2 top-28 sm:right-0" delay={1.2} icon={ScanLine} title="Scan validé" sub="il y a 2 s" />
      <FloatChip className="bottom-12 left-0 sm:-left-4" delay={0.6} icon={MapPin} title="320 m" sub="Librairie Centrale" />
    </div>
  )
}

function FloatChip({ className, delay, icon: Icon, title, sub }: {
  className: string; delay: number; icon: React.ElementType; title: string; sub: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: [10, -8, 10] }}
      transition={{ opacity: { duration: 0.6, delay }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay } }}
      className={`glass absolute z-10 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 ${className}`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cobalt-500/12 text-cobalt-600 dark:text-cobalt-300">
        <Icon size={16} strokeWidth={1.75} />
      </div>
      <div className="leading-tight">
        <p className="tnum text-sm font-bold text-ink-900 dark:text-white">{title}</p>
        <p className="text-[11px] text-stone-500">{sub}</p>
      </div>
    </motion.div>
  )
}
