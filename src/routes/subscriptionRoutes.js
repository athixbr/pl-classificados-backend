import express from 'express';
import {
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  getPaymentHistory,
  handleWebhook
} from '../controllers/subscriptionController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Rotas protegidas (requerem autenticação)
router.post('/create', protect, createSubscription);
router.post('/cancel', protect, cancelSubscription);
router.get('/status', protect, getSubscriptionStatus);
router.get('/payments', protect, getPaymentHistory);

// Webhook do Mercado Pago (público, mas validado)
router.post('/webhook', handleWebhook);

export default router;
