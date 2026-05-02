import { Router } from 'express';
import * as recettesController from '../controllers/recettesController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Routes publiques (lecture)
router.get('/', recettesController.getAll);
router.get('/:id', recettesController.getById);

// Routes protégées (écriture)
router.post('/', authenticate, authorize('ADMIN', 'TRANSFORMATEUR', 'FORMATEUR'), recettesController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'TRANSFORMATEUR', 'FORMATEUR'), recettesController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), recettesController.deleteOne);

// Routes pour les transformations
router.post('/:id/transformer', authenticate, authorize('ADMIN', 'TRANSFORMATEUR'), recettesController.transformer);
router.get('/calculatorendement', recettesController.calculerRendement);

export default router;
