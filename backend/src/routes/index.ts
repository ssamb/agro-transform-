import { Router } from 'express';
import authRoutes from './authRoutes';
import matieresPremieresRoutes from './matieresPremieresRoutes';
import produitsFinisRoutes from './produitsFinisRoutes';
import recettesRoutes from './recettesRoutes';
import transformationsRoutes from './transformationsRoutes';
import exportImportRoutes from './exportImportRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/matieres-premieres', matieresPremieresRoutes);
router.use('/produits-finis', produitsFinisRoutes);
router.use('/recettes', recettesRoutes);
router.use('/transformations', transformationsRoutes);
router.use('/data', exportImportRoutes);

export default router;
