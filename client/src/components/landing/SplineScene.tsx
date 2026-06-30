import { Component, Suspense, lazy, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import { QrCode } from 'lucide-react'

const Spline = lazy(() => import('@splinetool/react-spline'))

// Scène 3D communautaire (smartphone flottant). Remplaçable par une scène MADEV custom.
const SCENE_URL = 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode'

class SplineBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

// Fallback premium : mockup smartphone 3D animé en pur CSS/Framer
function PhoneMockup() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Tilt
        tiltMaxAngleX={14}
        tiltMaxAngleY={14}
        glareEnable
        glareMaxOpacity={0.18}
        glareColor="#a78bfa"
        glarePosition="all"
        glareBorderRadius="2.2rem"
        transitionSpeed={1800}
        className="[transform-style:preserve-3d]"
      >
        <motion.div
          initial={{ y: 12 }}
          animate={{ y: [12, -12, 12] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative h-[400px] w-[200px] rounded-[2.2rem] border border-slate-700 bg-gradient-to-br from-slate-900 to-violet-950 p-3 shadow-[0_0_80px_-10px_rgba(124,58,237,0.7)] sm:h-[440px] sm:w-[220px]"
        >
          <div className="absolute left-1/2 top-3 h-1.5 w-16 -translate-x-1/2 rounded-full bg-slate-700" />
          <div className="flex h-full flex-col items-center justify-center gap-4 rounded-[1.6rem] bg-slate-950/60">
            <div className="rounded-2xl bg-white p-3 shadow-glow">
              <QrCode size={88} className="text-slate-900" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[2px] text-primary-400">MADEV Pass</p>
          </div>
        </motion.div>
      </Tilt>
    </div>
  )
}

export default function SplineScene() {
  return (
    <SplineBoundary fallback={<PhoneMockup />}>
      <Suspense fallback={<PhoneMockup />}>
        <Spline scene={SCENE_URL} className="!h-full !w-full" />
      </Suspense>
    </SplineBoundary>
  )
}
