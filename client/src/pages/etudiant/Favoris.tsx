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
    <div className="relative min-h-screen overflow-hidden bg-slate-50 pb-28 dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="relative px-6 pb-6 pt-12">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Favoris</h1>
        <p className="mt-1 text-sm text-primary-400">
          {loading ? 'Chargement…' : `${favorisListe.length} commerce${favorisListe.length > 1 ? 's' : ''} sauvegardé${favorisListe.length > 1 ? 's' : ''}`}
        </p>
      </header>

      <div className="flex flex-col gap-3 px-6 pt-2">
        {!loading && favorisListe.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-8 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary-400">
              <Heart size={30} />
            </div>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-200">Aucun favori</p>
            <p className="text-sm leading-relaxed text-slate-400">
              Appuie sur le cœur d'un commerce dans l'Annuaire pour l'ajouter ici.
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
