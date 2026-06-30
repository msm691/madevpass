import { useEffect, useMemo, useState } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import type { Categorie, CommerceWithDetails } from '../../types/commerce'
import MerchantCard from '../../components/MerchantCard/MerchantCard'
import BottomNav from '../../components/BottomNav/BottomNav'
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
    <div className="relative min-h-screen overflow-hidden bg-slate-50 pb-28 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="relative px-6 pb-5 pt-12">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Annuaire</h1>
        <p className="mt-1 text-sm text-primary-400">Partenaires étudiants à Vienne</p>

        <div className="relative mt-5 flex items-center">
          <Search size={17} className="pointer-events-none absolute left-4 text-slate-400" />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-violet-600/30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Rechercher un commerce…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Effacer" className="absolute right-4 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="relative flex items-center gap-2.5 border-b border-slate-200 bg-white/50 px-6 py-3.5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            className={cn(chip, selectedCat === null
              ? 'border-primary bg-primary text-white'
              : 'border-slate-200 bg-transparent text-slate-500 dark:border-slate-700')}
            onClick={() => setSelectedCat(null)}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={cn(chip, selectedCat === cat.id
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 bg-transparent text-slate-500 dark:border-slate-700')}
              onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
            >
              {cat.icone ?? ''} {cat.nom}
            </button>
          ))}
        </div>

        <button
          className={cn(chip, 'flex items-center gap-1.5', sortProximite
            ? 'border-primary bg-primary/15 text-primary dark:text-primary-400'
            : 'border-slate-200 bg-transparent text-slate-500 dark:border-slate-700')}
          onClick={() => setSortProximite((v) => !v)}
          title="Trier par proximité"
        >
          <MapPin size={13} />
          Proximité
        </button>
      </div>

      <div className="px-6 pb-1 pt-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {loading ? 'Chargement…' : error ? error : `${filtered.length} commerce${filtered.length > 1 ? 's' : ''}`}
        </span>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-4 pt-2">
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
            <Search size={32} className="text-primary-400" />
            <p className="text-sm">Aucun résultat</p>
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
