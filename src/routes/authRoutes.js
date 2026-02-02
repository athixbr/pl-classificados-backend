import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { uploadSingle, handleUploadError } from '../middlewares/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, uploadSingle, handleUploadError, updateProfile);
router.put('/password', authenticate, changePassword);

export default router;
