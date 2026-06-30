import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/admin/users — liste de tous les comptes
router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      prenom: true,
      nom: true,
      numeroCarte: true,
      isActif: true,
      statutInscription: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

// PATCH /api/admin/users/:id — activer/désactiver + éditer infos
const userPatchSchema = z.object({
  isActif: z.boolean().optional(),
  prenom: z.string().min(1).optional(),
  nom: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

router.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const parsed = userPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ error: 'Utilisateur introuvable' });
    return;
  }

  if (parsed.data.email && parsed.data.email !== user.email) {
    const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) {
      res.status(409).json({ error: 'Email déjà utilisé' });
      return;
    }
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, email: true, prenom: true, nom: true, role: true, isActif: true },
    });
    res.json(updated);
  } catch {
    res.status(409).json({ error: 'Email déjà utilisé' });
  }
});

// POST /api/admin/merchants — création directe d'un compte commerçant + commerce
const merchantSchema = z.object({
  prenom: z.string().min(1),
  nom: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  nomCommerce: z.string().min(1),
  description: z.string().optional().default(''),
  adresse: z.string().min(1),
  ville: z.string().min(1),
  codePostal: z.string().min(1),
  categorieId: z.coerce.number().int(),
  telephone: z.string().optional().default(''),
  siteWeb: z.string().optional().default(''),
});

router.post('/merchants', async (req, res) => {
  const parsed = merchantSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const d = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: d.email } });
  if (existing) {
    res.status(409).json({ error: 'Cet email est déjà utilisé' });
    return;
  }

  const categorie = await prisma.categorie.findUnique({ where: { id: d.categorieId } });
  if (!categorie) {
    res.status(400).json({ error: 'Catégorie invalide' });
    return;
  }

  const passwordHash = await bcrypt.hash(d.password, 12);

  const user = await prisma.user.create({
    data: {
      email: d.email,
      passwordHash,
      prenom: d.prenom,
      nom: d.nom,
      role: 'COMMERCANT',
      isActif: true,
      statutInscription: 'VALIDE',
      commerce: {
        create: {
          categorieId: d.categorieId,
          nom: d.nomCommerce,
          description: d.description,
          adresse: d.adresse,
          ville: d.ville,
          codePostal: d.codePostal,
          telephone: d.telephone,
          siteWeb: d.siteWeb,
          estValide: true,
        },
      },
    },
    select: { id: true, email: true, prenom: true, nom: true, role: true },
  });

  res.status(201).json(user);
});

// DELETE /api/admin/users/:id — supprimer un compte
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ error: 'Utilisateur introuvable' });
    return;
  }

  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(409).json({ error: 'Compte lié à des données (passages/commerce), suppression impossible.' });
  }
});

// GET /api/admin/merchants — liste des commerçants + commerce + catégorie
router.get('/merchants', async (_req, res) => {
  const commerces = await prisma.commerce.findMany({
    include: {
      categorie: { select: { id: true, nom: true, icone: true } },
      proprietaire: { select: { id: true, prenom: true, nom: true, email: true, isActif: true } },
      _count: { select: { offres: true, passages: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(commerces.map(({ _count, ...c }) => ({
    ...c,
    nbOffres: _count.offres,
    nbPassages: _count.passages,
  })));
});

// GET /api/admin/categories — liste des catégories
router.get('/categories', async (_req, res) => {
  const categories = await prisma.categorie.findMany({
    include: { _count: { select: { commerces: true } } },
    orderBy: { nom: 'asc' },
  });
  res.json(categories.map(({ _count, ...c }) => ({ ...c, nbCommerces: _count.commerces })));
});

// POST /api/admin/categories — créer une catégorie
const categorieSchema = z.object({
  nom: z.string().min(1),
  icone: z.string().optional().default(''),
});

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

router.post('/categories', async (req, res) => {
  const parsed = categorieSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const slug = slugify(parsed.data.nom);
  const exists = await prisma.categorie.findFirst({ where: { OR: [{ nom: parsed.data.nom }, { slug }] } });
  if (exists) {
    res.status(409).json({ error: 'Catégorie déjà existante' });
    return;
  }
  const categorie = await prisma.categorie.create({
    data: { nom: parsed.data.nom, slug, icone: parsed.data.icone || null },
  });
  res.status(201).json({ ...categorie, nbCommerces: 0 });
});

// GET /api/admin/inscriptions
router.get('/inscriptions', async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { statutInscription: 'EN_ATTENTE' },
    select: {
      id: true,
      email: true,
      prenom: true,
      nom: true,
      documentAttestationUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  res.json(users);
});

// PATCH /api/admin/valider/:userId
router.patch('/valider/:userId', async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ error: 'Utilisateur introuvable' });
    return;
  }

  const numeroCarte = `MADEV-${Date.now().toString(36).toUpperCase()}`;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActif: true, statutInscription: 'VALIDE', numeroCarte },
    select: { id: true, prenom: true, nom: true, isActif: true, statutInscription: true, numeroCarte: true },
  });

  res.json(updated);
});

// PATCH /api/admin/refuser/:userId
router.patch('/refuser/:userId', async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ error: 'Utilisateur introuvable' });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActif: false, statutInscription: 'REJETÉ' },
    select: { id: true, prenom: true, nom: true, isActif: true, statutInscription: true },
  });

  res.json(updated);
});

export default router;
