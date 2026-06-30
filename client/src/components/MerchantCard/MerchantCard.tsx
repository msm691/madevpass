import { motion } from 'framer-motion'
import { Heart, MapPin } from 'lucide-react'
import type { CommerceWithDetails } from '../../types/commerce'
import { cn } from '../../lib/utils'

interface Props {
  commerce: CommerceWithDetails
  isFavori?: boolean
  onToggleFavori?: (id: string) => void
}

export default function MerchantCard({ commerce, isFavori = false, onToggleFavori }: Props) {
  const icone = commerce.categorie.icone ?? '🏪'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 0.99 }}
      className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-300 hover:border-cobalt-500/40 hover:shadow-card-hover dark:border-white/10 dark:bg-ink-900"
    >
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cobalt-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:translate-x-full group-hover:opacity-100" />

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-cobalt-500/10 text-2xl">
          {icone}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-semibold text-ink-900 dark:text-white">{commerce.nom}</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-stone-500">
            <MapPin size={13} strokeWidth={1.75} className="flex-shrink-0" />
            {commerce.adresse}, {commerce.ville}
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          {commerce.distanceKm !== undefined && (
            <span className="tnum text-xs font-semibold text-stone-400">
              {commerce.distanceKm < 1
                ? `${(commerce.distanceKm * 1000).toFixed(0)} m`
                : `${commerce.distanceKm.toFixed(1)} km`}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavori?.(commerce.id) }}
            aria-label={isFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
              isFavori
                ? 'border-red-500/50 bg-red-500/10 text-red-500'
                : 'border-stone-200 text-stone-400 hover:border-red-500/40 hover:text-red-500 dark:border-white/10',
            )}
          >
            <Heart size={17} strokeWidth={1.75} fill={isFavori ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {commerce.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-500">{commerce.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-500 dark:bg-ink-800 dark:text-stone-400">
          {commerce.categorie.nom}
        </span>
        {commerce.offresActives > 0 && (
          <span className="rounded-lg bg-cobalt-500/12 px-2.5 py-1 text-[11px] font-semibold text-cobalt-700 dark:text-cobalt-300">
            {commerce.offresActives} offre{commerce.offresActives > 1 ? 's' : ''} active{commerce.offresActives > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </motion.div>
  )
}
