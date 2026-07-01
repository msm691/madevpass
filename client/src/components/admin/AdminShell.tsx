import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Navigation from '../Navigation/Navigation'

interface Props {
  title: string
  eyebrow?: string
  /** Lien retour affiché sous le titre (ex: tableau de bord). Omis sur le dashboard. */
  back?: { to: string; label: string }
  /** Action optionnelle alignée à droite, sous la barre de navigation. */
  action?: React.ReactNode
  max?: string
  children: React.ReactNode
}

// Coquille commune des pages admin : fond crème/ink + grain, ambient cobalt,
// header cohérent (eyebrow + titre Outfit + Navigation), conteneur centré.
export default function AdminShell({ title, eyebrow = 'Espace administrateur', back, action, max = 'max-w-3xl', children }: Props) {
  return (
    <div className="grain relative min-h-screen overflow-hidden bg-cream pb-16 dark:bg-ink-950">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-72 opacity-40 dark:opacity-25" />
      <div className="aurora-blob -top-40 left-1/2 h-96 w-96 -translate-x-1/2 bg-cobalt-500/15" />

      <header className="relative mx-auto flex w-full max-w-5xl items-start justify-between px-6 pb-6 pt-12">
        <div className="min-w-0">
          {back && (
            <Link
              to={back.to}
              className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 transition-colors hover:text-cobalt-600 dark:text-stone-400 dark:hover:text-cobalt-300"
            >
              <ArrowLeft size={14} strokeWidth={1.75} /> {back.label}
            </Link>
          )}
          <p className="text-eyebrow uppercase text-cobalt-600 dark:text-cobalt-400">{eyebrow}</p>
          <h1 className="mt-1 truncate font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl">{title}</h1>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-3">
          <Navigation />
          {action}
        </div>
      </header>

      <main className={`relative mx-auto w-full ${max} px-6`}>{children}</main>
    </div>
  )
}
