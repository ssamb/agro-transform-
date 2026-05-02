import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Lister toutes les recettes avec filtres
export const getAll = async (req: Request, res: Response) => {
  try {
    const { matierePremiereId, produitFiniId, userId } = req.query;

    const where: any = {};

    if (matierePremiereId) {
      where.matierePremiereId = matierePremiereId as string;
    }

    if (produitFiniId) {
      where.produitFiniId = produitFiniId as string;
    }

    if (userId) {
      where.userId = userId as string;
    }

    const recettes = await prisma.recetteTransformation.findMany({
      where,
      include: {
        matierePremiere: true,
        produitFini: true,
        user: {
          select: { id: true, nom: true, email: true },
        },
        etapes: {
          orderBy: { numero: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(recettes);
  } catch (error) {
    console.error('Erreur liste recettes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des recettes' });
  }
};

// Créer une recette avec étapes
export const create = async (req: Request, res: Response) => {
  try {
    const {
      nom,
      description,
      rendementPercent,
      dureeTotale,
      pertePercent,
      matierePremiereId,
      produitFiniId,
      userId,
      etapes,
    } = req.body;

    // Validation
    if (!nom || !rendementPercent || !matierePremiereId || !produitFiniId || !userId) {
      return res.status(400).json({
        error: 'Nom, rendement, matière première, produit fini et userId sont requis',
      });
    }

    const recette = await prisma.recetteTransformation.create({
      data: {
        nom: nom.trim(),
        description: description?.trim(),
        rendementPercent: parseFloat(rendementPercent),
        dureeTotale: dureeTotale ? parseInt(dureeTotale) : null,
        pertePercent: pertePercent ? parseFloat(pertePercent) : 0,
        matierePremiereId,
        produitFiniId,
        userId,
        etapes: etapes ? {
          create: etapes.map((etape: any, index: number) => ({
            numero: index + 1,
            description: etape.description?.trim() || '',
            duree: etape.duree ? parseInt(etape.duree) : null,
          })),
        } : undefined,
      },
      include: {
        matierePremiere: true,
        produitFini: true,
        etapes: true,
      },
    });

    res.status(201).json({
      message: 'Recette créée avec succès',
      recette,
    });
  } catch (error) {
    console.error('Erreur création recette:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la recette' });
  }
};

// Obtenir une recette par ID
export const getById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const recette = await prisma.recetteTransformation.findUnique({
      where: { id },
      include: {
        matierePremiere: true,
        produitFini: true,
        user: {
          select: { id: true, nom: true, email: true },
        },
        etapes: {
          orderBy: { numero: 'asc' },
        },
        transformations: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
    });

    if (!recette) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }

    res.json(recette);
  } catch (error) {
    console.error('Erreur récupération recette:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la recette' });
  }
};

// Modifier une recette
export const update = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const {
      nom,
      description,
      rendementPercent,
      dureeTotale,
      pertePercent,
      etapes,
    } = req.body;

    // Vérifier si la recette existe
    const existing = await prisma.recetteTransformation.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }

    const recette = await prisma.recetteTransformation.update({
      where: { id },
      data: {
        ...(nom && { nom: nom.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(rendementPercent && { rendementPercent: parseFloat(rendementPercent) }),
        ...(dureeTotale !== undefined && { dureeTotale: parseInt(dureeTotale) }),
        ...(pertePercent !== undefined && { pertePercent: parseFloat(pertePercent) }),
      },
      include: {
        matierePremiere: true,
        produitFini: true,
        etapes: true,
      },
    });

    // Mettre à jour les étapes si fournies
    if (etapes && Array.isArray(etapes)) {
      await prisma.etape.deleteMany({
        where: { recetteId: id },
      });

      await prisma.etape.createMany({
        data: etapes.map((etape: any, index: number) => ({
          numero: index + 1,
          description: etape.description?.trim() || '',
          duree: etape.duree ? parseInt(etape.duree) : null,
          recetteId: id,
        })),
      });
    }

    res.json({
      message: 'Recette modifiée avec succès',
      recette,
    });
  } catch (error) {
    console.error('Erreur modification recette:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de la recette' });
  }
};

// Supprimer une recette
export const deleteOne = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Vérifier si la recette existe
    const existing = await prisma.recetteTransformation.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }

    await prisma.recetteTransformation.delete({
      where: { id },
    });

    res.json({ message: 'Recette supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression recette:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la recette' });
  }
};

// Lancer une transformation
export const transformer = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { quantiteMP, observations, userId } = req.body;

    if (!quantiteMP || !userId) {
      return res.status(400).json({
        error: 'Quantité de matière première et userId sont requis',
      });
    }

    // Récupérer la recette
    const recette = await prisma.recetteTransformation.findUnique({
      where: { id },
      include: {
        matierePremiere: true,
        produitFini: true,
      },
    });

    if (!recette) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }

    // Calculer le rendement théorique
    const rendementTheorique = (quantiteMP * recette.rendementPercent) / 100;

    // Calculer les pertes théoriques
    const perteTheorique = quantiteMP * (recette.pertePercent / 100);

    // Créer la transformation
    const transformation = await prisma.transformation.create({
      data: {
        quantiteMP: parseFloat(quantiteMP),
        quantitePF: rendementTheorique,
        perteReelle: perteTheorique,
        observations: observations?.trim(),
        userId,
        recetteId: id,
      },
      include: {
        recette: true,
        user: true,
      },
    });

    // Mettre à jour le stock de matière première
    await prisma.matierePremiere.update({
      where: { id: recette.matierePremiereId },
      data: {
        stock: {
          decrement: quantiteMP,
        },
      },
    });

    res.status(201).json({
      message: 'Transformation lancée avec succès',
      transformation,
      rendementTheorique,
      perteTheorique,
    });
  } catch (error) {
    console.error('Erreur lancement transformation:', error);
    res.status(500).json({ error: 'Erreur lors du lancement de la transformation' });
  }
};

// Calculer le rendement théorique
export const calculerRendement = async (req: Request, res: Response) => {
  try {
    const quantiteMP = req.query.quantiteMP as string;
    const recetteId = req.query.recetteId as string;

    if (!quantiteMP || !recetteId) {
      return res.status(400).json({
        error: 'Quantité de matière première et recetteId sont requis',
      });
    }

    const recette = await prisma.recetteTransformation.findUnique({
      where: { id: recetteId },
    });

    if (!recette) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }

    const rendementTheorique = (parseFloat(quantiteMP) * recette.rendementPercent) / 100;
    const perteTheorique = parseFloat(quantiteMP) * (recette.pertePercent / 100);

    res.json({
      quantiteMP: parseFloat(quantiteMP),
      rendementTheorique,
      perteTheorique,
      rendementPercent: recette.rendementPercent,
      pertePercent: recette.pertePercent,
    });
  } catch (error) {
    console.error('Erreur calcul rendement:', error);
    res.status(500).json({ error: 'Erreur lors du calcul du rendement' });
  }
};
