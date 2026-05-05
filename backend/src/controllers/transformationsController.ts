import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Lister toutes les transformations (historique)
export const getAll = async (req: Request, res: Response) => {
  try {
    const { userId, recetteId, startDate, endDate } = req.query;

    const where: any = {};

    if (userId) {
      where.userId = userId as string;
    }

    if (recetteId) {
      where.recetteId = recetteId as string;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const transformations = await prisma.transformation.findMany({
      where,
      include: {
        recette: {
          include: {
            matierePremiere: true,
            produitFini: true,
          },
        },
        user: {
          select: { id: true, nom: true, email: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(transformations);
  } catch (error) {
    console.error('Erreur liste transformations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des transformations' });
  }
};

// Obtenir une transformation par ID
export const getById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const transformation = await prisma.transformation.findUnique({
      where: { id },
      include: {
        recette: {
          include: {
            matierePremiere: true,
            produitFini: true,
          },
        },
        user: {
          select: { id: true, nom: true, email: true },
        },
      },
    });

    if (!transformation) {
      return res.status(404).json({ error: 'Transformation non trouvée' });
    }

    res.json(transformation);
  } catch (error) {
    console.error('Erreur récupération transformation:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la transformation' });
  }
};

// Créer une transformation (enregistrer résultat)
export const create = async (req: Request, res: Response) => {
  try {
    const { 
      quantiteMP, 
      quantitePF, 
      perteReelle, 
      pertePercent,
      observations, 
      userId, 
      recetteId,
      dateFabrication,
      dateExpiration,
      dureeConservation 
    } = req.body;

    // Validation
    if (!quantiteMP || !quantitePF || !userId || !recetteId) {
      return res.status(400).json({
        error: 'Quantité MP, quantité PF, userId et recetteId sont requis',
      });
    }

    // Vérifier si la recette existe
    const recette = await prisma.recetteTransformation.findUnique({
      where: { id: recetteId },
      include: {
        matierePremiere: true,
      },
    });

    if (!recette) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }

    // Calculer le rendement théorique
    const rendementTheorique = (quantiteMP * recette.rendementPercent) / 100;

    // Calculer la perte théorique
    const perteTheorique = quantiteMP * (recette.pertePercent / 100);
    
    // Calculer le pourcentage de perte réelle
    const pertePercentCalc = perteReelle ? ((perteReelle / quantiteMP) * 100) : perteTheorique;

    // Calculer le rendement réel
    const rendementReel = ((quantitePF / quantiteMP) * 100).toFixed(2);
    
    // Calculer la date d'expiration si durée de conservation fournie
    let calculatedDateExpiration = dateExpiration ? new Date(dateExpiration) : null;
    if (dureeConservation && !calculatedDateExpiration) {
      const dateFab = dateFabrication ? new Date(dateFabrication) : new Date();
      calculatedDateExpiration = new Date(dateFab.setDate(dateFab.getDate() + parseInt(dureeConservation)));
    }

    // Créer la transformation
    const transformation = await prisma.transformation.create({
      data: {
        quantiteMP: parseFloat(quantiteMP),
        quantitePF: parseFloat(quantitePF),
        perteReelle: perteReelle ? parseFloat(perteReelle) : perteTheorique,
        pertePercent: pertePercent || pertePercentCalc,
        observations: observations?.trim(),
        userId,
        recetteId,
        dateFabrication: dateFabrication ? new Date(dateFabrication) : new Date(),
        dateExpiration: calculatedDateExpiration,
        dureeConservation: dureeConservation ? parseInt(dureeConservation) : null,
        statut: 'termine',
      },
      include: {
        recette: {
          include: {
            matierePremiere: true,
            produitFini: true,
          },
        },
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
      message: 'Transformation enregistrée avec succès',
      transformation,
      rendementReel: parseFloat(rendementReel),
      rendementTheorique,
      pertePercent: pertePercentCalc,
      dateExpiration: calculatedDateExpiration,
    });
  } catch (error) {
    console.error('Erreur création transformation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la transformation' });
  }
};

// Mettre à jour une transformation
export const update = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { quantitePF, perteReelle, observations } = req.body;

    // Vérifier si la transformation existe
    const existing = await prisma.transformation.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transformation non trouvée' });
    }

    const transformation = await prisma.transformation.update({
      where: { id },
      data: {
        ...(quantitePF && { quantitePF: parseFloat(quantitePF) }),
        ...(perteReelle !== undefined && { perteReelle: parseFloat(perteReelle) }),
        ...(observations !== undefined && { observations: observations?.trim() }),
      },
      include: {
        recette: true,
        user: true,
      },
    });

    res.json({
      message: 'Transformation mise à jour avec succès',
      transformation,
    });
  } catch (error) {
    console.error('Erreur modification transformation:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de la transformation' });
  }
};

// Supprimer une transformation
export const deleteOne = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Vérifier si la transformation existe
    const existing = await prisma.transformation.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transformation non trouvée' });
    }

    await prisma.transformation.delete({
      where: { id },
    });

    res.json({ message: 'Transformation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression transformation:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la transformation' });
  }
};

// Statistiques de production
export const getStatsProduction = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, userId } = req.query;

    const where: any = {};

    if (userId) {
      where.userId = userId as string;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    // Nombre total de transformations
    const totalTransformations = await prisma.transformation.count({ where });

    // Quantité totale de matière première utilisée
    const totalMP = await prisma.transformation.aggregate({
      where,
      _sum: { quantiteMP: true },
    });

    // Quantité totale de produit fini obtenu
    const totalPF = await prisma.transformation.aggregate({
      where,
      _sum: { quantitePF: true },
    });

    // Perte totale
    const totalPerte = await prisma.transformation.aggregate({
      where,
      _sum: { perteReelle: true },
    });

    // Rendement moyen
    const transformations = await prisma.transformation.findMany({
      where,
      select: {
        quantiteMP: true,
        quantitePF: true,
      },
    });

    let rendementMoyen = 0;
    if (transformations.length > 0) {
      const totalQuantiteMP = transformations.reduce((acc, t) => acc + t.quantiteMP, 0);
      const totalQuantitePF = transformations.reduce((acc, t) => acc + t.quantitePF, 0);
      rendementMoyen = totalQuantiteMP > 0 ? (totalQuantitePF / totalQuantiteMP) * 100 : 0;
    }

    res.json({
      totalTransformations,
      totalMP: totalMP._sum.quantiteMP || 0,
      totalPF: totalPF._sum.quantitePF || 0,
      totalPerte: totalPerte._sum.perteReelle || 0,
      rendementMoyen: rendementMoyen.toFixed(2),
      periode: {
        startDate: startDate || 'N/A',
        endDate: endDate || 'N/A',
      },
    });
  } catch (error) {
    console.error('Erreur statistiques production:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

// Statistiques des rendements par recette
export const getStatsRendements = async (req: Request, res: Response) => {
  try {
    const recettes = await prisma.recetteTransformation.findMany({
      include: {
        transformations: true,
        matierePremiere: true,
        produitFini: true,
      },
    });

    const stats = recettes.map((recette) => {
      const transformations = recette.transformations;

      if (transformations.length === 0) {
        return {
          recetteId: recette.id,
          recetteNom: recette.nom,
          matierePremiere: recette.matierePremiere.nom,
          produitFini: recette.produitFini.nom,
          rendementTheorique: recette.rendementPercent,
          totalTransformations: 0,
          rendementMoyenReel: 0,
          ecartRendement: 0,
        };
      }

      const totalMP = transformations.reduce((acc, t) => acc + t.quantiteMP, 0);
      const totalPF = transformations.reduce((acc, t) => acc + t.quantitePF, 0);
      const rendementMoyenReel = totalMP > 0 ? (totalPF / totalMP) * 100 : 0;

      return {
        recetteId: recette.id,
        recetteNom: recette.nom,
        matierePremiere: recette.matierePremiere.nom,
        produitFini: recette.produitFini.nom,
        rendementTheorique: recette.rendementPercent,
        totalTransformations: transformations.length,
        rendementMoyenReel: parseFloat(rendementMoyenReel.toFixed(2)),
        ecartRendement: parseFloat((recette.rendementPercent - rendementMoyenReel).toFixed(2)),
      };
    });

    res.json(stats);
  } catch (error) {
    console.error('Erreur statistiques rendements:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques de rendements' });
  }
};

// Marquer une transformation comme perdue
export const markAsLost = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { perteReelle, observations } = req.body;

const existingTransformation = await prisma.transformation.findUnique({ where: { id } });
if (!existingTransformation) {
return res.status(404).json({ error: 'Transformation non trouvée' });
}

const transformation = await prisma.transformation.update({
where: { id },
data: {
perteReelle: perteReelle || existingTransformation.perteReelle,
observations: observations ? `${existingTransformation.observations}\n${observations}` : existingTransformation.observations,
statut: 'perdu',
},
      include: {
        recette: true,
        user: true,
      },
    });

    res.json({
      message: 'Transformation marquée comme perdue',
      transformation,
    });
  } catch (error) {
    console.error('Erreur markAsLost:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

// Changer le statut d'une transformation
export const updateStatut = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { statut } = req.body;

    if (!['en_cours', 'termine', 'expire', 'perdu'].includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const transformation = await prisma.transformation.update({
      where: { id },
      data: { statut },
    });

    res.json({
      message: `Statut mis à jour: ${statut}`,
      transformation,
    });
  } catch (error) {
    console.error('Erreur updateStatut:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

// Vérifier les transformations expirées
export const checkExpired = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const expired = await prisma.transformation.findMany({
      where: {
        dateExpiration: {
          lte: now,
        },
        statut: {
          not: 'expire',
        },
      },
      include: {
        recette: true,
        user: true,
      },
    });

    // Mettre à jour le statut de toutes les transformations expirées
    await prisma.transformation.updateMany({
      where: {
        dateExpiration: {
          lte: now,
        },
        statut: {
          not: 'expire',
        },
      },
      data: {
        statut: 'expire',
      },
    });

    res.json({
      message: `${expired.length} transformation(s) expirée(s) trouvée(s)`,
      expired,
    });
  } catch (error) {
    console.error('Erreur checkExpired:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification des transformations expirées' });
  }
};

// Obtenir les transformations avec dates
export const getByDates = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    const where: any = {};
    
    if (type === 'fabrication') {
      if (startDate) where.dateFabrication = { gte: new Date(startDate as string) };
      if (endDate) {
        if (where.dateFabrication) {
          where.dateFabrication.lte = new Date(endDate as string);
        } else {
          where.dateFabrication = { lte: new Date(endDate as string) };
        }
      }
    } else if (type === 'expiration') {
      if (startDate) where.dateExpiration = { gte: new Date(startDate as string) };
      if (endDate) {
        if (where.dateExpiration) {
          where.dateExpiration.lte = new Date(endDate as string);
        } else {
          where.dateExpiration = { lte: new Date(endDate as string) };
        }
      }
    }

    const transformations = await prisma.transformation.findMany({
      where,
      include: {
        recette: true,
        user: true,
      },
      orderBy: { date: 'desc' },
    });

    res.json(transformations);
  } catch (error) {
    console.error('Erreur getByDates:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des transformations par dates' });
  }
};
