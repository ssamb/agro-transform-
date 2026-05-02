import { Router } from 'express';
import * as matieresPremieresController from '../controllers/matieresPremieresController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Routes publiques (lecture)
router.get('/', matieresPremieresController.getAll);
router.get('/:id', matieresPremieresController.getById);

// Routes protégées (écriture)
router.post('/', authenticate, authorize('ADMIN', 'TRANSFORMATEUR', 'FORMATEUR'), matieresPremieresController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'TRANSFORMATEUR', 'FORMATEUR'), matieresPremieresController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), matieresPremieresController.deleteOne);
router.patch('/:id/stock', authenticate, authorize('ADMIN', 'TRANSFORMATEUR'), matieresPremieresController.updateStock);

export default router;
