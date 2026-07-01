import { motion } from 'framer-motion'

interface Point { icon: React.ElementType; text: string }

// Panneau latéral marque pour les écrans d'authentification (split-screen).
// Masqué sous lg : sur mobile, seul le formulaire est visible.
export default function AuthAside({ title, subtitle, points }: { title: string; subtitle: string; points: Point[] }) {
  return (
    <aside className="relative hidden overflow-hidden bg-ink-950 p-12 lg:flex lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute inset-0 bg-grid-line bg-grid opacity-[0.12]" />
      <div className="aurora-blob -top-32 -left-24 h-96 w-96 bg-cobalt-500/30" />
      <div className="aurora-blob bottom-0 right-0 h-80 w-80 bg-cobalt-600/20 [animation-delay:-8s]" />
      <div className="aurora-blob left-[30%] top-[40%] h-72 w-72 bg-[#7C5CFF]/15 [animation-delay:-13s]" />

      <span className="relative flex items-center gap-2 font-display text-xl font-bold tracking-tight text-white">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-cobalt-500 text-sm font-black text-white shadow-cobalt-sm">M</span>
        MADEV Pass
      </span>

      <div className="relative max-w-md">
        <motion.h2
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-display-md leading-tight text-white"
        >
          {title}
        </motion.h2>
        <p className="mt-4 text-stone-300">{subtitle}</p>

        <ul className="mt-8 flex flex-col gap-4">
          {points.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.li
                key={p.text}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 text-sm text-stone-200"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/8 text-cobalt-300">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                {p.text}
              </motion.li>
            )
          })}
        </ul>
      </div>

      <p className="relative text-xs text-stone-500">© {new Date().getFullYear()} MADEV Pass · Vienne</p>
    </aside>
  )
}
