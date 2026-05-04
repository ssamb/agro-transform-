import { Router } from 'express';
import { handleExport, handleImportPreview, handleImport } from '../controllers/exportImportController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Routes d'export (lecture - requis authentification)
router.get('/export', authenticate, handleExport);

// Routes d'import (écriture - admin requis)
router.post('/import/:entity/preview', authenticate, authorize('ADMIN', 'TRANSFORMATEUR', 'FORMATEUR'), handleImportPreview);
router.post('/import/:entity', authenticate, authorize('ADMIN', 'TRANSFORMATEUR'), handleImport);

export default router;
