import { Router } from 'express';
import {
  getAdminDashboard,
  getAllComplaints,
  updateComplaintStatus,
  assignComplaint,
  addInternalNote,
} from '../controllers/adminController.ts';
import { authenticateToken, requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Protect all admin endpoints with authenticateToken and requireAdmin
router.use(authenticateToken, requireAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/complaints', getAllComplaints);
router.patch('/complaints/:id/status', updateComplaintStatus);
router.patch('/complaints/:id/assign', assignComplaint);
router.post('/complaints/:id/internal-note', addInternalNote);

export default router;
