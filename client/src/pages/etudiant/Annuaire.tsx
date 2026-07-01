import { useEffect, useMemo, useState } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import type { Categorie, CommerceWithDetails } from '../../types/commerce'
import MerchantCard from '../../components/MerchantCard/MerchantCard'
import BottomNav from '../../components/BottomNav/BottomNav'
import { MerchantCardSkeleton } from '../../components/ui/Skeleton'
import { useFavoris } from '../../hooks/useFavoris'
import api from '../../api/client'
import { cn } from '../../lib/utils'

export default function Annuaire() {
  const [commerces, setCommerces] = useState<CommerceWithDetails[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState<number | null>(null)
  const [sortProximite, setSortProximite] = useState(false)
  const { favoris, toggleFavori } = useFavoris()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<CommerceWithDetails[]>('/commerces'),
      api.get<Categorie[]>('/categories'),
    ])
      .then(([resC, resCat]) => {
        setCommerces(resC.data)
        setCategories(resCat.data)
      })
      .catch((err) => {
        if (err.response?.status !== 401) {
          setError('Impossible de charger les commerces')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return commerces
      .filter(
        (c) =>
          (selectedCat === null || c.categorieId === selectedCat) &&
          (q === '' ||
            c.nom.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q)),
      )
      .sort((a, b) =>
        sortProximite ? (a.distanceKm ?? 99) - (b.distanceKm ?? 99) : 0,
      )
  }, [commerces, search, selectedCat, sortProximite])

  const chip = 'flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors'

  return (
    <div className="grain relative min-h-screen overflow-hidden bg-cream pb-28 dark:bg-ink-950">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-64 opacity-40 dark:opacity-25" />
      <div className="aurora-blob -top-40 left-1/2 h-96 w-96 -translate-x-1/2 bg-cobalt-500/15" />

      <header className="relative px-6 pb-5 pt-12">
        <p className="text-eyebrow uppercase text-cobalt-600 dark:text-cobalt-400">Partenaires · Vienne</p>
        <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">Annuaire</h1>

        <div className="relative mt-5 flex items-center">
          <Search size={17} strokeWidth={1.75} className="pointer-events-none absolute left-4 text-stone-400" />
          <input
            className="w-full rounded-xl border border-stone-300 bg-white px-11 py-3 text-sm text-ink-900 outline-none transition-all duration-200 placeholder:text-stone-400 focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-500/20 dark:border-white/10 dark:bg-ink-900 dark:text-stone-100"
            placeholder="Rechercher un commerce…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Effacer la recherche" className="absolute right-4 text-stone-400 hover:text-stone-600">
              <X size={16} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </header>

      <div className="relative flex items-center gap-2.5 border-b border-stone-200 bg-white/50 px-6 py-3.5 backdrop-blur-sm dark:border-white/10 dark:bg-ink-900/40">
        <div className="flex flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            className={cn(chip, selectedCat === null
              ? 'border-cobalt-500 bg-cobalt-500 text-white'
              : 'border-stone-200 bg-transparent text-stone-500 dark:border-white/10')}
            onClick={() => setSelectedCat(null)}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={cn(chip, selectedCat === cat.id
                ? 'border-cobalt-500 bg-cobalt-500 text-white'
                : 'border-stone-200 bg-transparent text-stone-500 dark:border-white/10')}
              onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
            >
              {cat.icone ?? ''} {cat.nom}
            </button>
          ))}
        </div>

        <button
          className={cn(chip, 'flex items-center gap-1.5', sortProximite
            ? 'border-cobalt-500 bg-cobalt-500/12 text-cobalt-700 dark:text-cobalt-300'
            : 'border-stone-200 bg-transparent text-stone-500 dark:border-white/10')}
          onClick={() => setSortProximite((v) => !v)}
          title="Trier par proximité"
        >
          <MapPin size={13} strokeWidth={1.75} />
          Proximité
        </button>
      </div>

      <div className="px-6 pb-1 pt-4">
        <span className="tnum text-xs font-semibold uppercase tracking-wider text-stone-400">
          {loading ? 'Chargement…' : error ? error : `${filtered.length} commerce${filtered.length > 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-4 pt-2">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <MerchantCardSkeleton key={i} />)}
        {!loading && error && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-stone-400">
            <p className="font-display text-base font-semibold text-ink-900 dark:text-white">Chargement impossible</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-stone-400">
            <Search size={32} strokeWidth={1.5} className="text-cobalt-500" />
            <p className="text-sm">Aucun commerce ne correspond à votre recherche.</p>
          </div>
        )}
        {filtered.map((commerce) => (
          <MerchantCard
            key={commerce.id}
            commerce={commerce}
            isFavori={favoris.has(commerce.id)}
            onToggleFavori={toggleFavori}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
