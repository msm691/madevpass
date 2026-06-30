import { useEffect, useRef } from 'react'
import { animate, useInView, useMotionValue } from 'framer-motion'

interface Props {
  to: number
  suffix?: string
  duration?: number
}

export default function AnimatedCounter({ to, suffix = '', duration = 1.8 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const count = useMotionValue(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('fr-FR') + suffix
      },
    })
    return () => controls.stop()
  }, [inView, to, suffix, duration, count])

  return <span ref={ref}>0{suffix}</span>
}
