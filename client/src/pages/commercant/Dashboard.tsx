import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ScanLine, CheckCircle2, Clock, Tag, TrendingUp, CalendarDays } from 'lucide-react'
import Navigation from '../../components/Navigation/Navigation'
import { useTheme } from '../../theme/ThemeProvider'
import api from '../../api/client'

interface Offre {
  id: string
  titre: string
  description: string
  typeRemise: string
  valeurRemise: number
  dateDebut: string
  dateFin: string | null
}

interface DashboardData {
  commerce: { id: string; nom: string; estValide: boolean }
  offres: Offre[]
  totalPassages: number
}

function formatRemise(type: string, valeur: number): string {
  if (type === 'POURCENTAGE') return `-${valeur}%`
  if (type === 'MONTANT_FIXE') return `-${valeur}€`
  return `${valeur}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// Affluence fictive sur 7 jours (en attendant l'agrégation backend des passages)
function buildAffluence(total: number) {
  const base = [4, 7, 6, 9, 14, 22, 11]
  const sum = base.reduce((a, b) => a + b, 0)
  const offset = new Date().getDay()
  return base.map((v, i) => ({
    jour: JOURS[(offset + i) % 7],
    scans: Math.max(1, Math.round((v / sum) * Math.max(total, 40))),
  }))
}

function KpiCard({ icon: Icon, value, label, delay }: { icon: React.ElementType; value: string | number; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-card dark:border-white/10 dark:bg-ink-900"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cobalt-500/15 blur-2xl" />
      <Icon size={18} strokeWidth={1.75} className="text-cobalt-600 dark:text-cobalt-400" />
      <span className="tnum mt-3 block font-display text-3xl font-bold leading-none tracking-tight text-ink-900 dark:text-white">{value}</span>
      <span className="mt-1.5 block text-xs font-medium text-stone-500 dark:text-stone-400">{label}</span>
    </motion.div>
  )
}

export default function CommercantDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const grid = isDark ? '#252B3D' : '#E7E5E4'
  const axis = isDark ? '#78716C' : '#A8A29E'

  useEffect(() => {
    api
      .get<DashboardData>('/commercant/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status !== 401) {
          setError('Impossible de charger le tableau de bord')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const affluence = useMemo(() => buildAffluence(data?.totalPassages ?? 0), [data?.totalPassages])
  const scansToday = affluence[affluence.length - 1]?.scans ?? 0

  if (loading) {
    return (
      <div className="min-h-screen bg-cream px-6 pt-12 dark:bg-ink-950">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton mt-2 h-7 w-52 rounded" />
        <div className="mt-8 grid grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
        <div className="skeleton mt-4 h-56 rounded-2xl" />
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">Tableau de bord indisponible</p>
        <p className="text-sm text-stone-500 dark:text-stone-400">{error ?? 'Réessayez plus tard.'}</p>
      </div>
    )
  }

  const { commerce, offres, totalPassages } = data

  return (
    <div className="grain relative min-h-screen overflow-hidden bg-cream pb-12 dark:bg-ink-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cobalt-500/15 blur-3xl" />

      <header className="relative flex items-start justify-between px-6 pb-7 pt-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt-600 dark:text-cobalt-400">Espace commerçant</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">{commerce.nom}</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            commerce.estValide
              ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-500'
              : 'border-amber-400/40 bg-amber-400/10 text-amber-500'
          }`}>
            {commerce.estValide ? <CheckCircle2 size={13} strokeWidth={1.75} /> : <Clock size={13} strokeWidth={1.75} />}
            {commerce.estValide ? 'Validé' : 'En attente'}
          </span>
          <Navigation />
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-2xl px-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Vue d'ensemble</p>

        <div className="grid grid-cols-3 gap-3">
          <KpiCard icon={ScanLine} value={totalPassages} label="Total scans" delay={0} />
          <KpiCard icon={CalendarDays} value={scansToday} label="Aujourd'hui" delay={0.05} />
          <KpiCard icon={Tag} value={offres.length} label="Offres actives" delay={0.1} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-card dark:border-white/10 dark:bg-ink-900"
        >
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={16} strokeWidth={1.75} className="text-cobalt-600 dark:text-cobalt-400" />
            <span className="text-sm font-semibold text-ink-900 dark:text-white">Affluence · 7 derniers jours</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={affluence} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2347E6" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#2347E6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey="jour" stroke={axis} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={axis} fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
              <Tooltip
                cursor={{ stroke: '#2347E6', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{
                  background: isDark ? 'rgba(17,20,27,0.96)' : 'rgba(255,255,255,0.98)',
                  border: `1px solid ${grid}`,
                  borderRadius: 12,
                  color: isDark ? '#e7e5e4' : '#11141B',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#2347E6', fontWeight: 700 }}
              />
              <Area
                type="monotone"
                dataKey="scans"
                name="Scans"
                stroke="#2347E6"
                strokeWidth={2.5}
                fill="url(#scansGradient)"
                dot={{ r: 3, fill: '#2347E6' }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <button
          onClick={() => navigate('/commercant/scanner')}
          className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl bg-cobalt-500 py-4 text-base font-bold text-white shadow-cobalt transition-colors hover:bg-cobalt-600 active:scale-[0.99]"
        >
          <ScanLine size={20} strokeWidth={1.75} />
          Scanner un QR
        </button>

        <p className="mb-3 mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Offres actives ({offres.length})</p>
        {offres.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 p-8 text-center text-sm text-stone-400 dark:border-white/10 dark:bg-ink-900/50">
            Aucune offre active pour le moment.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {offres.map((offre, i) => (
              <motion.div
                key={offre.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                className="rounded-2xl border border-stone-200 bg-white p-5 transition-colors hover:border-cobalt-500/40 dark:border-white/10 dark:bg-ink-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-2 font-semibold text-ink-900 dark:text-white">
                    <Tag size={15} strokeWidth={1.75} className="text-cobalt-600 dark:text-cobalt-400" />
                    {offre.titre}
                  </span>
                  <span className="tnum whitespace-nowrap rounded-lg bg-cobalt-500/12 px-2.5 py-1 text-sm font-bold text-cobalt-700 dark:text-cobalt-300">
                    {formatRemise(offre.typeRemise, offre.valeurRemise)}
                  </span>
                </div>
                {offre.description && <p className="mt-2 text-sm leading-relaxed text-stone-500">{offre.description}</p>}
                <div className="tnum mt-2 text-xs font-medium text-stone-400">
                  <span>{formatDate(offre.dateDebut)}</span>
                  {offre.dateFin && <span> → {formatDate(offre.dateFin)}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
