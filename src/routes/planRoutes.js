import express from 'express';
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
} from '../controllers/planController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Rotas públicas
router.get('/', getPlans);
router.get('/:identifier', getPlanById);

// Rotas privadas (Admin)
router.post('/', authenticate, authorizeRoles('admin'), createPlan);
router.put('/:id', authenticate, authorizeRoles('admin'), updatePlan);
router.delete('/:id', authenticate, authorizeRoles('admin'), deletePlan);

export default router;
