import { Request, Response } from 'express';
import prisma from './prisma';
import ExcelJS from 'exceljs';

// Types pour l'export
interface ExportData {
  entity: string;
  format: 'json' | 'csv';
  data: any[];
}

// Parser CSV simple
const parseToCSV = (data: any[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(item => 
    headers.map(header => {
      const value = item[header];
      // Échapper les guillemets et entourer de guillemets si nécessaire
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')
        ? `"${escaped}"`
        : escaped;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
};

// Parser CSV vers objet
const parseFromCSV = (csv: string, entityType: string): any[] => {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:([^"]*"){2})*[^"]*$)/); // Split en respectant les guillemets
    const obj: any = {};
    
    headers.forEach((header, index) => {
      let value = values[index]?.trim() || '';
      // Retirer les guillemets
      value = value.replace(/^"|"$/g, '').replace(/""/g, '"');
      
      // Conversion de type
      if (value === 'true') obj[header] = true;
      else if (value === 'false') obj[header] = false;
      else if (/^\d+$/.test(value)) obj[header] = parseInt(value, 10);
      else if (/^\d+\.\d+$/.test(value)) obj[header] = parseFloat(value);
      else obj[header] = value;
    });
    
    return obj;
  });
};

// Validation des données importées
const validateEntityData = (data: any, entityType: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  switch (entityType) {
    case 'matieres-premieres':
      if (!data.nom || typeof data.nom !== 'string') errors.push('nom requis (string)');
      if (!data.categorie || typeof data.categorie !== 'string') errors.push('catégorie requise (string)');
      if (!data.unite || typeof data.unite !== 'string') errors.push('unité requise (string)');
      if (data.stock !== undefined && typeof data.stock !== 'number') errors.push('stock doit être un nombre');
      break;
    case 'produits-finis':
      if (!data.nom || typeof data.nom !== 'string') errors.push('nom requis (string)');
      if (!data.categorie || typeof data.categorie !== 'string') errors.push('catégorie requise (string)');
      if (!data.unite || typeof data.unite !== 'string') errors.push('unité requise (string)');
      break;
    case 'recettes':
      if (!data.nom || typeof data.nom !== 'string') errors.push('nom requis (string)');
      if (!data.matierePremiereId || typeof data.matierePremiereId !== 'string') errors.push('matierePremiereId requis');
      if (!data.produitFiniId || typeof data.produitFiniId !== 'string') errors.push('produitFiniId requis');
      if (!data.userId || typeof data.userId !== 'string') errors.push('userId requis');
      if (data.rendementPercent === undefined || typeof data.rendementPercent !== 'number') errors.push('rendementPercent requis (number)');
      break;
    case 'transformations':
      if (!data.recetteId || typeof data.recetteId !== 'string') errors.push('recetteId requis');
      if (!data.userId || typeof data.userId !== 'string') errors.push('userId requis');
      if (data.quantiteMP === undefined || typeof data.quantiteMP !== 'number') errors.push('quantiteMP requis (number)');
      if (data.quantitePF === undefined || typeof data.quantitePF !== 'number') errors.push('quantitePF requis (number)');
      break;
    default:
      errors.push(`Entity type inconnu: ${entityType}`);
  }
  
  return { valid: errors.length === 0, errors };
};

// Exporter les données
export const exportData = async (req: Request, res: Response) => {
  try {
    const { entity, format = 'json' } = req.query;
    const entityType = entity as string;
    
    if (!entityType) {
      return res.status(400).json({ error: 'Paramètre "entity" requis (matieres-premieres, produits-finis, recettes, transformations)' });
    }
    
    let data: any[] = [];
    
    switch (entityType) {
      case 'matieres-premieres':
        data = await prisma.matierePremiere.findMany();
        break;
      case 'produits-finis':
        data = await prisma.produitFini.findMany();
        break;
      case 'recettes':
        data = await prisma.recetteTransformation.findMany({ include: { matierePremiere: true, produitFini: true } });
        break;
      case 'transformations':
        data = await prisma.transformation.findMany({ include: { recette: true, user: true } });
        break;
      default:
        return res.status(400).json({ error: 'Entity type non supporté' });
    }
    
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${entityType}-${dateStr}`;
    
    if (format === 'csv') {
      const csv = parseToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csv);
    } else if (format === 'xlsx') {
      // Export Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');
      
      if (data.length > 0) {
        // Headers
        const headers = Object.keys(data[0]).filter(key => !key.includes('Id'));
        worksheet.columns = headers.map(header => ({
          header: header.charAt(0).toUpperCase() + header.slice(1),
          key: header,
          width: 20
        }));
        
        // Rows
        data.forEach(item => {
          const row: any = {};
          headers.forEach(header => {
            row[header] = item[header];
          });
          worksheet.addRow(row);
        });
      }
      
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      
      await workbook.xlsx.write(res);
      return res.end();
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.json(data);
    }
  } catch (error) {
    console.error('Erreur export:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export des données' });
  }
};

// Import preview (valide sans écrire)
export const importPreview = async (req: Request, res: Response) => {
  try {
    const entity = Array.isArray(req.params.entity) ? req.params.entity[0] : req.params.entity;
    const { data } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Données invalides' });
    }
    
    const errors: any[] = [];
    const validData: any[] = [];
    
    data.forEach((item, index) => {
      const validation = validateEntityData(item, entity);
      if (validation.valid) {
        validData.push(item);
      } else {
        errors.push({ row: index + 1, errors: validation.errors });
      }
    });
    
    res.json({
      total: data.length,
      valid: validData.length,
      invalid: errors.length,
      errors,
      preview: validData.slice(0, 5), // Premieres 5 lignes valides
    });
  } catch (error) {
    console.error('Erreur preview import:', error);
    res.status(500).json({ error: 'Erreur lors de la prévisualisation' });
  }
};

// Importer les données
export const importData = async (req: Request, res: Response) => {
  try {
    const entity = Array.isArray(req.params.entity) ? req.params.entity[0] : req.params.entity;
    const { data, format = 'json' } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Données invalides' });
    }
    
    // Validation préalable
    const validationErrors: any[] = [];
    data.forEach((item: any, index: number) => {
      const validation = validateEntityData(item, entity);
      if (!validation.valid) {
        validationErrors.push({ row: index + 1, errors: validation.errors });
      }
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Erreurs de validation',
        details: validationErrors,
      });
    }
    
    // Transaction Prisma pour atomicité
    const results = await prisma.$transaction(async (tx: any) => {
      const created: any[] = [];
      
      for (const item of data) {
        let result;
        
        switch (entity) {
          case 'matieres-premieres':
            result = await tx.matierePremiere.create({
              data: {
                nom: item.nom,
                categorie: item.categorie,
                unite: item.unite,
                stock: item.stock || 0,
                stockMin: item.stockMin || 0,
                stockMax: item.stockMax || 0,
              },
            });
            break;
          case 'produits-finis':
            result = await tx.produitFini.create({
              data: {
                nom: item.nom,
                categorie: item.categorie,
                unite: item.unite,
              },
            });
            break;
          case 'recettes':
            result = await tx.recetteTransformation.create({
              data: {
                nom: item.nom,
                description: item.description,
                rendementPercent: item.rendementPercent,
                dureeTotale: item.dureeTotale,
                pertePercent: item.pertePercent || 0,
                matierePremiereId: item.matierePremiereId,
                produitFiniId: item.produitFiniId,
                userId: item.userId,
              },
            });
            break;
          case 'transformations':
            result = await tx.transformation.create({
              data: {
                quantiteMP: item.quantiteMP,
                quantitePF: item.quantitePF,
                perteReelle: item.perteReelle || 0,
                pertePercent: item.pertePercent || 0,
                observations: item.observations,
                userId: item.userId,
                recetteId: item.recetteId,
                statut: item.statut || 'en_cours',
              },
            });
            break;
          default:
            throw new Error(`Entity type non supporté: ${entity}`);
        }
        
        created.push(result);
      }
      
      return created;
    });
    
    res.status(201).json({
      message: `${results.length} élément(s) importé(s) avec succès`,
      count: results.length,
      data: results,
    });
  } catch (error: any) {
    console.error('Erreur import:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'import des données',
      details: error.message,
    });
  }
};

export { parseFromCSV, parseToCSV, validateEntityData };
