import { Router } from 'express';
import authRoutes from './authRoutes';
import matieresPremieresRoutes from './matieresPremieresRoutes';
import produitsFinisRoutes from './produitsFinisRoutes';
import recettesRoutes from './recettesRoutes';
import transformationsRoutes from './transformationsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/matieres-premieres', matieresPremieresRoutes);
router.use('/produits-finis', produitsFinisRoutes);
router.use('/recettes', recettesRoutes);
router.use('/transformations', transformationsRoutes);

export default router;
