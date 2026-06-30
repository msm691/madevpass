import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, FileUp, Clock } from 'lucide-react'
import api from '../api/client'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', password: '' })
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
  }

  async function submit(skipDoc: boolean) {
    setError(null)
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('prenom', form.prenom)
      formData.append('nom', form.nom)
      formData.append('email', form.email)
      formData.append('password', form.password)
      if (file && !skipDoc) formData.append('attestation', file)
      await api.post('/auth/register', formData, { headers: { 'Content-Type': undefined } })
      setSuccess(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(typeof msg === 'string' ? msg : "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submit(false)
  }

  const input = 'w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/30'
  const label = 'mb-1.5 block text-sm font-semibold text-slate-300'

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-10">
      {/* Background beams */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="glow-ring relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 backdrop-blur-xl"
      >
        {success ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <Check size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-50">Inscription reçue !</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Votre demande est en attente de validation par un administrateur.
              Vous pourrez vous connecter une fois votre dossier validé.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-7 w-full rounded-xl bg-primary py-3.5 font-bold text-white shadow-glow transition-colors hover:bg-violet-500"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <>
            <h1 className="bg-gradient-to-r from-primary-400 to-violet-300 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              MADEV Pass
            </h1>
            <p className="mb-7 mt-1.5 text-sm text-slate-400">Créer un compte étudiant</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={label} htmlFor="prenom">Prénom</label>
                  <input id="prenom" className={input} name="prenom" value={form.prenom} onChange={handleChange} required />
                </div>
                <div className="flex-1">
                  <label className={label} htmlFor="nom">Nom</label>
                  <input id="nom" className={input} name="nom" value={form.nom} onChange={handleChange} required />
                </div>
              </div>

              <div>
                <label className={label} htmlFor="email">Email</label>
                <input id="email" className={input} name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
              </div>

              <div>
                <label className={label} htmlFor="password">Mot de passe</label>
                <input id="password" className={input} name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} required minLength={8} />
                <span className="mt-1 block text-xs text-slate-500">8 caractères minimum</span>
              </div>

              <div>
                <label className={label}>Attestation de scolarité</label>
                <label
                  htmlFor="attestation"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary-400 transition-colors hover:border-primary/70 hover:bg-primary/15"
                >
                  <FileUp size={16} />
                  {file ? file.name : 'Choisir un document'}
                </label>
                <input id="attestation" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
                <span className="mt-1 block text-xs text-slate-500">PDF, JPG ou PNG — 5 Mo max</span>
              </div>

              {error && (
                <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-primary py-3.5 font-bold text-white shadow-glow transition-colors hover:bg-violet-500 disabled:opacity-60"
              >
                {loading ? 'Envoi en cours…' : 'Envoyer ma demande'}
              </button>

              {/* Bouton fantôme : bypass du justificatif */}
              <button
                type="button"
                disabled={loading}
                onClick={() => submit(true)}
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-200 disabled:opacity-60"
              >
                <Clock size={15} />
                Envoyer plus tard le justificatif
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Déjà un compte ? <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300">Se connecter</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
