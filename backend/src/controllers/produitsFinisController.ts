import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Lister tous les produits finis
export const getAll = async (req: Request, res: Response) => {
  try {
    const produits = await prisma.produitFini.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(produits);
  } catch (error) {
    console.error('Erreur liste produits finis:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits finis' });
  }
};

// Créer un produit fini
export const create = async (req: Request, res: Response) => {
  try {
    const { nom, categorie, unite } = req.body;

    // Validation
    if (!nom || !categorie || !unite) {
      return res.status(400).json({ error: 'Nom, catégorie et unité sont requis' });
    }

    // Vérifier si le produit fini existe déjà
    const existing = await prisma.produitFini.findFirst({
      where: { nom: nom.trim() },
    });

    if (existing) {
      return res.status(409).json({ error: 'Ce produit fini existe déjà' });
    }

    const produit = await prisma.produitFini.create({
      data: {
        nom: nom.trim(),
        categorie,
        unite,
      },
    });

    res.status(201).json({
      message: 'Produit fini créé avec succès',
      produit,
    });
  } catch (error) {
    console.error('Erreur création produit fini:', error);
    res.status(500).json({ error: 'Erreur lors de la création du produit fini' });
  }
};

// Obtenir un produit fini par ID
export const getById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const produit = await prisma.produitFini.findUnique({
      where: { id },
    });

    if (!produit) {
      return res.status(404).json({ error: 'Produit fini non trouvé' });
    }

    res.json(produit);
  } catch (error) {
    console.error('Erreur récupération produit fini:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du produit fini' });
  }
};

// Modifier un produit fini
export const update = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { nom, categorie, unite } = req.body;

    // Vérifier si le produit fini existe
    const existing = await prisma.produitFini.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Produit fini non trouvé' });
    }

    const produit = await prisma.produitFini.update({
      where: { id },
      data: {
        ...(nom && { nom: nom.trim() }),
        ...(categorie && { categorie }),
        ...(unite && { unite }),
      },
    });

    res.json({
      message: 'Produit fini modifié avec succès',
      produit,
    });
  } catch (error) {
    console.error('Erreur modification produit fini:', error);
    res.status(500).json({ error: 'Erreur lors de la modification du produit fini' });
  }
};

// Supprimer un produit fini
export const deleteOne = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Vérifier si le produit fini existe
    const existing = await prisma.produitFini.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Produit fini non trouvé' });
    }

    await prisma.produitFini.delete({
      where: { id },
    });

    res.json({ message: 'Produit fini supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression produit fini:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit fini' });
  }
};
