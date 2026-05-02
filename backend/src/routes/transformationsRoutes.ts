import { Router } from 'express';
import * as transformationsController from '../controllers/transformationsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Routes publiques (lecture)
router.get('/', transformationsController.getAll);
router.get('/:id', transformationsController.getById);

// Routes protégées (écriture)
router.post('/', authenticate, authorize('ADMIN', 'TRANSFORMATEUR'), transformationsController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'TRANSFORMATEUR'), transformationsController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), transformationsController.deleteOne);

// Statistiques
router.get('/stats/production', transformationsController.getStatsProduction);
router.get('/stats/rendements', transformationsController.getStatsRendements);

export default router;
