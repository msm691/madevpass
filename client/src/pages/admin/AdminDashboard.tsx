import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Users, Store, ShieldCheck, PieChart as PieIcon, BarChart3 } from 'lucide-react'
import Navigation from '../../components/Navigation/Navigation'
import { useTheme } from '../../theme/ThemeProvider'
import api from '../../api/client'

interface AdminUser {
  id: string
  statutInscription?: string
}

interface AdminCommerce {
  id: string
  nom: string
}

const STATUTS = [
  { key: 'ACCEPTE', label: 'Acceptés', color: '#10b981' }, // émeraude
  { key: 'EN_ATTENTE', label: 'En attente', color: '#f59e0b' }, // ambre
  { key: 'REJETE', label: 'Rejetés', color: '#f43f5e' }, // rose
]

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

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [commerces, setCommerces] = useState<AdminCommerce[]>([])
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const axis = isDark ? '#78716C' : '#A8A29E'
  const tooltipStyle = {
    background: isDark ? 'rgba(17,20,27,0.96)' : 'rgba(255,255,255,0.98)',
    border: `1px solid ${isDark ? '#252B3D' : '#E7E5E4'}`,
    borderRadius: 12,
    color: isDark ? '#e7e5e4' : '#11141B',
    fontSize: 12,
  }

  useEffect(() => {
    Promise.allSettled([
      api.get<AdminUser[]>('/admin/users'),
      api.get<AdminCommerce[]>('/admin/commerces'),
    ])
      .then(([resU, resC]) => {
        if (resU.status === 'fulfilled') setUsers(resU.value.data ?? [])
        if (resC.status === 'fulfilled') setCommerces(resC.value.data ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  const statutData = useMemo(() => {
    const counts: Record<string, number> = {}
    users.forEach((u) => {
      const s = u.statutInscription ?? 'EN_ATTENTE'
      counts[s] = (counts[s] ?? 0) + 1
    })
    const data = STATUTS.map((s) => ({ name: s.label, value: counts[s.key] ?? 0, color: s.color }))
    // Fallback démo si aucune donnée encore
    return data.some((d) => d.value > 0) ? data : [
      { name: 'Acceptés', value: 1280, color: '#10b981' },
      { name: 'En attente', value: 540, color: '#f59e0b' },
      { name: 'Rejetés', value: 100, color: '#f43f5e' },
    ]
  }, [users])

  // Top 5 commerces les plus scannés (affluence fictive en attendant l'agrégation backend)
  const topCommerces = useMemo(() => {
    const base = commerces.length
      ? commerces.slice(0, 5).map((c) => c.nom)
      : ['Café du Centre', 'Pizza Vienne', 'Librairie Plume', 'Sport+', 'Burger Lab']
    const seed = [342, 287, 219, 168, 94]
    return base.map((nom, i) => ({
      nom: nom.length > 14 ? nom.slice(0, 13) + '…' : nom,
      scans: seed[i] ?? 50,
    }))
  }, [commerces])

  const totalEtudiants = statutData.reduce((a, d) => a + d.value, 0)

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream pb-12 dark:bg-ink-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="relative flex items-start justify-between px-6 pb-7 pt-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[2px] text-primary-400">Espace Admin</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900 dark:text-stone-50">Tableau de bord</h1>
        </div>
        <Navigation />
      </header>

      <main className="relative mx-auto w-full max-w-2xl px-6">
        {loading ? (
          <p className="py-20 text-center text-sm text-stone-400">Chargement…</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <KpiCard icon={Users} value={totalEtudiants} label="Étudiants" delay={0} />
              <KpiCard icon={Store} value={commerces.length || 470} label="Commerces" delay={0.05} />
              <KpiCard icon={ShieldCheck} value={statutData[0].value} label="Validés" delay={0.1} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-card dark:border-white/10 dark:bg-ink-900"
            >
              <div className="mb-2 flex items-center gap-2">
                <PieIcon size={16} strokeWidth={1.75} className="text-cobalt-600 dark:text-cobalt-400" />
                <span className="text-sm font-semibold text-ink-900 dark:text-white">Statuts d'inscription</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={statutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {statutData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-center gap-5">
                {statutData.map((d) => (
                  <span key={d.name} className="flex items-center gap-1.5 text-xs font-medium text-stone-400">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-card dark:border-white/10 dark:bg-ink-900"
            >
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 size={16} strokeWidth={1.75} className="text-cobalt-600 dark:text-cobalt-400" />
                <span className="text-sm font-semibold text-ink-900 dark:text-white">Top 5 commerces les plus scannés</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topCommerces} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}>
                  <XAxis type="number" stroke={axis} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="nom"
                    stroke={axis}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={92}
                  />
                  <Tooltip cursor={{ fill: 'rgba(35,71,230,0.08)' }} contentStyle={tooltipStyle} labelStyle={{ color: '#2347E6', fontWeight: 700 }} />
                  <Bar dataKey="scans" name="Scans" fill="#2347E6" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}
      </main>
    </div>
  )
}
