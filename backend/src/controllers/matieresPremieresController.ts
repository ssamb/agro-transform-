import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Lister toutes les matières premières
export const getAll = async (req: Request, res: Response) => {
  try {
    const matieres = await prisma.matierePremiere.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(matieres);
  } catch (error) {
    console.error('Erreur liste matières premières:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des matières premières' });
  }
};

// Créer une matière première
export const create = async (req: Request, res: Response) => {
  try {
    const { nom, categorie, unite, stock, stockMin, stockMax } = req.body;

    // Validation
    if (!nom || !categorie || !unite) {
      return res.status(400).json({ error: 'Nom, catégorie et unité sont requis' });
    }

    // Vérifier si la matière première existe déjà
    const existing = await prisma.matierePremiere.findFirst({
      where: { nom: nom.trim() },
    });

    if (existing) {
      return res.status(409).json({ error: 'Cette matière première existe déjà' });
    }

    const matiere = await prisma.matierePremiere.create({
      data: {
        nom: nom.trim(),
        categorie,
        unite,
        stock: stock || 0,
        stockMin: stockMin || 0,
        stockMax: stockMax || 0,
      },
    });

    res.status(201).json({
      message: 'Matière première créée avec succès',
      matiere,
    });
  } catch (error) {
    console.error('Erreur création matière première:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la matière première' });
  }
};

// Obtenir une matière première par ID
export const getById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const matiere = await prisma.matierePremiere.findUnique({
      where: { id },
    });

    if (!matiere) {
      return res.status(404).json({ error: 'Matière première non trouvée' });
    }

    res.json(matiere);
  } catch (error) {
    console.error('Erreur récupération matière première:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la matière première' });
  }
};

// Modifier une matière première
export const update = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { nom, categorie, unite, stock, stockMin, stockMax } = req.body;

    // Vérifier si la matière première existe
    const existing = await prisma.matierePremiere.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Matière première non trouvée' });
    }

    const matiere = await prisma.matierePremiere.update({
      where: { id },
      data: {
        ...(nom && { nom: nom.trim() }),
        ...(categorie && { categorie }),
        ...(unite && { unite }),
        ...(stock !== undefined && { stock }),
        ...(stockMin !== undefined && { stockMin }),
        ...(stockMax !== undefined && { stockMax }),
      },
    });

    res.json({
      message: 'Matière première modifiée avec succès',
      matiere,
    });
  } catch (error) {
    console.error('Erreur modification matière première:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de la matière première' });
  }
};

// Supprimer une matière première
export const deleteOne = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Vérifier si la matière première existe
    const existing = await prisma.matierePremiere.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Matière première non trouvée' });
    }

    await prisma.matierePremiere.delete({
      where: { id },
    });

    res.json({ message: 'Matière première supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression matière première:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la matière première' });
  }
};

// Mettre à jour le stock
export const updateStock = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { stock, operation } = req.body;

    const matiere = await prisma.matierePremiere.findUnique({
      where: { id },
    });

    if (!matiere) {
      return res.status(404).json({ error: 'Matière première non trouvée' });
    }

    let newStock = stock !== undefined ? stock : matiere.stock;
    
    if (operation) {
      newStock = operation.type === 'add' 
        ? matiere.stock + operation.quantity 
        : matiere.stock - operation.quantity;
    }

    const updated = await prisma.matierePremiere.update({
      where: { id },
      data: { stock: newStock },
    });

    res.json({
      message: 'Stock mis à jour avec succès',
      matiere: updated,
    });
  } catch (error) {
    console.error('Erreur mise à jour stock:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du stock' });
  }
};
