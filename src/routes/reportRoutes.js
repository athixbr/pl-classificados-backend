import express from 'express';
import {
  getOverviewReport,
  getUsersReport,
  getListingsReport,
  getFinancialReport
} from '../controllers/reportController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Todas as rotas exigem autenticação de admin
router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/overview', getOverviewReport);
router.get('/users', getUsersReport);
router.get('/listings', getListingsReport);
router.get('/financial', getFinancialReport);

export default router;
