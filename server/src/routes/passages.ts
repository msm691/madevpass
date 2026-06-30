import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const router = Router();

// ─── GET /dashboard ───────────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const commerce = await prisma.commerce.findUnique({
      where: { proprietaireId: req.user!.sub },
      select: {
        id: true,
        nom: true,
        estValide: true,
        offres: {
          where: { estActive: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            titre: true,
            description: true,
            typeRemise: true,
            valeurRemise: true,
            dateDebut: true,
            dateFin: true,
          },
        },
        _count: { select: { passages: true } },
      },
    });

    if (!commerce) {
      res.status(404).json({ error: 'Commerce introuvable' });
      return;
    }

    res.json({
      commerce: { id: commerce.id, nom: commerce.nom, estValide: commerce.estValide },
      offres: commerce.offres,
      totalPassages: commerce._count.passages,
    });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── Offres CRUD (commercant) ───────────────────────────────────────────────
const offreSchema = z.object({
  titre: z.string().min(1),
  description: z.string().optional().default(''),
  typeRemise: z.enum(['POURCENTAGE', 'MONTANT_FIXE', 'ARTICLE_OFFERT', 'AUTRE']),
  valeurRemise: z.coerce.number().nullable().optional(),
  dateDebut: z.string().min(1),
  dateFin: z.string().nullable().optional(),
});

const offreSelect = {
  id: true, titre: true, description: true, typeRemise: true,
  valeurRemise: true, dateDebut: true, dateFin: true,
} as const;

async function ownedCommerce(userId: string) {
  return prisma.commerce.findUnique({ where: { proprietaireId: userId } });
}

// POST /offres
router.post('/offres', async (req, res) => {
  const parsed = offreSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const commerce = await ownedCommerce(req.user!.sub);
  if (!commerce) {
    res.status(404).json({ error: 'Commerce introuvable' });
    return;
  }
  const d = parsed.data;
  const offre = await prisma.offre.create({
    data: {
      commerceId: commerce.id,
      titre: d.titre,
      description: d.description ?? '',
      typeRemise: d.typeRemise,
      valeurRemise: d.valeurRemise ?? null,
      dateDebut: new Date(d.dateDebut),
      dateFin: d.dateFin ? new Date(d.dateFin) : null,
      estActive: true,
    },
    select: offreSelect,
  });
  res.status(201).json(offre);
});

// PATCH /offres/:id
router.patch('/offres/:id', async (req, res) => {
  const parsed = offreSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const commerce = await ownedCommerce(req.user!.sub);
  const offre = await prisma.offre.findUnique({ where: { id: req.params.id } });
  if (!commerce || !offre || offre.commerceId !== commerce.id) {
    res.status(404).json({ error: 'Offre introuvable' });
    return;
  }
  const d = parsed.data;
  const updated = await prisma.offre.update({
    where: { id: req.params.id },
    data: {
      ...(d.titre !== undefined ? { titre: d.titre } : {}),
      ...(d.description !== undefined ? { description: d.description } : {}),
      ...(d.typeRemise !== undefined ? { typeRemise: d.typeRemise } : {}),
      ...(d.valeurRemise !== undefined ? { valeurRemise: d.valeurRemise } : {}),
      ...(d.dateDebut !== undefined ? { dateDebut: new Date(d.dateDebut) } : {}),
      ...(d.dateFin !== undefined ? { dateFin: d.dateFin ? new Date(d.dateFin) : null } : {}),
    },
    select: offreSelect,
  });
  res.json(updated);
});

// DELETE /offres/:id
router.delete('/offres/:id', async (req, res) => {
  const commerce = await ownedCommerce(req.user!.sub);
  const offre = await prisma.offre.findUnique({ where: { id: req.params.id } });
  if (!commerce || !offre || offre.commerceId !== commerce.id) {
    res.status(404).json({ error: 'Offre introuvable' });
    return;
  }
  try {
    await prisma.offre.delete({ where: { id: req.params.id } });
  } catch {
    // Offre liée à des passages : désactivation logique
    await prisma.offre.update({ where: { id: req.params.id }, data: { estActive: false } });
  }
  res.status(204).end();
});

// PATCH /commerce — édition des infos du commerce
const commerceSchema = z.object({
  nom: z.string().min(1),
  description: z.string(),
  adresse: z.string().min(1),
  telephone: z.string(),
  siteWeb: z.string(),
}).partial();

router.patch('/commerce', async (req, res) => {
  const parsed = commerceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const commerce = await ownedCommerce(req.user!.sub);
  if (!commerce) {
    res.status(404).json({ error: 'Commerce introuvable' });
    return;
  }
  const updated = await prisma.commerce.update({
    where: { id: commerce.id },
    data: parsed.data,
    select: { id: true, nom: true, description: true, adresse: true, telephone: true, siteWeb: true, estValide: true },
  });
  res.json(updated);
});

// ─── POST /scan ───────────────────────────────────────────────────────────────
const scanSchema = z.object({
  qrToken: z.string().min(1),
  offreId: z.string().uuid().optional(),
});

interface QrPayload {
  sub: string;
  carte: string;
  type: string;
}

const ERROR_STATUS: Record<string, number> = {
  COMMERCE_NOT_FOUND: 403,
  COMMERCE_NOT_VALIDATED: 403,
  ETUDIANT_INVALIDE: 400,
  CARTE_MISMATCH: 400,
  OFFRE_INVALIDE: 400,
};

const ERROR_MSG: Record<string, string> = {
  COMMERCE_NOT_FOUND: 'Commerce introuvable',
  COMMERCE_NOT_VALIDATED: 'Commerce non validé par l\'admin',
  ETUDIANT_INVALIDE: 'Étudiant invalide ou inactif',
  CARTE_MISMATCH: 'Numéro de carte non concordant',
  OFFRE_INVALIDE: 'Offre invalide ou non rattachée à ce commerce',
};

router.post('/scan', async (req, res) => {
  const parsed = scanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { qrToken, offreId } = parsed.data;

  // Anti-rejeu : vérification signature JWT + expiration intégrée
  let qrPayload: QrPayload;
  try {
    qrPayload = jwt.verify(qrToken, process.env.JWT_SECRET!) as QrPayload;
    if (qrPayload.type !== 'QR') throw new Error('type_mismatch');
  } catch {
    res.status(400).json({ error: 'QR invalide ou expiré' });
    return;
  }

  try {
    const passage = await prisma.$transaction(async (tx) => {
      // Vérification commerce rattaché au commercant connecté
      const commerce = await tx.commerce.findUnique({
        where: { proprietaireId: req.user!.sub },
      });
      if (!commerce) throw new Error('COMMERCE_NOT_FOUND');
      if (!commerce.estValide) throw new Error('COMMERCE_NOT_VALIDATED');

      // Vérification étudiant valide
      const etudiant = await tx.user.findUnique({ where: { id: qrPayload.sub } });
      if (!etudiant || etudiant.role !== 'ETUDIANT' || !etudiant.isActif) {
        throw new Error('ETUDIANT_INVALIDE');
      }
      if (etudiant.numeroCarte !== qrPayload.carte) throw new Error('CARTE_MISMATCH');

      // Vérification ownership offre ↔ commerce du commercant
      if (offreId) {
        const offre = await tx.offre.findUnique({ where: { id: offreId } });
        if (!offre || offre.commerceId !== commerce.id || !offre.estActive) {
          throw new Error('OFFRE_INVALIDE');
        }
      }

      return tx.passageHistorique.create({
        data: {
          etudiantId: etudiant.id,
          commerceId: commerce.id,
          offreId: offreId ?? null,
          valideParId: req.user!.sub,
        },
        include: {
          etudiant: { select: { prenom: true, nom: true, numeroCarte: true } },
        },
      });
    });

    // Journalisation audit transactionnelle
    console.info('[AUDIT][SCAN]', JSON.stringify({
      passageId: passage.id,
      etudiantId: passage.etudiantId,
      commerceId: passage.commerceId,
      offreId: passage.offreId,
      valideParId: passage.valideParId,
      scanneLe: passage.scanneLe.toISOString(),
    }));

    res.status(201).json({
      passage: { id: passage.id, scanneLe: passage.scanneLe, offreId: passage.offreId },
      etudiant: passage.etudiant,
    });
  } catch (err: unknown) {
    const code = (err as Error).message;
    const status = ERROR_STATUS[code] ?? 500;
    res.status(status).json({ error: ERROR_MSG[code] ?? 'Erreur serveur' });
  }
});

export default router;
