import { useEffect, useRef } from 'react'

interface Point { x: number; y: number; z: number }

// Animation 3D de fond : nuage de points sphérique en rotation (vraie projection 3D),
// non-interactif, piloté par requestAnimationFrame. Pause si onglet caché / reduced-motion.
export default function Background3D({ dark }: { dark: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const canvas: HTMLCanvasElement = ref.current
    const context = canvas.getContext('2d')
    if (!context) return
    const ctx: CanvasRenderingContext2D = context

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0

    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Génération sphère de points (distribution de Fibonacci)
    const N = window.innerWidth < 640 ? 90 : 170
    const R = Math.min(w, h) * 0.42
    const pts: Point[] = []
    for (let i = 0; i < N; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / N)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      pts.push({
        x: R * Math.sin(phi) * Math.cos(theta),
        y: R * Math.sin(phi) * Math.sin(theta),
        z: R * Math.cos(phi),
      })
    }

    let a = 0
    let raf = 0
    const accent = dark ? '167,139,250' : '124,58,237'

    function frame() {
      a += 0.0024
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2, cy = h / 2
      const cosA = Math.cos(a), sinA = Math.sin(a)
      const tilt = 0.42

      for (const p of pts) {
        // rotation Y puis légère inclinaison X
        const x1 = p.x * cosA - p.z * sinA
        const z1 = p.x * sinA + p.z * cosA
        const y1 = p.y * Math.cos(tilt) - z1 * Math.sin(tilt)
        const z2 = p.y * Math.sin(tilt) + z1 * Math.cos(tilt)

        const perspective = 600 / (600 + z2)
        const sx = cx + x1 * perspective
        const sy = cy + y1 * perspective
        const depth = (z2 + R) / (2 * R) // 0..1
        const alpha = (0.12 + depth * 0.55) * (dark ? 0.9 : 0.55)
        const size = (0.7 + depth * 2.2) * perspective

        ctx.beginPath()
        ctx.arc(sx, sy, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${accent},${alpha.toFixed(3)})`
        ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }

    if (reduce) { frame(); cancelAnimationFrame(raf) } // une frame statique
    else frame()

    function onVis() {
      if (document.hidden) cancelAnimationFrame(raf)
      else if (!reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame) }
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [dark])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <canvas ref={ref} className="h-full w-full" />
      {/* Voiles pour garantir la lisibilité du texte */}
      <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white dark:from-slate-950 dark:via-transparent dark:to-slate-950" />
    </div>
  )
}
