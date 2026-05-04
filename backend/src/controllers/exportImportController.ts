import { Request, Response } from 'express';
import { exportData, importPreview, importData } from '../utils/exportImport';

// Controller wrapper pour l'export
export const handleExport = async (req: Request, res: Response) => {
  return exportData(req, res);
};

// Controller wrapper pour la preview d'import
export const handleImportPreview = async (req: Request, res: Response) => {
  return importPreview(req, res);
};

// Controller wrapper pour l'import
export const handleImport = async (req: Request, res: Response) => {
  return importData(req, res);
};
