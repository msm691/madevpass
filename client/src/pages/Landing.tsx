import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import Marquee from 'react-fast-marquee'
import {
  ScanLine, MapPin, Tag, ShieldCheck, ArrowRight, Check,
  GraduationCap, Store, BarChart3, Menu, X,
  Coffee, UtensilsCrossed, Dumbbell, BookOpen, Scissors, ShoppingBag, Film, Bus,
} from 'lucide-react'
import HeroVisual from '../components/landing/HeroVisual'
import AnimatedCounter from '../components/landing/AnimatedCounter'
import ThemeToggle from '../components/ui/ThemeToggle'
import { cn } from '../lib/utils'

const ICON = { size: 20, strokeWidth: 1.75 } as const
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const spring = { type: 'spring', stiffness: 380, damping: 32 } as const

export default function Landing() {
  const { scrollYProgress } = useScroll()

  return (
    <div className="grain relative min-h-screen overflow-x-hidden text-ink-900 antialiased dark:text-stone-200">
      <Ambient />
      <motion.div style={{ scaleX: scrollYProgress }} className="fixed inset-x-0 top-0 z-overlay h-0.5 origin-left bg-cobalt-500" />

      <Navbar />
      <Hero />
      <PartnerMarquee />
      <Stats />
      <Features />
      <Spaces />
      <CtaBand />
      <Footer />
    </div>
  )
}

/* Ambient cobalt intentionnel (remplace le fond 3D générique) */
function Ambient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cream dark:bg-ink-950">
      {/* Grille technique estompée en tête de page */}
      <div className="grid-bg absolute inset-x-0 top-0 h-[70vh] opacity-40 dark:opacity-30" />
      {/* Halos aurora en dérive lente */}
      <div className="aurora-blob -top-48 left-1/2 h-[620px] w-[920px] -translate-x-1/2 bg-cobalt-500/[0.11] dark:bg-cobalt-600/25" />
      <div className="aurora-blob bottom-[-10%] right-[-5%] h-[420px] w-[520px] bg-cobalt-400/[0.07] [animation-delay:-6s] dark:bg-cobalt-500/12" />
      <div className="aurora-blob left-[-8%] top-[40%] h-[380px] w-[420px] bg-[#7C5CFF]/[0.06] [animation-delay:-11s] dark:bg-[#7C5CFF]/12" />
    </div>
  )
}

/* ─── Navbar (single-line desktop, ≤72px) ─────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false)
  const links = [
    { href: '#fonctionnement', label: 'Fonctionnement' },
    { href: '#espaces', label: 'Les espaces' },
    { href: '#partenaires', label: 'Partenaires' },
  ]
  return (
    <header className="fixed inset-x-0 top-0 z-nav px-4 pt-3 sm:px-6 sm:pt-4">
      <nav className="glass mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl px-4 sm:px-5">
        <a href="#top" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink-900 dark:text-white">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-cobalt-500 text-white shadow-cobalt-sm"><span className="text-sm font-black">M</span></span>
          MADEV&nbsp;Pass
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:text-cobalt-600 dark:text-stone-300 dark:hover:text-cobalt-300">{l.label}</a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link to="/login" className="rounded-xl px-3.5 py-2 text-sm font-semibold text-stone-700 transition-colors hover:text-cobalt-600 dark:text-stone-200 dark:hover:text-cobalt-300">Se connecter</Link>
          <Btn to="/register">Créer mon compte</Btn>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button onClick={() => setOpen(o => !o)} className="grid h-9 w-9 place-items-center rounded-xl border border-stone-300 text-stone-700 dark:border-white/10 dark:text-stone-200" aria-label="Ouvrir le menu" aria-expanded={open}>
            {open ? <X {...ICON} /> : <Menu {...ICON} />}
          </button>
        </div>
      </nav>

      {open && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-2xl p-3 md:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-stone-700 hover:bg-cobalt-500/10 dark:text-stone-200">{l.label}</a>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-cobalt-500/10 dark:text-stone-200">Se connecter</Link>
          <Link to="/register" onClick={() => setOpen(false)} className="mt-1 rounded-xl bg-cobalt-500 px-4 py-3 text-center text-sm font-bold text-white">Créer mon compte</Link>
        </motion.div>
      )}
    </header>
  )
}

/* ─── Hero (split, max 4 éléments texte, pas de gradient-clip) ─ */
function Hero() {
  return (
    <section id="top" className="relative mx-auto grid min-h-[100dvh] max-w-6xl items-center gap-10 px-5 pb-16 pt-28 sm:px-6 md:grid-cols-2 md:pb-20 md:pt-24">
      <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.1 }} className="relative z-10 text-center md:text-left">
        <motion.span variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-cobalt-500/25 bg-cobalt-500/10 px-3.5 py-1.5 text-xs font-semibold text-cobalt-700 dark:text-cobalt-300">
          <span className="h-1.5 w-1.5 rounded-full bg-cobalt-500" /> Carte étudiante numérique · Vienne
        </motion.span>

        <motion.h1 variants={fadeUp} className="mt-5 text-display-xl text-ink-900 dark:text-white">
          La carte étudiante,<br /><span className="text-gradient">enfin numérique.</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-stone-600 dark:text-stone-400 sm:text-lg md:mx-0">
          Un QR code, des centaines de partenaires locaux. Scan instantané, offres réservées aux étudiants, sécurité RGPD.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
          <Btn to="/register" size="lg" icon><GraduationCap {...ICON} /> Créer mon compte</Btn>
          <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 px-6 py-3.5 text-base font-semibold text-stone-700 transition-all hover:border-cobalt-500/50 hover:text-cobalt-600 active:scale-[0.98] dark:border-white/10 dark:text-stone-200 dark:hover:text-cobalt-300">
            <Store {...ICON} /> Je suis commerçant
          </Link>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 h-[360px] sm:h-[440px] md:h-[500px]">
        <HeroVisual />
      </motion.div>
    </section>
  )
}

/* ─── Partner Marquee (logo wall, sans eyebrow) ───────────── */
const PARTNERS = [
  { icon: Coffee, label: 'Cafés' }, { icon: UtensilsCrossed, label: 'Restaurants' },
  { icon: Dumbbell, label: 'Sport' }, { icon: BookOpen, label: 'Librairies' },
  { icon: Scissors, label: 'Coiffure' }, { icon: ShoppingBag, label: 'Boutiques' },
  { icon: Film, label: 'Cinémas' }, { icon: Bus, label: 'Transports' },
]

function PartnerMarquee() {
  return (
    <section id="partenaires" className="relative border-y border-stone-200/70 py-7 dark:border-white/5">
      <Marquee gradient gradientColor="transparent" speed={38} pauseOnHover>
        {PARTNERS.map((p) => {
          const Icon = p.icon
          return (
            <div key={p.label} className="mx-3 flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white/60 px-5 py-2.5 text-stone-700 backdrop-blur-sm dark:border-white/10 dark:bg-ink-900/50 dark:text-stone-300">
              <Icon size={18} strokeWidth={1.75} className="text-cobalt-600 dark:text-cobalt-400" />
              <span className="text-sm font-medium">{p.label}</span>
            </div>
          )
        })}
      </Marquee>
    </section>
  )
}

/* ─── Stats (chiffres mono tabulaires, dividers au lieu de cartes) ─ */
const STATS = [
  { to: 470, suffix: '+', label: 'Commerçants partenaires' },
  { to: 1920, suffix: '', label: 'Étudiants inscrits' },
  { to: 100, suffix: '%', label: 'Conforme RGPD' },
  { to: 2, suffix: ' clics', label: 'Pour s’inscrire' },
]

function Stats() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
      <div className="grid grid-cols-2 divide-stone-200/70 dark:divide-white/10 md:grid-cols-4 md:divide-x">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06} className="px-2 py-4 text-center md:px-6">
            <p className="tnum font-display text-4xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-5xl">
              <AnimatedCounter to={s.to} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ─── Features (bento asymétrique, eyebrow #2 autorisé) ──── */
const FEATURES = [
  { icon: ScanLine, title: 'Scan en moins d’une seconde', desc: 'Un QR code qui tourne toutes les 5 minutes, validé d’un geste par le commerçant. Aucune carte physique, aucune attente en caisse.', span: 'md:col-span-4', tint: true },
  { icon: MapPin, title: 'Annuaire local', desc: 'Tous les partenaires de Vienne, filtrés par catégorie et par distance.', span: 'md:col-span-2' },
  { icon: Tag, title: 'Offres pilotées en temps réel', desc: 'Les commerçants créent et ajustent leurs remises depuis leur tableau de bord.', span: 'md:col-span-3' },
  { icon: ShieldCheck, title: 'Conforme RGPD', desc: 'Données chiffrées, consentement explicite, droit à l’oubli et suppression de compte.', span: 'md:col-span-3' },
]

function Features() {
  return (
    <section id="fonctionnement" className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt-600 dark:text-cobalt-400">Comment ça marche</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
          Pensé pour connecter étudiants et commerçants
        </h2>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6">
        {FEATURES.map((f, i) => {
          const Icon = f.icon
          return (
            <Reveal key={f.title} delay={i * 0.06} className={f.span}>
              <article className={cn(
                'sheen lift group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border p-6 sm:p-7',
                f.tint
                  ? 'border-cobalt-500/20 bg-cobalt-500/[0.06] dark:border-cobalt-400/15 dark:bg-cobalt-500/10'
                  : 'border-stone-200 bg-white/70 dark:border-white/10 dark:bg-ink-900/55',
              )}>
                {f.tint && <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cobalt-500/15 blur-2xl" />}
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-cobalt-500/12 text-cobalt-600 transition-transform duration-300 group-hover:scale-110 dark:text-cobalt-300">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{f.desc}</p>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

/* ─── Spaces (liste verticale divisée — autre famille de layout) ─ */
const SPACES = [
  { icon: GraduationCap, name: 'Étudiant', points: ['Carte numérique + QR sécurisé', 'Annuaire & favoris', 'Offres réservées'] },
  { icon: Store, name: 'Commerçant', points: ['Scan des passages', 'Gestion des offres', 'Statistiques de fréquentation'] },
  { icon: BarChart3, name: 'Administrateur', points: ['Validation des inscriptions', 'Gestion du réseau', 'Rapports conformes RGPD'] },
]

function Spaces() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <section id="espaces" ref={ref} className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
      <div className="grid gap-10 md:grid-cols-[0.9fr_1.4fr] md:gap-16">
        <Reveal className="md:sticky md:top-28 md:self-start">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
            Trois espaces, une même carte
          </h2>
          <p className="mt-4 max-w-sm text-stone-600 dark:text-stone-400">
            Chaque rôle dispose de son interface dédiée, connectée au même réseau local.
          </p>
        </Reveal>

        <motion.div style={{ y }} className="divide-y divide-stone-200/80 dark:divide-white/10">
          {SPACES.map((s, i) => {
            const Icon = s.icon
            return (
              <Reveal key={s.name} delay={i * 0.06} className="py-6 first:pt-0">
                <div className="flex items-start gap-5">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-cobalt-500/12 text-cobalt-600 dark:text-cobalt-300">
                    <Icon size={24} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-semibold text-ink-900 dark:text-white">{s.name}</h3>
                    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                      {s.points.map((p) => (
                        <li key={p} className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400">
                          <Check size={15} strokeWidth={2.25} className="text-cobalt-600 dark:text-cobalt-400" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── CTA Band (zone de conversion unique) ────────────────── */
function CtaBand() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
      <Reveal>
        <div className="glow-ring border-gradient relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-grid-line bg-grid opacity-[0.15]" />
          <div className="aurora-blob -top-24 left-1/2 h-72 w-72 -translate-x-1/2 bg-cobalt-500/40" />
          <div className="aurora-blob bottom-[-30%] right-[10%] h-60 w-60 bg-[#7C5CFF]/30 [animation-delay:-8s]" />
          <h2 className="relative text-display-md text-white">Activez votre carte en 2 clics</h2>
          <p className="relative mx-auto mt-4 max-w-md text-stone-300">
            Inscription gratuite. Validez votre statut étudiant et profitez des offres immédiatement.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Btn to="/register" size="lg" icon>Créer mon compte <ArrowRight {...ICON} /></Btn>
            <Link to="/login" className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 font-semibold text-white transition-all hover:border-white/40 active:scale-[0.98] sm:w-auto">
              Se connecter
            </Link>
          </div>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-400">
            {['Sans engagement', 'Données chiffrées', 'Conforme RGPD'].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><Check size={14} strokeWidth={2.25} className="text-cobalt-400" /> {t}</span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ─── Footer (nav + légal) ────────────────────────────────── */
function Footer() {
  return (
    <footer className="relative border-t border-stone-200/70 px-5 py-12 dark:border-white/10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <span className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-ink-900 dark:text-white">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-cobalt-500 text-sm font-black text-white">M</span> MADEV Pass
          </span>
          <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">La carte étudiante numérique de Vienne et son réseau de commerçants partenaires.</p>
        </div>
        <nav className="flex flex-wrap gap-x-10 gap-y-6 text-sm">
          <FooterCol title="Produit" links={[['Fonctionnement', '#fonctionnement'], ['Les espaces', '#espaces'], ['Partenaires', '#partenaires']]} />
          <FooterCol title="Compte" links={[['Créer un compte', '/register'], ['Se connecter', '/login']]} />
          <FooterCol title="Légal" links={[['Confidentialité', '/confidentialite'], ['Conditions', '/conditions'], ['RGPD', '/rgpd']]} />
        </nav>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-stone-200/70 pt-6 text-xs text-stone-400 dark:border-white/10 dark:text-stone-500">
        © {new Date().getFullYear()} MADEV Pass · Vienne
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-3 font-semibold text-ink-900 dark:text-white">{title}</p>
      <ul className="flex flex-col gap-2">
        {links.map(([label, href]) => (
          <li key={label}>
            {href.startsWith('#')
              ? <a href={href} className="text-stone-500 transition-colors hover:text-cobalt-600 dark:text-stone-400 dark:hover:text-cobalt-300">{label}</a>
              : <Link to={href} className="text-stone-500 transition-colors hover:text-cobalt-600 dark:text-stone-400 dark:hover:text-cobalt-300">{label}</Link>}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─── Primitives ──────────────────────────────────────────── */
function Btn({ to, children, size = 'md', icon = false }: { to: string; children: React.ReactNode; size?: 'md' | 'lg'; icon?: boolean }) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={spring} className={cn(size === 'lg' && 'w-full sm:w-auto')}>
      <Link
        to={to}
        className={cn(
          'sheen inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cobalt-500 font-bold text-white shadow-cobalt transition-shadow duration-300 hover:bg-cobalt-600 hover:shadow-e4',
          size === 'lg' ? 'px-6 py-3.5 text-base' : 'px-4 py-2 text-sm',
          icon && 'group',
        )}
      >
        {children}
      </Link>
    </motion.div>
  )
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  )
}
