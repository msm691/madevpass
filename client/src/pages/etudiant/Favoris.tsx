import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import type { CommerceWithDetails } from '../../types/commerce'
import MerchantCard from '../../components/MerchantCard/MerchantCard'
import BottomNav from '../../components/BottomNav/BottomNav'
import { MOCK_COMMERCES } from '../../data/mockCommerces'
import { useFavoris } from '../../hooks/useFavoris'
import api from '../../api/client'

export default function Favoris() {
  const [commerces, setCommerces] = useState<CommerceWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const { favoris, toggleFavori } = useFavoris()

  useEffect(() => {
    api.get<CommerceWithDetails[]>('/commerces')
      .then((res) => setCommerces(res.data))
      .catch(() => setCommerces(MOCK_COMMERCES))
      .finally(() => setLoading(false))
  }, [])

  const favorisListe = commerces.filter((c) => favoris.has(c.id))

  return (
    <div className="grain relative min-h-screen overflow-hidden bg-cream pb-28 dark:bg-ink-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cobalt-500/15 blur-3xl" />

      <header className="relative px-6 pb-6 pt-12">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">Favoris</h1>
        <p className="mt-1 text-sm text-cobalt-600 dark:text-cobalt-400">
          {loading ? 'Chargement…' : `${favorisListe.length} commerce${favorisListe.length > 1 ? 's' : ''} sauvegardé${favorisListe.length > 1 ? 's' : ''}`}
        </p>
      </header>

      <div className="flex flex-col gap-3 px-6 pt-2">
        {!loading && favorisListe.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-8 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400">
              <Heart size={30} strokeWidth={1.5} />
            </div>
            <p className="font-display text-lg font-semibold text-ink-900 dark:text-white">Aucun favori pour l’instant</p>
            <p className="text-sm leading-relaxed text-stone-400">
              Appuyez sur le cœur d’un commerce dans l’annuaire pour le retrouver ici.
            </p>
          </div>
        )}
        {favorisListe.map((commerce) => (
          <MerchantCard
            key={commerce.id}
            commerce={commerce}
            isFavori={true}
            onToggleFavori={toggleFavori}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
