# MADEV Pass

**Carte étudiante numérique de la ville de Vienne** et son réseau de commerçants partenaires.

MADEV Pass digitalise la carte étudiante sous forme d'un **QR code sécurisé à rotation**, met en relation les **étudiants** avec les **commerces locaux** (offres & réductions), et fournit aux **administrateurs** les outils de modération et de pilotage du réseau.

Application **PWA installable** (mobile & desktop) avec **notifications push** et **tableaux de bord analytiques**.

---

## ✨ Aperçu

L'application s'articule autour de **trois espaces** et d'une **landing page vitrine** publique :

| Espace | Rôle | Fonctionnalités clés |
|--------|------|----------------------|
| 🌐 **Landing** | Public | Vitrine premium (hero 3D, statistiques, showcase) avant connexion |
| 🎓 **Étudiant** | `ETUDIANT` | Carte numérique + QR plein écran avec timer, annuaire des partenaires, favoris, profil/RGPD, notifications push |
| 🏪 **Commerçant** | `COMMERCANT` | Tableau de bord analytique (graphiques `recharts`), UI caisse de scan QR, gestion des offres, édition du commerce |
| 🛡️ **Admin** | `ADMIN` | Validation des inscriptions, gestion des comptes & commerçants, catégories, dashboard analytique (`AdminShell`) |

---

## 🎨 Design System

Interface pensée comme un **produit SaaS / Fintech premium**, avec un **Dark Mode natif** (toggle clair/sombre persistant via `localStorage`).

- **Thème** : fond `slate-950` (dark) / `slate-50` (light), surfaces `slate-900` / `white`
- **Couleur primaire** : `violet-600` (#7C3AED) — CTA, bordures actives, effets de *glow*
- **Typographie** : `Geist`
- **Composants** : glassmorphism (`backdrop-blur`), coins très arrondis (`rounded-2xl`), bordures lumineuses animées
- **Animations** : entrées *stagger*, *scroll reveals*, *scroll-driven progress*, micro-interactions *hover scale*, fond 3D animé (canvas, projection de points sphériques), bordures coniques animées via `requestAnimationFrame`

---

## 🧱 Stack technique

### Frontend (`/client`)
- **React 18** + **TypeScript**
- **Vite** (build & dev server)
- **React Router DOM** (routing par rôle, routes protégées)
- **Tailwind CSS** (design utilitaire, dark mode `class`)
- **Framer Motion** (animations & transitions)
- **Lucide React** (icônes)
- **react-parallax-tilt** (effets 3D au survol)
- **react-fast-marquee** (bandeau partenaires)
- **qrcode.react** (génération QR)
- **html5-qrcode** (scan caméra)
- **recharts** (graphiques des tableaux de bord)
- **canvas-confetti** (feedback de validation)
- **vite-plugin-pwa** (PWA, service worker, manifest, install prompt)
- **Axios** (client API + intercepteurs auth)
- Polices : **Geist**, **Geist Mono**, **Outfit** (`@fontsource-variable`)

### Backend (`/server`)
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** + **SQLite**
- **JWT** (`jsonwebtoken`) pour l'authentification
- **bcryptjs** (hash des mots de passe)
- **Zod** (validation des entrées)
- **Multer** (upload des justificatifs)
- **web-push** (notifications push VAPID)

---

## 🔐 Sécurité & RGPD

- Authentification **JWT** (rôle encodé dans le token)
- Middlewares de protection : `authMiddleware`, `requireRole` → `adminGuard` / `commercantGuard`
- **QR code à rotation** (token éphémère, anti-rejeu via signature et expiration)
- Mots de passe hachés (bcrypt)
- Validation systématique des payloads (Zod)
- **Notifications push** sécurisées (VAPID via `web-push`, service worker `push-sw.js`)
- **Conformité RGPD** : demande de suppression de compte (statut `pending_deletion` + délai légal de 14 jours), gestion des documents justificatifs

---

## 📁 Architecture

```
madevpass/
├── client/                 # Application React (Vite + TS + Tailwind)
│   ├── public/             # favicon, manifest PWA, push-sw.js
│   └── src/
│       ├── pages/          # Landing, Login, Register, Profile + espaces etudiant/commercant/admin
│       ├── components/     # Navigation, BottomNav, StudentCard, MerchantCard, admin/, auth/, ui/, landing/
│       ├── theme/          # ThemeProvider (dark/light)
│       ├── hooks/          # useFavoris
│       └── api/            # client Axios
└── server/                 # API Express (TS + Prisma)
    └── src/
        ├── routes/         # auth, admin, commerces, categories, passages, documents, notifications
        ├── middleware/     # authMiddleware, requireRole
        └── lib/            # prisma client
```

---

## ✅ État actuel du projet

### Fonctionnel
- **Authentification** complète (inscription avec justificatif optionnel / différé, connexion, gestion d'erreurs sans rechargement)
- **Landing page** premium responsive (hero 3D, compteurs animés données réelles Vienne — 470 commerçants, 1920 étudiants, 100% RGPD)
- **Espace Étudiant** : carte numérique, QR plein écran avec timer de rafraîchissement, annuaire filtrable (recherche, catégories, proximité), favoris
- **Espace Commerçant** : dashboard analytique (graphiques `recharts`), UI caisse de scan QR (cadre + ligne de balayage animée + confetti de validation), création / édition / suppression d'offres, édition du commerce
- **Espace Admin** : layout dédié (`AdminShell`), dashboard analytique, validation/refus des inscriptions, liste & édition des comptes, liste des commerçants, création directe de commerçants, gestion des catégories, vue QR admin
- **PWA** : installable (manifest + service worker via `vite-plugin-pwa`), bouton d'installation (`InstallButton`)
- **Notifications push** : abonnement VAPID, `push-sw.js`, route serveur `/api/notifications`
- **Dark / Light mode** natif avec persistance
- **Conformité RGPD** (demande de suppression, upload différé de justificatif)

### Données réelles intégrées
Statistiques basées sur la ville de Vienne : **470 commerçants partenaires**, **1920 étudiants**, **100% conforme RGPD**, inscription en **2 clics**.

---

> Projet MADEV Pass — carte étudiante numérique & réseau de commerçants partenaires de Vienne.
