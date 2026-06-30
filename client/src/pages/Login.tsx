import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'

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
      setError(msg ?? 'Identifiants invalides')
    } finally {
      setLoading(false)
    }
  }

  const input = 'w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-violet-600/40'
  const label = 'mb-1.5 block text-sm font-semibold text-slate-300'

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="glow-ring relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-8 backdrop-blur-xl"
      >
        <h1 className="bg-gradient-to-r from-primary-400 to-violet-300 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
          MADEV Pass
        </h1>
        <p className="mb-7 mt-1.5 text-sm text-slate-400">Carte étudiante numérique de Vienne</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className={label} htmlFor="email">Email</label>
            <input
              id="email" className={input} type="email" autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>
          <div>
            <label className={label} htmlFor="password">Mot de passe</label>
            <input
              id="password" className={input} type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary py-3.5 font-bold text-white shadow-glow transition-colors hover:bg-violet-500 disabled:opacity-60"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>

          <p className="text-center text-sm text-slate-400">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold text-primary-400 hover:text-primary-300">S'inscrire</Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
