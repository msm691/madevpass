import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, FileUp, Clock, GraduationCap, Tag, ShieldCheck, ArrowLeft } from 'lucide-react'
import api from '../api/client'
import AuthAside from '../components/auth/AuthAside'

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
      setError(typeof msg === 'string' ? msg : "L'inscription a échoué. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submit(false)
  }

  const input = 'w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-all duration-200 placeholder:text-stone-400 focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-500/20 dark:border-white/10 dark:bg-ink-900 dark:text-stone-100 dark:placeholder:text-stone-500'
  const label = 'mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300'

  return (
    <div className="grid min-h-[100dvh] bg-cream dark:bg-ink-950 lg:grid-cols-2">
      <AuthAside
        title="Votre carte étudiante, en 2 minutes."
        subtitle="Créez votre compte, validez votre statut et activez immédiatement vos avantages."
        points={[
          { icon: GraduationCap, text: 'Carte numérique + QR sécurisé' },
          { icon: Tag, text: 'Offres réservées aux étudiants' },
          { icon: ShieldCheck, text: 'Données chiffrées, conformes RGPD' },
        ]}
      />

      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {success ? (
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 14, stiffness: 260 }}
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              >
                <Check size={32} strokeWidth={2} />
              </motion.div>
              <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Inscription reçue</h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                Votre demande est en attente de validation par un administrateur.
                Vous pourrez vous connecter dès que votre dossier sera validé.
              </p>
              <motion.button
                onClick={() => navigate('/login')} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                className="sheen mt-7 w-full rounded-xl bg-cobalt-500 py-3.5 font-bold text-white shadow-cobalt transition-all duration-300 hover:bg-cobalt-600 hover:shadow-e4"
              >
                Retour à la connexion
              </motion.button>
            </div>
          ) : (
            <>
              <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-cobalt-600 dark:text-stone-400 dark:hover:text-cobalt-300">
                <ArrowLeft size={16} strokeWidth={1.75} /> Accueil
              </Link>

              <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white">Créer mon compte</h1>
              <p className="mb-7 mt-1.5 text-sm text-stone-500 dark:text-stone-400">Compte étudiant — Vienne.</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
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
                  <span className="mt-1 block text-xs text-stone-500">8 caractères minimum</span>
                </div>

                <div>
                  <label className={label}>Attestation de scolarité</label>
                  <label
                    htmlFor="attestation"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-cobalt-500/40 bg-cobalt-500/[0.06] px-4 py-3 text-sm font-medium text-cobalt-700 transition-colors hover:border-cobalt-500/70 hover:bg-cobalt-500/10 dark:text-cobalt-300"
                  >
                    <FileUp size={16} strokeWidth={1.75} />
                    <span className="truncate">{file ? file.name : 'Choisir un document'}</span>
                  </label>
                  <input id="attestation" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
                  <span className="mt-1 block text-xs text-stone-500">PDF, JPG ou PNG — 5 Mo max</span>
                </div>

                {error && (
                  <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                )}

                <motion.button
                  type="submit" disabled={loading} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                  className="sheen rounded-xl bg-cobalt-500 py-3.5 font-bold text-white shadow-cobalt transition-all duration-300 hover:bg-cobalt-600 hover:shadow-e4 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Envoi en cours…' : 'Envoyer ma demande'}
                </motion.button>

                <button
                  type="button" disabled={loading} onClick={() => submit(true)}
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-500/10 hover:text-stone-700 disabled:opacity-60 dark:hover:text-stone-200"
                >
                  <Clock size={15} strokeWidth={1.75} />
                  Envoyer le justificatif plus tard
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
                Déjà un compte ? <Link to="/login" className="font-semibold text-cobalt-600 hover:text-cobalt-700 dark:text-cobalt-400 dark:hover:text-cobalt-300">Se connecter</Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
