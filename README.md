# MADEV Pass

**Carte étudiante numérique de la ville de Vienne** et son réseau de commerçants partenaires.

MADEV Pass digitalise la carte étudiante sous forme d'un **QR code sécurisé à rotation**, met en relation les **étudiants** avec les **commerces locaux** (offres & réductions), et fournit aux **administrateurs** les outils de modération et de pilotage du réseau.

---

## ✨ Aperçu

L'application s'articule autour de **trois espaces** et d'une **landing page vitrine** publique :

| Espace | Rôle | Fonctionnalités clés |
|--------|------|----------------------|
| 🌐 **Landing** | Public | Vitrine premium (hero 3D, statistiques, showcase) avant connexion |
| 🎓 **Étudiant** | `ETUDIANT` | Carte numérique + QR plein écran avec timer, annuaire des partenaires, favoris, profil/RGPD |
| 🏪 **Commerçant** | `COMMERCANT` | Tableau de bord, scan QR des étudiants, gestion des offres, édition du commerce |
| 🛡️ **Admin** | `ADMIN` | Validation des inscriptions, gestion des comptes & commerçants, catégories, statistiques |

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
- **Axios** (client API + intercepteurs auth)

### Backend (`/server`)
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** + **SQLite**
- **JWT** (`jsonwebtoken`) pour l'authentification
- **bcryptjs** (hash des mots de passe)
- **Zod** (validation des entrées)
- **Multer** (upload des justificatifs)

---

## 🔐 Sécurité & RGPD

- Authentification **JWT** (rôle encodé dans le token)
- Middlewares de protection : `authMiddleware`, `requireRole` → `adminGuard` / `commercantGuard`
- **QR code à rotation** (token éphémère, anti-rejeu via signature et expiration)
- Mots de passe hachés (bcrypt)
- Validation systématique des payloads (Zod)
- **Conformité RGPD** : demande de suppression de compte (statut `pending_deletion` + délai légal de 14 jours), gestion des documents justificatifs

---

## 📁 Architecture

```
madevpass/
├── client/                 # Application React (Vite + TS + Tailwind)
│   └── src/
│       ├── pages/          # Landing, Login, Register, Profile + espaces etudiant/commercant/admin
│       ├── components/     # Navigation, BottomNav, StudentCard, MerchantCard, ui/, landing/
│       ├── theme/          # ThemeProvider (dark/light)
│       ├── hooks/          # useFavoris
│       └── api/            # client Axios
└── server/                 # API Express (TS + Prisma)
    └── src/
        ├── routes/         # auth, admin, commerces, categories, passages, documents
        ├── middleware/     # authMiddleware, requireRole
        └── lib/            # prisma client
```

---

## ✅ État actuel du projet

### Fonctionnel
- **Authentification** complète (inscription avec justificatif optionnel / différé, connexion, gestion d'erreurs sans rechargement)
- **Landing page** premium responsive (hero 3D, compteurs animés données réelles Vienne — 470 commerçants, 1920 étudiants, 100% RGPD)
- **Espace Étudiant** : carte numérique, QR plein écran avec timer de rafraîchissement, annuaire filtrable (recherche, catégories, proximité), favoris
- **Espace Commerçant** : dashboard (statistiques de passages), scanner QR (cadre + ligne de balayage animée), création / édition / suppression d'offres, édition du commerce
- **Espace Admin** : validation/refus des inscriptions, liste & édition des comptes, liste des commerçants, création directe de commerçants, gestion des catégories, vue QR admin
- **Dark / Light mode** natif avec persistance
- **Conformité RGPD** (demande de suppression, upload différé de justificatif)

### Données réelles intégrées
Statistiques basées sur la ville de Vienne : **470 commerçants partenaires**, **1920 étudiants**, **100% conforme RGPD**, inscription en **2 clics**.

---

> Projet MADEV Pass — carte étudiante numérique & réseau de commerçants partenaires de Vienne.
