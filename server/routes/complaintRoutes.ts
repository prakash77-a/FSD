import { Router } from 'express';
import {
  createComplaint,
  getMyComplaints,
  getComplaintDetails,
  getUserDashboardStats,
} from '../controllers/complaintController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

router.post('/', authenticateToken, createComplaint);
router.get('/my', authenticateToken, getMyComplaints);
router.get('/dashboard-stats', authenticateToken, getUserDashboardStats);
router.get('/:id', authenticateToken, getComplaintDetails);

export default router;
