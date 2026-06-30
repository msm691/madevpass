import { Router } from 'express'
import webpush from 'web-push'

const router = Router()

// VAPID : variables d'env en prod, clés de dev factices en fallback (MVP)
const VAPID_PUBLIC =
  process.env.VAPID_PUBLIC_KEY ??
  'BAXg4HrNc5oQXHDRQ-sZtZGB8ljcYR8G7tb6NMDTxKwborXN1dZZYpfBTso0iU0p9zXSYW2P0udiSgBguTPnCfA'
const VAPID_PRIVATE =
  process.env.VAPID_PRIVATE_KEY ?? 'Q8Oqeqx4VSjvESLoQWjpGJ-M4P7qWzHMgpP8utEJu_8'
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:contact@madevpass.fr'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)

// Store en mémoire pour le MVP (à remplacer par une table Prisma PushSubscription)
const subscriptions = new Map<string, webpush.PushSubscription>()

// GET /api/notifications/vapid-public-key
router.get('/vapid-public-key', (_req, res) => {
  res.json({ publicKey: VAPID_PUBLIC })
})

// POST /api/notifications/subscribe
router.post('/subscribe', (req, res) => {
  const sub = req.body as webpush.PushSubscription
  if (!sub?.endpoint) {
    return res.status(400).json({ message: 'Souscription invalide.' })
  }
  subscriptions.set(sub.endpoint, sub)
  console.log(`[push] Nouvelle souscription enregistrée (${subscriptions.size} au total):`, sub.endpoint)
  res.status(201).json({ message: 'Alertes activées.' })
})

// POST /api/notifications/test — diffuse une notif factice à tous les abonnés (dev)
router.post('/test', async (_req, res) => {
  const payload = JSON.stringify({
    title: 'MADEV Pass',
    body: 'Une nouvelle offre vient d’être publiée chez un de vos favoris !',
    url: '/annuaire',
  })
  await Promise.allSettled(
    [...subscriptions.values()].map((sub) =>
      webpush.sendNotification(sub, payload).catch((err) => {
        if (err?.statusCode === 404 || err?.statusCode === 410) subscriptions.delete(sub.endpoint)
      }),
    ),
  )
  res.json({ sent: subscriptions.size })
})

export default router
