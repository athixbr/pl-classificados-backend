import express from 'express';
import { getAdminStats, getUserStats, getAgencyStats } from '../controllers/statsController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Admin stats
router.get('/admin', authenticate, authorizeRoles('admin'), getAdminStats);

// User stats
router.get('/user', authenticate, getUserStats);

// Agency stats
router.get('/agency', authenticate, authorizeRoles('agency'), getAgencyStats);

export default router;
