import express from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  featureListing
} from '../controllers/listingController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';
import { uploadMultiple, handleUploadError } from '../middlewares/upload.js';

const router = express.Router();

// Rotas privadas (devem vir antes das rotas com :id)
router.get('/my/ads', authenticate, getMyListings);
router.post('/', authenticate, uploadMultiple, handleUploadError, createListing);

// Rotas públicas (com auth opcional)
router.get('/', optionalAuth, getListings);
router.get('/:id', optionalAuth, getListingById);

// Rotas de atualização
router.put('/:id', authenticate, uploadMultiple, handleUploadError, updateListing);
router.put('/:id/feature', authenticate, featureListing);
router.delete('/:id', authenticate, deleteListing);

export default router;
