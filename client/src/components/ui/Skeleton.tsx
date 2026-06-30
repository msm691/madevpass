import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-stone-200/70 dark:bg-ink-800',
        className,
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
    </div>
  )
}

export function MerchantCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 dark:border-white/10 dark:bg-ink-900">
      <Skeleton className="h-16 w-16 flex-shrink-0 rounded-xl" />
      <div className="flex flex-1 flex-col gap-2.5">
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <Skeleton className="h-3 w-full rounded-md" />
        <Skeleton className="h-3 w-1/3 rounded-md" />
        <div className="mt-1 flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-9 w-9 flex-shrink-0 rounded-full" />
    </div>
  )
}
