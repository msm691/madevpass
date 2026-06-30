import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import Marquee from 'react-fast-marquee'
import {
  ScanLine, MapPin, Tag, ShieldCheck, ArrowRight, Sparkles, Check,
  GraduationCap, Store, BarChart3, Menu, X, Star,
  Coffee, UtensilsCrossed, Dumbbell, BookOpen, Scissors, ShoppingBag, Film, Bus,
} from 'lucide-react'
import HeroVisual from '../components/landing/HeroVisual'
import Background3D from '../components/landing/Background3D'
import GradientBorderCard from '../components/landing/GradientBorderCard'
import AnimatedCounter from '../components/landing/AnimatedCounter'
import ThemeToggle from '../components/ui/ThemeToggle'
import { useTheme } from '../theme/ThemeProvider'
import { cn } from '../lib/utils'

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } }

export default function Landing() {
  const { theme } = useTheme()
  const { scrollYProgress } = useScroll()

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-200">
      <Background3D dark={theme === 'dark'} />
      {/* Barre de progression scroll-driven */}
      <motion.div style={{ scaleX: scrollYProgress }} className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-primary-400 via-violet-400 to-fuchsia-400" />

      <Navbar />
      <Hero />
      <PartnerMarquee />
      <Stats />
      <Features />
      <ParallaxShowcase />
      <CtaBand />
      <Footer />
    </div>
  )
}

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 sm:px-5">
        <span className="bg-gradient-to-r from-primary-500 to-violet-400 bg-clip-text text-lg font-extrabold tracking-tight text-transparent sm:text-xl">
          MADEV Pass
        </span>

        <div className="hidden items-center gap-2.5 md:flex">
          <ThemeToggle />
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary dark:text-slate-300 dark:hover:text-primary-400">
            Connexion
          </Link>
          <Link to="/register" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-glow transition-colors hover:bg-violet-500">
            S'inscrire
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button onClick={() => setOpen(o => !o)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-200" aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-2 flex max-w-6xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 md:hidden">
          <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-500/10 dark:text-slate-200">Connexion</Link>
          <Link to="/register" onClick={() => setOpen(false)} className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white">S'inscrire gratuitement</Link>
        </motion.div>
      )}
    </header>
  )
}

/* ─── Hero ───────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-28 sm:px-6 md:grid-cols-2 md:pb-24 md:pt-40">
      <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.12 }} className="relative z-10 text-center md:text-left">
        <motion.span variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary dark:text-primary-400">
          <Sparkles size={13} /> Carte étudiante numérique · Vienne
        </motion.span>

        <motion.h1 variants={fadeUp} className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
          La carte étudiante{' '}
          <span className="bg-gradient-to-r from-primary-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent dark:from-primary-400 dark:via-violet-400 dark:to-fuchsia-400">réinventée</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-md text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg md:mx-0">
          Un QR code, des centaines de partenaires locaux. Scan instantané, offres exclusives
          et sécurité RGPD pour les étudiants et commerçants de Vienne.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
          <Link to="/register" className="group flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-white shadow-glow transition-all hover:scale-[0.98] hover:bg-violet-500">
            <GraduationCap size={18} /> S'inscrire Étudiant
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/login" className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-6 py-4 text-base font-bold text-slate-700 transition-all hover:scale-[0.98] hover:border-primary/60 hover:text-primary dark:border-slate-700 dark:text-slate-200 dark:hover:text-primary-400">
            <Store size={18} /> Espace Commerçant
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-7 flex items-center justify-center gap-4 md:justify-start">
          <div className="flex -space-x-2">
            {['from-sky-400 to-primary', 'from-amber-400 to-primary', 'from-emerald-400 to-primary', 'from-fuchsia-400 to-primary'].map((g, i) => (
              <div key={i} className={`h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br dark:border-slate-950 ${g}`} />
            ))}
          </div>
          <div className="text-left">
            <div className="flex gap-0.5 text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Adopté par les étudiants de Vienne</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="relative z-10 h-[360px] sm:h-[440px] md:h-[500px]">
        <HeroVisual />
      </motion.div>
    </section>
  )
}

/* ─── Partner Marquee ────────────────────────────────────── */
const PARTNERS = [
  { icon: Coffee, label: 'Cafés' }, { icon: UtensilsCrossed, label: 'Restaurants' },
  { icon: Dumbbell, label: 'Sport' }, { icon: BookOpen, label: 'Librairies' },
  { icon: Scissors, label: 'Coiffure' }, { icon: ShoppingBag, label: 'Boutiques' },
  { icon: Film, label: 'Cinémas' }, { icon: Bus, label: 'Transports' },
]

function PartnerMarquee() {
  const { theme } = useTheme()
  return (
    <section className="relative border-y border-slate-200 bg-white/40 py-8 backdrop-blur-sm dark:border-slate-900 dark:bg-slate-950/40">
      <p className="mb-6 text-center text-xs font-bold uppercase tracking-[3px] text-slate-400 dark:text-slate-500">Plus de 8 catégories de partenaires</p>
      <Marquee gradient gradientColor={theme === 'dark' ? '#020617' : '#ffffff'} gradientWidth={80} speed={40} pauseOnHover>
        {PARTNERS.map((p) => {
          const Icon = p.icon
          return (
            <div key={p.label} className="mx-4 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white/70 px-5 py-3 text-slate-700 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <Icon size={18} className="text-primary dark:text-primary-400" />
              <span className="text-sm font-semibold">{p.label}</span>
            </div>
          )
        })}
      </Marquee>
    </section>
  )
}

/* ─── Stats (données réelles Vienne) ─────────────────────── */
const STATS = [
  { to: 470, suffix: '+', label: 'Commerçants partenaires' },
  { to: 1920, suffix: '', label: 'Étudiants inscrits' },
  { to: 100, suffix: '%', label: 'Conforme RGPD' },
  { to: 2, suffix: ' clics', label: 'Pour s\'inscrire' },
]

function Stats() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 text-center backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/50 sm:p-6">
              <p className="bg-gradient-to-r from-primary-500 to-violet-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:from-primary-400 dark:to-violet-300 sm:text-4xl">
                <AnimatedCounter to={s.to} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ─── Features (éditorial : numéros fantômes + bordure animée) ─ */
const FEATURES = [
  { icon: ScanLine, title: 'Scan instantané', desc: 'Validation des passages en moins d\'une seconde via un QR code sécurisé à rotation. Aucune carte physique, aucune attente.' },
  { icon: MapPin, title: 'Annuaire local', desc: 'Tous les partenaires de Vienne, filtrés par catégorie et proximité géographique, mis à jour en continu.' },
  { icon: Tag, title: 'Gestion d\'offres', desc: 'Les commerçants créent, modifient et pilotent leurs remises en temps réel depuis un tableau de bord dédié.' },
  { icon: ShieldCheck, title: 'Sécurité RGPD', desc: 'Données chiffrées, consentement explicite, droit à l\'oubli et suppression de compte 100% conforme.' },
]

function Features() {
  return (
    <section className="relative mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-24">
      <Reveal>
        <p className="text-center text-xs font-bold uppercase tracking-[3px] text-primary dark:text-primary-400">Bénéfices</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Pensé pour connecter étudiants & commerçants
        </h2>
      </Reveal>

      <div className="mt-14 flex flex-col gap-7 sm:gap-9">
        {FEATURES.map((f, i) => {
          const Icon = f.icon
          return (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className={cn('flex flex-col items-center gap-5 sm:gap-8 md:flex-row', i % 2 === 1 && 'md:flex-row-reverse')}>
                <span
                  className="select-none text-6xl font-black leading-none text-transparent sm:text-8xl"
                  style={{ WebkitTextStroke: '1.5px rgba(124,58,237,0.45)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <GradientBorderCard className="w-full md:flex-1" speed={0.18 + i * 0.04}>
                  <div className="flex items-start gap-5 p-7 sm:p-8">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary dark:text-primary-400">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">{f.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.desc}</p>
                    </div>
                  </div>
                </GradientBorderCard>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

/* ─── Parallax Showcase ──────────────────────────────────── */
const PANELS = [
  { icon: GraduationCap, label: 'Espace Étudiant', tint: 'from-sky-500/20 to-primary/20' },
  { icon: Store, label: 'Espace Commerçant', tint: 'from-amber-500/20 to-primary/20' },
  { icon: BarChart3, label: 'Espace Admin', tint: 'from-emerald-500/20 to-primary/20' },
]

function ParallaxShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const yUp = useTransform(scrollYProgress, [0, 1], [80, -80])
  const yDown = useTransform(scrollYProgress, [0, 1], [-60, 80])

  return (
    <section ref={ref} className="relative mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
      <Reveal>
        <p className="text-center text-xs font-bold uppercase tracking-[3px] text-primary dark:text-primary-400">Showcase</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Trois interfaces, une expérience premium
        </h2>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3" style={{ perspective: 1200 }}>
        {PANELS.map((p, i) => {
          const Icon = p.icon
          return (
            <motion.div key={p.label} style={{ y: i === 1 ? yDown : yUp }} className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br p-1 dark:border-slate-800 ${p.tint}`}>
              <div className="rounded-[0.9rem] bg-white/80 p-6 backdrop-blur-xl dark:bg-slate-900/80">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary dark:text-primary-400"><Icon size={20} /></div>
                  <span className="font-bold text-slate-900 dark:text-white">{p.label}</span>
                </div>
                <div className="space-y-3">
                  <div className="h-24 rounded-xl bg-gradient-to-br from-slate-100 to-violet-200/60 shadow-glow-sm dark:from-slate-800 dark:to-violet-950/60" />
                  <div className="h-3 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div className="flex gap-2 pt-1">
                    <div className="h-8 flex-1 rounded-lg bg-primary/30" />
                    <div className="h-8 w-12 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

/* ─── CTA Band (unique zone de conversion) ───────────────── */
function CtaBand() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
      <Reveal>
        <div className="glow-ring relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-white via-violet-100/60 to-white px-6 py-12 text-center dark:from-slate-900 dark:via-violet-950/60 dark:to-slate-900 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-[100px]" />
          <h2 className="relative text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Prêt à rejoindre MADEV Pass ?</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-slate-600 dark:text-slate-300">
            Inscription gratuite en 2 clics. Activez votre carte et profitez immédiatement des offres.
          </p>
          <div className="relative mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-4 font-bold text-white shadow-glow transition-all hover:scale-[0.98] hover:bg-violet-500 sm:w-auto">
              Créer mon compte <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="flex w-full items-center justify-center rounded-2xl border border-slate-300 px-7 py-4 font-bold text-slate-700 transition-all hover:scale-[0.98] hover:border-primary/60 dark:border-slate-600 dark:text-slate-200 sm:w-auto">
              J'ai déjà un compte
            </Link>
          </div>
          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            {['Sans engagement', 'Données chiffrées', 'Conforme RGPD'].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><Check size={13} className="text-emerald-500 dark:text-emerald-400" /> {t}</span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ─── Footer (sans CTA dupliqué) ─────────────────────────── */
function Footer() {
  return (
    <footer className="relative border-t border-slate-200 px-5 py-12 dark:border-slate-800 sm:px-6">
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
        <span className="bg-gradient-to-r from-primary-500 to-violet-400 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">MADEV Pass</span>
        <p className="max-w-sm text-sm text-slate-500">La carte étudiante numérique de Vienne et son réseau de commerçants partenaires.</p>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-600">© {new Date().getFullYear()} MADEV Pass · Tous droits réservés</p>
      </div>
    </footer>
  )
}

/* ─── Helper : scroll reveal ─────────────────────────────── */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5, delay, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  )
}
