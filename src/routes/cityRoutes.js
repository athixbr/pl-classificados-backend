import express from 'express';
import {
  getCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
  getStates
} from '../controllers/cityController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Rotas públicas
router.get('/', getCities);
router.get('/states/list', getStates);
router.get('/:identifier', getCityById);

// Rotas privadas (Admin)
router.post('/', authenticate, authorizeRoles('admin'), createCity);
router.put('/:id', authenticate, authorizeRoles('admin'), updateCity);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteCity);

export default router;
