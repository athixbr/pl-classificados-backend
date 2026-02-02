import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Rotas públicas
router.get('/', getCategories);
router.get('/:identifier', getCategoryById);

// Rotas privadas (Admin)
router.post('/', authenticate, authorizeRoles('admin'), createCategory);
router.put('/:id', authenticate, authorizeRoles('admin'), updateCategory);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteCategory);

export default router;
