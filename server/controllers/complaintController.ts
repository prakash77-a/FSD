import { Request, Response } from 'express';
import {
  createComplaint as dbCreateComplaint,
  findComplaints,
  findComplaintById,
  getComplaintActivities,
  getDashboardStats as dbGetDashboardStats,
} from '../services/dbStore.ts';
import { ComplaintCategory, ComplaintPriority } from '../models/Complaint.ts';

const VALID_CATEGORIES: ComplaintCategory[] = [
  'Infrastructure',
  'Technical Issue',
  'Maintenance',
  'Staff or Service',
  'Billing',
  'Other',
];

const VALID_PRIORITIES: ComplaintPriority[] = ['Low', 'Medium', 'High'];

export async function createComplaint(req: Request, res: Response) {
  try {
    const user = req.user!;
    const { title, category, priority, description, locationOrDepartment } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Complaint title is required.' });
      return;
    }
    if (title.trim().length < 3) {
      res.status(400).json({ success: false, message: 'Title must be at least 3 characters long.' });
      return;
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      res.status(400).json({
        success: false,
        message: `Please select a valid category (${VALID_CATEGORIES.join(', ')}).`,
      });
      return;
    }

    if (!priority || !VALID_PRIORITIES.includes(priority)) {
      res.status(400).json({
        success: false,
        message: 'Please select a valid priority (Low, Medium, High).',
      });
      return;
    }

    if (!description || !description.trim()) {
      res.status(400).json({ success: false, message: 'Detailed description is required.' });
      return;
    }
    if (description.trim().length < 10) {
      res.status(400).json({ success: false, message: 'Description must be at least 10 characters long.' });
      return;
    }

    const complaint = await dbCreateComplaint({
      title: title.trim(),
      category,
      priority,
      description: description.trim(),
      locationOrDepartment: locationOrDepartment?.trim(),
      createdBy: user._id,
      createdByName: user.name,
      createdByEmail: user.email,
    });

    res.status(201).json({
      success: true,
      message: `Complaint ${complaint.complaintNumber} registered successfully.`,
      complaint,
    });
  } catch (err: any) {
    console.error('Create complaint error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error submitting complaint.' });
  }
}

export async function getMyComplaints(req: Request, res: Response) {
  try {
    const user = req.user!;
    const { status, category, priority, search, page, limit, sort } = req.query;

    const result = await findComplaints({
      userId: user._id,
      status: status as string,
      category: category as string,
      priority: priority as string,
      search: search as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sort: sort === 'oldest' ? 'oldest' : 'newest',
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Get my complaints error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error fetching complaints.' });
  }
}

export async function getComplaintDetails(req: Request, res: Response) {
  try {
    const user = req.user!;
    const { id } = req.params;

    const complaint = await findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    // Role-based security check: must be owner or admin
    const isOwner = String(complaint.createdBy) === String(user._id);
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this complaint.',
      });
      return;
    }

    const activities = await getComplaintActivities(String(complaint._id));

    res.json({
      success: true,
      complaint,
      activities,
    });
  } catch (err: any) {
    console.error('Get complaint details error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error retrieving complaint details.' });
  }
}

export async function getUserDashboardStats(req: Request, res: Response) {
  try {
    const user = req.user!;
    const stats = await dbGetDashboardStats(user._id);

    // Also get recent 5 complaints
    const recent = await findComplaints({
      userId: user._id,
      page: 1,
      limit: 5,
      sort: 'newest',
    });

    res.json({
      success: true,
      stats,
      recentComplaints: recent.complaints,
    });
  } catch (err: any) {
    console.error('User dashboard stats error:', err);
    res.status(500).json({ success: false, message: err.message || 'Error loading dashboard statistics.' });
  }
}
