import { Router } from 'express';
import * as produitsFinisController from '../controllers/produitsFinisController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Routes publiques (lecture)
router.get('/', produitsFinisController.getAll);
router.get('/:id', produitsFinisController.getById);

// Routes protégées (écriture)
router.post('/', authenticate, authorize('ADMIN', 'TRANSFORMATEUR', 'FORMATEUR'), produitsFinisController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'TRANSFORMATEUR', 'FORMATEUR'), produitsFinisController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), produitsFinisController.deleteOne);

export default router;
