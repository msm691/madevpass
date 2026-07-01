import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ScanLine, Tag, ShieldCheck, ArrowLeft } from 'lucide-react'
import api from '../api/client'
import AuthAside from '../components/auth/AuthAside'

interface LoginResponse {
  token: string
  user: { role: string }
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post<LoginResponse>('/auth/login', { email, password })
      localStorage.setItem('access_token', res.data.token)
      const { role } = res.data.user
      if (role === 'COMMERCANT') navigate('/commercant', { replace: true })
      else if (role === 'ADMIN') navigate('/admin', { replace: true })
      else navigate('/carte', { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Identifiants invalides. Vérifiez votre email et mot de passe.')
    } finally {
      setLoading(false)
    }
  }

  const input = 'w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-all duration-200 placeholder:text-stone-400 focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-500/20 dark:border-white/10 dark:bg-ink-900 dark:text-stone-100 dark:placeholder:text-stone-500'
  const label = 'mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300'

  return (
    <div className="grid min-h-[100dvh] bg-cream dark:bg-ink-950 lg:grid-cols-2">
      <AuthAside
        title="Bon retour parmi nous."
        subtitle="Retrouvez votre carte, vos favoris et les offres de vos commerçants partenaires."
        points={[
          { icon: ScanLine, text: 'Votre QR sécurisé, toujours à portée' },
          { icon: Tag, text: 'Les offres réservées aux étudiants' },
          { icon: ShieldCheck, text: 'Données chiffrées, conformes RGPD' },
        ]}
      />

      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-cobalt-600 dark:text-stone-400 dark:hover:text-cobalt-300">
            <ArrowLeft size={16} strokeWidth={1.75} /> Accueil
          </Link>

          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white">Se connecter</h1>
          <p className="mb-7 mt-1.5 text-sm text-stone-500 dark:text-stone-400">Accédez à votre espace MADEV Pass.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div>
              <label className={label} htmlFor="email">Email</label>
              <input id="email" className={input} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className={label} htmlFor="password">Mot de passe</label>
              <input id="password" className={input} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            )}

            <motion.button
              type="submit" disabled={loading} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
              className="sheen rounded-xl bg-cobalt-500 py-3.5 font-bold text-white shadow-cobalt transition-all duration-300 hover:bg-cobalt-600 hover:shadow-e4 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </motion.button>

            <p className="text-center text-sm text-stone-500 dark:text-stone-400">
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-semibold text-cobalt-600 hover:text-cobalt-700 dark:text-cobalt-400 dark:hover:text-cobalt-300">Créer mon compte</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
