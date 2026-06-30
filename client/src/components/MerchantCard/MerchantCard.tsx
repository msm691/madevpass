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
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-glow dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:translate-x-full group-hover:opacity-100" />

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
          {icone}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-slate-900 dark:text-slate-100">{commerce.nom}</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-slate-500">
            <MapPin size={13} className="flex-shrink-0" />
            {commerce.adresse}, {commerce.ville}
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          {commerce.distanceKm !== undefined && (
            <span className="text-xs font-semibold text-slate-400">
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
                : 'border-slate-200 text-slate-400 hover:border-red-500/40 hover:text-red-500 dark:border-slate-700',
            )}
          >
            <Heart size={17} fill={isFavori ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {commerce.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">{commerce.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {commerce.categorie.nom}
        </span>
        {commerce.offresActives > 0 && (
          <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-[11px] font-bold text-primary dark:text-primary-400">
            {commerce.offresActives} offre{commerce.offresActives > 1 ? 's' : ''} active{commerce.offresActives > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </motion.div>
  )
}
