import { useEffect, useRef } from 'react'

// Bordure dégradée conique qui tourne en continu (requestAnimationFrame).
// Le contenu repose sur une surface "glass" : flou + translucidité.
export default function GradientBorderCard({
  children,
  className = '',
  speed = 0.25,
}: {
  children: React.ReactNode
  className?: string
  speed?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--angle', '120deg')
      return
    }
    let angle = Math.random() * 360
    let raf = 0
    const loop = () => {
      angle = (angle + speed) % 360
      el.style.setProperty('--angle', angle + 'deg')
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [speed])

  return (
    <div
      ref={ref}
      className={`relative rounded-3xl p-px ${className}`}
      style={{
        background:
          'conic-gradient(from var(--angle,0deg), transparent 55%, rgba(124,58,237,0.9), rgba(167,139,250,0.9), transparent 75%)',
      }}
    >
      <div className="h-full rounded-[calc(1.5rem-1px)] border border-white/40 bg-white/70 backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/70">
        {children}
      </div>
    </div>
  )
}
