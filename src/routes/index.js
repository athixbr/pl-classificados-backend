import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import listingRoutes from './listingRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import cityRoutes from './cityRoutes.js';
import planRoutes from './planRoutes.js';
import statsRoutes from './statsRoutes.js';
import reportRoutes from './reportRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/listings', listingRoutes);
router.use('/categories', categoryRoutes);
router.use('/cities', cityRoutes);
router.use('/plans', planRoutes);
router.use('/stats', statsRoutes);
router.use('/reports', reportRoutes);
router.use('/subscriptions', subscriptionRoutes);

export default router;
